from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

from models import User, db


auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


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
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"}), 201


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

    access_token = create_access_token(identity=str(user.id))

    return jsonify(
        {
            "access_token": access_token,
            "user": user.to_dict(),
        }
    ), 200


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
