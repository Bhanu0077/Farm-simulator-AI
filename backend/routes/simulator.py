from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from services.market_service import get_crop_prices


simulator_bp = Blueprint("simulator", __name__)


SOIL_FACTORS = {
    "Loamy": {"yield": 1.12, "risk": -1},
    "Sandy": {"yield": 0.88, "risk": 1},
    "Clay": {"yield": 0.95, "risk": 1},
    "Silt": {"yield": 1.05, "risk": 0},
}

CROP_PROFILES = {
    "Rice": {
        "base_yield": 5.0,
        "rainfall": 210,
        "temperature": 28,
        "humidity": 75,
        "rainfall_tolerance": 70,
        "temperature_tolerance": 6,
        "humidity_tolerance": 12,
        "preferred_soils": ["Clay", "Silt", "Loamy"],
        "summary": "Rice benefits from high rainfall and humid conditions.",
    },
    "Wheat": {
        "base_yield": 4.2,
        "rainfall": 110,
        "temperature": 20,
        "humidity": 60,
        "rainfall_tolerance": 45,
        "temperature_tolerance": 7,
        "humidity_tolerance": 12,
        "preferred_soils": ["Loamy", "Silt"],
        "summary": "Wheat performs best in milder temperatures with lower excess moisture.",
    },
    "Maize": {
        "base_yield": 6.1,
        "rainfall": 130,
        "temperature": 25,
        "humidity": 65,
        "rainfall_tolerance": 45,
        "temperature_tolerance": 7,
        "humidity_tolerance": 15,
        "preferred_soils": ["Loamy", "Sandy", "Silt"],
        "summary": "Maize prefers warm weather and balanced rainfall.",
    },
    "Barley": {
        "base_yield": 3.9,
        "rainfall": 95,
        "temperature": 18,
        "humidity": 58,
        "rainfall_tolerance": 40,
        "temperature_tolerance": 7,
        "humidity_tolerance": 12,
        "preferred_soils": ["Loamy", "Sandy"],
        "summary": "Barley tolerates drier conditions better than many grains.",
    },
    "Chickpea": {
        "base_yield": 2.8,
        "rainfall": 85,
        "temperature": 22,
        "humidity": 55,
        "rainfall_tolerance": 30,
        "temperature_tolerance": 6,
        "humidity_tolerance": 12,
        "preferred_soils": ["Loamy", "Sandy"],
        "summary": "Chickpea suits moderate warmth and relatively dry conditions.",
    },
    "Lentil": {
        "base_yield": 2.4,
        "rainfall": 80,
        "temperature": 20,
        "humidity": 55,
        "rainfall_tolerance": 30,
        "temperature_tolerance": 6,
        "humidity_tolerance": 12,
        "preferred_soils": ["Loamy", "Silt"],
        "summary": "Lentil prefers cool-to-moderate temperatures and controlled moisture.",
    },
    "Pigeon Pea": {
        "base_yield": 3.1,
        "rainfall": 100,
        "temperature": 26,
        "humidity": 60,
        "rainfall_tolerance": 35,
        "temperature_tolerance": 7,
        "humidity_tolerance": 14,
        "preferred_soils": ["Loamy", "Sandy"],
        "summary": "Pigeon pea handles warm climates and moderate rainfall.",
    },
    "Cotton": {
        "base_yield": 2.6,
        "rainfall": 95,
        "temperature": 29,
        "humidity": 55,
        "rainfall_tolerance": 35,
        "temperature_tolerance": 6,
        "humidity_tolerance": 12,
        "preferred_soils": ["Black", "Loamy", "Clay"],
        "summary": "Cotton prefers warm weather with moderate water supply.",
    },
    "Sugarcane": {
        "base_yield": 35.0,
        "rainfall": 180,
        "temperature": 29,
        "humidity": 70,
        "rainfall_tolerance": 55,
        "temperature_tolerance": 6,
        "humidity_tolerance": 12,
        "preferred_soils": ["Loamy", "Clay", "Silt"],
        "summary": "Sugarcane responds well to warm, moist conditions and fertile soils.",
    },
    "Tomato": {
        "base_yield": 10.0,
        "rainfall": 90,
        "temperature": 24,
        "humidity": 60,
        "rainfall_tolerance": 30,
        "temperature_tolerance": 5,
        "humidity_tolerance": 12,
        "preferred_soils": ["Loamy", "Sandy"],
        "summary": "Tomato performs best in mild warmth and well-drained soils.",
    },
    "Potato": {
        "base_yield": 9.2,
        "rainfall": 95,
        "temperature": 20,
        "humidity": 65,
        "rainfall_tolerance": 30,
        "temperature_tolerance": 5,
        "humidity_tolerance": 10,
        "preferred_soils": ["Loamy", "Sandy"],
        "summary": "Potato prefers cooler temperatures and good soil drainage.",
    },
    "Onion": {
        "base_yield": 8.0,
        "rainfall": 75,
        "temperature": 23,
        "humidity": 60,
        "rainfall_tolerance": 25,
        "temperature_tolerance": 5,
        "humidity_tolerance": 10,
        "preferred_soils": ["Loamy", "Sandy"],
        "summary": "Onion suits moderate warmth and lighter soils.",
    },
    "Mango": {
        "base_yield": 6.5,
        "rainfall": 120,
        "temperature": 27,
        "humidity": 65,
        "rainfall_tolerance": 40,
        "temperature_tolerance": 7,
        "humidity_tolerance": 14,
        "preferred_soils": ["Loamy", "Sandy"],
        "summary": "Mango grows well in warm climates with moderate rainfall.",
    },
    "Banana": {
        "base_yield": 12.0,
        "rainfall": 160,
        "temperature": 28,
        "humidity": 72,
        "rainfall_tolerance": 45,
        "temperature_tolerance": 6,
        "humidity_tolerance": 12,
        "preferred_soils": ["Loamy", "Silt"],
        "summary": "Banana needs warmth, moisture, and fertile soils.",
    },
}

