import { useState } from "react";
import { ArrowUpDown, ThumbsUp, MessageCircle, Hash } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";

type SortKey = "conversations" | "likes" | "comments";

const defaultHashtags = [
  { id: 1, tag: "#BrandXFail", conversations: 1240, likes: 8921, comments: 3412 },
  { id: 2, tag: "#SkincareTok", conversations: 980, likes: 7654, comments: 2187 },
  { id: 3, tag: "#BrandXReview", conversations: 856, likes: 6432, comments: 1954 },
  { id: 4, tag: "#CleanBeauty", conversations: 720, likes: 5876, comments: 1643 },
  { id: 5, tag: "#PackagingFail", conversations: 690, likes: 5210, comments: 2876 },
  { id: 6, tag: "#BrandXLove", conversations: 612, likes: 4987, comments: 1102 },
  { id: 7, tag: "#AffordableSkincare", conversations: 544, likes: 4321, comments: 987 },
  { id: 8, tag: "#CompetitorAvsX", conversations: 498, likes: 3876, comments: 1543 },
  { id: 9, tag: "#GlowUp", conversations: 421, likes: 3210, comments: 765 },
  { id: 10, tag: "#BrandXAlternative", conversations: 388, likes: 2987, comments: 1321 },
];

export function TopHashtags() {
  const content = useDashboardContent();
  const hashtags = (content?.whatsHappeningHashtags?.length ? content.whatsHappeningHashtags : defaultHashtags) as typeof defaultHashtags;
  const [sortKey, setSortKey] = useState<SortKey>("conversations");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...hashtags].sort((a, b) => {
    const va = sortKey === "conversations" ? (a.conversations ?? 0) : a[sortKey];
    const vb = sortKey === "conversations" ? (b.conversations ?? 0) : b[sortKey];
    return sortAsc ? va - vb : vb - va;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Sort controls */}
      <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
        <span>Sort by:</span>
        <button
          onClick={() => handleSort("conversations")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
            sortKey === "conversations"
              ? "bg-violet-100 text-violet-700 font-medium"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <Hash className="w-3 h-3" />
          Conversations
          {sortKey === "conversations" && <ArrowUpDown className="w-3 h-3" />}
        </button>
        <button
          onClick={() => handleSort("likes")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
            sortKey === "likes"
              ? "bg-violet-100 text-violet-700 font-medium"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <ThumbsUp className="w-3 h-3" />
          Likes
          {sortKey === "likes" && <ArrowUpDown className="w-3 h-3" />}
        </button>
        <button
          onClick={() => handleSort("comments")}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
            sortKey === "comments"
              ? "bg-violet-100 text-violet-700 font-medium"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <MessageCircle className="w-3 h-3" />
          Comments
          {sortKey === "comments" && <ArrowUpDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Hashtag list */}
      <div className="divide-y divide-slate-100">
        {sorted.map((item, index) => (
          <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="text-xs font-semibold text-slate-400 w-5 text-right shrink-0">
              {index + 1}
            </span>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <Hash className="w-3.5 h-3.5 text-violet-500 shrink-0" />
              <span className="text-sm font-semibold text-slate-800 truncate">
                {item.tag}
              </span>
            </div>
            <div className="flex items-center gap-4 shrink-0 text-xs">
              {(item.conversations != null) && (
                <div className="flex items-center justify-end gap-1 text-slate-600">
                  <Hash className="w-3 h-3" />
                  <span className={sortKey === "conversations" ? "font-semibold text-violet-700" : ""}>
                    {item.conversations.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-end gap-1 text-slate-600">
                <ThumbsUp className="w-3 h-3" />
                <span className={sortKey === "likes" ? "font-semibold text-violet-700" : ""}>
                  {item.likes.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-end gap-1 text-slate-600">
                <MessageCircle className="w-3 h-3" />
                <span className={sortKey === "comments" ? "font-semibold text-violet-700" : ""}>
                  {item.comments.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
