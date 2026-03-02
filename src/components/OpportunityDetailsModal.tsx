import { X, ThumbsUp, Twitter, Instagram, Facebook, MessageSquare } from "lucide-react";
import type { OpportunityItem } from "@/lib/dashboard-content-types";

interface OpportunityDetailsModalProps {
  opportunity: OpportunityItem;
  onClose: () => void;
}

function getPlatformIcon(platform: string) {
  switch (platform) {
    case "twitter":
      return <Twitter className="w-4 h-4 text-sky-500" />;
    case "instagram":
      return <Instagram className="w-4 h-4 text-pink-500" />;
    case "facebook":
      return <Facebook className="w-4 h-4 text-blue-600" />;
    default:
      return <MessageSquare className="w-4 h-4 text-slate-500" />;
  }
}

export function OpportunityDetailsModal({ opportunity, onClose }: OpportunityDetailsModalProps) {
  const sourceList = opportunity.sourceContent?.length
    ? opportunity.sourceContent
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">{opportunity.title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</div>
            <p className="text-slate-700">{opportunity.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Potential: {opportunity.potential}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Confidence: {opportunity.confidence}%
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Timeframe: {opportunity.timeframe}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Category: {opportunity.category}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Number of Supporting Contents: {opportunity.supportingContents}
            </span>
          </div>
          <div>
            <div className="text-sm text-slate-700 font-medium mb-2">Recommended Actions</div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <ul className="space-y-2 text-sm text-slate-700">
                {(opportunity.recommendations ?? []).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
                {(!opportunity.recommendations || opportunity.recommendations.length === 0) && (
                  <li className="text-slate-500">—</li>
                )}
              </ul>
            </div>
          </div>
          <div>
            <div className="text-sm text-slate-700 font-medium mb-2">Source Content</div>
            <p className="text-xs text-slate-600 mb-3">Social media posts contributing to this opportunity</p>
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {sourceList.map((post) => (
                <div key={post.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(post.platform)}
                      <span className="text-sm font-medium text-slate-900">{post.author}</span>
                      <span className="text-xs text-slate-500">• {post.timestamp}</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700">
                      {post.sentiment.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>
                </div>
              ))}
              {sourceList.length === 0 && (
                <p className="text-sm text-slate-500 py-4 text-center">No source content</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
