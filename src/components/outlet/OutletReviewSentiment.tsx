import { useState } from "react";
import { MessageSquare } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ---- Data ----

const overallSentiment = {
  positive: 62,
  neutral: 22,
  negative: 16,
};

const outletSentiment = [
  { name: "Bandung Dago",           positive: 84, neutral: 12, negative: 4  },
  { name: "Yogyakarta Malioboro",   positive: 80, neutral: 13, negative: 7  },
  { name: "Denpasar Kuta",          positive: 77, neutral: 14, negative: 9  },
  { name: "Malang Kota",            positive: 74, neutral: 16, negative: 10 },
  { name: "Semarang Simpang",       positive: 70, neutral: 17, negative: 13 },
  { name: "Surabaya North",         positive: 65, neutral: 20, negative: 15 },
  { name: "Jakarta Selatan",        positive: 55, neutral: 22, negative: 23 },
  { name: "Surabaya East",          positive: 48, neutral: 24, negative: 28 },
  { name: "Balikpapan Centre",      positive: 38, neutral: 20, negative: 42 },
  { name: "Medan Central",          positive: 29, neutral: 15, negative: 56 },
  { name: "Jakarta Flagship",       positive: 26, neutral: 18, negative: 56 },
];

const topics = [
  { topic: "Service Speed",    mentions: 8420, positive: 44, negative: 42 },
  { topic: "Product Quality",  mentions: 7680, positive: 75, negative: 12 },
  { topic: "Cleanliness",      mentions: 5940, positive: 68, negative: 21 },
  { topic: "Staff Friendliness",mentions:5120, positive: 72, negative: 16 },
  { topic: "Pricing & Value",  mentions: 4880, positive: 38, negative: 48 },
  { topic: "Product Availability", mentions: 3760, positive: 51, negative: 35 },
  { topic: "Ambiance",         mentions: 3240, positive: 80, negative: 8  },
  { topic: "Parking",          mentions: 2980, positive: 31, negative: 54 },
  { topic: "Queue Management", mentions: 2640, positive: 29, negative: 58 },
  { topic: "Promotions & Deals",mentions:2100, positive: 84, negative: 6  },
];

const recentReviews = [
  { outlet: "Jakarta Flagship",     sentiment: "negative", text: "Waited 40 minutes just for a drink. Staff seem overwhelmed and understaffed. Not coming back.", stars: 1 },
  { outlet: "Bandung Dago",         sentiment: "positive", text: "The best experience! Staff are warm, the atmosphere is cozy and the products taste amazing. 10/10.", stars: 5 },
  { outlet: "Medan Central",        sentiment: "negative", text: "Prices are way too high compared to other locations. The facility was not clean and service was dismissive.", stars: 2 },
  { outlet: "Yogyakarta Malioboro", sentiment: "positive", text: "Perfect spot right by Malioboro. Always consistent, quick service, and the staff remembered my order!", stars: 5 },
  { outlet: "Surabaya East",        sentiment: "neutral",  text: "Average experience. They were out of 3 menu items on a Saturday afternoon. Staff were polite though.", stars: 3 },
  { outlet: "Balikpapan Centre",    sentiment: "negative", text: "Took nearly an hour to serve us. Multiple tables left without ordering. Management needs to step in.", stars: 1 },
];

// ---- Sub-components ----

function SentimentDonut({ positive, neutral, negative }: { positive: number; neutral: number; negative: number }) {
  const total = positive + neutral + negative;
  const posAng = (positive / total) * 360;
  const neuAng = (neutral / total) * 360;

  const describeArc = (start: number, end: number, r = 48, cx = 56, cy = 56) => {
    const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(start));
    const y1 = cy + r * Math.sin(toRad(start));
    const x2 = cx + r * Math.cos(toRad(end));
    const y2 = cy + r * Math.sin(toRad(end));
    const large = end - start > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const segments = [
    { start: 0,              end: posAng,           color: "#34d399" }, // positive
    { start: posAng,         end: posAng + neuAng,  color: "#94a3b8" }, // neutral
    { start: posAng + neuAng, end: 360,             color: "#f87171" }, // negative
  ];

  return (
    <svg viewBox="0 0 112 112" className="w-28 h-28">
      {segments.map((seg, i) => (
        <path
          key={i}
          d={describeArc(seg.start, seg.end)}
          fill="none"
          stroke={seg.color}
          strokeWidth="16"
          strokeLinecap="butt"
        />
      ))}
      <text x="56" y="52" textAnchor="middle" className="text-2xl font-bold fill-slate-900" fontSize="18" fontWeight="700">{positive}%</text>
      <text x="56" y="68" textAnchor="middle" className="fill-slate-500" fontSize="9">positive</text>
    </svg>
  );
}

