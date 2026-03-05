import { Zap, Heart, Share2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { defaultDashboardContent } from "@/lib/dashboard-content-store";

function MetricBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${max > 0 ? (value / max) * 100 : 0}%` }} />
    </div>
  );
}

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}

export function ContentAnalysis() {
  const content = useDashboardContent();
  const contentTypes = content?.campaignContentTypes ?? defaultDashboardContent.campaignContentTypes ?? [];
  const topPosts = content?.campaignTopPosts ?? defaultDashboardContent.campaignTopPosts ?? [];

  const [activeTab, setActiveTab] = useState<"types" | "posts">("types");

  const maxLikes   = Math.max(...contentTypes.map((c) => c.likes), 1);
  const maxShares  = Math.max(...contentTypes.map((c) => c.shares), 1);
  const maxReplies = Math.max(...contentTypes.map((c) => c.replies), 1);

  return (
    <div id="content-analysis" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
          <Zap className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Content & Audience Response</h2>
          <p className="text-sm text-slate-500">How different content types drive different audience reactions</p>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {(["types", "posts"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "types" ? "By Content Type" : "Top Posts"}
          </button>
        ))}
      </div>

      {activeTab === "types" && (
        <div className="space-y-4">
          {contentTypes.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 hover:border-violet-200 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-bold">{c.type}</span>
                    <span className="text-xs text-slate-500">{c.platform} · {c.posts} posts</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center gap-1 mb-1.5 text-xs text-rose-600 font-medium">
                        <Heart className="w-3 h-3" /> Likes
                      </div>
                      <MetricBar value={c.likes} max={maxLikes} color="bg-rose-400" />
                      <span className="text-sm font-semibold text-slate-800 mt-1 block">{fmt(c.likes)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1.5 text-xs text-violet-600 font-medium">
                        <Share2 className="w-3 h-3" /> Shares
                      </div>
                      <MetricBar value={c.shares} max={maxShares} color="bg-violet-400" />
                      <span className="text-sm font-semibold text-slate-800 mt-1 block">{fmt(c.shares)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1.5 text-xs text-cyan-600 font-medium">
                        <MessageCircle className="w-3 h-3" /> Replies
                      </div>
                      <MetricBar value={c.replies} max={maxReplies} color="bg-cyan-400" />
                      <span className="text-sm font-semibold text-slate-800 mt-1 block">{fmt(c.replies)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-500 font-medium">Reply Sentiment</span>
                      <div className="flex gap-3">
                        <span className="text-emerald-600 font-semibold">{c.positiveSentiment}% pos</span>
                        <span className="text-red-500 font-semibold">{c.negativeSentiment}% neg</span>
                      </div>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-400" style={{ width: `${c.positiveSentiment}%` }} />
                      <div className="bg-slate-200" style={{ width: `${100 - c.positiveSentiment - c.negativeSentiment}%` }} />
                      <div className="bg-red-400" style={{ width: `${c.negativeSentiment}%` }} />
                    </div>
                  </div>
                </div>
                <div className="lg:w-72 shrink-0 space-y-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Audience Reaction</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{c.audienceReaction}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.topTopics.map((topic) => (
                      <span key={topic} className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 text-xs font-medium border border-violet-100">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "posts" && (
        <div className="space-y-3">
          {topPosts.map((p) => (
            <div key={p.id} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 hover:border-violet-200 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">{p.type}</span>
                    <span className="text-xs text-slate-500">{p.platform}</span>
                  </div>
                  <p className="font-medium text-slate-800">{p.title}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-xl ${p.sentiment >= 0.75 ? "bg-emerald-100 text-emerald-700" : p.sentiment >= 0.6 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600"}`}>
                  {Math.round(p.sentiment * 100)}% positive
                </span>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-1.5 text-rose-600">
                  <Heart className="w-3.5 h-3.5" />
                  <span className="font-semibold">{fmt(p.likes)}</span>
                  <span className="text-slate-400 text-xs">likes</span>
                </div>
                <div className="flex items-center gap-1.5 text-violet-600">
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="font-semibold">{fmt(p.shares)}</span>
                  <span className="text-slate-400 text-xs">shares</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-600">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="font-semibold">{fmt(p.replies)}</span>
                  <span className="text-slate-400 text-xs">replies</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
