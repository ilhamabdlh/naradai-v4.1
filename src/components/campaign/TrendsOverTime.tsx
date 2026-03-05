import { TrendingUp } from "lucide-react";
import { useState } from "react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { useDataFilter } from "@/contexts/DataFilterContext";
import { defaultDashboardContent } from "@/lib/dashboard-content-store";

type MetricKey = "likes" | "shares" | "replies";

const metricConfig: Record<MetricKey, { label: string; unit: string; colorBar: string; colorBtn: string }> = {
  likes:   { label: "Likes",   unit: "K", colorBar: "bg-rose-400",   colorBtn: "text-rose-600 bg-rose-50 border-rose-200" },
  shares:  { label: "Shares",  unit: "K", colorBar: "bg-violet-500", colorBtn: "text-violet-600 bg-violet-50 border-violet-200" },
  replies: { label: "Replies", unit: "K", colorBar: "bg-cyan-500",   colorBtn: "text-cyan-600 bg-cyan-50 border-cyan-200" },
};

const HORIZON_SLICE: Record<string, number> = {
  "7d":  2,
  "30d": 4,
  "90d": 7,
};

export function TrendsOverTime() {
  const content = useDashboardContent();
  const { appliedFilter } = useDataFilter();
  const allData = content?.campaignTrendData ?? defaultDashboardContent.campaignTrendData ?? [];

  const sliceCount = HORIZON_SLICE[appliedFilter.timeHorizon] ?? allData.length;
  const data = allData.slice(-sliceCount);

  const [activeMetric, setActiveMetric] = useState<MetricKey>("likes");
  const values = data.map((d) => d[activeMetric] as number);
  const max = Math.max(...values, 1);

  return (
    <div id="trends-over-time" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Trends Over Time</h2>
          <p className="text-sm text-slate-500">Monthly engagement trends across likes, shares & replies</p>
        </div>
      </div>
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(metricConfig) as MetricKey[]).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMetric(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                activeMetric === m
                  ? metricConfig[m].colorBtn
                  : "text-slate-500 bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              {metricConfig[m].label} ({metricConfig[m].unit})
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2" style={{ height: "192px" }}>
          {data.map((d, i) => {
            const val = d[activeMetric] as number;
            const heightPct = (val / max) * 100;
            return (
              <div key={d.id ?? i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">{val}{metricConfig[activeMetric].unit}</span>
                <div className="w-full flex flex-col justify-end" style={{ height: "140px" }}>
                  <div
                    className={`w-full rounded-t-lg ${metricConfig[activeMetric].colorBar} opacity-80 transition-all duration-500`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