function StarRow({ stars }: { stars: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 12 12" className={`w-3 h-3 ${s <= stars ? "text-amber-400" : "text-slate-200"}`} fill="currentColor">
          <path d="M6 1l1.4 2.9 3.2.5-2.3 2.2.5 3.2L6 8.4 3.2 9.8l.5-3.2L1.4 4.4l3.2-.5z" />
        </svg>
      ))}
    </span>
  );
}

// ---- Main component ----

type Tab = "overview" | "topics" | "reviews";

export function OutletReviewSentiment() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div id="outlet-review-sentiment" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reviews, Sentiment &amp; Topics</h2>
          <p className="text-sm text-slate-500">Customer review analysis across all outlet locations</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {(["overview", "topics", "reviews"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "overview" ? "Sentiment Overview" : tab === "topics" ? "Top Topics" : "Recent Reviews"}
          </button>
        ))}
      </div>

      {/* --- Overview tab --- */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* Overall donut + legend */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-8">
            <SentimentDonut {...overallSentiment} />
            <div className="flex-1 space-y-4">
              <h3 className="font-semibold text-slate-800">Overall Sentiment — All Outlets</h3>
              <div className="space-y-2.5">
                {[
                  { label: "Positive", value: overallSentiment.positive, color: "bg-emerald-400" },
                  { label: "Neutral",  value: overallSentiment.neutral,  color: "bg-slate-300" },
                  { label: "Negative", value: overallSentiment.negative, color: "bg-red-400" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="w-20 text-xs font-medium text-slate-600 text-right">{s.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.value}%` }} />
                    </div>
                    <span className="w-10 text-xs font-semibold text-slate-700">{s.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Per-outlet sentiment chart */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm">Sentiment by Outlet</h3>
            <div className="space-y-3">
              {outletSentiment.map((o) => (
                <div key={o.name} className="flex items-center gap-3">
                  <span className="w-44 text-xs text-slate-600 truncate text-right shrink-0">{o.name}</span>
                  <div className="flex-1 flex h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400" style={{ width: `${o.positive}%` }} />
                    <div className="bg-slate-200" style={{ width: `${o.neutral}%` }} />
                    <div className="bg-red-400" style={{ width: `${o.negative}%` }} />
                  </div>
                  <div className="w-24 flex gap-2 text-[10px] font-semibold shrink-0">
                    <span className="text-emerald-600">{o.positive}%</span>
                    <span className="text-red-500">{o.negative}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-1">
              {[{ color: "bg-emerald-400", label: "Positive" }, { color: "bg-slate-200", label: "Neutral" }, { color: "bg-red-400", label: "Negative" }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`w-3 h-1.5 rounded-full ${l.color}`} />
                  <span className="text-xs text-slate-500">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- Topics tab --- */}
      {activeTab === "topics" && (
        <div className="space-y-4">
          {/* Mentions bar chart */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm">Mentions by Topic</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topics} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="topic" type="category" width={138} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, padding: "8px 12px" }}
                  cursor={{ fill: "#f8fafc" }}
                  formatter={(v: number) => [v.toLocaleString(), "Mentions"]}
                />
                <Bar dataKey="mentions" radius={[0, 6, 6, 0]} maxBarSize={18}>
                  {topics.map((t, i) => (
                    <Cell key={i} fill={t.positive >= 60 ? "#818cf8" : t.positive >= 45 ? "#fbbf24" : "#f87171"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Topic cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topics.map((t) => (
              <div key={t.topic} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 hover:border-violet-200 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-slate-800 text-sm">{t.topic}</span>
                  <span className="text-xs text-slate-500 font-medium">{t.mentions.toLocaleString()} mentions</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-slate-500">Positive</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${t.positive}%` }} />
                    </div>
                    <span className="w-8 text-right font-semibold text-emerald-600">{t.positive}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-slate-500">Negative</span>
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full bg-red-400" style={{ width: `${t.negative}%` }} />
                    </div>
                    <span className="w-8 text-right font-semibold text-red-500">{t.negative}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- Recent Reviews tab --- */}
      {activeTab === "reviews" && (
        <div className="space-y-3">
          {recentReviews.map((review, i) => (
            <div key={i} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 hover:border-violet-200 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
                      {review.outlet}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      review.sentiment === "positive" ? "bg-emerald-100 text-emerald-700" :
                      review.sentiment === "negative" ? "bg-red-100 text-red-600" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      {review.sentiment.charAt(0).toUpperCase() + review.sentiment.slice(1)}
                    </span>
                  </div>
                  <StarRow stars={review.stars} />
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">"{review.text}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
