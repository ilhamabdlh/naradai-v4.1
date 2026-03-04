import { Users } from "lucide-react";

const ageGroups = [
  { group: "18-24", pct: 28, color: "from-violet-400 to-violet-600" },
  { group: "25-34", pct: 38, color: "from-cyan-400 to-cyan-600" },
  { group: "35-44", pct: 20, color: "from-emerald-400 to-emerald-600" },
  { group: "45-54", pct: 10, color: "from-amber-400 to-amber-600" },
  { group: "55+", pct: 4, color: "from-rose-400 to-rose-600" },
];

const genders = [
  { label: "Female", pct: 56, color: "bg-pink-400" },
  { label: "Male", pct: 40, color: "bg-blue-400" },
  { label: "Other", pct: 4, color: "bg-slate-400" },
];

const topLocations = [
  { city: "Jakarta", pct: 34 },
  { city: "Surabaya", pct: 18 },
  { city: "Bandung", pct: 13 },
  { city: "Medan", pct: 9 },
  { city: "Makassar", pct: 7 },
];

export function AudienceInsights() {
  return (
    <div id="audience-insights" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
          <Users className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Audience Insights</h2>
          <p className="text-sm text-slate-500">Demographics and geographic breakdown of campaign audience</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Age Distribution</h3>
          <div className="space-y-2.5">
            {ageGroups.map((a) => (
              <div key={a.group}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{a.group}</span>
                  <span className="font-medium text-slate-800">{a.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full bg-gradient-to-r ${a.color}`} style={{ width: `${a.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Gender Split</h3>
          <div className="flex items-center h-4 rounded-full overflow-hidden mt-2">
            {genders.map((g) => (
              <div key={g.label} className={`h-full ${g.color}`} style={{ width: `${g.pct}%` }} />
            ))}
          </div>
          <div className="flex gap-4 flex-wrap mt-3">
            {genders.map((g) => (
              <div key={g.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full ${g.color}`} />
                <span className="text-sm text-slate-600">{g.label} <span className="font-semibold text-slate-800">{g.pct}%</span></span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-800">Top Locations</h3>
          <div className="space-y-2.5">
            {topLocations.map((loc, i) => (
              <div key={loc.city} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-4">#{i + 1}</span>
                <span className="text-sm text-slate-700 flex-1">{loc.city}</span>
                <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" style={{ width: `${loc.pct}%` }} />
                </div>
                <span className="text-xs font-medium text-slate-600 w-8 text-right">{loc.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
