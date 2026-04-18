from datetime import datetime


DEFAULT_CROP_PRICES = {
    "Rice": 22.0,
    "Wheat": 18.0,
    "Maize": 16.0,
    "Millet": 20.0,
    "Barley": 17.0,
    "Sorghum": 18.5,
    "Oats": 19.0,
    "Chickpea": 28.0,
    "Lentil": 30.0,
    "Pigeon Pea": 32.0,
    "Green Gram": 34.0,
    "Black Gram": 35.0,
    "Pea": 24.0,
    "Groundnut": 31.0,
    "Soybean": 26.0,
    "Sunflower": 29.0,
    "Mustard": 27.0,
    "Sesame": 36.0,
    "Cotton": 35.0,
    "Sugarcane": 14.0,
    "Jute": 22.0,
    "Tomato": 20.0,
    "Potato": 15.0,
    "Onion": 19.0,
    "Brinjal": 18.0,
    "Cabbage": 16.0,
    "Cauliflower": 17.0,
    "Okra": 21.0,
    "Mango": 24.0,
    "Banana": 18.0,
    "Papaya": 20.0,
    "Guava": 22.0,
    "Grapes": 30.0,
}


def get_crop_prices():
    month = datetime.utcnow().month
    seasonal_multiplier = 1 + (((month % 6) - 3) * 0.01)

    adjusted_prices = {
        crop: round(price * seasonal_multiplier, 2)
        for crop, price in DEFAULT_CROP_PRICES.items()
    }

    return {
        "prices": adjusted_prices,
        "source": "Seasonal fallback pricing",
        "updated_at": datetime.utcnow().isoformat() + "Z",
    }
