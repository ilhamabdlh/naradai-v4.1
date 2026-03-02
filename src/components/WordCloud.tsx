import { useMemo, useState } from "react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";

interface WordItem {
  text: string;
  weight: number;
  sentiment: "positive" | "negative" | "neutral";
}

const defaultWords: WordItem[] = [
  { text: "quality", weight: 95, sentiment: "positive" },
  { text: "customer service", weight: 88, sentiment: "negative" },
  { text: "price", weight: 82, sentiment: "neutral" },
  { text: "delivery", weight: 78, sentiment: "positive" },
  { text: "packaging", weight: 72, sentiment: "negative" },
  { text: "taste", weight: 70, sentiment: "positive" },
  { text: "freshness", weight: 65, sentiment: "positive" },
  { text: "value", weight: 62, sentiment: "neutral" },
  { text: "variety", weight: 58, sentiment: "positive" },
  { text: "app", weight: 55, sentiment: "neutral" },
  { text: "refund", weight: 52, sentiment: "negative" },
  { text: "promotion", weight: 50, sentiment: "positive" },
  { text: "ingredients", weight: 48, sentiment: "positive" },
  { text: "waiting time", weight: 46, sentiment: "negative" },
  { text: "loyalty", weight: 44, sentiment: "positive" },
  { text: "store", weight: 42, sentiment: "neutral" },
  { text: "recommend", weight: 40, sentiment: "positive" },
  { text: "complaint", weight: 38, sentiment: "negative" },
  { text: "new product", weight: 36, sentiment: "positive" },
  { text: "availability", weight: 34, sentiment: "neutral" },
  { text: "support", weight: 32, sentiment: "negative" },
  { text: "discount", weight: 30, sentiment: "positive" },
  { text: "broken", weight: 28, sentiment: "negative" },
  { text: "experience", weight: 26, sentiment: "neutral" },
  { text: "design", weight: 24, sentiment: "positive" },
  { text: "subscription", weight: 22, sentiment: "neutral" },
  { text: "eco-friendly", weight: 20, sentiment: "positive" },
  { text: "slow response", weight: 18, sentiment: "negative" },
  { text: "reliable", weight: 16, sentiment: "positive" },
  { text: "overpriced", weight: 14, sentiment: "negative" },
];

const sentimentStyles = {
  positive: {
    bg: "bg-emerald-500/15 hover:bg-emerald-500/25",
    border: "border-emerald-400/40",
    text: "text-emerald-700",
    glow: "shadow-emerald-200/50",
  },
  negative: {
    bg: "bg-rose-500/15 hover:bg-rose-500/25",
    border: "border-rose-400/40",
    text: "text-rose-700",
    glow: "shadow-rose-200/50",
  },
  neutral: {
    bg: "bg-slate-500/10 hover:bg-slate-500/20",
    border: "border-slate-400/30",
    text: "text-slate-600",
    glow: "shadow-slate-200/40",
  },
};

export function WordCloud() {
  const content = useDashboardContent();
  const [hovered, setHovered] = useState<string | null>(null);
  const words = useMemo(() => {
    // Prioritas 1: Gunakan data dari whatsHappeningWordCloud (data yang di-edit di Source Content)
    if (content?.whatsHappeningWordCloud?.length) {
      return content.whatsHappeningWordCloud.map((item) => ({
        text: item.text,
        weight: item.weight,
        sentiment: item.sentiment,
      })) as WordItem[];
    }
    
    // Prioritas 2: Generate dari whatsHappeningTopTopics jika tidak ada data word cloud
    const topics = content?.whatsHappeningTopTopics ?? [];
    if (topics.length > 0) {
      return topics.map((t) => ({
        text: t.topic,
        weight: t.mentions,
        sentiment: "neutral" as const,
      })) as WordItem[];
    }
    
    // Fallback: default words
    return defaultWords;
  }, [content?.whatsHappeningWordCloud, content?.whatsHappeningTopTopics]);

  const positioned = useMemo(() => {
    const minSize = 14;
    const maxSize = 28;
    const maxWeight = Math.max(...words.map((w) => w.weight), 1);
    const minWeight = Math.min(...words.map((w) => w.weight), 0);

    return words.map((word) => {
      const normalized = (word.weight - minWeight) / (maxWeight - minWeight);
      const fontSize = minSize + normalized * (maxSize - minSize);
      const style = sentimentStyles[word.sentiment];
      return { ...word, fontSize, style };
    });
  }, [words]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6 min-h-[300px]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-100/20 via-transparent to-cyan-100/20 pointer-events-none" />
      <div className="relative flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-6">
        {positioned.map((word, i) => {
          const isHovered = hovered === word.text;
          return (
            <span
              key={i}
              onMouseEnter={() => setHovered(word.text)}
              onMouseLeave={() => setHovered(null)}
              className={`
                inline-flex items-center px-3 py-1.5 rounded-full border font-medium transition-all duration-200
                ${word.style.bg} ${word.style.border} ${word.style.text}
                ${isHovered ? `scale-110 shadow-lg ${word.style.glow}` : "shadow-sm"}
              `}
              style={{
                fontSize: `${word.fontSize}px`,
                lineHeight: 1.2,
              }}
              title={`${word.text}: ${word.weight} mentions · ${word.sentiment}`}
            >
              {word.text}
            </span>
          );
        })}
      </div>

      <div className="relative flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 pt-5 border-t border-slate-200/80 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" />
          <span className="text-slate-600 font-medium">Positive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/30" />
          <span className="text-slate-600 font-medium">Negative</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-slate-500 shadow-sm shadow-slate-500/30" />
          <span className="text-slate-600 font-medium">Neutral</span>
        </div>
        <span className="text-slate-400 hidden sm:inline">·</span>
        <span className="text-slate-500 italic">Larger = more mentions</span>
      </div>
    </div>
  );
}
