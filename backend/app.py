import os

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import inspect, text

from config import Config, INSTANCE_DIR
from models import db
from routes.auth import auth_bp
from routes.land import land_bp
from routes.simulator import simulator_bp
from routes.weather import weather_bp


jwt = JWTManager()


def create_app():
    app = Flask(__name__, instance_path=INSTANCE_DIR)
    app.config.from_object(Config)

    os.makedirs(app.instance_path, exist_ok=True)

    db.init_app(app)
    jwt.init_app(app)
    CORS(
        app,
        resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=False,
    )

    app.register_blueprint(auth_bp)
    app.register_blueprint(land_bp)
    app.register_blueprint(simulator_bp)
    app.register_blueprint(weather_bp)

    @app.get("/")
    def health_check():
        return jsonify({"message": "Smart Farm Simulator API is running"}), 200

    @jwt.unauthorized_loader
    def handle_missing_token(error_message):
        return jsonify({"error": error_message}), 401

    @jwt.invalid_token_loader
    def handle_invalid_token(error_message):
        return jsonify({"error": error_message}), 422

    @jwt.expired_token_loader
    def handle_expired_token(jwt_header, jwt_payload):
        return jsonify({"error": "token has expired"}), 401

    with app.app_context():
        db.create_all()
        _ensure_schema_updates()

    return app


def _ensure_schema_updates():
    inspector = inspect(db.engine)
    user_columns = {column["name"] for column in inspector.get_columns("users")}
    if "is_verified" not in user_columns:
        with db.engine.begin() as connection:
            connection.execute(
                text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT 0")
            )


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
