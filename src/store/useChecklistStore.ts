import { create } from 'zustand';
import { type TaskCategory } from '../utils/constants';
import { checklistService } from '../services/checklistService';
import { type ChecklistItem as SupabaseItem } from '../lib/supabase';

export interface ChecklistTask {
  id: string;
  text: string;
  category: TaskCategory;
  done: boolean;
  xpReward: number;
}

// Default tasks are now in profileService.ts — used only during first login initialization

// Mapeo de Supabase → tipo local
function toLocalTask(item: SupabaseItem): ChecklistTask {
  return {
    id: item.id,
    text: item.text,
    category: item.category as TaskCategory,
    done: item.done,
    xpReward: item.xp_reward,
  };
}

interface ChecklistState {
  userId: string | null;
  dailyTasks: ChecklistTask[];
  weeklyTasks: ChecklistTask[];
  isLoading: boolean;
  // Actions
  loadFromSupabase: (userId: string) => Promise<void>;
  toggleTask: (id: string, type: 'daily' | 'weekly') => void;
  addTask: (task: Omit<ChecklistTask, 'id'>, type: 'daily' | 'weekly') => void;
  removeTask: (id: string, type: 'daily' | 'weekly') => void;
  getDailyProgress: () => number;
  getWeeklyProgress: () => number;
}

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  userId: null,
  dailyTasks: [],
  weeklyTasks: [],
  isLoading: false,

  loadFromSupabase: async (userId: string) => {
    set({ isLoading: true, userId });
    try {
      // Auto-reset via RPC de Supabase (daily/weekly/monthly)
      await checklistService.resetItems(userId);
      const items = await checklistService.getItems(userId);
      const daily = items.filter(i => i.type === 'daily').map(toLocalTask);
      const weekly = items.filter(i => i.type === 'weekly').map(toLocalTask);
      set({ dailyTasks: daily, weeklyTasks: weekly });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleTask: (id, type) => {
    const { userId } = get();
    const key = type === 'daily' ? 'dailyTasks' : 'weeklyTasks';
    const task = get()[key].find(t => t.id === id);
    if (!task) return;

    const newDone = !task.done;
    const updated = get()[key].map((t) =>
      t.id === id ? { ...t, done: newDone } : t
    );
    set({ [key]: updated } as Partial<ChecklistState>);

    // Persistir en Supabase
    if (userId) checklistService.toggleItem(userId, id, newDone);
  },

  addTask: (task, type) => {
    const { userId } = get();
    const tempId = `${type}_${Date.now()}`;
    const newTask: ChecklistTask = { ...task, id: tempId };
    const key = type === 'daily' ? 'dailyTasks' : 'weeklyTasks';
    const updated = [...get()[key], newTask];
    set({ [key]: updated } as Partial<ChecklistState>);

    // Persistir en Supabase
    if (userId) {
      checklistService.createItem(userId, {
        text: task.text,
        category: task.category,
        type,
        done: false,
        xp_reward: task.xpReward,
        position: updated.length - 1,
      }).then(item => {
        if (!item) return;
        // Actualizar ID temporal con el real de Supabase
        const withRealId = get()[key].map(t => t.id === tempId ? { ...t, id: item.id } : t);
        set({ [key]: withRealId } as Partial<ChecklistState>);
      });
    }
  },

  removeTask: (id, type) => {
    const key = type === 'daily' ? 'dailyTasks' : 'weeklyTasks';
    const updated = get()[key].filter((t) => t.id !== id);
    set({ [key]: updated } as Partial<ChecklistState>);
    checklistService.deleteItem(id);
  },

  getDailyProgress: () => {
    const tasks = get().dailyTasks;
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
  },

  getWeeklyProgress: () => {
    const tasks = get().weeklyTasks;
    if (tasks.length === 0) return 0;
    return Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100);
  },
}));
