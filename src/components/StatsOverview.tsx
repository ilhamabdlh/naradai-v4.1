import { TrendingUp, AlertTriangle, Users, BarChart3, Info } from "lucide-react";
import { useState } from "react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";

const iconMap: Record<string, typeof Users> = {
  Users,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  MessageSquare: BarChart3,
};

const cardStyles: {
  color: string;
  iconBg: string;
  iconText: string;
}[] = [
  {
    color: "from-violet-400 to-indigo-500",
    iconBg: "from-violet-50 to-indigo-50",
    iconText: "text-violet-600",
  },
  {
    color: "from-emerald-400 to-teal-500",
    iconBg: "from-emerald-50 to-teal-50",
    iconText: "text-emerald-600",
  },
  {
    color: "from-red-400 to-rose-500",
    iconBg: "from-red-50 to-rose-50",
    iconText: "text-red-600",
  },
  {
    color: "from-cyan-400 to-sky-500",
    iconBg: "from-cyan-50 to-sky-50",
    iconText: "text-cyan-600",
  },
];

export const STATS_SECTION_ID = "overview";

const defaultStats = [
  { id: "1", label: "Conversations Analyzed", value: "—", description: "Posts and comments containing keywords related to your brand and competitors", icon: "Users" },
  { id: "2", label: "Average Sentiment Score", value: "—", description: "The average sentiment score (0.0–1.0) of the conversations related to your brand", icon: "TrendingUp" },
  { id: "3", label: "Critical Issues", value: "—", description: "Critical issues identified by Naradai AI where sentiment is relatively worse with mentions volume relatively higher", icon: "AlertTriangle" },
  { id: "4", label: "Share of Voice", value: "—", description: "Your brand's share of total conversations compared to competitors", icon: "BarChart3" },
];

export function StatsOverview() {
  const content = useDashboardContent();
  const stats = (content?.statsOverview?.length ? content.statsOverview : defaultStats) as { id: string; label: string; value: string; description: string; icon: string }[];
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  return (
    <div id={STATS_SECTION_ID} className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-md">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Brand Overview</h2>
          <p className="text-sm text-slate-500">Key metrics and conversation snapshot for your brand</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = iconMap[stat.icon] ?? BarChart3;
          const style = cardStyles[i % cardStyles.length];
          return (
            <div
              key={stat.id}
              className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 hover:border-violet-300 transition-colors shadow-sm hover:shadow-md"
            >
              <div className="mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${style.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${style.iconText}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-slate-600">{stat.label}</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenTooltip(openTooltip === stat.label ? null : stat.label)}
                    onMouseEnter={() => setOpenTooltip(stat.label)}
                    onMouseLeave={() => setOpenTooltip(null)}
                    className="text-slate-400 hover:text-violet-500 transition-colors"
                    aria-label={`Info about ${stat.label}`}
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
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${style.color}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
