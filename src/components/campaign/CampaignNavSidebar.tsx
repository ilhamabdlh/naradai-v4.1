import { useState, useEffect } from "react";
import {
  Heart,
  Target,
  TrendingUp,
  Clock,
  MessageCircle,
  Zap,
  Layers,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: any;
}

const navItems: NavItem[] = [
  { id: "campaign-overview",      label: "Overview",           icon: Heart },
  { id: "campaign-performance",   label: "Performance",        icon: Target },
  { id: "trends-over-time",       label: "Trends Over Time",   icon: TrendingUp },
  { id: "chronological-analysis",   label: "Chronological",      icon: Clock },
  { id: "reply-sentiment",        label: "Reply Sentiment",    icon: MessageCircle },
  { id: "content-analysis",       label: "Content & Response", icon: Zap },
  { id: "channel-breakdown",      label: "Channel Breakdown",  icon: Layers },
  { id: "competitor-campaigns",   label: "Competitors",        icon: BarChart3 },
  { id: "campaign-recommendations", label: "Recommendations",  icon: Target },
];

export function CampaignNavSidebar() {
  const [activeId, setActiveId] = useState<string>("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const allIds = navItems.map((item) => item.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 }
    );
    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (collapsed) {
    return (
      <div className="sticky top-20 h-[calc(100vh-5rem)] flex flex-col items-center py-4 w-10">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="Expand sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="sticky top-20 h-[calc(100vh-5rem)] w-56 shrink-0 overflow-y-auto py-4 pr-2 scrollbar-thin">
      <div className="flex items-center justify-between mb-3 pl-3 pr-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contents</span>
        <button
          onClick={() => setCollapsed(true)}
          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="Collapse sidebar"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>
      <nav className="space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-sm transition-colors ${
                activeId === item.id
                  ? "bg-violet-50 text-violet-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate flex-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
