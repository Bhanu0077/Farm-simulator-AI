import secrets
from datetime import datetime, timedelta

from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

from models import EmailOTP, User, db
from services.email_service import EmailDeliveryError, send_email


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

VERIFY_EMAIL_PURPOSE = "verify_email"


def _error(message, status_code):
    return jsonify({"error": message}), status_code


def _get_reset_serializer():
    return URLSafeTimedSerializer(current_app.config["SECRET_KEY"])


def _generate_reset_token(email):
    serializer = _get_reset_serializer()
    return serializer.dumps(email, salt=current_app.config["RESET_TOKEN_SALT"])


def _validate_reset_token(token):
    serializer = _get_reset_serializer()
    return serializer.loads(
        token,
        salt=current_app.config["RESET_TOKEN_SALT"],
        max_age=current_app.config["RESET_TOKEN_MAX_AGE"],
    )


def _issue_login_response(user):
    access_token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": access_token, "user": user.to_dict()}), 200


def _build_otp_code(length):
    max_value = 10 ** length
    return str(secrets.randbelow(max_value)).zfill(length)


def _mark_existing_otps_used(user_id, purpose):
    EmailOTP.query.filter_by(user_id=user_id, purpose=purpose, used_at=None).update(
        {"used_at": datetime.utcnow()}
    )


def _latest_otp(user_id, purpose):
    return (
        EmailOTP.query.filter_by(user_id=user_id, purpose=purpose)
        .order_by(EmailOTP.created_at.desc())
        .first()
    )


def _send_otp(user, purpose):
    latest_otp = _latest_otp(user.id, purpose)
    cooldown_seconds = current_app.config["OTP_RESEND_COOLDOWN_SECONDS"]
    if latest_otp and (datetime.utcnow() - latest_otp.created_at).total_seconds() < cooldown_seconds:
        return None, _error(f"please wait {cooldown_seconds} seconds before requesting another OTP", 429)

    otp_code = _build_otp_code(current_app.config["OTP_LENGTH"])
    _mark_existing_otps_used(user.id, purpose)

    otp_record = EmailOTP(
        user_id=user.id,
        purpose=purpose,
        code_hash=generate_password_hash(otp_code),
        expires_at=datetime.utcnow() + timedelta(minutes=current_app.config["OTP_EXPIRY_MINUTES"]),
    )
    db.session.add(otp_record)
    db.session.commit()

    if purpose == VERIFY_EMAIL_PURPOSE:
        subject = "Verify your Smart Farm Simulator account"
        text = (
            f"Hello {user.name},\n\n"
            f"Your account verification code is: {otp_code}\n"
            f"This code expires in {current_app.config['OTP_EXPIRY_MINUTES']} minutes.\n\n"
            "Enter this OTP in the verification screen to activate your account."
        )
        html = (
            f"<p>Hello {user.name},</p>"
            f"<p>Your account verification code is <strong>{otp_code}</strong>.</p>"
            f"<p>This code expires in {current_app.config['OTP_EXPIRY_MINUTES']} minutes.</p>"
            "<p>Enter this OTP in the verification screen to activate your account.</p>"
        )
    else:
        subject = "Your Smart Farm Simulator OTP"
        text = (
            f"Hello {user.name},\n\n"
            f"Your one-time code is: {otp_code}\n"
            f"This code expires in {current_app.config['OTP_EXPIRY_MINUTES']} minutes."
        )
        html = (
            f"<p>Hello {user.name},</p>"
            f"<p>Your one-time code is <strong>{otp_code}</strong>.</p>"
            f"<p>This code expires in {current_app.config['OTP_EXPIRY_MINUTES']} minutes.</p>"
        )

    try:
        send_email(current_app.config, user.email, subject, html, text)
    except EmailDeliveryError as error:
        return None, _error(str(error), 500)

    print(f"{purpose.upper()} OTP FOR {user.email}: {otp_code}")
    if current_app.config.get("EMAIL_PROVIDER", "console").lower() == "console":
        return otp_code, None
    return None, None


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return _error("name, email, and password are required", 400)

    if len(password) < 8:
        return _error("password must be at least 8 characters long", 400)

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return _error("email is already registered", 409)

    user = User(
        name=name,
        email=email,
        password_hash=generate_password_hash(password),
        is_verified=False,
    )
    db.session.add(user)
    db.session.commit()

    otp_code, error_response = _send_otp(user, VERIFY_EMAIL_PURPOSE)
    if error_response:
        return error_response

    return jsonify(
        {
            "message": "User registered successfully. Verification OTP sent to email",
            "email": user.email,
            "otp_debug": otp_code,
        }
    ), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return _error("email and password are required", 400)

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return _error("invalid email or password", 401)

    if not user.is_verified:
        return _error("email not verified. Please verify OTP before logging in", 403)

    return _issue_login_response(user)


@auth_bp.post("/request-otp")
def request_otp():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    purpose = (data.get("purpose") or VERIFY_EMAIL_PURPOSE).strip()

    if not email:
        return _error("email is required", 400)

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "If the email exists, an OTP has been sent"}), 200

    if purpose == VERIFY_EMAIL_PURPOSE and user.is_verified:
        return jsonify({"message": "Email is already verified"}), 200

    otp_code, error_response = _send_otp(user, purpose)
    if error_response:
        return error_response

    return jsonify(
        {
            "message": "If the email exists, an OTP has been sent",
            "otp_debug": otp_code,
        }
    ), 200


@auth_bp.post("/verify-otp")
def verify_otp():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    otp = (data.get("otp") or "").strip()
    purpose = (data.get("purpose") or VERIFY_EMAIL_PURPOSE).strip()

    if not email or not otp:
        return _error("email and otp are required", 400)

    user = User.query.filter_by(email=email).first()
    if not user:
        return _error("invalid email or otp", 401)

    otp_record = (
        EmailOTP.query.filter_by(user_id=user.id, purpose=purpose, used_at=None)
        .order_by(EmailOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        return _error("no active otp found", 400)

    if otp_record.expires_at < datetime.utcnow():
        otp_record.used_at = datetime.utcnow()
        db.session.commit()
        return _error("otp has expired", 400)

    if not check_password_hash(otp_record.code_hash, otp):
        return _error("invalid email or otp", 401)

    otp_record.used_at = datetime.utcnow()
    if purpose == VERIFY_EMAIL_PURPOSE:
        user.is_verified = True
    db.session.commit()

    return _issue_login_response(user)


@auth_bp.post("/forgot-password")
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not email:
        return _error("email is required", 400)

    user = User.query.filter_by(email=email).first()
    token = None

    if user:
        token = _generate_reset_token(user.email)
        reset_link = f"http://localhost:5173/reset-password?token={token}"
        print(f"RESET LINK: {reset_link}")

    return jsonify(
        {
            "message": "If email exists, reset link has been sent",
            "reset_token": token,
        }
    ), 200


@auth_bp.post("/reset-password")
def reset_password():
    data = request.get_json(silent=True) or {}
    token = data.get("token") or ""
    new_password = data.get("new_password") or ""

    if not token or not new_password:
        return _error("token and new_password are required", 400)

    if len(new_password) < 8:
        return _error("new_password must be at least 8 characters long", 400)

    try:
        email = _validate_reset_token(token)
    except SignatureExpired:
        return _error("reset token has expired", 400)
    except BadSignature:
        return _error("invalid reset token", 400)

    user = User.query.filter_by(email=email).first()
    if not user:
        return _error("user not found", 404)

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"message": "Password reset successfully"}), 200
