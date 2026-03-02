import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, MessageSquare } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";
import { parseChartDate, formatChartDateMonthDay, formatChartDateAxisLabel, getWeekStart } from "@/lib/chart-date-utils";

type Granularity = "daily" | "weekly" | "monthly";

const MONTH_SHORT_TOPIC: Record<number, string> = {
  0: "Jan", 1: "Feb", 2: "Mar", 3: "Apr", 4: "May", 5: "Jun",
  6: "Jul", 7: "Aug", 8: "Sep", 9: "Oct", 10: "Nov", 11: "Dec",
};

const dailyData = [
  { date: "Nov 1", packaging: 320, customerService: 280, productQuality: 245, shipping: 190 },
  { date: "Nov 2", packaging: 310, customerService: 275, productQuality: 250, shipping: 188 },
  { date: "Nov 3", packaging: 325, customerService: 282, productQuality: 248, shipping: 192 },
  { date: "Nov 4", packaging: 330, customerService: 268, productQuality: 255, shipping: 186 },
  { date: "Nov 5", packaging: 340, customerService: 265, productQuality: 260, shipping: 185 },
  { date: "Nov 6", packaging: 335, customerService: 272, productQuality: 258, shipping: 190 },
  { date: "Nov 7", packaging: 345, customerService: 268, productQuality: 262, shipping: 188 },
  { date: "Nov 8", packaging: 350, customerService: 270, productQuality: 275, shipping: 193 },
  { date: "Nov 9", packaging: 355, customerService: 270, productQuality: 280, shipping: 195 },
  { date: "Nov 10", packaging: 360, customerService: 274, productQuality: 278, shipping: 192 },
  { date: "Nov 11", packaging: 370, customerService: 278, productQuality: 276, shipping: 196 },
  { date: "Nov 12", packaging: 375, customerService: 280, productQuality: 274, shipping: 198 },
  { date: "Nov 13", packaging: 380, customerService: 285, productQuality: 275, shipping: 200 },
  { date: "Nov 14", packaging: 395, customerService: 288, productQuality: 272, shipping: 198 },
  { date: "Nov 15", packaging: 420, customerService: 290, productQuality: 271, shipping: 202 },
  { date: "Nov 16", packaging: 440, customerService: 292, productQuality: 269, shipping: 204 },
  { date: "Nov 17", packaging: 465, customerService: 295, productQuality: 270, shipping: 205 },
  { date: "Nov 18", packaging: 480, customerService: 305, productQuality: 268, shipping: 207 },
  { date: "Nov 19", packaging: 490, customerService: 315, productQuality: 266, shipping: 208 },
  { date: "Nov 20", packaging: 505, customerService: 328, productQuality: 264, shipping: 209 },
  { date: "Nov 21", packaging: 520, customerService: 340, productQuality: 265, shipping: 210 },
  { date: "Nov 22", packaging: 530, customerService: 355, productQuality: 263, shipping: 212 },
  { date: "Nov 23", packaging: 540, customerService: 370, productQuality: 262, shipping: 213 },
  { date: "Nov 24", packaging: 555, customerService: 385, productQuality: 261, shipping: 214 },
  { date: "Nov 25", packaging: 567, customerService: 401, productQuality: 260, shipping: 215 },
  { date: "Nov 26", packaging: 575, customerService: 410, productQuality: 258, shipping: 216 },
  { date: "Nov 27", packaging: 580, customerService: 418, productQuality: 256, shipping: 218 },
  { date: "Nov 28", packaging: 590, customerService: 425, productQuality: 255, shipping: 219 },
  { date: "Nov 29", packaging: 595, customerService: 430, productQuality: 257, shipping: 220 },
  { date: "Nov 30", packaging: 600, customerService: 435, productQuality: 258, shipping: 222 },
];

