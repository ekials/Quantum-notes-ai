import { formatDate } from '../../utils/dateUtils';
import type { Achievement } from '../../store/useAppStore';

const ALL_ACHIEVEMENTS = [
  { id: 'first_task', title: '¡Primer Paso!', description: 'Completa tu primera tarea', icon: '🎯' },
  { id: 'streak_3', title: 'Racha de fuego', description: '3 días consecutivos activos', icon: '🔥' },
  { id: 'streak_7', title: 'Semana perfecta', description: '7 días consecutivos activos', icon: '⚡' },
  { id: 'streak_30', title: 'Mes de hierro', description: '30 días consecutivos activos', icon: '💎' },
  { id: 'xp_500', title: 'Nivel 2', description: 'Alcanza 500 XP', icon: '⭐' },
  { id: 'xp_2000', title: 'Nivel 5', description: 'Alcanza 2000 XP', icon: '🌟' },
  { id: 'notes_10', title: 'Escritor', description: 'Crea 10 notas', icon: '📝' },
  { id: 'daily_complete', title: 'Día perfecto', description: 'Completa todas las tareas del día', icon: '✅' },
];

interface AchievementCardProps {
  achievement: (typeof ALL_ACHIEVEMENTS)[0];
  earned?: Achievement;
}

export function AchievementsList({ earned }: { earned: Achievement[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {ALL_ACHIEVEMENTS.map((ach) => {
        const earnedAch = earned.find((e) => e.id === ach.id);
        return <AchievementCard key={ach.id} achievement={ach} earned={earnedAch} />;
      })}
    </div>
  );
}

function AchievementCard({ achievement, earned }: AchievementCardProps) {
  const isEarned = !!earned;

  return (
    <div className={`
      relative rounded-xl p-4 border text-center transition-all duration-200
      ${isEarned
        ? 'glass-card border-primary-500/30 shadow-lg shadow-primary-900/20'
        : 'bg-dark-900/30 border-white/5 opacity-50 grayscale'
      }
    `}>
      <div className="text-3xl mb-2">{achievement.icon}</div>
      <h3 className={`text-xs font-bold mb-1 ${isEarned ? 'text-white' : 'text-gray-600'}`}>
        {achievement.title}
      </h3>
      <p className="text-[10px] text-gray-500 leading-snug">{achievement.description}</p>
      {isEarned && earned?.earnedAt && (
        <p className="text-[10px] text-accent-500 mt-2">{formatDate(earned.earnedAt)}</p>
      )}
      {!isEarned && (
        <div className="absolute top-2 right-2">
          <div className="w-4 h-4 rounded-full border-2 border-gray-700 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
}
