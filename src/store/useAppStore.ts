import { create } from 'zustand';
import { storageService } from '../services/storageService';
import { getLevel, getLevelProgress } from '../utils/progressUtils';
import { getCurrentDateKey } from '../utils/dateUtils';
import { XP_PER_TASK } from '../utils/constants';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_task', title: '¡Primer Paso!', description: 'Completa tu primera tarea', icon: '🎯' },
  { id: 'streak_3', title: 'Racha de fuego', description: '3 días consecutivos activos', icon: '🔥' },
  { id: 'streak_7', title: 'Semana perfecta', description: '7 días consecutivos activos', icon: '⚡' },
  { id: 'streak_30', title: 'Mes de hierro', description: '30 días consecutivos activos', icon: '💎' },
  { id: 'xp_500', title: 'Nivel 2', description: 'Alcanza 500 XP', icon: '⭐' },
  { id: 'xp_2000', title: 'Nivel 5', description: 'Alcanza 2000 XP', icon: '🌟' },
  { id: 'notes_10', title: 'Escritor', description: 'Crea 10 notas', icon: '📝' },
  { id: 'daily_complete', title: 'Día perfecto', description: 'Completa todas las tareas del día', icon: '✅' },
];

interface AppState {
  xp: number;
  level: number;
  levelProgress: number;
  streak: number;
  lastActiveDate: string | null;
  achievements: Achievement[];
  totalTasksCompleted: number;
  totalNotesCreated: number;
  // Actions
  addXp: (amount: number) => void;
  updateStreak: () => void;
  checkAchievements: () => void;
  incrementTasks: () => void;
  incrementNotes: () => void;
}

const saved = storageService.get<Partial<AppState>>('app_state', {});

export const useAppStore = create<AppState>((set, get) => ({
  xp: saved.xp ?? 0,
  level: saved.level ?? 1,
  levelProgress: saved.levelProgress ?? 0,
  streak: saved.streak ?? 0,
  lastActiveDate: saved.lastActiveDate ?? null,
  achievements: saved.achievements ?? [],
  totalTasksCompleted: saved.totalTasksCompleted ?? 0,
  totalNotesCreated: saved.totalNotesCreated ?? 0,

  addXp: (amount: number) => {
    const newXp = get().xp + amount;
    const newLevel = getLevel(newXp);
    const newProgress = getLevelProgress(newXp);
    set({ xp: newXp, level: newLevel, levelProgress: newProgress });
    storageService.set('app_state', get());
    get().checkAchievements();
  },

  updateStreak: () => {
    const today = getCurrentDateKey();
    const last = get().lastActiveDate;
    if (last === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    const newStreak = last === yesterdayKey ? get().streak + 1 : 1;
    set({ streak: newStreak, lastActiveDate: today });
    storageService.set('app_state', get());
    get().checkAchievements();
  },

  checkAchievements: () => {
    const state = get();
    const earned = state.achievements.map((a) => a.id);
    const newAchievements = [...state.achievements];
    let changed = false;

    const tryEarn = (id: string) => {
      if (!earned.includes(id)) {
        const ach = ACHIEVEMENTS.find((a) => a.id === id);
        if (ach) {
          newAchievements.push({ ...ach, earnedAt: new Date().toISOString() });
          changed = true;
        }
      }
    };

    if (state.totalTasksCompleted >= 1) tryEarn('first_task');
    if (state.streak >= 3) tryEarn('streak_3');
    if (state.streak >= 7) tryEarn('streak_7');
    if (state.streak >= 30) tryEarn('streak_30');
    if (state.xp >= 500) tryEarn('xp_500');
    if (state.xp >= 2000) tryEarn('xp_2000');
    if (state.totalNotesCreated >= 10) tryEarn('notes_10');

    if (changed) {
      set({ achievements: newAchievements });
      storageService.set('app_state', get());
    }
  },

  incrementTasks: () => {
    set((s) => ({ totalTasksCompleted: s.totalTasksCompleted + 1 }));
    get().addXp(XP_PER_TASK);
    get().updateStreak();
  },

  incrementNotes: () => {
    set((s) => ({ totalNotesCreated: s.totalNotesCreated + 1 }));
    storageService.set('app_state', get());
    get().checkAchievements();
  },
}));
