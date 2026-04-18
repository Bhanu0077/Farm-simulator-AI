import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Leaf, Sprout } from "lucide-react";


const cropColors = {
  Rice: "#84cc16",
  Wheat: "#f59e0b",
  Maize: "#22c55e",
  Barley: "#eab308",
  Chickpea: "#f97316",
  Lentil: "#fb7185",
  "Pigeon Pea": "#facc15",
  Cotton: "#60a5fa",
  Sugarcane: "#34d399",
  Tomato: "#ef4444",
  Potato: "#a16207",
  Onion: "#c084fc",
  Mango: "#f59e0b",
  Banana: "#fde047",
};


export default function SimulatorResultsPanel({
  results,
  emptyTitle = "No simulation yet",
  emptyMessage = "Draw the land, fetch weather, and run the simulator to compare acreage-scaled crop predictions and profits.",
}) {
  const chartData = results
    ? Object.entries(results.predictions).map(([crop, metrics]) => ({
        crop,
        totalYield: metrics.total_predicted_yield,
        profit: metrics.profit,
      }))
    : [];

  return (
    <section className="rounded-xl border border-white/10 bg-[#1f2937] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Simulation Results</h2>
          <p className="mt-2 text-sm leading-6 text-[#9ca3af]">
            Compare total yield, dynamic pricing, and acreage-aware profitability after each run.
          </p>
        </div>
        {results?.recommended_crop ? (
          <div className="rounded-xl border border-[#22c55e]/25 bg-[#22c55e]/10 px-4 py-3 text-sm">
            <span className="text-[#9ca3af]">Best crop:</span>{" "}
            <span className="font-semibold text-lime-100">{results.recommended_crop.name}</span>
          </div>
        ) : null}
      </div>

      {results?.pricing ? (
        <div className="mb-5 rounded-xl border border-white/10 bg-[#111827] p-4 text-sm text-[#9ca3af]">
          Using prices from <span className="font-medium text-stone-100">{results.pricing.source}</span>.
          Updated at {results.pricing.updated_at}
        </div>
      ) : null}

      {results?.inputs?.selected_crops?.length ? (
        <div className="mb-5 rounded-xl border border-white/10 bg-[#111827] p-4">
          <p className="text-sm text-[#9ca3af]">Selected Crops</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {results.inputs.selected_crops.map((crop) => (
              <span
                key={crop}
                className="rounded-full bg-[#22c55e]/15 px-3 py-1 text-sm font-medium text-lime-100"
              >
                {crop}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {!results ? (
        <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-[#111827] px-6 text-center">
          <div className="mb-4 rounded-full bg-[#22c55e]/10 p-4 text-lime-200">
            <Sprout className="h-10 w-10 animate-float" />
          </div>
          <h3 className="text-xl font-semibold">{emptyTitle}</h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#9ca3af]">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(results.predictions).map(([crop, metrics]) => {
              const isBestCrop = results.recommended_crop.name === crop;

              return (
                <article
                  key={crop}
                  className={`rounded-xl border p-4 transition ${
                    isBestCrop
                      ? "border-[#22c55e]/40 bg-[#22c55e]/10 shadow-[0_0_0_1px_rgba(34,197,94,0.2)]"
                      : "border-white/10 bg-[#111827]"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">{crop}</h3>
                      <p className="mt-1 text-sm text-[#9ca3af]">{metrics.risk_level} risk</p>
                    </div>
                    {isBestCrop ? (
                      <div className="rounded-full bg-[#22c55e] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0f172a]">
                        Recommended
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-2 text-sm text-stone-200">
                    <p>
                      <span className="text-[#9ca3af]">Yield per acre:</span> {metrics.predicted_yield_per_acre}
                    </p>
                    <p>
                      <span className="text-[#9ca3af]">Total yield:</span> {metrics.total_predicted_yield}
                    </p>
                    <p>
                      <span className="text-[#9ca3af]">Price used:</span> ${metrics.unit_price}
                    </p>
                    <p>
                      <span className="text-[#9ca3af]">Profit:</span> ${metrics.profit}
                    </p>
                    <p>
                      <span className="text-[#9ca3af]">Explanation:</span> {metrics.explanation}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="rounded-xl border border-white/10 bg-[#111827] p-4">
            <div className="mb-4 flex items-center gap-2">
              <Leaf className="h-5 w-5 text-[#22c55e]" />
              <h3 className="text-lg font-semibold">Total Yield Comparison</h3>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                  <XAxis dataKey="crop" stroke="#d6d3d1" />
                  <YAxis stroke="#d6d3d1" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      color: "#f9fafb",
                    }}
                    itemStyle={{ color: "#f9fafb" }}
                    labelStyle={{ color: "#f9fafb" }}
                  />
                  <Bar dataKey="totalYield" radius={[12, 12, 0, 0]}>
                    {chartData.map((entry) => (
                      <Cell key={entry.crop} fill={cropColors[entry.crop] || "#84cc16"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
