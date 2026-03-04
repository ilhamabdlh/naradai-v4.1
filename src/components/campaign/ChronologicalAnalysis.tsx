import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Dot,
} from "recharts";
import { Clock, Sparkles, ChevronDown, ChevronUp, ImageIcon, TrendingUp, AlertCircle, Zap } from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────

const timeSeriesData = [
  { date: "Jan 5",  likes: 820,  replies: 94,  shares: 61 },
  { date: "Jan 8",  likes: 910,  replies: 102, shares: 70 },
  { date: "Jan 10", likes: 870,  replies: 98,  shares: 66 },
  { date: "Jan 13", likes: 1050, replies: 130, shares: 85 },
  { date: "Jan 15", likes: 1420, replies: 198, shares: 120 },
  { date: "Jan 18", likes: 1310, replies: 177, shares: 108 },
  { date: "Jan 20", likes: 1180, replies: 155, shares: 95 },
  { date: "Jan 22", likes: 1390, replies: 185, shares: 114 },
  { date: "Jan 25", likes: 1680, replies: 232, shares: 147 },
  { date: "Jan 28", likes: 1540, replies: 210, shares: 133 },
  { date: "Feb 1",  likes: 1720, replies: 248, shares: 158 },
  { date: "Feb 4",  likes: 2050, replies: 310, shares: 193 },
  { date: "Feb 7",  likes: 1920, replies: 285, shares: 178 },
  { date: "Feb 10", likes: 2210, replies: 345, shares: 215 },
  { date: "Feb 13", likes: 2640, replies: 420, shares: 268 },
  { date: "Feb 16", likes: 2490, replies: 390, shares: 245 },
  { date: "Feb 18", likes: 2310, replies: 355, shares: 228 },
  { date: "Feb 20", likes: 2520, replies: 380, shares: 249 },
  { date: "Feb 22", likes: 3080, replies: 487, shares: 312 },
  { date: "Feb 25", likes: 2870, replies: 445, shares: 286 },
  { date: "Feb 28", likes: 3240, replies: 520, shares: 335 },
];

// dates when new posts were published
const postPublishDates: { date: string; label: string; type: string }[] = [
  { date: "Jan 8",  label: "Reel #1 — Product Reveal",      type: "reel"    },
  { date: "Jan 15", label: "Thread — Founder Story",         type: "thread"  },
  { date: "Jan 22", label: "Carousel — Feature Breakdown",   type: "carousel"},
  { date: "Feb 1",  label: "Reel #2 — Tutorial",             type: "reel"    },
  { date: "Feb 10", label: "Static — UGC Compilation",       type: "image"   },
  { date: "Feb 13", label: "Reel #3 — Creator Collab",       type: "reel"    },
  { date: "Feb 22", label: "Live Stream Recap Clip",          type: "reel"    },
];

