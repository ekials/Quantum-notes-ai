import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const RATING_DATA = [
  { month: 'Sep 24', rating: 1050 },
  { month: 'Oct 24', rating: 1100 },
  { month: 'Nov 24', rating: 1085 },
  { month: 'Dic 24', rating: 1150 },
  { month: 'Ene 25', rating: 1200 },
  { month: 'Feb 25', rating: 1250 },
  { month: 'Mar 25', rating: 1250 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card border border-primary-500/30 px-3 py-2">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-primary-300">{payload[0].value} rating</p>
      </div>
    );
  }
  return null;
};

export function RatingChart() {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300">Codeforces Rating</h3>
        <span className="text-xs text-gray-500">Target: 2000</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={RATING_DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[900, 2100]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={2000} stroke="rgba(0, 245, 196, 0.3)" strokeDasharray="6 3" label={{ value: 'Goal', fill: '#00f5c4', fontSize: 10 }} />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="#7c6af5"
            strokeWidth={2.5}
            dot={{ fill: '#7c6af5', r: 4 }}
            activeDot={{ r: 6, fill: '#7c6af5', strokeWidth: 2, stroke: '#0a0a0f' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
