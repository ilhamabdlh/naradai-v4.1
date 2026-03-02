import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis, Label } from "recharts";
import { AlertTriangle, TrendingUp, Target } from "lucide-react";
import { useDashboardContent } from "@/contexts/DashboardContentContext";

const defaultKOLData = [
    { 
      name: "@TechReviewer",
      followers: 245000,
      positivity: 82,
      engagement: 12400,
      color: "#10b981",
      category: "Tech Influencer"
    },
    { 
      name: "@DigitalTrends",
      followers: 189000,
      positivity: 76,
      engagement: 9800,
      color: "#06b6d4",
      category: "Media Outlet"
    },
    { 
      name: "@ProductGuru",
      followers: 156000,
      positivity: 88,
      engagement: 15600,
      color: "#10b981",
      category: "Product Reviewer"
    },
    { 
      name: "@TechCritic",
      followers: 134000,
      positivity: 34,
      engagement: 8900,
      color: "#ef4444",
      category: "Critical Reviewer"
    },
    { 
      name: "@IndustryInsider",
      followers: 98000,
      positivity: 68,
      engagement: 5200,
      color: "#f59e0b",
      category: "Industry Expert"
    },
    { 
      name: "@ConsumerWatch",
      followers: 87000,
      positivity: 42,
      engagement: 6700,
      color: "#ef4444",
      category: "Consumer Advocate"
    },
    { 
      name: "@SmartBuyer",
      followers: 72000,
      positivity: 79,
      engagement: 4800,
      color: "#06b6d4",
      category: "Shopping Guide"
    },
    { 
      name: "@EcoReviews",
      followers: 64000,
      positivity: 91,
      engagement: 7200,
      color: "#10b981",
      category: "Sustainability Focus"
    },
    { 
      name: "@BudgetHacks",
      followers: 53000,
      positivity: 58,
      engagement: 3400,
      color: "#f59e0b",
      category: "Value Focused"
    },
    { 
      name: "@QualityFirst",
      followers: 47000,
      positivity: 85,
      engagement: 5100,
      color: "#10b981",
      category: "Quality Advocate"
    },
    { 
      name: "@TrendSpotter",
      followers: 38000,
      positivity: 72,
      engagement: 2900,
      color: "#06b6d4",
      category: "Trend Analyst"
    },
    { 
      name: "@HonestReview",
      followers: 29000,
      positivity: 51,
      engagement: 1800,
      color: "#f59e0b",
      category: "Honest Opinions"
    },
    { 
      name: "@DailyDeals",
      followers: 23000,
      positivity: 64,
      engagement: 1400,
      color: "#06b6d4",
      category: "Deals Curator"
    },
    { 
      name: "@UnboxExpert",
      followers: 18000,
      positivity: 38,
      engagement: 1200,
      color: "#ef4444",
      category: "Unboxing Channel"
    },
    { 
      name: "@GreenChoice",
      followers: 12000,
      positivity: 94,
      engagement: 1600,
      color: "#10b981",
      category: "Eco Advocate"
    },
  ];

export function KOLMatrixChart() {
  const content = useDashboardContent();
  const data = (content?.whatsHappeningKOLMatrix?.length ? content.whatsHappeningKOLMatrix : defaultKOLData) as typeof defaultKOLData;
  const aiKOL = content?.whatsHappeningAIKOLAnalysis ?? [];
  const defaultInsights = [
    {
      type: "critical",
      title: "Engage @TechCritic Urgently",
      description: "High-reach influencer (134K followers) with only 34% positive sentiment. One negative post could reach thousands. Prioritize relationship building.",
      icon: AlertTriangle,
      color: "red",
    },
    {
      type: "opportunity",
      title: "Partner with @ProductGuru",
      description: "Top-tier influencer with 88% positivity and high engagement. Perfect candidate for brand ambassadorship or product collaboration.",
      icon: TrendingUp,
      color: "emerald",
    },
    {
      type: "insight",
      title: "Nurture Mid-Tier Advocates",
      description: "@EcoReviews (91% positive) and @QualityFirst (85% positive) are smaller but highly supportive. Great for authentic testimonials.",
      icon: Target,
      color: "violet",
    },
  ];
  const insights = aiKOL.length
    ? aiKOL.map((a) => ({
        type: a.type,
        title: a.title,
        description: a.description,
        icon: a.type === "critical" ? AlertTriangle : a.type === "opportunity" ? TrendingUp : Target,
        color: a.type === "critical" ? "red" : a.type === "opportunity" ? "emerald" : "violet",
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
    violet: {
      bg: "bg-violet-50",
      border: "border-violet-200",
      text: "text-violet-700",
      icon: "text-violet-600",
    },
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xl">
          <div className="font-medium text-slate-900 mb-1">{data.name}</div>
          <div className="text-xs text-slate-600 mb-2">{data.category}</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-600">Followers:</span>
              <span className="text-slate-900">{data.followers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-600">Positivity:</span>
              <span className="text-slate-900">{data.positivity}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-600">Engagement:</span>
              <span className="text-slate-900">{data.engagement.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={340}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            type="number" 
            dataKey="followers" 
            name="Followers"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          >
            <Label 
              value="Number of Followers" 
              position="bottom" 
              style={{ textAnchor: 'middle', fill: '#64748b', fontSize: '12px' }}
              offset={20}
            />
          </XAxis>
          <YAxis 
            type="number" 
            dataKey="positivity" 
            name="Positivity"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value}%`}
            domain={[20, 100]}
          >
            <Label 
              value="Positivity %" 
              angle={-90} 
              position="left" 
              style={{ textAnchor: 'middle', fill: '#64748b', fontSize: '12px' }}
              offset={-5}
            />
          </YAxis>
          <ZAxis type="number" dataKey="engagement" range={[200, 800]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={data}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Positive (&gt;70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500" />
          <span>Neutral (50-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span>Mixed (40-50%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Negative (&lt;40%)</span>
        </div>
        <div className="text-slate-500">• Bubble size = Engagement rate</div>
      </div>

      {/* AI Insights */}
      <div className="space-y-3 mt-4">
        <div className="text-sm text-slate-700 mb-2">AI KOL Analysis</div>
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