import requests
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required


weather_bp = Blueprint("weather", __name__)


WEATHER_CODE_MAP = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
}


def _error(message, status_code):
    return jsonify({"error": message}), status_code


def _resolve_coordinates(location):
    response = requests.get(
        "https://geocoding-api.open-meteo.com/v1/search",
        params={"name": location, "count": 1, "language": "en", "format": "json"},
        timeout=15,
    )
    response.raise_for_status()
    data = response.json()
    results = data.get("results") or []

    if not results:
        return None

    top = results[0]
    return {
        "name": top.get("name"),
        "country": top.get("country"),
        "latitude": top.get("latitude"),
        "longitude": top.get("longitude"),
    }


@weather_bp.get("/weather")
@jwt_required()
def get_weather():
    location = (request.args.get("location") or "").strip()
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if location:
        place = _resolve_coordinates(location)
        if not place:
            return _error("location not found", 404)
        latitude = place["latitude"]
        longitude = place["longitude"]
    elif lat and lon:
        try:
            latitude = float(lat)
            longitude = float(lon)
        except ValueError:
            return _error("lat and lon must be valid numbers", 400)
        place = {
            "name": "Custom coordinates",
            "country": None,
            "latitude": latitude,
            "longitude": longitude,
        }
    else:
        return _error("provide either location or lat and lon", 400)

    response = requests.get(
        "https://api.open-meteo.com/v1/forecast",
        params={
            "latitude": latitude,
            "longitude": longitude,
            "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code",
            "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum",
            "timezone": "auto",
            "forecast_days": 3,
        },
        timeout=15,
    )
    response.raise_for_status()
    data = response.json()
    current = data.get("current", {})
    daily = data.get("daily", {})
    code = current.get("weather_code")

    forecast = []
    times = daily.get("time", [])
    maxes = daily.get("temperature_2m_max", [])
    mins = daily.get("temperature_2m_min", [])
    precipitation = daily.get("precipitation_sum", [])
    for index, day in enumerate(times):
        forecast.append(
            {
                "date": day,
                "temperature_max": maxes[index] if index < len(maxes) else None,
                "temperature_min": mins[index] if index < len(mins) else None,
                "precipitation_sum": precipitation[index] if index < len(precipitation) else None,
            }
        )

    return jsonify(
        {
            "location": place,
            "current_weather": {
                "temperature": current.get("temperature_2m"),
                "humidity": current.get("relative_humidity_2m"),
                "precipitation": current.get("precipitation"),
                "wind_speed": current.get("wind_speed_10m"),
                "weather_code": code,
                "summary": WEATHER_CODE_MAP.get(code, "Unknown"),
                "observed_at": current.get("time"),
            },
            "forecast": forecast,
            "source": "Open-Meteo",
        }
    ), 200
