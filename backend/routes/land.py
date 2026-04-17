from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from services.soil_service import SoilServiceError, fetch_soil_profile


land_bp = Blueprint("land", __name__)


def _error(message, status_code):
    return jsonify({"error": message}), status_code


@land_bp.get("/soil-data")
@jwt_required()
def soil_data():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if lat is None or lon is None:
        return _error("lat and lon are required", 400)

    try:
        latitude = float(lat)
        longitude = float(lon)
    except ValueError:
        return _error("lat and lon must be valid numbers", 400)

    try:
        profile = fetch_soil_profile(latitude, longitude)
    except SoilServiceError as error:
        return _error(str(error), 404)
    except Exception:
        return _error("Unable to fetch soil data right now", 502)

    return jsonify(
        {
            "center": {"lat": latitude, "lon": longitude},
            "soil_profile": profile,
        }
    ), 200
