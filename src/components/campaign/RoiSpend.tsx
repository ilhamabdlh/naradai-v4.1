import { DollarSign } from "lucide-react";

const spendData = [
  { channel: "Instagram", spend: 42000, roi: 300, color: "from-pink-400 to-rose-500" },
  { channel: "TikTok", spend: 28000, roi: 250, color: "from-slate-700 to-slate-900" },
  { channel: "Twitter/X", spend: 18000, roi: 200, color: "from-sky-400 to-blue-500" },
  { channel: "YouTube", spend: 35000, roi: 150, color: "from-red-400 to-red-600" },
  { channel: "Facebook", spend: 22000, roi: 120, color: "from-blue-500 to-indigo-600" },
];

const totalSpend = spendData.reduce((s, d) => s + d.spend, 0);

export function RoiSpend() {
  return (
    <div id="roi-spend" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">ROI &amp; Spend</h2>
          <p className="text-sm text-slate-500">Budget allocation and return on investment by channel</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Spend Allocation</h3>
          <div className="space-y-3">
            {spendData.map((d) => {
              const pct = Math.round((d.spend / totalSpend) * 100);
              return (
                <div key={d.channel}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 font-medium">{d.channel}</span>
                    <span className="text-slate-500">${(d.spend / 1000).toFixed(0)}K ({pct}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${d.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">ROI by Channel</h3>
          <div className="space-y-3">
            {[...spendData].sort((a, b) => b.roi - a.roi).map((d) => (
              <div key={d.channel} className="flex items-center gap-3">
                <span className="text-sm text-slate-700 w-24 shrink-0">{d.channel}</span>
                <div className="flex-1 h-6 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-lg bg-gradient-to-r ${d.color} opacity-80 flex items-center justify-end pr-2`}
                    style={{ width: `${Math.min((d.roi / 350) * 100, 100)}%` }}
                  >
                    <span className="text-white text-xs font-bold">{d.roi}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">ROI = (Revenue - Spend) / Spend x 100</p>
        </div>
      </div>
    </div>
  );
}
