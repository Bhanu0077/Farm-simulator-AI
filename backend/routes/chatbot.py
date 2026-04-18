import requests
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from config import Config


chatbot_bp = Blueprint("chatbot", __name__)


OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "openai/gpt-4o-mini"
MAX_HISTORY_MESSAGES = 14


def _error(message, status_code):
    return jsonify({"error": message}), status_code


def _format_farm_value(value, fallback="unknown"):
    if value in (None, ""):
        return fallback
    return value


def _build_system_prompt(farm_data):
    soil = farm_data.get("soil") or {}
    weather = farm_data.get("weather") or {}
    land = farm_data.get("land") or {}
    recommended_crop = farm_data.get("recommendedCrop")
    user_name = farm_data.get("userName") or "Farmer"

    return f"""You are an agricultural assistant helping farmers using real farm data.

You must:
- Give practical, simple advice
- Use the user's farm data: soil, weather, land size, and recommended crop
- Recommend crops, irrigation, fertilizer, and risk actions when relevant
- Answer Smart Farm Simulator project questions when asked, including how the simulator uses soil, weather, land area, and crop recommendation data
- Be concise and clear
- Personalize responses using the user's name
- Keep responses relevant to farming or this Smart Farm Simulator project
- Do not invent missing data; say what is unavailable if needed

Available data:
- Soil sand: {_format_farm_value(soil.get("sand"))}%
- Soil clay: {_format_farm_value(soil.get("clay"))}%
- Soil silt: {_format_farm_value(soil.get("silt"))}%
- Soil pH: {_format_farm_value(soil.get("ph"))}
- Organic carbon: {_format_farm_value(soil.get("organicCarbon"))}%
- Soil type: {_format_farm_value(soil.get("soilType"))}
- Weather temperature: {_format_farm_value(weather.get("temperature"))} C
- Weather rainfall: {_format_farm_value(weather.get("rainfall"))} mm
- Weather humidity: {_format_farm_value(weather.get("humidity"))}%
- Land size: {_format_farm_value(land.get("acres"))} acres
- Recommended Crop: {_format_farm_value(recommended_crop)}
- User Name: {_format_farm_value(user_name, "Farmer")}

Do NOT give generic answers. Use the data provided."""


def _sanitize_messages(messages):
    if not isinstance(messages, list):
        return []

    sanitized = []
    for message in messages[-MAX_HISTORY_MESSAGES:]:
        role = message.get("role")
        content = str(message.get("content") or "").strip()
        if role in {"user", "assistant"} and content:
            sanitized.append({"role": role, "content": content})
    return sanitized


@chatbot_bp.post("/chatbot")
@jwt_required()
def chatbot():
    if not Config.OPENROUTER_API_KEY:
        return _error("OpenRouter API key is not configured", 503)

    data = request.get_json(silent=True) or {}
    messages = _sanitize_messages(data.get("messages"))
    if not messages:
        return _error("messages are required", 400)

    response = requests.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {Config.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": OPENROUTER_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": _build_system_prompt(data.get("farmData") or {}),
                },
                *messages,
            ],
            "temperature": 0.3,
            "max_tokens": 300,
        },
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    content = (((payload.get("choices") or [{}])[0]).get("message") or {}).get("content")

    return jsonify({"reply": (content or "").strip()}), 200
