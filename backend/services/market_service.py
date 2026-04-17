from datetime import datetime


DEFAULT_CROP_PRICES = {
    "Rice": 22.0,
    "Wheat": 18.0,
    "Corn": 16.0,
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