// key trend events with AI insight
const keyEvents: {
  date: string;
  title: string;
  type: "pivot" | "spike" | "drop";
  insight: string;
}[] = [
  {
    date: "Jan 15",
    title: "First major engagement spike",
    type: "spike",
    insight:
      "The Founder Story thread published on Jan 15 drove a 35% jump in likes and a 52% surge in replies within 48 hours. Audience comments clustered around authenticity and brand trust — reply sentiment was 78% positive. This was the first signal that narrative-led content outperforms product-focused posts.",
  },
  {
    date: "Feb 4",
    title: "Sustained growth trend begins",
    type: "pivot",
    insight:
      "Starting Feb 4, all three engagement metrics entered a consistent upward trend that persisted for the rest of the period. The Tutorial Reel appears to have onboarded a new audience cohort — shares nearly doubled week-over-week, indicating the content was being distributed beyond existing followers.",
  },
  {
    date: "Feb 13",
    title: "Creator Collab inflection point",
    type: "spike",
    insight:
      "The Creator Collab Reel on Feb 13 produced the single-day highest like-to-reply ratio (6.3×) suggesting broad passive appreciation rather than active discussion. Reply sentiment shifted toward excitement and FOMO-driven language. This content type should be repeated with different creators.",
  },
  {
    date: "Feb 22",
    title: "Replies & shares decouple from likes",
    type: "pivot",
    insight:
      "On Feb 22, replies (+28%) and shares (+26%) grew significantly faster than likes (+22%) — a decoupling that signals deeper audience involvement. Topics in replies shifted toward pricing and availability queries, suggesting the audience is moving from awareness to purchase intent.",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const EVENT_TYPE_STYLES = {
  spike:  { dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-200",  line: "#f59e0b", icon: TrendingUp   },
  pivot:  { dot: "bg-violet-500",  badge: "bg-violet-50 text-violet-700 border-violet-200", line: "#8b5cf6", icon: Zap         },
  drop:   { dot: "bg-rose-500",    badge: "bg-rose-50 text-rose-700 border-rose-200",    line: "#ef4444", icon: AlertCircle  },
};

const POST_TYPE_COLORS: Record<string, string> = {
  reel:     "#06b6d4",
  thread:   "#8b5cf6",
  carousel: "#f59e0b",
  image:    "#10b981",
};

const SERIES = [
  { key: "likes",   color: "#f43f5e", label: "Likes"   },
  { key: "replies", color: "#06b6d4", label: "Replies" },
  { key: "shares",  color: "#8b5cf6", label: "Shares"  },
] as const;

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const post = postPublishDates.find((p) => p.date === label);
  const event = keyEvents.find((e) => e.date === label);

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

// ── Main Component ────────────────────────────────────────────────────────────

export function ChronologicalAnalysis() {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleEvent = (date: string) =>
    setExpandedEvent((prev) => (prev === date ? null : date));

  return (
    <div id="chronological-analysis" className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-100 to-violet-100 flex items-center justify-center">
          <Clock className="w-5 h-5 text-cyan-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Chronological Analysis</h2>
          <p className="text-sm text-slate-500">Engagement over time with post publish events and trend pivots</p>
        </div>
      </div>

      {/* Chart Card */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">

        {/* Series toggles */}
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

        {/* Chart */}
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={timeSeriesData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Post publish reference lines */}
            {postPublishDates.map((p) => (
              <ReferenceLine
                key={`post-${p.date}`}
                x={p.date}
                stroke={POST_TYPE_COLORS[p.type]}
                strokeDasharray="4 3"
                strokeWidth={1.5}
                label={{
                  value: "▲",
                  position: "top",
                  fill: POST_TYPE_COLORS[p.type],
                  fontSize: 10,
                }}
              />
            ))}

            {/* Key event reference lines */}
            {keyEvents.map((e) => (
              <ReferenceLine
                key={`event-${e.date}`}
                x={e.date}
                stroke={EVENT_TYPE_STYLES[e.type].line}
                strokeDasharray="6 3"
                strokeWidth={2}
                label={{
                  value: "★",
                  position: "insideTopRight",
                  fill: EVENT_TYPE_STYLES[e.type].line,
                  fontSize: 11,
                }}
              />
            ))}

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

        {/* Post legend */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Posts Published</p>
          <div className="flex flex-wrap gap-2">
            {postPublishDates.map((p) => (
              <span
                key={p.date}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-50 border border-slate-200 text-slate-600"
              >
                <span className="w-2 h-2 rounded-full" style={{ background: POST_TYPE_COLORS[p.type] }} />
                <span className="text-slate-400 font-normal">{p.date}</span>
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Key Events + AI Insights */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-700">Key Events & AI Insights</h3>
        </div>

        {keyEvents.map((event) => {
          const styles = EVENT_TYPE_STYLES[event.type];
          const EventIcon = styles.icon;
          const isOpen = expandedEvent === event.date;

          return (
            <div
              key={event.date}
              className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              <button
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
                onClick={() => toggleEvent(event.date)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${styles.badge}`}>
                  <EventIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles.badge}`}>
                      {event.type === "spike" ? "Spike" : event.type === "pivot" ? "Trend Pivot" : "Drop"}
                    </span>
                    <span className="text-xs text-slate-400">{event.date}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{event.title}</p>
                </div>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
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
    </div>
  );
}
