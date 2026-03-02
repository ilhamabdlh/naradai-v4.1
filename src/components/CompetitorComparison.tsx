import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

export function CompetitorComparison() {
  const data = [
    { 
      name: "Your Brand",
      shareOfVoice: 32,
      sentiment: 72,
      engagement: 8.4,
    },
    { 
      name: "Competitor A",
      shareOfVoice: 28,
      sentiment: 68,
      engagement: 7.2,
    },
    { 
      name: "Competitor B",
      shareOfVoice: 24,
      sentiment: 75,
      engagement: 6.8,
    },
    { 
      name: "Competitor C",
      shareOfVoice: 16,
      sentiment: 65,
      engagement: 5.9,
    },
  ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            stroke="#64748b"
            style={{ fontSize: '11px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
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
            wrapperStyle={{ fontSize: '12px', color: '#475569' }}
          />
          <Bar dataKey="shareOfVoice" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Share of Voice %" />
          <Bar dataKey="sentiment" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Sentiment Score" />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Your Position</div>
          <div className="text-slate-900">#1 in Share of Voice</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
          <div className="text-xs text-slate-500 mb-1">Gap to Leader</div>
          <div className="text-emerald-600">Leading by 4%</div>
        </div>
      </div>
    </div>
  );
}