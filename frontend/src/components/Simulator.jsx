import { useRef, useState } from "react";
import {
  CloudSun,
  Droplets,
  FlaskConical,
  LogOut,
  MapPinned,
  Mountain,
  Search,
  SunMedium,
  Trees,
  Wind,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import CropMultiSelect from "./CropMultiSelect";
import { FARMS } from "../data/farms";
import LandSelectionMap from "./LandSelectionMap";
import LoadingSpinner from "./LoadingSpinner";

const MAX_SELECTED_CROPS = 30;


const initialFormState = {
  rainfall: "",
  temperature: "",
  humidity: "",
  acres: "",
  soil_type: "",
  sand: "",
  clay: "",
  silt: "",
  ph: "",
  organic_carbon: "",
};


function MetricCard({ icon: Icon, label, value, helper }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-4">
      <div className="mb-3 inline-flex rounded-2xl bg-white/10 p-2 text-lime-200">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-stone-300">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-stone-400">{helper}</p>
    </div>
  );
}


function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "--";
  }

  return Number(value).toFixed(digits);
}


function formatSoilField(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "";
  }

  return String(value);
}


export default function Simulator() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const restoredState = location.state?.simulatorState;
  const [formData, setFormData] = useState(() => restoredState?.formData || initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weatherLocation, setWeatherLocation] = useState(() => restoredState?.weatherLocation || "");
  const [weather, setWeather] = useState(() => restoredState?.weather || null);
  const [isFetchingWeather, setIsFetchingWeather] = useState(false);
  const [landSelection, setLandSelection] = useState(() => restoredState?.landSelection || null);
  const [soilProfile, setSoilProfile] = useState(() => restoredState?.soilProfile || null);
  const [isFetchingSoil, setIsFetchingSoil] = useState(false);
  const [mapFocus, setMapFocus] = useState(() => restoredState?.mapFocus || null);
  const [selectedCrops, setSelectedCrops] = useState(() => restoredState?.selectedCrops || []);
  const [cropSelectionError, setCropSelectionError] = useState("");
  const [selectedFarmId, setSelectedFarmId] = useState(() => restoredState?.selectedFarmId || "");
  const soilRequestIdRef = useRef(0);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSelectedCropsChange = (nextSelectedCrops) => {
    if (nextSelectedCrops.length > MAX_SELECTED_CROPS) {
      setCropSelectionError(`Please select no more than ${MAX_SELECTED_CROPS} crops.`);
      toast.error(`Please select no more than ${MAX_SELECTED_CROPS} crops.`);
      return;
    }

    setSelectedCrops(nextSelectedCrops);
    setCropSelectionError("");
  };

  const applyWeatherData = (weatherData, fallbackLocation) => {
    setWeather(weatherData);
    setWeatherLocation(weatherData.location?.name || fallbackLocation);

    if (
      weatherData.location?.latitude !== null &&
      weatherData.location?.latitude !== undefined &&
      weatherData.location?.longitude !== null &&
      weatherData.location?.longitude !== undefined
    ) {
      setMapFocus({
        lat: weatherData.location.latitude,
        lon: weatherData.location.longitude,
        zoom: 13,
      });
    }

    setFormData((current) => ({
      ...current,
      rainfall:
        weatherData.current_weather?.precipitation !== null &&
        weatherData.current_weather?.precipitation !== undefined
          ? String(weatherData.current_weather.precipitation)
          : current.rainfall,
      temperature:
        weatherData.current_weather?.temperature !== null &&
        weatherData.current_weather?.temperature !== undefined
          ? String(weatherData.current_weather.temperature)
          : current.temperature,
      humidity:
        weatherData.current_weather?.humidity !== null &&
        weatherData.current_weather?.humidity !== undefined
          ? String(weatherData.current_weather.humidity)
          : current.humidity,
    }));
  };

  const handleFarmSelect = async (event) => {
    const nextFarmId = event.target.value;
    setSelectedFarmId(nextFarmId);

    if (!nextFarmId) {
      return;
    }

    const farm = FARMS.find((item) => item.id === nextFarmId);
    if (!farm) {
      return;
    }

    const nextLandSelection = {
      polygon: null,
      center: farm.center,
      areaSquareMeters: farm.areaSquareMeters,
      areaAcres: farm.areaAcres,
    };

    setLandSelection(nextLandSelection);
    setSoilProfile(farm.soilProfile);
    setMapFocus({
      lat: farm.center.lat,
      lon: farm.center.lon,
      zoom: 13,
    });
    setWeatherLocation(farm.locationName);
    setFormData((current) => ({
      ...current,
      acres: String(farm.areaAcres),
      soil_type: farm.soilProfile.soil_type,
      sand: formatSoilField(farm.soilProfile.sand),
      clay: formatSoilField(farm.soilProfile.clay),
      silt: formatSoilField(farm.soilProfile.silt),
      ph: formatSoilField(farm.soilProfile.ph),
      organic_carbon: formatSoilField(farm.soilProfile.organic_carbon_percent),
    }));

    try {
      setIsFetchingWeather(true);
      const response = await api.get("/weather", {
        params: { location: farm.locationName },
      });
      applyWeatherData(response.data, farm.locationName);
      toast.success(`${farm.name} loaded`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Farm selected, but weather lookup failed");
    } finally {
      setIsFetchingWeather(false);
    }
  };

  const handleSelectionChange = async (selection) => {
    soilRequestIdRef.current += 1;
    const requestId = soilRequestIdRef.current;

    setLandSelection(selection);
    setSoilProfile(null);

    if (!selection) {
      setIsFetchingSoil(false);
      setFormData((current) => ({
        ...current,
        acres: "",
        soil_type: "",
        sand: "",
        clay: "",
        silt: "",
        ph: "",
        organic_carbon: "",
      }));
      return;
    }

    setFormData((current) => ({
      ...current,
      acres: selection.areaAcres.toFixed(2),
      soil_type: "",
      sand: "",
      clay: "",
      silt: "",
      ph: "",
      organic_carbon: "",
    }));

    setIsFetchingSoil(true);
    try {
      const response = await api.get("/soil-data", {
        params: {
          lat: selection.center.lat,
          lon: selection.center.lon,
        },
      });

      if (soilRequestIdRef.current !== requestId) {
        return;
      }

      const nextSoilProfile = response.data.soil_profile;
      setSoilProfile(nextSoilProfile);
      setFormData((current) => ({
        ...current,
        soil_type: nextSoilProfile.soil_type,
        acres: selection.areaAcres.toFixed(2),
        sand: formatSoilField(nextSoilProfile.sand),
        clay: formatSoilField(nextSoilProfile.clay),
        silt: formatSoilField(nextSoilProfile.silt),
        ph: formatSoilField(nextSoilProfile.ph),
        organic_carbon: formatSoilField(nextSoilProfile.organic_carbon_percent),
      }));
      toast.success("Soil data fetched");
    } catch (error) {
      if (soilRequestIdRef.current !== requestId) {
        return;
      }

      toast.error(error.response?.data?.error || "Unable to fetch soil data");
    } finally {
      if (soilRequestIdRef.current === requestId) {
        setIsFetchingSoil(false);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        rainfall: Number(formData.rainfall),
        temperature: Number(formData.temperature),
        humidity: Number(formData.humidity),
        acres: Number(formData.acres),
        soil_type: formData.soil_type || soilProfile?.soil_type || "Loamy",
        selected_crops: selectedCrops,
      };

      const response = await api.post("/predict", payload);
      toast.success("Simulation complete");
      navigate("/simulator/results", {
        state: {
          simulationState: {
            results: response.data,
            formData,
            weatherLocation,
            weather,
            landSelection,
            soilProfile,
            mapFocus,
            selectedCrops,
            selectedFarmId,
          },
        },
      });
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 422) {
        logout();
        navigate("/login", { replace: true });
      }

      toast.error(error.response?.data?.error || "Unable to run simulation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWeatherLookup = async (event) => {
    event.preventDefault();

    if (!weatherLocation.trim()) {
      toast.error("Enter a location first");
      return;
    }

    setIsFetchingWeather(true);

    try {
      const response = await api.get("/weather", {
        params: { location: weatherLocation.trim() },
      });

      applyWeatherData(response.data, weatherLocation.trim());
      toast.success("Weather fetched");
    } catch (error) {
      toast.error(error.response?.data?.error || "Unable to fetch weather");
    } finally {
      setIsFetchingWeather(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.08),transparent_30%),linear-gradient(180deg,#0e1b11_0%,#142419_40%,#261d14_100%)] px-4 py-6 text-stone-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-glow backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-lime-200/80">Smart Farm Simulator</p>
            <h1 className="mt-2 text-3xl font-semibold">Welcome back, {user?.name || "Farmer"}</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-300">
              Draw your land, fetch SoilGrids data, pull weather for the location, and simulate crop performance with acreage-aware results.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 self-start rounded-2xl border border-white/10 bg-stone-950/60 px-4 py-3 text-sm font-medium text-white transition hover:bg-stone-900"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <MetricCard icon={MapPinned} label="Land Mapping" value="Polygon Draw" helper="Draw and redraw a boundary directly on the map." />
          <MetricCard icon={Droplets} label="Weather Inputs" value="Auto Fill" helper="Rainfall, temperature, and humidity come from live weather lookup." />
          <MetricCard icon={Trees} label="Soil Source" value="SoilGrids" helper="Soil type and composition are pulled from online soil data." />
          <MetricCard icon={Mountain} label="Area Tracking" value={`${formData.acres || "0"} acres`} helper="Simulation profit now scales with the selected land area." />
        </section>

        <section className="mb-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-glow backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3">
              <MapPinned className="h-6 w-6 text-lime-200" />
              <div>
                <h2 className="text-2xl font-semibold">Land Selection</h2>
                <p className="text-sm text-stone-300">
                  Search a location to re-center the map, then click multiple points to draw a field polygon and fetch soil characteristics.
                </p>
              </div>
            </div>

            <LandSelectionMap onSelectionChange={handleSelectionChange} focusLocation={mapFocus} />

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
                <p className="text-sm text-stone-400">Area (sq m)</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {landSelection ? formatNumber(landSelection.areaSquareMeters, 0) : "--"}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
                <p className="text-sm text-stone-400">Area (acres)</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {landSelection ? formatNumber(landSelection.areaAcres) : "--"}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
                <p className="text-sm text-stone-400">Center Latitude</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {landSelection ? formatNumber(landSelection.center.lat, 5) : "--"}
                </p>
              </div>
              <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-4">
                <p className="text-sm text-stone-400">Center Longitude</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {landSelection ? formatNumber(landSelection.center.lon, 5) : "--"}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/10 p-5">
              <div className="mb-3 flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-amber-200" />
                <h3 className="text-lg font-semibold">Soil Summary</h3>
              </div>

              {isFetchingSoil ? (
                <div className="text-sm text-stone-300">
                  <LoadingSpinner size="sm" label="Fetching SoilGrids data..." />
                </div>
              ) : soilProfile ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-stone-400">Classified Soil Type</p>
                    <p className="mt-2 text-xl font-semibold">{soilProfile.soil_type}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-stone-400">Sand</p>
                    <p className="mt-2 text-xl font-semibold">{formatNumber(soilProfile.sand)}%</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-stone-400">Clay</p>
                    <p className="mt-2 text-xl font-semibold">{formatNumber(soilProfile.clay)}%</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-stone-400">Silt</p>
                    <p className="mt-2 text-xl font-semibold">{formatNumber(soilProfile.silt)}%</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-stone-400">pH</p>
                    <p className="mt-2 text-xl font-semibold">{formatNumber(soilProfile.ph)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-stone-400">Organic Carbon</p>
                    <p className="mt-2 text-xl font-semibold">
                      {formatNumber(soilProfile.organic_carbon_percent)}%
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-stone-300">
                  Draw a polygon to fetch soil texture, pH, and organic carbon from SoilGrids.
                </p>
              )}
            </div>
          </div>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-glow backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3">
              <CloudSun className="h-6 w-6 text-sky-200" />
              <div>
                <h2 className="text-2xl font-semibold">Live Weather Lookup</h2>
                <p className="text-sm text-stone-300">Check current weather using the free Open-Meteo API before you simulate.</p>
              </div>
            </div>

            <form className="grid gap-4 lg:grid-cols-[1fr_auto]" onSubmit={handleWeatherLookup}>
              <input
                type="text"
                value={weatherLocation}
                onChange={(event) => setWeatherLocation(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
                placeholder="Enter city or village, e.g. Hyderabad"
              />
              <button
                type="submit"
                disabled={isFetchingWeather}
                className="flex items-center justify-center gap-2 rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Search className="h-4 w-4" />
                {isFetchingWeather ? <LoadingSpinner size="sm" label="Checking..." /> : "Check Weather"}
              </button>
            </form>

            {weather ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-lime-200">
                      <MapPinned className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {weather.location.name}
                        {weather.location.country ? `, ${weather.location.country}` : ""}
                      </span>
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold">{weather.current_weather.summary}</h3>
                    <p className="mt-1 text-sm text-stone-300">Observed at {weather.current_weather.observed_at}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sky-200">
                        <SunMedium className="h-4 w-4" />
                        <span className="text-sm">Temperature</span>
                      </div>
                      <p className="text-xl font-semibold">{weather.current_weather.temperature} deg C</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sky-200">
                        <Droplets className="h-4 w-4" />
                        <span className="text-sm">Humidity</span>
                      </div>
                      <p className="text-xl font-semibold">{weather.current_weather.humidity}%</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sky-200">
                        <CloudSun className="h-4 w-4" />
                        <span className="text-sm">Precipitation</span>
                      </div>
                      <p className="text-xl font-semibold">{weather.current_weather.precipitation} mm</p>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sky-200">
                        <Wind className="h-4 w-4" />
                        <span className="text-sm">Wind Speed</span>
                      </div>
                      <p className="text-xl font-semibold">{weather.current_weather.wind_speed} km/h</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-5">
                  <h3 className="mb-4 text-lg font-semibold">3-Day Forecast</h3>
                  <div className="grid gap-3">
                    {weather.forecast.map((day) => (
                      <div key={day.date} className="rounded-2xl bg-white/5 p-4">
                        <p className="text-sm text-stone-300">{day.date}</p>
                        <p className="mt-2 text-lg font-semibold">
                          {day.temperature_max} / {day.temperature_min} deg C
                        </p>
                        <p className="mt-1 text-sm text-stone-400">Precipitation: {day.precipitation_sum} mm</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            <p className="mt-4 text-sm text-stone-300">
              After lookup, temperature, humidity, and precipitation are automatically filled into the simulator inputs below and the map zooms to the searched location.
            </p>
          </section>
        </section>

        <div className="grid gap-6">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-glow backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Field Inputs</h2>
              <p className="mt-2 text-sm text-stone-300">
                Weather can auto-fill from the location lookup, while acreage and soil values come from the drawn land polygon.
              </p>
            </div>

            <form className="grid gap-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-100" htmlFor="selected_farm">
                    Select Farm
                  </label>
                  <select
                    id="selected_farm"
                    value={selectedFarmId}
                    onChange={handleFarmSelect}
                    className="w-full rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
                  >
                    <option value="">Choose a saved farm</option>
                    {FARMS.map((farm) => (
                      <option key={farm.id} value={farm.id}>
                        {farm.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-stone-300">
                    Selecting a farm auto-fills soil data, land area, map location, and weather location.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-100" htmlFor="rainfall">
                    Rainfall (mm)
                  </label>
                  <input
                    id="rainfall"
                    name="rainfall"
                    type="number"
                    step="0.1"
                    className="w-full rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
                    placeholder="210"
                    value={formData.rainfall}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-100" htmlFor="temperature">
                    Temperature (deg C)
                  </label>
                  <input
                    id="temperature"
                    name="temperature"
                    type="number"
                    step="0.1"
                    className="w-full rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
                    placeholder="27"
                    value={formData.temperature}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-100" htmlFor="humidity">
                    Humidity (%)
                  </label>
                  <input
                    id="humidity"
                    name="humidity"
                    type="number"
                    step="0.1"
                    className="w-full rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
                    placeholder="74"
                    value={formData.humidity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-100" htmlFor="acres">
                    Land Area (acres)
                  </label>
                  <input
                    id="acres"
                    name="acres"
                    type="number"
                    step="0.01"
                    className="w-full rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
                    placeholder="1.25"
                    value={formData.acres}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-100" htmlFor="soil_type">
                    Soil Type (editable fallback)
                  </label>
                  <input
                    id="soil_type"
                    name="soil_type"
                    type="text"
                    className="w-full rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-stone-900 outline-none"
                    value={formData.soil_type}
                    placeholder="Draw land polygon to fetch soil type"
                    onChange={handleChange}
                  />
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-4">
                  <p className="text-sm text-stone-400">Soil Profile Snapshot</p>
                  {soilProfile ? (
                    <div className="mt-2 space-y-1 text-sm text-stone-200">
                      <p>Sand: {formatNumber(soilProfile.sand)}%</p>
                      <p>Clay: {formatNumber(soilProfile.clay)}%</p>
                      <p>Silt: {formatNumber(soilProfile.silt)}%</p>
                      <p>pH: {formatNumber(soilProfile.ph)}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-stone-300">Waiting for SoilGrids lookup.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-100">Select Crops</label>
                <CropMultiSelect
                  value={selectedCrops}
                  onChange={handleSelectedCropsChange}
                  maxSelections={MAX_SELECTED_CROPS}
                  error={cropSelectionError}
                />
                <p className="text-sm text-stone-300">
                  Select up to {MAX_SELECTED_CROPS} crops to compare only those options. Leave empty to use automatic crop recommendation across all supported crops.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-100" htmlFor="sand">
                    Sand (%)
                  </label>
                  <input
                    id="sand"
                    name="sand"
                    type="number"
                    step="0.01"
                    className="w-full rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-stone-900 outline-none"
                    value={formData.sand}
                    onChange={handleChange}
                    placeholder="Auto-filled from soil data"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-100" htmlFor="clay">
                    Clay (%)
                  </label>
                  <input
                    id="clay"
                    name="clay"
                    type="number"
                    step="0.01"
                    className="w-full rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-stone-900 outline-none"
                    value={formData.clay}
                    onChange={handleChange}
                    placeholder="Auto-filled from soil data"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-100" htmlFor="silt">
                    Silt (%)
                  </label>
                  <input
                    id="silt"
                    name="silt"
                    type="number"
                    step="0.01"
                    className="w-full rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-stone-900 outline-none"
                    value={formData.silt}
                    onChange={handleChange}
                    placeholder="Auto-filled from soil data"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-100" htmlFor="ph">
                    Soil pH
                  </label>
                  <input
                    id="ph"
                    name="ph"
                    type="number"
                    step="0.01"
                    className="w-full rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-stone-900 outline-none"
                    value={formData.ph}
                    onChange={handleChange}
                    placeholder="Auto-filled from soil data"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-100" htmlFor="organic_carbon">
                    Organic Carbon (%)
                  </label>
                  <input
                    id="organic_carbon"
                    name="organic_carbon"
                    type="number"
                    step="0.01"
                    className="w-full rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-stone-900 outline-none"
                    value={formData.organic_carbon}
                    onChange={handleChange}
                    placeholder="Auto-filled from soil data"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 flex items-center justify-center rounded-2xl bg-leaf-500 px-4 py-3 font-semibold text-white transition hover:bg-leaf-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? <LoadingSpinner size="sm" label="Simulating..." /> : "Simulate"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
