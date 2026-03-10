import { XpBar } from '../components/Gamification/XpBar';
import { AchievementsList } from '../components/Gamification/AchievementsList';
import { useAppStore } from '../store/useAppStore';
import { useChecklistStore } from '../store/useChecklistStore';
import { getStreakLabel } from '../utils/dateUtils';

export function GamificationPage() {
  const { achievements, streak, totalTasksCompleted, totalNotesCreated, xp } = useAppStore();
  const getDailyProgress = useChecklistStore((s) => s.getDailyProgress);
  const todayPct = getDailyProgress();

  const stats = [
    { label: 'Tareas completadas', value: totalTasksCompleted, icon: '✅' },
    { label: 'Notas creadas', value: totalNotesCreated, icon: '📝' },
    { label: 'Racha actual', value: `${streak}d`, icon: '🔥' },
    { label: 'XP ganado', value: xp, icon: '⭐' },
    { label: 'Logros', value: achievements.length, icon: '🏆' },
    { label: 'Hoy', value: `${todayPct}%`, icon: '📊' },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white">Logros y Gamificación</h1>
        <p className="text-sm text-gray-500">{getStreakLabel(streak)}</p>
      </div>

      {/* XP Bar */}
      <XpBar />

      {/* Quick Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass-card p-3 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-lg font-bold text-white">{s.value}</div>
            <div className="text-[10px] text-gray-600">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Achievements Grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Logros ({achievements.length}/8)
        </h2>
        <AchievementsList earned={achievements} />
      </div>

      {/* Tips to unlock */}
      <div className="glass-card border border-accent-500/15 p-4">
        <h3 className="text-xs font-semibold text-accent-400 uppercase tracking-wider mb-3">💡 Cómo ganar XP</h3>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
          <div>✅ Completar tarea diaria = +15 XP</div>
          <div>📝 Crear nota = contado en logros</div>
          <div>🔥 Racha de 3 días = logro desbloqueado</div>
          <div>⭐ 500 XP = Nivel 2</div>
          <div>📅 Completa todas las tareas = Día Perfecto</div>
          <div>💎 30 días seguidos = Mes de Hierro</div>
        </div>
      </div>
    </div>
  );
}