const weeklyData = [
  { date: "Nov 1", packaging: 320, customerService: 280, productQuality: 245, shipping: 190 },
  { date: "Nov 5", packaging: 340, customerService: 265, productQuality: 260, shipping: 185 },
  { date: "Nov 9", packaging: 355, customerService: 270, productQuality: 280, shipping: 195 },
  { date: "Nov 13", packaging: 380, customerService: 285, productQuality: 275, shipping: 200 },
  { date: "Nov 17", packaging: 465, customerService: 295, productQuality: 270, shipping: 205 },
  { date: "Nov 21", packaging: 520, customerService: 340, productQuality: 265, shipping: 210 },
  { date: "Nov 25", packaging: 567, customerService: 401, productQuality: 260, shipping: 215 },
];

const monthlyData = [
  { date: "Sep", packaging: 250, customerService: 200, productQuality: 230, shipping: 170 },
  { date: "Oct", packaging: 290, customerService: 240, productQuality: 240, shipping: 180 },
  { date: "Nov", packaging: 567, customerService: 401, productQuality: 260, shipping: 215 },
  { date: "Dec", packaging: 620, customerService: 450, productQuality: 255, shipping: 225 },
  { date: "Jan", packaging: 580, customerService: 420, productQuality: 270, shipping: 230 },
  { date: "Feb", packaging: 540, customerService: 380, productQuality: 280, shipping: 220 },
];

const dataByGranularity: Record<Granularity, typeof dailyData> = {
  daily: dailyData,
  weekly: weeklyData,
  monthly: monthlyData,
};

const TOPIC_COLORS = [
  "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#06b6d4", "#ec4899", "#f97316", "#84cc16", "#6366f1", "#14b8a6",
  "#f43f5e", "#fb923c", "#a855f7", "#3b82f6", "#eab308", "#22c55e", "#f59e0b", "#06b6d4", "#8b5cf6", "#ef4444",
];

function aggregateTopicDataByGranularity(
  items: typeof dailyData,
  granularity: Granularity
): typeof dailyData {
  if (!items.length) return [];

  const allDates = items.map((i) => i.date);
  const sorted = [...items].sort((a, b) => {
    const dateA = parseChartDate(a.date, allDates);
    const dateB = parseChartDate(b.date, allDates);
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
    return dateA.getTime() - dateB.getTime();
  });

  if (granularity === "daily") {
    return sorted.map((item) => ({
      ...item,
      date: formatChartDateAxisLabel(item.date, allDates),
    }));
  }

  if (granularity === "weekly") {
    const byWeek = new Map<string, { data: Record<string, number>; sortKey: string }>();
    for (const item of sorted) {
      const date = parseChartDate(item.date, allDates);
      if (isNaN(date.getTime())) continue;

      const weekStart = getWeekStart(date);
      const label = formatChartDateAxisLabel(weekStart, allDates);

      if (!byWeek.has(label)) {
        byWeek.set(label, { data: { date: label }, sortKey: weekStart });
      }
      const acc = byWeek.get(label)!;

      Object.keys(item).forEach((key) => {
        if (key !== "date") {
          acc.data[key] = (acc.data[key] || 0) + ((item[key as keyof typeof item] as number) || 0);
        }
      });
    }
    return Array.from(byWeek.values())
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map(({ data }) => data as typeof dailyData[0]);
  }

  const byMonth = new Map<string, { data: Record<string, number>; sortKey: number }>();
  for (const item of sorted) {
    const date = parseChartDate(item.date, allDates);
    if (isNaN(date.getTime())) continue;

    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    const label = MONTH_SHORT_TOPIC[date.getMonth()] ?? "?";

    if (!byMonth.has(monthKey)) {
      byMonth.set(monthKey, { data: { date: label }, sortKey: date.getTime() });
    }
    const acc = byMonth.get(monthKey)!;

    Object.keys(item).forEach((key) => {
      if (key !== "date") {
        acc.data[key] = (acc.data[key] || 0) + ((item[key as keyof typeof item] as number) || 0);
      }
    });
  }
  return Array.from(byMonth.values())
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ data }) => data as typeof dailyData[0]);
}

