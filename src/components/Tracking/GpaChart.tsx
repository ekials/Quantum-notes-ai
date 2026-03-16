import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const GPA_DATA = [
  { semester: 'Sem 1', gpa: 12.5 },
  { semester: 'Sem 2', gpa: 13.0 },
  { semester: 'Sem 3', gpa: 13.5 },
  { semester: 'Sem 4', gpa: 13.8 },
  { semester: 'Sem 5', gpa: null },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length && payload[0].value) {
    return (
      <div className="glass-card border border-accent-500/30 px-3 py-2">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-accent-300">{payload[0].value.toFixed(1)} / 20</p>
      </div>
    );
  }
  return null;
};

export function GpaChart() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300">Progresión GPA</h3>
        <span className="text-xs text-gray-500">Target: 16.0</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={GPA_DATA}>
          <defs>
            <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f5c4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00f5c4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="semester" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[10, 20]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={16} stroke="rgba(124, 106, 245, 0.4)" strokeDasharray="6 3" label={{ value: 'Goal', fill: '#7c6af5', fontSize: 10 }} />
          <Area
            type="monotone"
            dataKey="gpa"
            stroke="#00f5c4"
            strokeWidth={2.5}
            fill="url(#gpaGradient)"
            connectNulls={false}
            dot={{ fill: '#00f5c4', r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
