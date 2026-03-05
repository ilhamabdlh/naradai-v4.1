import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Clock, Sparkles, ChevronDown, ChevronUp, ImageIcon, TrendingUp, AlertCircle, Zap } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { useDataFilter } from "@/contexts/DataFilterContext";
import { defaultDashboardContent } from "@/lib/dashboard-content-store";

const EVENT_TYPE_STYLES = {
  spike:  { dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200",   line: "#f59e0b", icon: TrendingUp   },
  pivot:  { dot: "bg-violet-500",  badge: "bg-violet-50 text-violet-700 border-violet-200", line: "#8b5cf6", icon: Zap         },
  drop:   { dot: "bg-rose-500",    badge: "bg-rose-50 text-rose-700 border-rose-200",       line: "#ef4444", icon: AlertCircle  },
};

const POST_TYPE_COLORS: Record<string, string> = {
  reel:        "#06b6d4",
  thread:      "#8b5cf6",
  carousel:    "#f59e0b",
  image:       "#10b981",
  short_video: "#f43f5e",
  live_stream: "#ef4444",
};

const SERIES = [
  { key: "likes",   color: "#f43f5e", label: "Likes"   },
  { key: "replies", color: "#06b6d4", label: "Replies" },
  { key: "shares",  color: "#8b5cf6", label: "Shares"  },
] as const;

const HORIZON_SLICE: Record<string, number> = { "7d": 7, "30d": 14, "90d": 9999 };

function CustomTooltip({ active, payload, label, postEvents, keyEvents }: any) {
  if (!active || !payload?.length) return null;
  const post = postEvents?.find((p: any) => p.date === label);
  const event = keyEvents?.find((e: any) => e.date === label);
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 min-w-[200px] text-sm">
      <p className="font-semibold text-slate-800 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: p.color }} />
            <span className="text-slate-600">{p.name}</span>
          </div>
          <span className="font-medium text-slate-900">{p.value.toLocaleString()}</span>
        </div>
      ))}
      {post && (
        <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: POST_TYPE_COLORS[post.type] }} />
          <span className="text-xs text-slate-500">{post.label}</span>
        </div>
      )}
      {event && (
        <div className="mt-1.5 flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />
          <span className="text-xs text-amber-700 font-medium">{event.title}</span>
        </div>
      )}
    </div>
  );
}

export function ChronologicalAnalysis() {
  const content = useDashboardContent();
  const { appliedFilter } = useDataFilter();

  const allTimeSeries = content?.campaignTimeSeriesData ?? defaultDashboardContent.campaignTimeSeriesData ?? [];
  const postPublishEvents = content?.campaignPostPublishEvents ?? defaultDashboardContent.campaignPostPublishEvents ?? [];
  const keyEvents = content?.campaignKeyEvents ?? defaultDashboardContent.campaignKeyEvents ?? [];

  const sliceCount = HORIZON_SLICE[appliedFilter.timeHorizon] ?? allTimeSeries.length;
  const timeSeriesData = useMemo(() => allTimeSeries.slice(-sliceCount), [allTimeSeries, sliceCount]);

  const visibleDates = new Set(timeSeriesData.map((d) => d.date));
  const visiblePostEvents = postPublishEvents.filter((p) => visibleDates.has(p.date));
  const visibleKeyEvents = keyEvents.filter((e) => visibleDates.has(e.date));

  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleEvent = (id: string) =>
    setExpandedEvent((prev) => (prev === id ? null : id));

  return (
    <div id="chronological-analysis" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-violet-100 flex items-center justify-center">
          <Clock className="w-5 h-5 text-cyan-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Chronological Analysis</h2>
          <p className="text-sm text-slate-500">Engagement over time with post publish events and trend pivots</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {SERIES.map((s) => (
            <button
              key={s.key}
              onClick={() => toggleSeries(s.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                hiddenSeries.has(s.key)
                  ? "text-slate-400 bg-slate-50 border-slate-200 line-through"
                  : "text-slate-700 bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: hiddenSeries.has(s.key) ? "#cbd5e1" : s.color }} />
              {s.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-px h-4 border-l-2 border-dashed border-cyan-400 inline-block" />
              Post published
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-px h-4 border-l-2 border-dashed border-amber-400 inline-block" />
              Key event
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={timeSeriesData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={45} />
            <Tooltip content={<CustomTooltip postEvents={visiblePostEvents} keyEvents={visibleKeyEvents} />} />
            {visiblePostEvents.map((p) => (
              <ReferenceLine
                key={`post-${p.id}`}
                x={p.date}
                stroke={POST_TYPE_COLORS[p.type] ?? "#94a3b8"}
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{ value: "▲", position: "top", fill: POST_TYPE_COLORS[p.type] ?? "#94a3b8", fontSize: 10 }}
              />
            ))}
            {visibleKeyEvents.map((e) => {
              const style = EVENT_TYPE_STYLES[e.type as keyof typeof EVENT_TYPE_STYLES];
              return (
                <ReferenceLine
                  key={`event-${e.id}`}
                  x={e.date}
                  stroke={style?.line ?? "#94a3b8"}
                  strokeDasharray="6 3"
                  strokeWidth={2}
                  label={{ value: "★", position: "insideTopRight", fill: style?.line ?? "#94a3b8", fontSize: 11 }}
                />
              );
            })}
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
                hide={hiddenSeries.has(s.key)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {visiblePostEvents.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Posts Published</p>
            <div className="flex flex-wrap gap-2">
              {visiblePostEvents.map((p) => (
                <span
                  key={p.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600"
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: POST_TYPE_COLORS[p.type] ?? "#94a3b8" }} />
                  <span className="text-slate-400 font-normal">{p.date}</span>
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {visibleKeyEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-700">Key Events & AI Insights</h3>
          </div>
          {visibleKeyEvents.map((event) => {
            const styles = EVENT_TYPE_STYLES[event.type as keyof typeof EVENT_TYPE_STYLES];
            const EventIcon = styles?.icon ?? Zap;
            const isOpen = expandedEvent === event.id;
            return (
              <div key={event.id} className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
                  onClick={() => toggleEvent(event.id)}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${styles?.badge}`}>
                    <EventIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles?.badge}`}>
                        {event.type === "spike" ? "Spike" : event.type === "pivot" ? "Trend Pivot" : "Drop"}
                      </span>
                      <span className="text-xs text-slate-400">{event.date}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{event.title}</p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4">
                    <div className="rounded-xl bg-gradient-to-br from-slate-50 to-violet-50 border border-violet-100 p-4 flex gap-3">
                      <Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 leading-relaxed">{event.insight}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
