import os

from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import Config, INSTANCE_DIR
from models import db
from routes.auth import auth_bp
from routes.simulator import simulator_bp


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
    app.register_blueprint(simulator_bp)

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

    return app


app = create_app()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
