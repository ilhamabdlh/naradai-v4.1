import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";

const defaultTopics = [
  { topic: "Packaging", mentions: 2847, sentiment: -0.68 },
  { topic: "Customer Service", mentions: 2341, sentiment: -0.54 },
  { topic: "Product Quality", mentions: 1923, sentiment: 0.71 },
  { topic: "Shipping Speed", mentions: 1654, sentiment: 0.32 },
  { topic: "Price Value", mentions: 1432, sentiment: 0.45 },
  { topic: "Mobile App", mentions: 892, sentiment: 0.12 },
];

const defaultInsights = [
    {
      type: "critical",
      title: "Packaging is #1 Pain Point",
      description: "Most discussed topic with highly negative sentiment. Immediate action required to prevent brand damage.",
      icon: AlertTriangle,
      color: "red",
    },
    {
      type: "opportunity",
      title: "Product Quality is a Strength",
      description: "High volume with positive sentiment. Leverage this in marketing to counter negative narratives.",
      icon: TrendingUp,
      color: "emerald",
    },
    {
      type: "insight",
      title: "Mobile App Underperforming",
      description: "Low mention volume with neutral sentiment suggests lack of engagement. Consider feature improvements.",
      icon: Lightbulb,
      color: "amber",
    },
  ];

export function TopicsChart() {
  const content = useDashboardContent();
  const data = (content?.whatsHappeningTopTopics?.length ? content.whatsHappeningTopTopics : defaultTopics) as { topic: string; mentions: number; sentiment: number }[];
  const aiInsights = content?.whatsHappeningAITopicAnalysis ?? [];
  const insights = aiInsights.length
    ? aiInsights.map((a) => ({
        type: a.type as "critical" | "opportunity" | "insight",
        title: a.title,
        description: a.description,
        icon: a.type === "critical" ? AlertTriangle : a.type === "opportunity" ? TrendingUp : Lightbulb,
        color: a.type === "critical" ? "red" : a.type === "opportunity" ? "emerald" : "amber",
      }))
    : defaultInsights;

  const colorConfig = {
    red: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: "text-red-600",
    },
    emerald: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: "text-emerald-600",
    },
    amber: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: "text-amber-600",
    },
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            type="number" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            type="category" 
            dataKey="topic" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            width={120}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              color: '#0f172a',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: number, name: string, props: any) => {
              if (name === "mentions") {
                return [value.toLocaleString(), "Mentions"];
              }
              return value;
            }}
          />
          <Bar 
            dataKey="mentions" 
            fill="url(#barGradient)" 
            radius={[0, 8, 8, 0]}
          />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2 mb-6">
        {data.slice(0, 3).map((item) => (
          <div key={item.topic} className="flex items-center justify-between text-sm">
            <span className="text-slate-600">{item.topic}</span>
            <span className={item.sentiment < 0 ? "text-red-600" : "text-emerald-600"}>
              {item.sentiment > 0 ? '+' : ''}{item.sentiment.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="space-y-3">
        <div className="text-sm text-slate-700 mb-2">AI Topic Analysis</div>
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