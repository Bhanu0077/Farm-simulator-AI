import os
from datetime import timedelta


BASE_DIR = os.path.abspath(os.path.dirname(__file__))
INSTANCE_DIR = os.path.join(BASE_DIR, "instance")


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-this-in-production")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-jwt-secret")
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(INSTANCE_DIR, 'app.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    CORS_ORIGINS = ["http://localhost:5173"]
    RESET_TOKEN_SALT = "smart-farm-reset-password"
    RESET_TOKEN_MAX_AGE = 900
    OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", "10"))
    OTP_LENGTH = int(os.getenv("OTP_LENGTH", "6"))
    OTP_RESEND_COOLDOWN_SECONDS = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", "60"))
    EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "console")
    EMAIL_FROM = os.getenv("EMAIL_FROM", "noreply@smartfarm.local")
    RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
    RESEND_API_URL = os.getenv("RESEND_API_URL", "https://api.resend.com/emails")
    SMTP_HOST = os.getenv("SMTP_HOST", "")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
