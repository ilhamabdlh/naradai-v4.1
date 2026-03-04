import { TrendingUp } from "lucide-react";
import { useState } from "react";

const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];

const datasets: Record<string, number[]> = {
  likes:   [28, 34, 41, 52, 63, 74, 88],
  shares:  [3.2, 3.8, 4.4, 5.1, 5.8, 6.4, 7.2],
  replies: [5.1, 6.0, 7.2, 8.8, 10.4, 12.1, 14.3],
};

const metricConfig: Record<string, { label: string; unit: string; colorBar: string; colorBtn: string }> = {
  likes:   { label: "Likes",   unit: "K", colorBar: "bg-rose-400",   colorBtn: "text-rose-600 bg-rose-50 border-rose-200" },
  shares:  { label: "Shares",  unit: "K", colorBar: "bg-violet-500", colorBtn: "text-violet-600 bg-violet-50 border-violet-200" },
  replies: { label: "Replies", unit: "K", colorBar: "bg-cyan-500",   colorBtn: "text-cyan-600 bg-cyan-50 border-cyan-200" },
};

export function TrendsOverTime() {
  const [activeMetric, setActiveMetric] = useState("likes");
  const data = datasets[activeMetric];
  const max = Math.max(...data);

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
          {Object.keys(metricConfig).map((m) => (
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
          {data.map((val, i) => {
            const heightPct = (val / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs text-slate-500 font-medium">{val}{metricConfig[activeMetric].unit}</span>
                <div className="w-full flex flex-col justify-end" style={{ height: "140px" }}>
                  <div
                    className={`w-full rounded-t-lg ${metricConfig[activeMetric].colorBar} opacity-80 transition-all duration-500`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-xs text-slate-400">{months[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