CROP_PROFILES.update(
    {
        "Millet": {
            "base_yield": 3.4,
            "rainfall": 75,
            "temperature": 29,
            "humidity": 50,
            "rainfall_tolerance": 30,
            "temperature_tolerance": 7,
            "humidity_tolerance": 14,
            "preferred_soils": ["Sandy", "Loamy"],
            "summary": "Millet is suitable for drier, warmer conditions.",
        },
        "Sorghum": {
            "base_yield": 3.8,
            "rainfall": 85,
            "temperature": 28,
            "humidity": 52,
            "rainfall_tolerance": 32,
            "temperature_tolerance": 7,
            "humidity_tolerance": 14,
            "preferred_soils": ["Sandy", "Loamy"],
            "summary": "Sorghum handles heat and limited rainfall well.",
        },
        "Oats": {
            "base_yield": 3.2,
            "rainfall": 95,
            "temperature": 18,
            "humidity": 60,
            "rainfall_tolerance": 35,
            "temperature_tolerance": 6,
            "humidity_tolerance": 12,
            "preferred_soils": ["Loamy", "Silt"],
            "summary": "Oats prefer cooler weather and moderate moisture.",
        },
        "Green Gram": {
            "base_yield": 2.2,
            "rainfall": 80,
            "temperature": 27,
            "humidity": 58,
            "rainfall_tolerance": 28,
            "temperature_tolerance": 6,
            "humidity_tolerance": 12,
            "preferred_soils": ["Sandy", "Loamy"],
            "summary": "Green gram suits warm, moderately dry conditions.",
        },
        "Black Gram": {
            "base_yield": 2.1,
            "rainfall": 85,
            "temperature": 27,
            "humidity": 60,
            "rainfall_tolerance": 28,
            "temperature_tolerance": 6,
            "humidity_tolerance": 12,
            "preferred_soils": ["Loamy", "Silt"],
            "summary": "Black gram performs well in warm conditions with moderate moisture.",
        },
        "Pea": {
            "base_yield": 2.5,
            "rainfall": 80,
            "temperature": 18,
            "humidity": 62,
            "rainfall_tolerance": 28,
            "temperature_tolerance": 5,
            "humidity_tolerance": 12,
            "preferred_soils": ["Loamy", "Silt"],
            "summary": "Pea prefers cooler weather and balanced soil moisture.",
        },
        "Groundnut": {
            "base_yield": 3.3,
            "rainfall": 90,
            "temperature": 27,
            "humidity": 58,
            "rainfall_tolerance": 30,
            "temperature_tolerance": 6,
            "humidity_tolerance": 12,
            "preferred_soils": ["Sandy", "Loamy"],
            "summary": "Groundnut prefers warm weather and well-drained soils.",
        },
        "Soybean": {
            "base_yield": 3.0,
            "rainfall": 110,
            "temperature": 25,
            "humidity": 65,
            "rainfall_tolerance": 35,
            "temperature_tolerance": 6,
            "humidity_tolerance": 12,
            "preferred_soils": ["Loamy", "Silt"],
            "summary": "Soybean performs best in warm conditions with moderate rainfall.",
        },
        "Sunflower": {
            "base_yield": 2.9,
            "rainfall": 85,
            "temperature": 26,
            "humidity": 55,
            "rainfall_tolerance": 30,
            "temperature_tolerance": 7,
            "humidity_tolerance": 12,
            "preferred_soils": ["Sandy", "Loamy"],
            "summary": "Sunflower tolerates moderate dryness and warm weather.",
        },
        "Mustard": {
            "base_yield": 2.4,
            "rainfall": 70,
            "temperature": 20,
            "humidity": 55,
            "rainfall_tolerance": 25,
            "temperature_tolerance": 6,
            "humidity_tolerance": 12,
            "preferred_soils": ["Loamy", "Sandy"],
            "summary": "Mustard prefers cooler, relatively dry conditions.",
        },
        "Sesame": {
            "base_yield": 1.8,
            "rainfall": 65,
            "temperature": 28,
            "humidity": 50,
            "rainfall_tolerance": 25,
            "temperature_tolerance": 7,
            "humidity_tolerance": 12,
            "preferred_soils": ["Sandy", "Loamy"],
            "summary": "Sesame is suitable for warm and lower-rainfall areas.",
        },
        "Jute": {
            "base_yield": 4.0,
            "rainfall": 170,
            "temperature": 28,
            "humidity": 75,
            "rainfall_tolerance": 45,
            "temperature_tolerance": 6,
            "humidity_tolerance": 12,
            "preferred_soils": ["Silt", "Loamy"],
            "summary": "Jute needs warm, humid conditions and moist soils.",
        },
        "Brinjal": {
            "base_yield": 8.4,
            "rainfall": 90,
            "temperature": 26,
            "humidity": 62,
            "rainfall_tolerance": 30,
            "temperature_tolerance": 6,
            "humidity_tolerance": 12,
            "preferred_soils": ["Loamy", "Sandy"],
            "summary": "Brinjal prefers warm weather and good drainage.",
        },
        "Cabbage": {
            "base_yield": 9.0,
            "rainfall": 85,
            "temperature": 19,
            "humidity": 65,
            "rainfall_tolerance": 28,
            "temperature_tolerance": 5,
            "humidity_tolerance": 12,
            "preferred_soils": ["Loamy", "Silt"],
            "summary": "Cabbage prefers cooler conditions and fertile soils.",
        },
        "Cauliflower": {
            "base_yield": 8.2,
            "rainfall": 85,
            "temperature": 18,
            "humidity": 65,
            "rainfall_tolerance": 28,
            "temperature_tolerance": 5,
            "humidity_tolerance": 12,
            "preferred_soils": ["Loamy", "Silt"],
            "summary": "Cauliflower prefers cool weather and steady moisture.",
        },
        "Okra": {
            "base_yield": 5.5,
            "rainfall": 80,
            "temperature": 29,
            "humidity": 60,
            "rainfall_tolerance": 30,
            "temperature_tolerance": 7,
            "humidity_tolerance": 12,
            "preferred_soils": ["Sandy", "Loamy"],
            "summary": "Okra grows well in warm climates with moderate watering.",
        },
        "Papaya": {
            "base_yield": 10.5,
            "rainfall": 130,
            "temperature": 27,
            "humidity": 68,
            "rainfall_tolerance": 40,
            "temperature_tolerance": 6,
            "humidity_tolerance": 12,
            "preferred_soils": ["Loamy", "Sandy"],
            "summary": "Papaya prefers warm weather and well-drained soils.",
        },
        "Guava": {
            "base_yield": 7.0,
            "rainfall": 100,
            "temperature": 26,
            "humidity": 62,
            "rainfall_tolerance": 35,
            "temperature_tolerance": 7,
            "humidity_tolerance": 14,
            "preferred_soils": ["Loamy", "Sandy"],
            "summary": "Guava tolerates moderate rainfall and warm climates.",
        },
        "Grapes": {
            "base_yield": 8.8,
            "rainfall": 70,
            "temperature": 25,
            "humidity": 55,
            "rainfall_tolerance": 25,
            "temperature_tolerance": 6,
            "humidity_tolerance": 10,
            "preferred_soils": ["Sandy", "Loamy"],
            "summary": "Grapes prefer drier weather and well-drained soils.",
        },
    }
)

