import { Code2, BookOpen, FileSearch, Headphones, GitCommit } from 'lucide-react';
import { TIER1_GOALS } from '../../utils/constants';
import { ProgressBar } from '../../ui/ProgressBar';
import { getProgressPercent } from '../../utils/progressUtils';

const GOALS = [
  { key: 'gpa', icon: BookOpen, color: 'primary' as const, label: 'GPA' },
  { key: 'codeforces', icon: Code2, color: 'accent' as const, label: 'Codeforces Rating' },
  { key: 'papers', icon: FileSearch, color: 'warning' as const, label: 'Papers Publicados' },
  { key: 'toefl', icon: Headphones, color: 'success' as const, label: 'TOEFL iBT' },
  { key: 'topik', icon: FileSearch, color: 'primary' as const, label: 'TOPIK Korean' },
  { key: 'github', icon: GitCommit, color: 'accent' as const, label: 'GitHub Commits' },
];

export function GoalProgress() {
  return (
    <div className="glass-card p-5">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
        Objetivos Tier 1 → KAIST
      </h2>
      <div className="space-y-4">
        {GOALS.map(({ key, icon: Icon, color, label }) => {
          const goal = TIER1_GOALS[key as keyof typeof TIER1_GOALS];
          const pct = getProgressPercent(goal.current, goal.target);
          return (
            <div key={key} className="flex items-center gap-3">
              <div className={`flex-shrink-0 p-1.5 rounded-lg ${color === 'accent' ? 'bg-accent-500/10 text-accent-400' : 'bg-primary-500/10 text-primary-400'}`}>
                <Icon size={14} />
              </div>
              <div className="flex-1">
                <ProgressBar
                  label={label}
                  sublabel={`${goal.current}${goal.unit} → ${goal.target}${goal.unit}`}
                  value={goal.current}
                  max={goal.target}
                  color={color}
                  size="sm"
                  showPercent={false}
                />
              </div>
              <span className="text-xs font-mono text-gray-500 w-10 text-right">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
