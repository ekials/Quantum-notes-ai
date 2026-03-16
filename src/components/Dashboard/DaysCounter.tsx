import { daysUntilGraduation, daysUntilKAIST } from '../../utils/dateUtils';

export function DaysCounter() {
  const daysGrad = daysUntilGraduation();
  const daysKAIST = daysUntilKAIST();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="glass-card border border-primary-500/20 p-5 text-center">
        <div className="text-4xl font-bold gradient-text tabular-nums">{daysGrad}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">días hasta graduación UCSP</div>
      </div>
      <div className="glass-card border border-accent-500/20 p-5 text-center">
        <div className="text-4xl font-bold text-accent-400 tabular-nums">{daysKAIST}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">días hasta KAIST 2029 🇰🇷</div>
      </div>
    </div>
  );
}
