from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required


simulator_bp = Blueprint("simulator", __name__)


SOIL_FACTORS = {
    "Loamy": {"yield": 1.12, "risk": -1},
    "Sandy": {"yield": 0.88, "risk": 1},
    "Clay": {"yield": 0.95, "risk": 1},
    "Silt": {"yield": 1.05, "risk": 0},
}

CROP_PRICES = {
    "Rice": 22.0,
    "Wheat": 18.0,
    "Corn": 16.0,
}


def _error(message, status_code):
    return jsonify({"error": message}), status_code


def _classify_risk(score):
    if score <= 1:
        return "Low"
    if score == 2:
        return "Medium"
    return "High"


def _crop_metrics(crop_name, rainfall, temperature, humidity, soil_type):
    soil_factor = SOIL_FACTORS[soil_type]

    if crop_name == "Rice":
        base_yield = 5.0
        score = 0
        if rainfall < 180:
            score += 2
        elif rainfall < 220:
            score += 1
        if temperature < 22 or temperature > 34:
            score += 1
        if humidity < 65:
            score += 1
        yield_multiplier = (
            1
            + ((rainfall - 200) / 500)
            + ((humidity - 70) / 250)
            - (abs(temperature - 28) / 40)
        )
        explanation = (
            "Rice benefits from high rainfall and humidity. "
            f"The current conditions are {'close to ideal' if score <= 1 else 'moderately stressed' if score == 2 else 'stressful'} for paddy growth."
        )
    elif crop_name == "Wheat":
        base_yield = 4.2
        score = 0
        if rainfall > 180:
            score += 2
        elif rainfall > 140:
            score += 1
        if temperature < 12 or temperature > 28:
            score += 1
        if humidity > 75:
            score += 1
        yield_multiplier = (
            1
            + ((120 - rainfall) / 450)
            + ((22 - abs(temperature - 20)) / 120)
            - (max(humidity - 65, 0) / 180)
        )
        explanation = (
            "Wheat prefers moderate temperatures and lower excess moisture. "
            f"These conditions look {'favorable' if score <= 1 else 'manageable' if score == 2 else 'less suitable'} for grain filling."
        )
    else:
        base_yield = 6.1
        score = 0
        if rainfall < 90 or rainfall > 170:
            score += 1
        if temperature < 18 or temperature > 32:
            score += 1
        if humidity < 50 or humidity > 80:
            score += 1
        yield_multiplier = (
            1
            + ((150 - abs(rainfall - 130)) / 500)
            + ((26 - abs(temperature - 25)) / 120)
            + ((70 - abs(humidity - 65)) / 300)
        )
        explanation = (
            "Corn performs best in warm weather with balanced moisture. "
            f"The current profile is {'well aligned' if score <= 1 else 'acceptable' if score == 2 else 'higher risk'} for stable maize output."
        )

    adjusted_yield = max(1.2, round(base_yield * yield_multiplier * soil_factor["yield"], 2))
    risk_level = _classify_risk(score + soil_factor["risk"])
    profit = round(adjusted_yield * CROP_PRICES[crop_name], 2)

    return {
        "predicted_yield": adjusted_yield,
        "profit": profit,
        "risk_level": risk_level,
        "explanation": explanation,
    }


@simulator_bp.post("/predict")
@jwt_required()
def predict():
    data = request.get_json(silent=True) or {}

    required_fields = ["rainfall", "temperature", "humidity", "soil_type"]
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return _error(f"missing fields: {', '.join(missing_fields)}", 400)

    try:
        rainfall = float(data["rainfall"])
        temperature = float(data["temperature"])
        humidity = float(data["humidity"])
    except (TypeError, ValueError):
        return _error("rainfall, temperature, and humidity must be numbers", 400)

    soil_type = str(data["soil_type"]).strip().title()
    if soil_type not in SOIL_FACTORS:
        return _error("soil_type must be one of: Loamy, Sandy, Clay, Silt", 400)

    predictions = {
        crop: _crop_metrics(crop, rainfall, temperature, humidity, soil_type)
        for crop in ["Rice", "Wheat", "Corn"]
    }

    best_crop = max(predictions.items(), key=lambda item: item[1]["profit"])

    return jsonify(
        {
            "inputs": {
                "rainfall": rainfall,
                "temperature": temperature,
                "humidity": humidity,
                "soil_type": soil_type,
            },
            "predictions": predictions,
            "recommended_crop": {
                "name": best_crop[0],
                **best_crop[1],
            },
        }
    ), 200
