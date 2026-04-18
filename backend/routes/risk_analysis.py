import json

import requests
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from config import Config


risk_analysis_bp = Blueprint("risk_analysis", __name__)


OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = "openai/gpt-4o-mini"


def _error(message, status_code):
    return jsonify({"error": message}), status_code


def _to_float(value):
    try:
        if value in (None, ""):
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def _build_prompt(data):
    soil = data.get("soil") or {}
    weather = data.get("weather") or {}
    land = data.get("land") or {}

    return f"""You are an agricultural risk analyst.

Analyze the following farm conditions and return a concise farming risk assessment.

Farm data:
- Land area (acres): {land.get("acres", "unknown")}
- Temperature (C): {weather.get("temperature", "unknown")}
- Rainfall (mm): {weather.get("rainfall", "unknown")}
- Humidity (%): {weather.get("humidity", "unknown")}
- Sand (%): {soil.get("sand", "unknown")}
- Clay (%): {soil.get("clay", "unknown")}
- Silt (%): {soil.get("silt", "unknown")}
- pH: {soil.get("ph", "unknown")}
- Organic carbon (%): {soil.get("organicCarbon", "unknown")}
- Soil type: {soil.get("soilType", "unknown")}

Respond in strict JSON with this exact shape:
{{
  "overallRisk": "Low | Medium | High",
  "waterRisk": "short sentence",
  "soilRisk": "short sentence",
  "weatherRisk": "short sentence",
  "recommendations": [
    "recommendation 1",
    "recommendation 2",
    "recommendation 3"
  ]
}}

Keep recommendations practical and crop-focused."""


def _extract_json(content):
    trimmed = (content or "").strip()
    if not trimmed:
        raise ValueError("Empty AI response")

    try:
        return json.loads(trimmed)
    except json.JSONDecodeError:
        start = trimmed.find("{")
        end = trimmed.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise ValueError("Unable to parse AI response") from None
        return json.loads(trimmed[start : end + 1])


def _fallback_analysis(data):
    soil = data.get("soil") or {}
    weather = data.get("weather") or {}
    land = data.get("land") or {}

    rainfall = _to_float(weather.get("rainfall"))
    temperature = _to_float(weather.get("temperature"))
    humidity = _to_float(weather.get("humidity"))
    ph = _to_float(soil.get("ph"))
    organic_carbon = _to_float(soil.get("organicCarbon"))
    clay = _to_float(soil.get("clay"))
    sand = _to_float(soil.get("sand"))
    acres = _to_float(land.get("acres"))

    score = 0
    recommendations = []

    if rainfall is not None and rainfall < 40:
        score += 2
        water_risk = "High drought risk because rainfall is currently low."
        recommendations.append("Plan supplemental irrigation or drip watering.")
    elif rainfall is not None and rainfall > 220:
        score += 2
        water_risk = "Excess water risk is elevated because rainfall is high."
        recommendations.append("Improve drainage and avoid waterlogging-sensitive crops.")
    else:
        water_risk = "Water availability looks relatively balanced for the current reading."

    if ph is not None and (ph < 5.8 or ph > 7.8):
        score += 2
        soil_risk = "Soil balance risk is elevated because pH is outside the preferred range."
        recommendations.append("Correct soil pH with lime or sulfur based on soil testing.")
    elif organic_carbon is not None and organic_carbon < 0.8:
        score += 1
        soil_risk = "Soil fertility risk is moderate because organic carbon is low."
        recommendations.append("Add organic compost or manure to improve soil structure.")
    elif clay is not None and clay > 45:
        score += 1
        soil_risk = "Heavy clay may reduce drainage and root development."
        recommendations.append("Use raised beds or add organic matter to improve aeration.")
    elif sand is not None and sand > 70:
        score += 1
        soil_risk = "Sandy soil may lose water and nutrients quickly."
        recommendations.append("Use mulching and split fertilizer applications.")
    else:
        soil_risk = "Soil structure and fertility look reasonably manageable."

    if temperature is not None and (temperature < 15 or temperature > 36):
        score += 2
        weather_risk = "Temperature extremes may stress crop growth."
        recommendations.append("Choose heat- or stress-tolerant crops for this season.")
    elif humidity is not None and humidity > 85:
        score += 1
        weather_risk = "High humidity may increase fungal disease pressure."
        recommendations.append("Improve spacing and monitor for moisture-related disease.")
    else:
        weather_risk = "Weather conditions look fairly stable for field operations."

    if acres is not None and acres < 1:
        recommendations.append("Use intensive irrigation and nutrient planning for the smaller plot.")
    elif acres is not None and acres > 8:
        recommendations.append("Phase irrigation and fertilizer scheduling across the larger field.")

    if rainfall is not None and rainfall < 80 and temperature is not None and temperature > 24:
        recommendations.append("Suitable crops: maize, millet, groundnut.")
    elif rainfall is not None and rainfall > 140:
        recommendations.append("Suitable crops: rice, sugarcane, fodder crops.")
    else:
        recommendations.append("Suitable crops: maize, wheat, pulses depending on season.")

    overall_risk = "Low" if score <= 1 else "Medium" if score <= 3 else "High"

    deduped = []
    for item in recommendations:
        if item not in deduped:
            deduped.append(item)

    return {
        "overallRisk": overall_risk,
        "waterRisk": water_risk,
        "soilRisk": soil_risk,
        "weatherRisk": weather_risk,
        "recommendations": deduped[:5],
        "source": "fallback",
    }


def _openrouter_analysis(data):
    if not Config.OPENROUTER_API_KEY:
        raise RuntimeError("OpenRouter API key not configured")

    response = requests.post(
        OPENROUTER_URL,
        headers={
            "Authorization": f"Bearer {Config.OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "model": OPENROUTER_MODEL,
            "messages": [{"role": "user", "content": _build_prompt(data)}],
            "temperature": 0.2,
        },
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    content = (((payload.get("choices") or [{}])[0]).get("message") or {}).get("content")
    parsed = _extract_json(content)

    return {
        "overallRisk": parsed.get("overallRisk", "Medium"),
        "waterRisk": parsed.get("waterRisk", "Water conditions need further review."),
        "soilRisk": parsed.get("soilRisk", "Soil conditions need further review."),
        "weatherRisk": parsed.get("weatherRisk", "Weather conditions need further review."),
        "recommendations": parsed.get("recommendations") if isinstance(parsed.get("recommendations"), list) else [],
        "source": "openrouter",
    }


@risk_analysis_bp.post("/risk-analysis")
@jwt_required()
def risk_analysis():
    data = request.get_json(silent=True) or {}

    try:
        analysis = _openrouter_analysis(data)
    except Exception:
        analysis = _fallback_analysis(data)

    return jsonify(analysis), 200
