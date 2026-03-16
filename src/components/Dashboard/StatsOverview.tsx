import { GraduationCap, Code2, BookOpen, Flame, Star } from 'lucide-react';
import { StatCard } from '../../ui/StatCard';
import { TIER1_GOALS } from '../../utils/constants';
import { useAppStore } from '../../store/useAppStore';
import { useChecklistStore } from '../../store/useChecklistStore';
import { getStreakLabel } from '../../utils/dateUtils';

export function StatsOverview() {
  const { xp, level, streak } = useAppStore();
  const getDailyProgress = useChecklistStore((s) => s.getDailyProgress);
  const dailyPct = getDailyProgress();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <StatCard
        label="GPA"
        value={TIER1_GOALS.gpa.current}
        icon={<GraduationCap size={18} />}
        delta={`Target: ${TIER1_GOALS.gpa.target}`}
        deltaPositive={false}
        sublabel="escala /20"
      />
      <StatCard
        label="Codeforces"
        value={TIER1_GOALS.codeforces.current}
        icon={<Code2 size={18} />}
        delta={`+${TIER1_GOALS.codeforces.target - TIER1_GOALS.codeforces.current} needed`}
        deltaPositive={false}
        sublabel="rating"
        accentColor="accent"
      />
      <StatCard
        label="Papers"
        value={TIER1_GOALS.papers.current}
        icon={<BookOpen size={18} />}
        delta={`Target: ${TIER1_GOALS.papers.target}`}
        deltaPositive={false}
        sublabel="publicados"
      />
      <StatCard
        label="Racha"
        value={`${streak}d`}
        icon={<Flame size={18} />}
        delta={getStreakLabel(streak)}
        deltaPositive={streak > 0}
        sublabel="días consecutivos"
        accentColor="accent"
      />
      <StatCard
        label="XP Total"
        value={`${xp} XP`}
        icon={<Star size={18} />}
        delta={`Nivel ${level}`}
        deltaPositive={true}
        sublabel={`hoy: ${dailyPct}% tareas`}
      />
    </div>
  );
}
