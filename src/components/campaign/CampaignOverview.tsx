import { Heart, Share2, MessageCircle, Info } from "lucide-react";
import { useState } from "react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { defaultDashboardContent } from "@/lib/dashboard-content-store";

const ICON_MAP: Record<string, typeof Heart> = {
  Heart,
  Share2,
  MessageCircle,
};

const COLOR_MAP: Record<string, { color: string; iconBg: string; iconText: string }> = {
  Heart: {
    color: "from-pink-400 to-rose-500",
    iconBg: "from-pink-50 to-rose-50",
    iconText: "text-rose-600",
  },
  Share2: {
    color: "from-violet-400 to-violet-600",
    iconBg: "from-violet-50 to-indigo-50",
    iconText: "text-violet-600",
  },
  MessageCircle: {
    color: "from-cyan-400 to-sky-500",
    iconBg: "from-cyan-50 to-sky-50",
    iconText: "text-cyan-600",
  },
};

const EMERALD_OVERRIDE = [
  "Positive Reply Rate",
  "Positive",
];

export function CampaignOverview() {
  const content = useDashboardContent();
  const stats = content?.campaignStats ?? defaultDashboardContent.campaignStats ?? [];
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
        {stats.map((stat, idx) => {
          const iconKey = stat.icon as keyof typeof ICON_MAP;
          const Icon = ICON_MAP[iconKey] ?? Heart;
          const isEmerald = EMERALD_OVERRIDE.some((l) => stat.label.includes(l));
          const colors = isEmerald
            ? { color: "from-emerald-400 to-teal-500", iconBg: "from-emerald-50 to-teal-50", iconText: "text-emerald-600" }
            : COLOR_MAP[iconKey] ?? COLOR_MAP["Heart"];
          return (
            <div
              key={stat.id ?? idx}
              className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 hover:border-violet-300 transition-colors shadow-sm hover:shadow-md"
            >
              <div className="mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colors.iconText}`} />
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
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.color}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
