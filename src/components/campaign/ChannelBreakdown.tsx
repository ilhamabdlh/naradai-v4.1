import { Heart, MessageCircle, Share2, Layers } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { defaultDashboardContent } from "@/lib/dashboard-content-store";

function fmt(n: number) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}

export function ChannelBreakdown() {
  const content = useDashboardContent();
  const channels = content?.campaignChannels ?? defaultDashboardContent.campaignChannels ?? [];

  return (
    <div id="channel-breakdown" className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 flex items-center justify-center">
          <Layers className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Channel Breakdown</h2>
          <p className="text-sm text-slate-500">Performance metrics per social channel</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {channels.map((c) => (
          <div key={c.id} className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 hover:border-violet-200 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white font-bold text-xs`}>
                {c.icon}
              </div>
              <div>
                <div className="font-semibold text-slate-800">{c.name}</div>
                <div className="text-xs text-slate-500">{c.posts} posts published</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-500"><Heart className="w-3.5 h-3.5 text-rose-400" />Likes</span>
                <span className="font-medium text-slate-800">{fmt(c.likes)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-500"><MessageCircle className="w-3.5 h-3.5 text-sky-400" />Replies</span>
                <span className="font-medium text-slate-800">{fmt(c.replies)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 text-slate-500"><Share2 className="w-3.5 h-3.5 text-violet-400" />Shares</span>
                <span className="font-medium text-slate-800">{fmt(c.shares)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
