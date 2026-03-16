import { DaysCounter } from '../components/Dashboard/DaysCounter';
import { StatsOverview } from '../components/Dashboard/StatsOverview';
import { GoalProgress } from '../components/Dashboard/GoalProgress';
import { MotivationQuote } from '../components/Dashboard/MotivationQuote';
import { QuickActions } from '../components/Dashboard/QuickActions';
import { useChecklistStore } from '../store/useChecklistStore';
import { useNavigate } from 'react-router-dom';
import { ChecklistItem } from '../components/Checklist/ChecklistItem';
import { ProgressBar } from '../ui/ProgressBar';
import { useAppStore } from '../store/useAppStore';

export function DashboardPage() {
  const { dailyTasks, toggleTask, removeTask, getDailyProgress } = useChecklistStore();
  const { incrementTasks } = useAppStore();
  const navigate = useNavigate();
  const progress = getDailyProgress();
  const todayTasks = dailyTasks.slice(0, 5);

  const handleToggle = (id: string, isDone: boolean) => {
    toggleTask(id, 'daily');
    if (!isDone) incrementTasks();
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Buenos días 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Tu camino hacia KAIST 2029 — cada día cuenta.
        </p>
      </div>

      {/* Countdown */}
      <DaysCounter />

      {/* Stats */}
      <StatsOverview />

      {/* Motivation & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-4">
          <MotivationQuote />
          <QuickActions />
        </div>
        <GoalProgress />
      </div>

      {/* Daily checklist preview */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Hoy</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-primary-400">{progress}%</span>
            <button
              onClick={() => navigate('/checklist')}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Ver todo →
            </button>
          </div>
        </div>
        <ProgressBar value={progress} max={100} showPercent={false} size="sm" className="mb-4" />
        <div className="space-y-2">
          {todayTasks.map((task) => (
            <ChecklistItem
              key={task.id}
              task={task}
              onToggle={() => handleToggle(task.id, task.done)}
              onDelete={() => removeTask(task.id, 'daily')}
            />
          ))}
        </div>
        {dailyTasks.length > 5 && (
          <button
            onClick={() => navigate('/checklist')}
            className="mt-3 text-xs text-gray-600 hover:text-gray-400 w-full text-center transition-colors"
          >
            +{dailyTasks.length - 5} tareas más →
          </button>
        )}
      </div>
    </div>
  );
}
