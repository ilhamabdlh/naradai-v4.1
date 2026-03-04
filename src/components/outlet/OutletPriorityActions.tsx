import { Target, AlertTriangle, Info, CheckCircle } from "lucide-react";

const actions = [
  {
    priority: "high",
    outlet: "Jakarta Flagship",
    region: "DKI Jakarta",
    title: "Address wait time complaints urgently",
    detail:
      "Wait time mentions spiked 45% in the last 48 hours. Negative reviews citing 'slow service' now account for 38% of all reviews for this outlet. Immediate staffing review recommended.",
    impact: "Est. +0.6 score",
  },
  {
    priority: "high",
    outlet: "Medan Central",
    region: "North Sumatra",
    title: "Investigate pricing & cleanliness issues",
    detail:
      "Persistent complaints about overpriced items and facility hygiene. Sentiment dropped 22pts MoM. An on-site audit and price alignment with regional average is advised.",
    impact: "Est. +0.5 score",
  },
  {
    priority: "medium",
    outlet: "Surabaya East",
    region: "East Java",
    title: "Respond to product availability feedback",
    detail:
      "Customers repeatedly mention out-of-stock items during peak hours. Aligning inventory reorder points with foot traffic data could reduce stockout complaints by ~60%.",
    impact: "Est. +0.3 score",
  },
  {
    priority: "medium",
    outlet: "Bandung Dago",
    region: "West Java",
    title: "Leverage high satisfaction as showcase outlet",
    detail:
      "Scoring 4.6/5 — the highest in the network. Document service practices and replicate the SOP across the 8 underperforming outlets in West Java.",
    impact: "Network +0.2 avg",
  },
  {
    priority: "low",
    outlet: "All Regions",
    region: "National",
    title: "Launch post-visit review reminder campaign",
    detail:
      "Review collection rate is 12% below target. A simple SMS/WhatsApp prompt sent 2 hours after visit could increase review volume and provide better signal on emerging issues.",
    impact: "Est. +30% reviews",
  },
];

const priorityConfig: Record<string, { label: string; icon: any; style: string }> = {
  high:   { label: "High Priority",   icon: AlertTriangle, style: "bg-red-50 border-red-200 text-red-700" },
  medium: { label: "Medium Priority", icon: Info,          style: "bg-amber-50 border-amber-200 text-amber-700" },
  low:    { label: "Low Priority",    icon: CheckCircle,   style: "bg-emerald-50 border-emerald-200 text-emerald-700" },
};

export function OutletPriorityActions() {
  return (
    <div id="outlet-priority-actions" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-md">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Priority Actions</h2>
          <p className="text-sm text-slate-500">AI-identified actions to improve outlet performance</p>
        </div>
      </div>
      <div className="space-y-3">
        {actions.map((action) => {
          const cfg = priorityConfig[action.priority];
          const PriorityIcon = cfg.icon;
          return (
            <div
              key={action.title}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${cfg.style}`}>
                  <PriorityIcon className="w-3.5 h-3.5" />
                  {cfg.label}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{action.title}</h4>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                      {action.outlet}
                    </span>
                    <span className="text-xs text-slate-400">{action.region}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{action.detail}</p>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
