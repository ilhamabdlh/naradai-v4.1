import { useState, useMemo } from "react";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import type { SentimentTrendItem } from "@/lib/dashboard-content-types";
import { parseChartDate, formatChartDateMonthDay, formatChartDateAxisLabel, getWeekStart } from "@/lib/chart-date-utils";

type Granularity = "daily" | "weekly" | "monthly";

const MONTH_SHORT: Record<number, string> = {
  0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr", 4: "May", 5: "Jun",
  6: "Jul", 7: "Aug", 8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec",
};

function aggregateByGranularity(
  items: SentimentTrendItem[],
  granularity: Granularity
): { date: string; positive: number; negative: number; neutral: number }[] {
  if (!items.length) return [];

  const allDates = items.map((i) => i.date);
  const sorted = [...items].sort(
    (a, b) => parseChartDate(a.date, allDates).getTime() - parseChartDate(b.date, allDates).getTime()
  );

  if (granularity === "daily") {
    return sorted.map((item) => ({
      date: formatChartDateAxisLabel(item.date, allDates),
      positive: item.positive ?? 0,
      negative: item.negative ?? 0,
      neutral: item.neutral ?? 0,
    }));
  }

  if (granularity === "weekly") {
    const byWeek = new Map<string, { positive: number; negative: number; neutral: number; sortKey: string }>();
    for (const item of sorted) {
      const d = parseChartDate(item.date, allDates);
      if (isNaN(d.getTime())) continue;
      const weekKey = getWeekStart(d);
      const label = formatChartDateAxisLabel(weekKey, allDates);
      if (!byWeek.has(label)) {
        byWeek.set(label, { positive: 0, negative: 0, neutral: 0, sortKey: weekKey });
      }
      const acc = byWeek.get(label)!;
      acc.positive += item.positive ?? 0;
      acc.negative += item.negative ?? 0;
      acc.neutral += item.neutral ?? 0;
    }
    return Array.from(byWeek.entries())
      .map(([date, v]) => ({
        date,
        positive: v.positive,
        negative: v.negative,
        neutral: v.neutral,
        _sort: v.sortKey,
      }))
      .sort((a, b) => (a._sort as string).localeCompare(b._sort as string))
      .map(({ date, positive, negative, neutral }) => ({ date, positive, negative, neutral }));
  }

  const byMonth = new Map<string, { positive: number; negative: number; neutral: number; year: number; month: number }>();
  for (const item of sorted) {
    const d = parseChartDate(item.date, allDates);
    if (isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = `${MONTH_SHORT[d.getMonth()] ?? "?"} ${d.getFullYear()}`;
    if (!byMonth.has(key)) {
      byMonth.set(key, { positive: 0, negative: 0, neutral: 0, year: d.getFullYear(), month: d.getMonth() });
    }
    const acc = byMonth.get(key)!;
    acc.positive += item.positive ?? 0;
    acc.negative += item.negative ?? 0;
    acc.neutral += item.neutral ?? 0;
  }
  return Array.from(byMonth.entries())
    .map(([key, v]) => ({
      date: MONTH_SHORT[v.month] ?? "?",
      positive: v.positive,
      negative: v.negative,
      neutral: v.neutral,
      _sort: new Date(v.year, v.month).getTime(),
    }))
    .sort((a, b) => (a as any)._sort - (b as any)._sort)
    .map(({ date, positive, negative, neutral }) => ({ date, positive, negative, neutral }));
}

const dailyData = [
  { date: "Nov 1", positive: 68, negative: 22, neutral: 10 },
  { date: "Nov 2", positive: 70, negative: 20, neutral: 10 },
  { date: "Nov 3", positive: 66, negative: 24, neutral: 10 },
  { date: "Nov 4", positive: 69, negative: 21, neutral: 10 },
  { date: "Nov 5", positive: 72, negative: 18, neutral: 10 },
  { date: "Nov 6", positive: 74, negative: 16, neutral: 10 },
  { date: "Nov 7", positive: 71, negative: 19, neutral: 10 },
  { date: "Nov 8", positive: 73, negative: 17, neutral: 10 },
  { date: "Nov 9", positive: 75, negative: 15, neutral: 10, event: true },
  { date: "Nov 10", positive: 74, negative: 16, neutral: 10 },
  { date: "Nov 11", positive: 72, negative: 18, neutral: 10 },
  { date: "Nov 12", positive: 70, negative: 20, neutral: 10 },
  { date: "Nov 13", positive: 71, negative: 19, neutral: 10 },
  { date: "Nov 14", positive: 69, negative: 21, neutral: 10 },
  { date: "Nov 15", positive: 67, negative: 23, neutral: 10 },
  { date: "Nov 16", positive: 66, negative: 24, neutral: 10 },
  { date: "Nov 17", positive: 65, negative: 25, neutral: 10, event: true },
  { date: "Nov 18", positive: 63, negative: 27, neutral: 10 },
  { date: "Nov 19", positive: 64, negative: 26, neutral: 10 },
  { date: "Nov 20", positive: 62, negative: 28, neutral: 10 },
  { date: "Nov 21", positive: 62, negative: 28, neutral: 10 },
  { date: "Nov 22", positive: 60, negative: 30, neutral: 10 },
  { date: "Nov 23", positive: 59, negative: 31, neutral: 10 },
  { date: "Nov 24", positive: 61, negative: 29, neutral: 10 },
  { date: "Nov 25", positive: 58, negative: 32, neutral: 10, event: true },
  { date: "Nov 26", positive: 57, negative: 33, neutral: 10 },
  { date: "Nov 27", positive: 56, negative: 34, neutral: 10 },
  { date: "Nov 28", positive: 59, negative: 31, neutral: 10 },
  { date: "Nov 29", positive: 60, negative: 30, neutral: 10 },
  { date: "Nov 30", positive: 61, negative: 29, neutral: 10 },
];

const weeklyData = [
  { date: "Nov 1", positive: 68, negative: 22, neutral: 10 },
  { date: "Nov 5", positive: 72, negative: 18, neutral: 10 },
  { date: "Nov 9", positive: 75, negative: 15, neutral: 10, event: true },
  { date: "Nov 13", positive: 71, negative: 19, neutral: 10 },
  { date: "Nov 17", positive: 65, negative: 25, neutral: 10, event: true },
  { date: "Nov 21", positive: 62, negative: 28, neutral: 10 },
  { date: "Nov 25", positive: 58, negative: 32, neutral: 10, event: true },
];

const monthlyData = [
  { date: "Sep", positive: 72, negative: 18, neutral: 10 },
  { date: "Oct", positive: 70, negative: 20, neutral: 10 },
  { date: "Nov", positive: 65, negative: 25, neutral: 10, event: true },
  { date: "Dec", positive: 58, negative: 32, neutral: 10 },
  { date: "Jan", positive: 62, negative: 28, neutral: 10 },
  { date: "Feb", positive: 66, negative: 24, neutral: 10 },
];

const dataByGranularity: Record<Granularity, typeof dailyData> = {
  daily: dailyData,
  weekly: weeklyData,
  monthly: monthlyData,
};

interface KeyEvent {
  date: string;
  title: string;
  description: string;
}

const allEvents: KeyEvent[] = [
  {
    date: "Nov 9",
    title: "Product Launch Success",
    description: "New feature rollout received 75% positive sentiment, highest this month.",
  },
  {
    date: "Nov 17",
    title: "Packaging Issue Reports Spike",
    description: "Shipping damage complaints increased 23%, causing sentiment drop.",
  },
  {
    date: "Nov 17",
    title: "Competitor Price War Begins",
    description: "Major competitor slashed prices by 30%, triggering negative brand comparisons.",
  },
  {
    date: "Nov 25",
    title: "Customer Service Backlash",
    description: "Support wait times triggered wave of negative feedback across platforms.",
  },
];

const weeklyEventMap: Record<string, string[]> = {
  "Nov 9": ["Nov 9"],
  "Nov 17": ["Nov 17"],
  "Nov 25": ["Nov 25"],
};

const monthlyEventMap: Record<string, string[]> = {
  "Nov": ["Nov 9", "Nov 17", "Nov 25"],
};

function getEventsForDate(date: string, granularity: Granularity, eventList: KeyEvent[]): KeyEvent[] {
  if (granularity === "daily") {
    return eventList.filter((e) => e.date === date);
  }
  if (granularity === "weekly") {
    const sourceDates = weeklyEventMap[date] || [];
    return eventList.filter((e) => sourceDates.includes(e.date));
  }
  const sourceDates = monthlyEventMap[date] || [];
  return eventList.filter((e) => sourceDates.includes(e.date));
}

export function SentimentChart() {
  const content = useDashboardContent();
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const trendFromStore = content?.whatsHappeningSentimentTrends ?? [];
  const data = useMemo(
    () =>
      trendFromStore.length
        ? aggregateByGranularity(trendFromStore, granularity)
        : dataByGranularity[granularity],
    [trendFromStore, granularity]
  );
  const eventsFromStore = content?.whatsHappeningKeyEvents ?? [];
  const events = eventsFromStore.length ? eventsFromStore.map((e) => ({ date: e.date, title: e.title, description: e.description })) : allEvents;

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
          {(["daily", "weekly", "monthly"] as Granularity[]).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                granularity === g
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b" 
            style={{ fontSize: '12px' }}
            interval={granularity === "daily" ? 4 : 0}
          />
          <YAxis 
            stroke="#64748b" 
            style={{ fontSize: '12px' }}
            label={{
              value: 'Number of Conversations',
              angle: -90,
              position: 'insideLeft',
              offset: -5,
              style: { fontSize: 12, fill: '#475569', fontWeight: 600 },
            }}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (!active || !payload || !payload.length) return null;
              const matchedEvents = getEventsForDate(label as string, granularity, events);
              return (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    padding: '10px 12px',
                    maxWidth: 280,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</div>
                  {payload.map((entry: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 2 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: entry.color, display: 'inline-block' }} />
                      <span style={{ textTransform: 'capitalize', color: '#64748b' }}>{entry.name}:</span>
                      <span style={{ fontWeight: 600 }}>{entry.value}</span>
                    </div>
                  ))}
                  {matchedEvents.length > 0 && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: '2px solid #6366f1' }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#6366f1', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {matchedEvents.length === 1 ? 'Key Event' : `${matchedEvents.length} Key Events`}
                      </div>
                      {matchedEvents.map((evt, i) => (
                        <div key={i} style={{ marginBottom: i < matchedEvents.length - 1 ? 8 : 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>
                            {evt.title}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
                            {evt.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="positive"
            stroke="#10b981"
            strokeWidth={2}
            fill="url(#colorPositive)"
          />
          <Area
            type="monotone"
            dataKey="negative"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#colorNegative)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
