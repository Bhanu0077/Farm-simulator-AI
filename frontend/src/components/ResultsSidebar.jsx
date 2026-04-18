import { useState } from "react";
import { AlertTriangle, ChevronDown, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import LoadingSpinner from "./LoadingSpinner";
import OfflineFarmChatbot from "./OfflineFarmChatbot";
import { getRiskAnalysis } from "../services/riskAnalysis";


function CollapsiblePanel({ title, icon: Icon, isOpen, onToggle, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-[#1f2937] shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 p-4 text-left transition hover:bg-white/[0.05]"
      >
        <span className="flex items-center gap-3">
          <span className="rounded-xl bg-white/10 p-2 text-[#22c55e]">
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold text-white">{title}</span>
        </span>
        <ChevronDown className={`h-5 w-5 text-[#9ca3af] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-white/10 p-4">{children}</div>
        </div>
      </div>
    </section>
  );
}


export default function ResultsSidebar({ recommendedCrop, riskPayload }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [isRiskOpen, setIsRiskOpen] = useState(true);
  const [riskAnalysis, setRiskAnalysis] = useState(null);
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false);
  const [riskError, setRiskError] = useState("");

  const handleRiskAnalysis = async () => {
    setIsAnalyzingRisk(true);
    setRiskError("");

    try {
      const analysis = await getRiskAnalysis(riskPayload);
      setRiskAnalysis(analysis);
      toast.success("Risk analysis ready");
    } catch (error) {
      const message = error.message || "Unable to analyze farming risk right now.";
      setRiskError(message);
      toast.error("Risk analysis unavailable");
    } finally {
      setIsAnalyzingRisk(false);
    }
  };

  return (
    <aside className="flex-[3] border-l border-[#1f2937] bg-[#111827] p-5 shadow-[-18px_0_45px_rgba(0,0,0,0.22)] lg:h-screen lg:min-w-[340px] lg:max-w-[440px] lg:overflow-y-auto max-lg:fixed max-lg:inset-x-3 max-lg:bottom-3 max-lg:z-[900] max-lg:max-h-[82vh] max-lg:overflow-y-auto max-lg:rounded-xl max-lg:border max-lg:border-white/10 max-lg:bg-[#111827]/95 max-lg:p-4 max-lg:backdrop-blur-xl">
      <div className="flex h-full flex-col gap-5">
        <button
          type="button"
          onClick={() => setIsSidebarOpen((current) => !current)}
          className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left font-semibold text-white transition hover:bg-white/[0.14] lg:hidden"
        >
          <span>Farm Assistant</span>
          <ChevronDown className={`h-5 w-5 transition-transform ${isSidebarOpen ? "rotate-180" : ""}`} />
        </button>

        <div className={`${isSidebarOpen ? "flex" : "hidden"} flex-1 flex-col gap-5 lg:flex`}>
          <CollapsiblePanel
            title="Chatbot"
            icon={MessageCircle}
            isOpen={isChatOpen}
            onToggle={() => setIsChatOpen((current) => !current)}
          >
            <OfflineFarmChatbot
              embedded
              recommendedCrop={recommendedCrop}
              soil={riskPayload.soil}
              weather={riskPayload.weather}
              land={riskPayload.land}
            />
          </CollapsiblePanel>

          <CollapsiblePanel
            title="Risk Analysis"
            icon={AlertTriangle}
            isOpen={isRiskOpen}
            onToggle={() => setIsRiskOpen((current) => !current)}
          >
            <button
              type="button"
              onClick={handleRiskAnalysis}
              disabled={isAnalyzingRisk}
              className="mb-4 inline-flex w-full items-center justify-center rounded-xl bg-[#f59e0b] px-4 py-3 font-semibold text-[#111827] transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isAnalyzingRisk ? <LoadingSpinner size="sm" label="Analyzing..." /> : "Analyze Risk"}
            </button>

            {riskError ? (
              <div className="rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/10 p-4 text-sm text-red-100">
                Risk analysis is unavailable right now. {riskError}
              </div>
            ) : null}

            {riskAnalysis ? (
              <div className="space-y-3">
                <div className="rounded-xl border border-[#f59e0b]/25 bg-[#f59e0b]/10 p-4">
                  <p className="text-sm text-[#9ca3af]">Risk Level</p>
                  <p className="mt-2 text-2xl font-bold text-amber-100">{riskAnalysis.overallRisk}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-[#9ca3af]">Soil Risk</p>
                  <p className="mt-2 text-sm font-medium text-stone-100">{riskAnalysis.soilRisk}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-[#9ca3af]">Water Risk</p>
                  <p className="mt-2 text-sm font-medium text-stone-100">{riskAnalysis.waterRisk}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-[#9ca3af]">Weather Risk</p>
                  <p className="mt-2 text-sm font-medium text-stone-100">{riskAnalysis.weatherRisk}</p>
                </div>
                {riskAnalysis.recommendations?.length ? (
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-sm text-[#9ca3af]">Recommendations</p>
                    <div className="mt-3 space-y-2 text-sm text-stone-100">
                      {riskAnalysis.recommendations.map((recommendation) => (
                        <p key={recommendation}>* {recommendation}</p>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="rounded-xl bg-white/5 p-4 text-sm text-stone-300">
                Click Analyze Risk to evaluate soil, water, weather, and land-size risk for this simulation.
              </p>
            )}
          </CollapsiblePanel>
        </div>
      </div>
    </aside>
  );
}
