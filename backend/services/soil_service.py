import requests


SOILGRIDS_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"
SOIL_PROPERTIES = ["sand", "clay", "silt", "phh2o", "soc"]


class SoilServiceError(Exception):
    pass


def classify_soil_type(sand, clay, silt):
    if sand is None or clay is None or silt is None:
        return "Loamy"
    if sand >= 70:
        return "Sandy"
    if clay >= 40:
        return "Clay"
    if silt >= 60:
        return "Silt"
    return "Loamy"


def fetch_soil_profile(lat, lon):
    response = requests.get(
        SOILGRIDS_URL,
        params=[
            ("lat", lat),
            ("lon", lon),
            *[("property", prop) for prop in SOIL_PROPERTIES],
            ("depth", "0-5cm"),
            ("value", "mean"),
        ],
        timeout=20,
    )
    response.raise_for_status()
    payload = response.json()
    layers = payload.get("properties", {}).get("layers", [])

    values = {}
    for layer in layers:
        name = layer.get("name")
        factor = (layer.get("unit_measure") or {}).get("d_factor", 1) or 1
        depths = layer.get("depths") or []
        if not depths:
            continue
        mean_value = (depths[0].get("values") or {}).get("mean")
        if mean_value is None:
          values[name] = None
          continue
        converted = mean_value / factor
        if name == "soc":
            values["organic_carbon_g_per_kg"] = round(converted, 2)
            values["organic_carbon_percent"] = round(converted / 10, 2)
        elif name == "phh2o":
            values["ph"] = round(converted, 2)
        else:
            values[name] = round(converted, 2)

    sand = values.get("sand")
    clay = values.get("clay")
    silt = values.get("silt")
    if sand is None and clay is None and silt is None:
        raise SoilServiceError("No SoilGrids data available for this location")

    return {
        "sand": sand,
        "clay": clay,
        "silt": silt,
        "ph": values.get("ph"),
        "organic_carbon_g_per_kg": values.get("organic_carbon_g_per_kg"),
        "organic_carbon_percent": values.get("organic_carbon_percent"),
        "soil_type": classify_soil_type(sand, clay, silt),
        "source": "SoilGrids",
    }
