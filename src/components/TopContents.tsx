import { useState } from "react";
import { ArrowUpDown, ThumbsUp, MessageCircle } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";

type SortKey = "likes" | "comments";

const defaultContents = [
  { id: 1, title: "OMG the new packaging is literally falling apart 😭", platform: "Twitter", author: "@beautyobsessed", likes: 4823, comments: 1247 },
  { id: 2, title: "Honest review: Is Brand X worth the hype? (spoiler: YES)", platform: "YouTube", author: "GlowUpGuru", likes: 3912, comments: 982 },
  { id: 3, title: "Customer service finally responded after 3 weeks...", platform: "Reddit", author: "u/frustrated_buyer", likes: 3541, comments: 876 },
  { id: 4, title: "Brand X vs Competitor A - full comparison thread 🧵", platform: "Twitter", author: "@skincaredaily", likes: 3104, comments: 743 },
  { id: 5, title: "Just switched from Competitor B and WOW the difference", platform: "Instagram", author: "@glowjourney", likes: 2876, comments: 654 },
  { id: 6, title: "Why does nobody talk about their shipping issues?", platform: "Reddit", author: "u/online_shopper99", likes: 2654, comments: 891 },
  { id: 7, title: "Brand X appreciation post - 2 years and counting ❤️", platform: "Instagram", author: "@loyalcustomer", likes: 2431, comments: 412 },
  { id: 8, title: "Price increase again?? This is getting ridiculous", platform: "Twitter", author: "@dealwatcher", likes: 2198, comments: 567 },
  { id: 9, title: "Tutorial: How to get the most out of Brand X products", platform: "YouTube", author: "BeautyHacks101", likes: 1987, comments: 324 },
  { id: 10, title: "My mobile app keeps crashing after the latest update", platform: "Reddit", author: "u/tech_user42", likes: 1765, comments: 498 },
];

const platformColors: Record<string, string> = {
  Twitter: "bg-sky-100 text-sky-700",
  YouTube: "bg-red-100 text-red-700",
  Reddit: "bg-orange-100 text-orange-700",
  Instagram: "bg-pink-100 text-pink-700",
};

export function TopContents() {
  const content = useDashboardContent();
  const contents = (content?.whatsHappeningContents?.length ? content.whatsHappeningContents : defaultContents) as typeof defaultContents;
  const [sortKey, setSortKey] = useState<SortKey>("likes");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...contents]
    .sort((a, b) => (sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]))
    .slice(0, 10);

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
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Sort by:</span>
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
          {sortKey === "likes" && (
            <ArrowUpDown className="w-3 h-3" />
          )}
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
          Replies / Comments
          {sortKey === "comments" && (
            <ArrowUpDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Content list */}
      <div className="divide-y divide-slate-100">
        {sorted.map((item, index) => (
          <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span className="text-xs font-semibold text-slate-400 mt-1 w-5 text-right shrink-0">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800 font-medium leading-snug truncate">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${platformColors[item.platform]}`}>
                  {item.platform}
                </span>
                <span className="text-xs text-slate-400">{item.author}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0 text-xs">
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
