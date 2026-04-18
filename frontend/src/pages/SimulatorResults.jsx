import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LogOut, Sprout } from "lucide-react";
import { toast } from "sonner";

import ResultsSidebar from "../components/ResultsSidebar";
import SimulatorResultsPanel from "../components/SimulatorResultsPanel";
import { useAuth } from "../context/AuthContext";
import { getRecommendedCrop } from "../utils/recommendedCrop";


export default function SimulatorResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const simulationState = location.state?.simulationState;

  if (!simulationState?.results) {
    return <Navigate to="/simulator" replace />;
  }

  const riskPayload = {
    soil: {
      sand: simulationState.soilProfile?.sand ?? simulationState.formData?.sand,
      clay: simulationState.soilProfile?.clay ?? simulationState.formData?.clay,
      silt: simulationState.soilProfile?.silt ?? simulationState.formData?.silt,
      ph: simulationState.soilProfile?.ph ?? simulationState.formData?.ph,
      organicCarbon:
        simulationState.soilProfile?.organic_carbon_percent ?? simulationState.formData?.organic_carbon,
      soilType: simulationState.soilProfile?.soil_type ?? simulationState.formData?.soil_type,
    },
    weather: {
      temperature:
        simulationState.weather?.current_weather?.temperature ?? simulationState.formData?.temperature,
      rainfall:
        simulationState.weather?.current_weather?.precipitation ?? simulationState.formData?.rainfall,
      humidity: simulationState.weather?.current_weather?.humidity ?? simulationState.formData?.humidity,
    },
    land: {
      acres: simulationState.landSelection?.areaAcres ?? simulationState.formData?.acres,
    },
  };

  const recommendedCrop = getRecommendedCrop(riskPayload);

  const handleBack = () => {
    navigate("/simulator", {
      replace: true,
      state: {
        simulatorState: simulationState,
      },
    });
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <div className="h-screen overflow-hidden bg-[#0f172a] text-[#f9fafb]">
      <div className="flex h-full">
        <main className="min-w-0 flex-[7] overflow-y-auto p-4 sm:p-6 lg:p-8">
          <header className="mb-6 flex flex-col gap-4 rounded-xl border border-white/10 bg-[#1f2937] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22)] lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#22c55e]">
                Smart Farm Simulator
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back, {user?.name || "Farmer"}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9ca3af]">
                Review the latest crop simulation, then return to the input page to adjust weather, land, or soil values.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm font-medium text-white transition hover:border-[#22c55e]/40 hover:bg-[#111827]"
              >
                Back to Inputs
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm font-medium text-white transition hover:border-red-300/40 hover:bg-[#111827]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </header>

          <div className="space-y-6">
            <section className="rounded-xl border border-[#22c55e]/20 bg-[#22c55e]/10 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.2)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#22c55e]">Farm Insight</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="inline-flex self-start rounded-xl bg-[#22c55e] p-2 text-[#0f172a]">
                  <Sprout className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Recommended Crop: {recommendedCrop}
                </h2>
              </div>
              <p className="mt-2 text-sm leading-6 text-[#d1d5db]">
                This recommendation is generated offline from your current soil profile, rainfall, temperature, and land conditions.
              </p>
            </section>

            <SimulatorResultsPanel results={simulationState.results} />
          </div>
        </main>

        <ResultsSidebar recommendedCrop={recommendedCrop} riskPayload={riskPayload} />
      </div>
    </div>
  );
}
