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
    <div id={STATS_SECTION_ID} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon] ?? BarChart3;
        return (
          <div
            key={stat.id}
            className="relative overflow-hidden rounded-2xl bg-white backdrop-blur-sm border border-slate-200 p-6 hover:border-violet-300 transition-colors shadow-sm hover:shadow-md"
          >
            <div className="mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
                <Icon className="w-6 h-6 text-violet-600" />
              </div>
            </div>
            <div>
              <div className="text-3xl text-slate-900 mb-1">{stat.value}</div>
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
            </div>
          </div>
        );
      })}
    </div>
  );
}
