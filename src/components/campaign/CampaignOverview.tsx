import { Heart, Share2, MessageCircle, Info } from "lucide-react";
import { useState } from "react";

const stats = [
  {
    label: "Total Likes",
    value: "186K",
    change: "+22%",
    positive: true,
    icon: Heart,
    description: "Total likes received across all campaign posts.",
    color: "from-pink-400 to-rose-500",
    iconBg: "from-pink-50 to-rose-50",
    iconText: "text-rose-600",
  },
  {
    label: "Total Shares",
    value: "28.4K",
    change: "+14%",
    positive: true,
    icon: Share2,
    description: "Total shares and reposts across all platforms.",
    color: "from-violet-400 to-violet-600",
    iconBg: "from-violet-50 to-indigo-50",
    iconText: "text-violet-600",
  },
  {
    label: "Total Replies",
    value: "41.2K",
    change: "+31%",
    positive: true,
    icon: MessageCircle,
    description: "Total replies and comments on campaign posts.",
    color: "from-cyan-400 to-sky-500",
    iconBg: "from-cyan-50 to-sky-50",
    iconText: "text-cyan-600",
  },
  {
    label: "Positive Reply Rate",
    value: "74%",
    change: "+5pts",
    positive: true,
    icon: MessageCircle,
    description: "Percentage of replies classified as positive sentiment.",
    color: "from-emerald-400 to-teal-500",
    iconBg: "from-emerald-50 to-teal-50",
    iconText: "text-emerald-600",
  },
];

export function CampaignOverview() {
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  return (
    <div id="campaign-overview" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-md">
          <Heart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Campaign Overview</h2>
          <p className="text-sm text-slate-500">Likes, shares &amp; reply engagement at a glance</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 hover:border-violet-300 transition-colors shadow-sm hover:shadow-md"
            >
              <div className="mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.iconText}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-slate-600">{stat.label}</span>
                  <div className="relative">
                    <button
                      onMouseEnter={() => setOpenTooltip(stat.label)}
                      onMouseLeave={() => setOpenTooltip(null)}
                      className="text-slate-400 hover:text-violet-500 transition-colors"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                    {openTooltip === stat.label && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 px-3 py-2 rounded-lg bg-slate-800 text-white text-xs leading-relaxed shadow-lg z-10 pointer-events-none">
                        {stat.description}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                      </div>
                    )}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stat.positive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                  {stat.change}
                </span>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
