import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ChecklistItem } from '../components/Checklist/ChecklistItem';
import { CategoryFilter } from '../components/Checklist/CategoryFilter';
import { RewardBanner } from '../components/Checklist/RewardBanner';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useChecklistStore } from '../store/useChecklistStore';
import { useAppStore } from '../store/useAppStore';
import { type TaskCategory, TASK_CATEGORIES, CATEGORY_LABELS } from '../utils/constants';

type Tab = 'daily' | 'weekly';

export function ChecklistPage() {
  const [tab, setTab] = useState<Tab>('daily');
  const [activeCategory, setActiveCategory] = useState<TaskCategory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ text: '', category: 'academic' as TaskCategory, xpReward: 15 });

  const { dailyTasks, weeklyTasks, toggleTask, removeTask, addTask, getDailyProgress, getWeeklyProgress } = useChecklistStore();
  const { incrementTasks } = useAppStore();

  const tasks = tab === 'daily' ? dailyTasks : weeklyTasks;
  const progress = tab === 'daily' ? getDailyProgress() : getWeeklyProgress();

  const filtered = activeCategory ? tasks.filter((t) => t.category === activeCategory) : tasks;

  const categoryCounts = TASK_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = tasks.filter((t) => t.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const xpEarned = tasks.filter((t) => t.done).reduce((s, t) => s + t.xpReward, 0);

  const handleToggle = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task && !task.done) incrementTasks();
    toggleTask(id, tab);
  };

  const handleAdd = () => {
    if (!newTask.text.trim()) return;
    addTask({ ...newTask, done: false }, tab);
    setNewTask({ text: '', category: 'academic', xpReward: 15 });
    setShowModal(false);
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Checklist</h1>
          <p className="text-sm text-gray-500">Sistema de hábitos académicos</p>
        </div>
        <Button onClick={() => setShowModal(true)} size="sm">
          <Plus size={14} /> Nueva tarea
        </Button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-dark-900/60 rounded-xl border border-white/5 w-fit">
        {(['daily', 'weekly'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              tab === t ? 'bg-primary-600 text-white shadow' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t === 'daily' ? 'Diario' : 'Semanal'}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="glass-card p-4">
        <ProgressBar
          label={`Progreso ${tab === 'daily' ? 'de hoy' : 'semanal'}`}
          sublabel={`${tasks.filter(t => t.done).length}/${tasks.length} completadas`}
          value={progress}
          max={100}
          color={progress === 100 ? 'success' : 'primary'}
          size="md"
          showPercent={true}
        />
      </div>

      {/* Reward Banner */}
      <RewardBanner percent={progress} xpEarned={xpEarned} />

      {/* Category Filter */}
      <CategoryFilter active={activeCategory} onChange={setActiveCategory} counts={categoryCounts} />

      {/* Task List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-600 py-8 text-sm">No hay tareas en esta categoría</p>
        ) : (
          filtered.map((task) => (
            <ChecklistItem
              key={task.id}
              task={task}
              onToggle={() => handleToggle(task.id)}
              onDelete={() => removeTask(task.id, tab)}
            />
          ))
        )}
      </div>

      {/* Add Task Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Nueva Tarea" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
            <input
              autoFocus
              value={newTask.text}
              onChange={(e) => setNewTask((n) => ({ ...n, text: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="¿Qué harás hoy?"
              className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none focus:border-primary-500/40 placeholder-gray-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask((n) => ({ ...n, category: e.target.value as TaskCategory }))}
                className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
              >
                {TASK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">XP Reward</label>
              <input
                type="number"
                value={newTask.xpReward}
                onChange={(e) => setNewTask((n) => ({ ...n, xpReward: Number(e.target.value) }))}
                min={5}
                max={100}
                className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAdd} disabled={!newTask.text.trim()}>Agregar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