export function TopicTimeSeriesChart() {
  const content = useDashboardContent();
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const trendFromStore = content?.whatsHappeningTopicTrendsData ?? [];
  
  const data = useMemo(() => {
    if (trendFromStore.length > 0) {
      return aggregateTopicDataByGranularity(trendFromStore as typeof dailyData, granularity);
    }
    return dataByGranularity[granularity];
  }, [trendFromStore, granularity]);
  
  const aiTrends = content?.whatsHappeningAITrendAnalysis ?? [];
  
  const topicKeys = useMemo(() => {
    if (!data.length) return [];
    const keys = Object.keys(data[0]).filter((k) => k !== "date");
    return keys;
  }, [data]);
  const defaultInsights = [
    {
      type: "critical",
      title: "Packaging Mentions Surging",
      description: "77% increase in packaging discussions since Nov 1. Spike correlates with shipping damage reports.",
      icon: TrendingUp,
      color: "red",
    },
    {
      type: "warning",
      title: "Customer Service Escalating",
      description: "43% rise in customer service mentions, accelerating after Nov 21. Wait times are primary driver.",
      icon: TrendingUp,
      color: "amber",
    },
    {
      type: "insight",
      title: "Product Quality Discussions Stable",
      description: "Minimal variation in product quality mentions. Consistent positive sentiment indicates strength.",
      icon: MessageSquare,
      color: "emerald",
    },
  ];
  const insights = aiTrends.length
    ? aiTrends.map((a) => ({
        type: a.type as "critical" | "warning" | "insight",
        title: a.title,
        description: a.description,
        icon: a.type === "critical" || a.type === "warning" ? TrendingUp : MessageSquare,
        color: a.type === "critical" ? "red" : a.type === "warning" ? "amber" : "emerald",
      }))
    : defaultInsights;

  const colorConfig = {
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: "text-red-600",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: "text-amber-600",
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: "text-emerald-600",
    },
  };

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

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
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
            label={{ value: 'Mentions', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#64748b' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#0f172a',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="line"
          />
          {topicKeys.length > 0
            ? topicKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={TOPIC_COLORS[idx % TOPIC_COLORS.length]}
                  strokeWidth={2.5}
                  name={key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  dot={{ fill: TOPIC_COLORS[idx % TOPIC_COLORS.length], r: granularity === "daily" ? 2 : 4 }}
                  activeDot={{ r: 6 }}
                />
              ))
            : (
              <>
                <Line 
                  type="monotone" 
                  dataKey="packaging" 
                  stroke="#ef4444" 
                  strokeWidth={2.5}
                  name="Packaging"
                  dot={{ fill: '#ef4444', r: granularity === "daily" ? 2 : 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="customerService" 
                  stroke="#f59e0b" 
                  strokeWidth={2.5}
                  name="Customer Service"
                  dot={{ fill: '#f59e0b', r: granularity === "daily" ? 2 : 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="productQuality" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  name="Product Quality"
                  dot={{ fill: '#10b981', r: granularity === "daily" ? 2 : 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="shipping" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Shipping"
                  dot={{ fill: '#8b5cf6', r: granularity === "daily" ? 2 : 3 }}
                  activeDot={{ r: 5 }}
                  strokeDasharray="5 5"
                />
              </>
            )}
        </LineChart>
      </ResponsiveContainer>

      {/* AI Insights */}
      <div className="space-y-3 mt-4">
        <div className="text-sm text-slate-700 mb-2">AI Trend Analysis</div>
        {insights.map((insight, idx) => {
          const Icon = insight.icon;
          const colors = colorConfig[insight.color as keyof typeof colorConfig];
          
          return (
            <div
              key={idx}
              className={`${colors.bg} ${colors.border} border rounded-lg p-3`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <Icon className={`w-4 h-4 ${colors.icon}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm ${colors.text} mb-1`}>{insight.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
