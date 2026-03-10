import { RatingChart } from '../components/Tracking/RatingChart';
import { GpaChart } from '../components/Tracking/GpaChart';
import { StudyHoursChart } from '../components/Tracking/StudyHoursChart';
import { TIER1_GOALS } from '../utils/constants';
import { getProgressPercent } from '../utils/progressUtils';
import { ProgressBar } from '../ui/ProgressBar';

export function TrackingPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Seguimiento de Progreso</h1>
        <p className="text-sm text-gray-500">Ruta hacia KAIST 2029 — métricas actualizadas</p>
      </div>

      {/* Tier 1 Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {Object.entries(TIER1_GOALS).map(([key, goal]) => {
          const pct = getProgressPercent(goal.current, goal.target);
          return (
            <div key={key} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">{goal.label}</span>
                <span className="text-xs font-mono text-primary-400">{pct}%</span>
              </div>
              <div className="text-xl font-bold text-white tabular-nums">
                {goal.current}
                <span className="text-sm text-gray-500 font-normal">{goal.unit}</span>
              </div>
              <div className="text-xs text-gray-600 mb-2">Target: {goal.target}{goal.unit}</div>
              <ProgressBar value={goal.current} max={goal.target} showPercent={false} size="sm" color={pct >= 80 ? 'success' : pct >= 50 ? 'primary' : 'warning'} />
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RatingChart />
        <GpaChart />
      </div>
      <StudyHoursChart />
    </div>
  );
}
