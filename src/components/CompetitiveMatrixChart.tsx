import { useMemo } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis, Label } from "recharts";
import { useDashboardContent } from "@/contexts/DashboardContentContext";

const DEFAULT_CHART_DATA = [
  { name: "Your Brand", mentions: 42000, positivePercentage: 58, size: 850, color: "#8b5cf6" },
  { name: "Competitor A", mentions: 38000, positivePercentage: 62, size: 720, color: "#06b6d4" },
  { name: "Competitor B", mentions: 31000, positivePercentage: 71, size: 650, color: "#10b981" },
  { name: "Competitor C", mentions: 24000, positivePercentage: 54, size: 480, color: "#f59e0b" },
  { name: "Competitor D", mentions: 18000, positivePercentage: 48, size: 380, color: "#ef4444" },
];

const QUADRANT_BOX = ["bg-emerald-50 border-emerald-200", "bg-violet-50 border-violet-200", "bg-amber-50 border-amber-200", "bg-slate-50 border-slate-200"];
const QUADRANT_LABEL = ["text-emerald-700", "text-violet-700", "text-amber-700", "text-slate-700"];

export function CompetitiveMatrixChart() {
  const content = useDashboardContent();
  const data = useMemo(() => {
    const items = content?.competitiveMatrixItems ?? [];
    if (!items.length) return DEFAULT_CHART_DATA;
    return items.map((item, i) => ({
      name: item.name,
      mentions: item.mentions,
      positivePercentage: item.positivePercentage,
      size: Math.max(item.size || item.mentions, 50),
      color: i === 0 ? "#8b5cf6" : (item.color || ["#06b6d4", "#10b981", "#f59e0b", "#ef4444"][i % 4]),
    }));
  }, [content?.competitiveMatrixItems]);

  const quadrantItems = content?.competitiveQuadrantAnalysis ?? [];
  const yDomain = useMemo(() => {
    if (!data.length) return [40, 80] as [number, number];
    const vals = data.map((d) => d.positivePercentage);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const padding = Math.max(5, (max - min) * 0.1);
    return [Math.max(0, min - padding), Math.min(100, max + padding)] as [number, number];
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xl">
          <div className="font-medium text-slate-900 mb-2">{data.name}</div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-600">Mentions:</span>
              <span className="text-slate-900">{data.mentions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-600">Positive:</span>
              <span className="text-slate-900">{data.positivePercentage}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-600">Size:</span>
              <span className="text-slate-900">{data.size >= 1000 ? `${(data.size / 1000).toFixed(1)}K` : data.size}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = (props: any) => {
    const { x, y, payload } = props;
    if (!payload || !payload.name) return null;
    
    return (
      <text 
        x={x} 
        y={y - 10} 
        textAnchor="middle" 
        fill="#64748b"
        fontSize={11}
        fontWeight={500}
      >
        {payload.name}
      </text>
    );
  };

  return (
    <div>
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            type="number" 
            dataKey="mentions" 
            name="Mentions"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          >
            <Label 
              value="Number of Mentions" 
              position="bottom" 
              style={{ textAnchor: 'middle', fill: '#64748b', fontSize: '12px' }}
              offset={0}
            />
          </XAxis>
          <YAxis 
            type="number" 
            dataKey="positivePercentage" 
            name="Positive %"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `${value}%`}
            domain={yDomain}
          >
            <Label 
              value="Positive Sentiment %" 
              angle={-90} 
              position="left" 
              style={{ textAnchor: 'middle', fill: '#64748b', fontSize: '12px' }}
              offset={0}
            />
          </YAxis>
          <ZAxis type="number" dataKey="size" range={[400, 1200]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Scatter 
            data={data} 
            label={<CustomLabel />}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <div className="mt-6 space-y-3">
        <div className="text-sm text-slate-700 mb-2">Quadrant Analysis</div>
        <div className="grid grid-cols-2 gap-3">
          {quadrantItems.length > 0
            ? quadrantItems.map((q, i) => (
                <div
                  key={q.id}
                  className={`rounded-lg p-3 border ${QUADRANT_BOX[i % QUADRANT_BOX.length]}`}
                >
                  <div className={`text-xs font-medium mb-1 ${QUADRANT_LABEL[i % QUADRANT_LABEL.length]}`}>{q.label}</div>
                  <div className="text-sm text-slate-900">{q.brands}</div>
                  <div className="text-xs text-slate-600 mt-1">{q.note}</div>
                </div>
              ))
            : (
              <>
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                  <div className="text-xs text-emerald-700 mb-1">High Volume + Positive</div>
                  <div className="text-sm text-slate-900">Competitor A, B</div>
                  <div className="text-xs text-slate-600 mt-1">Market leaders</div>
                </div>
                <div className="bg-violet-50 rounded-lg p-3 border border-violet-200">
                  <div className="text-xs text-violet-700 mb-1">High Volume + Mixed</div>
                  <div className="text-sm text-slate-900">Your Brand</div>
                  <div className="text-xs text-slate-600 mt-1">Improve sentiment</div>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <div className="text-xs text-amber-700 mb-1">Low Volume + Mixed</div>
                  <div className="text-sm text-slate-900">Competitor C, D</div>
                  <div className="text-xs text-slate-600 mt-1">Growth opportunity</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="text-xs text-slate-700 mb-1">Key Insight</div>
                  <div className="text-sm text-slate-900">↗ Move up-right</div>
                  <div className="text-xs text-slate-600 mt-1">Increase positive %</div>
                </div>
              </>
            )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-500" />
          <span>Your Brand</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500" />
          <span>Competitors</span>
        </div>
        <div className="text-slate-500">• Bubble size = Engagement volume</div>
      </div>
    </div>
  );
}