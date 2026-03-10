import { useAppStore } from '../../store/useAppStore';
import { getLevelProgress, getLevel, getLevelTitle, getXpToNextLevel } from '../../utils/progressUtils';
import { XP_PER_LEVEL } from '../../utils/constants';

export function XpBar() {
  const { xp, level, streak } = useAppStore();
  const progress = getLevelProgress(xp);
  const title = getLevelTitle(level);
  const toNext = getXpToNextLevel(xp);
  const currentLevelXp = xp % XP_PER_LEVEL;

  return (
    <div className="glass-card border border-primary-500/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold gradient-text">Nv. {level}</span>
            <span className="text-base text-gray-400">{title}</span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            {currentLevelXp} / {XP_PER_LEVEL} XP — faltan {toNext} XP para el siguiente nivel
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-primary-400">{xp}</div>
          <div className="text-xs text-gray-500">XP Total</div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="h-3 bg-dark-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 transition-all duration-700 relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse-slow" />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
        {streak > 0 && (
          <span className="text-amber-400">🔥 {streak} días de racha</span>
        )}
        <span>{progress.toFixed(0)}% al nivel {level + 1}</span>
        <span className="ml-auto">Próximo nivel: {getLevel(xp) + 1} — {getLevelTitle(getLevel(xp) + 1)}</span>
      </div>
    </div>
  );
}
