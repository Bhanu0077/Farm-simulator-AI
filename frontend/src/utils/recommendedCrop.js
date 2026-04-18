export function getRecommendedCrop({ soil = {}, weather = {}, land = {} }) {
  const clay = Number(soil.clay);
  const sand = Number(soil.sand);
  const rainfall = Number(weather.rainfall);
  const temperature = Number(weather.temperature);
  const acres = Number(land.acres);

  if (!Number.isNaN(clay) && !Number.isNaN(rainfall) && clay > 40 && rainfall > 200) {
    return "Rice";
  }

  if (!Number.isNaN(sand) && !Number.isNaN(rainfall) && sand > 50 && rainfall < 100) {
    return "Millet";
  }

  if (!Number.isNaN(temperature) && temperature >= 33) {
    return "Cotton";
  }

  if (
    !Number.isNaN(clay) &&
    !Number.isNaN(sand) &&
    !Number.isNaN(rainfall) &&
    !Number.isNaN(temperature) &&
    clay >= 20 &&
    clay <= 40 &&
    sand >= 25 &&
    sand <= 50 &&
    rainfall >= 100 &&
    rainfall <= 180 &&
    temperature >= 22 &&
    temperature <= 31
  ) {
    return "Maize";
  }

  if (!Number.isNaN(acres) && acres > 6) {
    return "Sugarcane";
  }

  return "Maize";
}
