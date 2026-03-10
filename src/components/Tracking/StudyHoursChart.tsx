import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const HOURS_DATA = [
  { day: 'Lun', hours: 4.5 },
  { day: 'Mar', hours: 3.0 },
  { day: 'Mié', hours: 5.0 },
  { day: 'Jue', hours: 4.0 },
  { day: 'Vie', hours: 3.5 },
  { day: 'Sáb', hours: 6.0 },
  { day: 'Dom', hours: 2.0 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card border border-primary-500/30 px-3 py-2">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-primary-300">{payload[0].value}h de estudio</p>
      </div>
    );
  }
  return null;
};

export function StudyHoursChart() {
  const total = HOURS_DATA.reduce((s, d) => s + d.hours, 0);

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-300">Horas de Estudio</h3>
        <span className="text-xs text-accent-400 font-mono">{total}h esta semana</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={HOURS_DATA} barSize={24}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 8]} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="hours"
            fill="url(#hoursGradient)"
            radius={[4, 4, 0, 0]}
          />
          <defs>
            <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c6af5" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#7c6af5" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
