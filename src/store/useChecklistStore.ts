import { create } from 'zustand';
import { storageService } from '../services/storageService';
import { type TaskCategory } from '../utils/constants';
import { getCurrentDateKey } from '../utils/dateUtils';

export interface ChecklistTask {
  id: string;
  text: string;
  category: TaskCategory;
  done: boolean;
  xpReward: number;
}

const DEFAULT_DAILY: ChecklistTask[] = [
  { id: 'd1', text: 'Meditación / respiración (5 min)', category: 'morning', done: false, xpReward: 10 },
  { id: 'd2', text: 'Ejercicio o gimnasio (30 min)', category: 'health', done: false, xpReward: 20 },
  { id: 'd3', text: 'Leer 20 páginas de un libro técnico', category: 'academic', done: false, xpReward: 15 },
  { id: 'd4', text: 'Resolver 2 problemas en Codeforces', category: 'technical', done: false, xpReward: 25 },
  { id: 'd5', text: 'Estudiar coreano (30 min Duolingo/TOPIK)', category: 'languages', done: false, xpReward: 15 },
  { id: 'd6', text: 'Repasar notas del día (15 min)', category: 'academic', done: false, xpReward: 10 },
  { id: 'd7', text: 'Commit en GitHub (al menos 1)', category: 'technical', done: false, xpReward: 15 },
  { id: 'd8', text: 'Revisar finanzas / gastos del día', category: 'finance', done: false, xpReward: 5 },
  { id: 'd9', text: 'Dormir 8 horas (planificación nocturna)', category: 'health', done: false, xpReward: 10 },
  { id: 'd10', text: 'Practicar inglés (30 min)', category: 'languages', done: false, xpReward: 15 },
];

const DEFAULT_WEEKLY: ChecklistTask[] = [
  { id: 'w1', text: 'Participar en un Codeforces Round', category: 'technical', done: false, xpReward: 50 },
  { id: 'w2', text: 'Leer un paper de investigación', category: 'research', done: false, xpReward: 40 },
  { id: 'w3', text: 'Revisar syllabus y notas de UCSP', category: 'academic', done: false, xpReward: 20 },
  { id: 'w4', text: 'Sesión de inglés avanzado (TOEFL prep)', category: 'languages', done: false, xpReward: 30 },
  { id: 'w5', text: 'Actualizar portfolio / LinkedIn / GitHub', category: 'technical', done: false, xpReward: 25 },
  { id: 'w6', text: 'Planificar objetivos de la próxima semana', category: 'academic', done: false, xpReward: 20 },
  { id: 'w7', text: 'Revisar movimientos financieros semanales', category: 'finance', done: false, xpReward: 15 },
  { id: 'w8', text: 'Escribir reflexión semanal de progreso', category: 'research', done: false, xpReward: 20 },
];

interface ChecklistState {
  dailyTasks: ChecklistTask[];
  weeklyTasks: ChecklistTask[];
  lastResetDate: string;
  // Actions
  toggleTask: (id: string, type: 'daily' | 'weekly') => void;
  addTask: (task: Omit<ChecklistTask, 'id'>, type: 'daily' | 'weekly') => void;
  removeTask: (id: string, type: 'daily' | 'weekly') => void;
  resetDaily: () => void;
  getDailyProgress: () => number;
  getWeeklyProgress: () => number;
}

const savedDaily = storageService.get<ChecklistTask[]>('daily_tasks', DEFAULT_DAILY);
const savedWeekly = storageService.get<ChecklistTask[]>('weekly_tasks', DEFAULT_WEEKLY);
const lastReset = storageService.get<string>('last_reset', '');

// Auto-reset if new day
const todayKey = getCurrentDateKey();
let initialDaily = savedDaily;
if (lastReset !== todayKey) {
  initialDaily = DEFAULT_DAILY.map((t) => ({ ...t, done: false }));
  storageService.set('daily_tasks', initialDaily);
  storageService.set('last_reset', todayKey);
}

export const useChecklistStore = create<ChecklistState>((set, get) => ({
  dailyTasks: initialDaily,
  weeklyTasks: savedWeekly,
  lastResetDate: lastReset,

  toggleTask: (id, type) => {
    const key = type === 'daily' ? 'dailyTasks' : 'weeklyTasks';
    const updated = get()[key].map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    set({ [key]: updated } as Partial<ChecklistState>);
    storageService.set(type === 'daily' ? 'daily_tasks' : 'weekly_tasks', updated);
  },

  addTask: (task, type) => {
    const newTask: ChecklistTask = { ...task, id: `${type}_${Date.now()}` };
    const key = type === 'daily' ? 'dailyTasks' : 'weeklyTasks';
    const updated = [...get()[key], newTask];
    set({ [key]: updated } as Partial<ChecklistState>);
    storageService.set(type === 'daily' ? 'daily_tasks' : 'weekly_tasks', updated);
  },

  removeTask: (id, type) => {
    const key = type === 'daily' ? 'dailyTasks' : 'weeklyTasks';
    const updated = get()[key].filter((t) => t.id !== id);
    set({ [key]: updated } as Partial<ChecklistState>);
    storageService.set(type === 'daily' ? 'daily_tasks' : 'weekly_tasks', updated);
  },

  resetDaily: () => {
    const reset = DEFAULT_DAILY.map((t) => ({ ...t, done: false }));
    set({ dailyTasks: reset, lastResetDate: getCurrentDateKey() });
    storageService.set('daily_tasks', reset);
    storageService.set('last_reset', getCurrentDateKey());
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
