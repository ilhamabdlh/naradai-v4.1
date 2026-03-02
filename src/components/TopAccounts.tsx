import { useState } from "react";
import { ArrowUpDown, MessageSquare, ThumbsUp, MessageCircle } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";

type SortKey = "conversations" | "likes" | "replies";

const defaultAccounts = [
  { id: 1, name: "GlowUpGuru", handle: "@glowupguru", platform: "YouTube", followers: 1240000, conversations: 87, likes: 34200, replies: 8740 },
  { id: 2, name: "Beauty Obsessed", handle: "@beautyobsessed", platform: "Twitter", followers: 890000, conversations: 124, likes: 28900, replies: 6320 },
  { id: 3, name: "Skincare Daily", handle: "@skincaredaily", platform: "Twitter", followers: 760000, conversations: 96, likes: 22100, replies: 5480 },
  { id: 4, name: "Glow Journey", handle: "@glowjourney", platform: "Instagram", followers: 654000, conversations: 63, likes: 19800, replies: 4120 },
  { id: 5, name: "BeautyHacks101", handle: "@beautyhacks101", platform: "YouTube", followers: 521000, conversations: 45, likes: 16400, replies: 3890 },
  { id: 6, name: "Deal Watcher", handle: "@dealwatcher", platform: "Twitter", followers: 412000, conversations: 78, likes: 12300, replies: 3210 },
  { id: 7, name: "Loyal Customer", handle: "@loyalcustomer", platform: "Instagram", followers: 328000, conversations: 34, likes: 9870, replies: 2140 },
  { id: 8, name: "frustrated_buyer", handle: "u/frustrated_buyer", platform: "Reddit", followers: 245000, conversations: 56, likes: 8430, replies: 4670 },
  { id: 9, name: "online_shopper99", handle: "u/online_shopper99", platform: "Reddit", followers: 198000, conversations: 42, likes: 6210, replies: 3540 },
  { id: 10, name: "tech_user42", handle: "u/tech_user42", platform: "Reddit", followers: 156000, conversations: 38, likes: 4890, replies: 2980 },
];

const platformColors: Record<string, string> = {
  Twitter: "bg-sky-100 text-sky-700",
  YouTube: "bg-red-100 text-red-700",
  Reddit: "bg-orange-100 text-orange-700",
  Instagram: "bg-pink-100 text-pink-700",
};

const sortOptions: { key: SortKey; label: string; icon: typeof MessageSquare }[] = [
  { key: "conversations", label: "Related Posts", icon: MessageSquare },
  { key: "likes", label: "Likes", icon: ThumbsUp },
  { key: "replies", label: "Replies", icon: MessageCircle },
];

function formatNum(n: number | undefined | null): string {
  if (n === undefined || n === null || isNaN(n)) return "0";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toLocaleString();
}

export function TopAccounts() {
  const content = useDashboardContent();
  const accounts = (content?.whatsHappeningAccounts?.length ? content.whatsHappeningAccounts : defaultAccounts) as typeof defaultAccounts;
  const [sortKey, setSortKey] = useState<SortKey>("conversations");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...accounts].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return sortAsc ? aVal - bVal : bVal - aVal;
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
        {sortOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.key}
              onClick={() => handleSort(opt.key)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-colors ${
                sortKey === opt.key
                  ? "bg-violet-100 text-violet-700 font-medium"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Icon className="w-3 h-3" />
              {opt.label}
              {sortKey === opt.key && <ArrowUpDown className="w-3 h-3" />}
            </button>
          );
        })}
      </div>

      {/* Accounts list */}
      <div className="divide-y divide-slate-100">
        {sorted.map((item, index) => (
          <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span className="text-xs font-semibold text-slate-400 mt-1 w-5 text-right shrink-0">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-800 font-medium leading-snug truncate">
                {item.name}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${platformColors[item.platform]}`}>
                  {item.platform}
                </span>
                <span className="text-xs text-slate-400">{item.handle}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 text-xs">
                <div className="flex items-center gap-1 text-slate-600">
                <MessageSquare className="w-3 h-3" />
                <span className={sortKey === "conversations" ? "font-semibold text-violet-700" : ""}>
                  {item.conversations ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <ThumbsUp className="w-3 h-3" />
                <span className={sortKey === "likes" ? "font-semibold text-violet-700" : ""}>
                  {formatNum((item as any).likes)}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <MessageCircle className="w-3 h-3" />
                <span className={sortKey === "replies" ? "font-semibold text-violet-700" : ""}>
                  {formatNum((item as any).replies)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