MAX_SELECTED_CROPS = 30


def _error(message, status_code):
    return jsonify({"error": message}), status_code


def _classify_risk(score):
    if score <= 1:
        return "Low"
    if score <= 3:
        return "Medium"
    return "High"


def _normalize_crop_name(name):
    normalized = " ".join(str(name).strip().title().split())
    if normalized == "Corn":
        return "Maize"
    return normalized


def _weather_penalty(value, ideal, tolerance):
    deviation = abs(value - ideal)
    if deviation <= tolerance:
        return 0
    if deviation <= tolerance * 1.6:
        return 1
    return 2


def _crop_metrics(crop_name, rainfall, temperature, humidity, soil_type, unit_price, acres):
    soil_factor = SOIL_FACTORS[soil_type]
    profile = CROP_PROFILES[crop_name]

    rainfall_penalty = _weather_penalty(rainfall, profile["rainfall"], profile["rainfall_tolerance"])
    temperature_penalty = _weather_penalty(
        temperature,
        profile["temperature"],
        profile["temperature_tolerance"],
    )
    humidity_penalty = _weather_penalty(humidity, profile["humidity"], profile["humidity_tolerance"])

    score = rainfall_penalty + temperature_penalty + humidity_penalty
    soil_bonus = 1.0 if soil_type in profile["preferred_soils"] else 0.9
    if soil_bonus < 1.0:
        score += 1

    rainfall_adjustment = 1 - (abs(rainfall - profile["rainfall"]) / max(profile["rainfall"] * 2, 120))
    temperature_adjustment = 1 - (
        abs(temperature - profile["temperature"]) / max(profile["temperature"] * 1.8, 40)
    )
    humidity_adjustment = 1 - (abs(humidity - profile["humidity"]) / 140)

    yield_multiplier = max(
        0.55,
        (
            rainfall_adjustment
            + temperature_adjustment
            + humidity_adjustment
            + soil_bonus
        )
        / 4,
    )

    adjusted_yield = max(1.0, round(profile["base_yield"] * yield_multiplier * soil_factor["yield"], 2))
    total_yield = round(adjusted_yield * acres, 2)
    risk_level = _classify_risk(score + soil_factor["risk"])
    profit = round(total_yield * unit_price, 2)

    explanation = (
        f"{profile['summary']} "
        f"Current rainfall, temperature, humidity, and {soil_type.lower()} soil create a {risk_level.lower()}-risk profile for this crop."
    )

    return {
        "predicted_yield_per_acre": adjusted_yield,
        "total_predicted_yield": total_yield,
        "acres": acres,
        "unit_price": unit_price,
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
        acres = float(data.get("acres", 1))
    except (TypeError, ValueError):
        return _error("rainfall, temperature, humidity, and acres must be numbers", 400)

    if acres <= 0:
        return _error("acres must be greater than 0", 400)

    soil_type = str(data["soil_type"]).strip().title()
    if soil_type not in SOIL_FACTORS:
        return _error("soil_type must be one of: Loamy, Sandy, Clay, Silt", 400)

    raw_selected_crops = data.get("selected_crops") or []
    if not isinstance(raw_selected_crops, list):
        return _error("selected_crops must be an array when provided", 400)

    selected_crops = [_normalize_crop_name(name) for name in raw_selected_crops if str(name).strip()]
    if len(selected_crops) > MAX_SELECTED_CROPS:
        return _error(f"select no more than {MAX_SELECTED_CROPS} crops", 400)

    invalid_crops = [crop for crop in selected_crops if crop not in CROP_PROFILES]
    if invalid_crops:
        return _error(f"unsupported crops: {', '.join(invalid_crops)}", 400)

    crop_pool = selected_crops or list(CROP_PROFILES.keys())

    market_data = get_crop_prices()
    prices = market_data["prices"]

    predictions = {
        crop: _crop_metrics(
            crop,
            rainfall,
            temperature,
            humidity,
            soil_type,
            prices[crop],
            acres,
        )
        for crop in crop_pool
    }

    best_crop = max(predictions.items(), key=lambda item: item[1]["profit"])

    return jsonify(
        {
            "inputs": {
                "rainfall": rainfall,
                "temperature": temperature,
                "humidity": humidity,
                "soil_type": soil_type,
                "acres": acres,
                "selected_crops": selected_crops,
            },
            "pricing": market_data,
            "predictions": predictions,
            "recommended_crop": {
                "name": best_crop[0],
                **best_crop[1],
            },
        }
    ), 200
