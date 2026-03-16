import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  delta?: string;
  deltaPositive?: boolean;
  sublabel?: string;
  accentColor?: string;
}

export function StatCard({
  label,
  value,
  icon,
  delta,
  deltaPositive = true,
  sublabel,
  accentColor = 'primary',
}: StatCardProps) {
  const borderColor = accentColor === 'accent'
    ? 'hover:border-accent-500/40'
    : 'hover:border-primary-500/40';

  return (
    <div className={`glass-card p-4 transition-all duration-200 border border-white/5 ${borderColor} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
          {delta && (
            <p className={`text-xs mt-1 font-medium ${deltaPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {deltaPositive ? '▲' : '▼'} {delta}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${accentColor === 'accent' ? 'bg-accent-500/10 text-accent-400' : 'bg-primary-500/10 text-primary-400'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
