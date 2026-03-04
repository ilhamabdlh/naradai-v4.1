import { Target, ChevronRight, AlertTriangle, CheckCircle, Info } from "lucide-react";

const recommendations = [
  {
    priority: "high",
    title: "Double down on TikTok Reels",
    detail: "TikTok shows the highest engagement rate at 12.1%. Increase posting frequency from 2x to 4x per week and allocate an additional 10% of budget.",
    impact: "Est. +18% reach",
  },
  {
    priority: "high",
    title: "Address negative price sentiment",
    detail: "Price & Value theme has a 61% positive sentiment score - the lowest across all themes. Consider highlighting value propositions or limited-time offers.",
    impact: "Est. +9% sentiment",
  },
  {
    priority: "medium",
    title: "Reactivate paused YouTube campaign",
    detail: "Product Launch - ProMax shows 0.55 sentiment. Refreshing the creative and relaunching could improve perception and recapture lost reach.",
    impact: "Est. +280K reach",
  },
  {
    priority: "medium",
    title: "Expand influencer collaboration",
    detail: "The Influencer Collab Series has the highest engagement rate (15.3%). Partnering with 2-3 additional micro-influencers could amplify organic reach.",
    impact: "Est. +400K impressions",
  },
  {
    priority: "low",
    title: "Repurpose top-performing content cross-platform",
    detail: "The TikTok 30-second campaign spot has 92K likes. Repurposing it for Instagram Reels and YouTube Shorts can extend its lifecycle at minimal cost.",
    impact: "Est. +150K engagements",
  },
];

const priorityConfig: Record<string, { label: string; icon: any; style: string }> = {
  high: { label: "High Priority", icon: AlertTriangle, style: "bg-red-50 border-red-200 text-red-700" },
  medium: { label: "Medium Priority", icon: Info, style: "bg-amber-50 border-amber-200 text-amber-700" },
  low: { label: "Low Priority", icon: CheckCircle, style: "bg-emerald-50 border-emerald-200 text-emerald-700" },
};

export function CampaignRecommendations() {
  return (
    <div id="campaign-recommendations" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-md">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">AI Recommendations</h2>
          <p className="text-sm text-slate-500">Data-driven actions to improve campaign performance</p>
        </div>
      </div>
      <div className="space-y-3">
        {recommendations.map((rec) => {
          const cfg = priorityConfig[rec.priority];
          const PriorityIcon = cfg.icon;
          return (
            <div key={rec.title} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className={`mt-0.5 flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${cfg.style}`}>
                  <PriorityIcon className="w-3.5 h-3.5" />
                  {cfg.label}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 mb-1">{rec.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{rec.detail}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1.5 rounded-lg">
                    <ChevronRight className="w-3.5 h-3.5" />
                    {rec.impact}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
