import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Droplets, Leaf, LogOut, Sprout, SunMedium, Trees } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";


const initialFormState = {
  rainfall: "",
  temperature: "",
  humidity: "",
  soil_type: "Loamy",
};

const cropColors = {
  Rice: "#84cc16",
  Wheat: "#f59e0b",
  Corn: "#22c55e",
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


export default function Simulator() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState(initialFormState);
  const [results, setResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        rainfall: Number(formData.rainfall),
        temperature: Number(formData.temperature),
        humidity: Number(formData.humidity),
        soil_type: formData.soil_type,
      };

      const response = await api.post("/predict", payload);
      setResults(response.data);
      toast.success("Simulation complete");
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

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  const chartData = results
    ? Object.entries(results.predictions).map(([crop, metrics]) => ({
        crop,
        yield: metrics.predicted_yield,
        profit: metrics.profit,
      }))
    : [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.08),transparent_30%),linear-gradient(180deg,#0e1b11_0%,#142419_40%,#261d14_100%)] px-4 py-6 text-stone-50 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-glow backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-lime-200/80">Smart Farm Simulator</p>
            <h1 className="mt-2 text-3xl font-semibold">Welcome back, {user?.name || "Farmer"}</h1>
            <p className="mt-2 max-w-2xl text-sm text-stone-300">
              Run a crop simulation using your field conditions and compare expected yield, profit, and operational risk across Rice, Wheat, and Corn.
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

        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <MetricCard icon={Droplets} label="Rainfall Range" value="90-220 mm" helper="Balanced water planning improves yield confidence." />
          <MetricCard icon={SunMedium} label="Temperature Range" value="18-30 deg C" helper="Crop stress increases beyond the preferred window." />
          <MetricCard icon={Trees} label="Supported Soils" value="Loamy / Sandy / Clay / Silt" helper="Soil profile changes yield and risk scoring." />
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-glow backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">Field Inputs</h2>
              <p className="mt-2 text-sm text-stone-300">Enter your current field conditions to simulate crop outcomes.</p>
            </div>

            <form className="grid gap-5" onSubmit={handleSubmit}>
              <div className="grid gap-5 md:grid-cols-2">
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
                  <label className="text-sm font-medium text-stone-100" htmlFor="soil_type">
                    Soil Type
                  </label>
                  <select
                    id="soil_type"
                    name="soil_type"
                    className="w-full rounded-2xl border border-white/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-200/30"
                    value={formData.soil_type}
                    onChange={handleChange}
                  >
                    <option value="Loamy">Loamy</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Clay">Clay</option>
                    <option value="Silt">Silt</option>
                  </select>
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

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-6 shadow-glow backdrop-blur-xl">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Simulation Results</h2>
                <p className="mt-2 text-sm text-stone-300">Compare output, profit, and field risk after each run.</p>
              </div>
              {results?.recommended_crop ? (
                <div className="rounded-2xl border border-lime-200/30 bg-lime-300/10 px-4 py-3 text-sm">
                  <span className="text-stone-300">Best crop:</span>{" "}
                  <span className="font-semibold text-lime-100">{results.recommended_crop.name}</span>
                </div>
              ) : null}
            </div>

            {!results ? (
              <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-white/15 bg-black/10 px-6 text-center">
                <div className="mb-4 rounded-full bg-lime-300/10 p-4 text-lime-200">
                  <Sprout className="h-10 w-10 animate-float" />
                </div>
                <h3 className="text-xl font-semibold">No simulation yet</h3>
                <p className="mt-2 max-w-md text-sm text-stone-300">
                  Fill in the field inputs and run the simulator to see crop predictions, profitability, and the recommended crop.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  {Object.entries(results.predictions).map(([crop, metrics]) => {
                    const isBestCrop = results.recommended_crop.name === crop;

                    return (
                      <article
                        key={crop}
                        className={`rounded-[1.5rem] border p-4 transition ${
                          isBestCrop
                            ? "border-lime-200/40 bg-lime-300/10 shadow-[0_0_0_1px_rgba(190,242,100,0.2)]"
                            : "border-white/10 bg-black/10"
                        }`}
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-semibold">{crop}</h3>
                            <p className="mt-1 text-sm text-stone-300">{metrics.risk_level} risk</p>
                          </div>
                          {isBestCrop ? (
                            <div className="rounded-full bg-lime-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-stone-900">
                              Recommended
                            </div>
                          ) : null}
                        </div>

                        <div className="space-y-2 text-sm text-stone-200">
                          <p>
                            <span className="text-stone-400">Predicted yield:</span> {metrics.predicted_yield}
                          </p>
                          <p>
                            <span className="text-stone-400">Estimated profit:</span> ${metrics.profit}
                          </p>
                          <p>
                            <span className="text-stone-400">Explanation:</span> {metrics.explanation}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/10 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <Leaf className="h-5 w-5 text-lime-200" />
                    <h3 className="text-lg font-semibold">Predicted Yield Comparison</h3>
                  </div>

                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                        <XAxis dataKey="crop" stroke="#d6d3d1" />
                        <YAxis stroke="#d6d3d1" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1c1917",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "1rem",
                            color: "#fafaf9",
                          }}
                        />
                        <Bar dataKey="yield" radius={[12, 12, 0, 0]}>
                          {chartData.map((entry) => (
                            <Cell key={entry.crop} fill={cropColors[entry.crop]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
