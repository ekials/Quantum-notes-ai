// src/services/financeService.ts
// CRUD para finance_entries y finance_goals en Supabase

import { supabase, type FinanceEntry } from '../lib/supabase';

export type FinanceGoal = {
  id: string;
  user_id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string | null;
  color: string;
};

export const financeService = {
  // ── ENTRIES ──────────────────────────────────────────────

  async getEntries(userId: string, limit = 100): Promise<FinanceEntry[]> {
    const { data, error } = await supabase
      .from('finance_entries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    if (error) { console.error(error); return []; }
    return data as FinanceEntry[];
  },

  async addEntry(userId: string, entry: Omit<FinanceEntry, 'id' | 'user_id' | 'created_at'>): Promise<FinanceEntry | null> {
    const { data, error } = await supabase
      .from('finance_entries')
      .insert({ ...entry, user_id: userId })
      .select()
      .single();
    if (error) { console.error(error); return null; }
    return data as FinanceEntry;
  },

  async deleteEntry(id: string): Promise<void> {
    await supabase.from('finance_entries').delete().eq('id', id);
  },

  // ── GOALS ────────────────────────────────────────────────

  async getGoals(userId: string): Promise<FinanceGoal[]> {
    const { data, error } = await supabase
      .from('finance_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) { console.error(error); return []; }
    return data as FinanceGoal[];
  },

  async addGoal(userId: string, goal: Omit<FinanceGoal, 'id' | 'user_id'>): Promise<FinanceGoal | null> {
    const { data, error } = await supabase
      .from('finance_goals')
      .insert({ ...goal, user_id: userId })
      .select()
      .single();
    if (error) { console.error(error); return null; }
    return data as FinanceGoal;
  },

  async updateGoalSaved(id: string, saved: number): Promise<void> {
    await supabase.from('finance_goals').update({ saved }).eq('id', id);
  },

  async deleteGoal(id: string): Promise<void> {
    await supabase.from('finance_goals').delete().eq('id', id);
  },

  // ── STATS HELPERS ────────────────────────────────────────

  calcStats(entries: FinanceEntry[]) {
    const now = new Date();
    const thisMonth = entries.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const ingresos = thisMonth.filter(e => e.type === 'ingreso').reduce((a, e) => a + e.amount, 0);
    const gastos = thisMonth.filter(e => e.type === 'gasto').reduce((a, e) => a + e.amount, 0);

    // Agrupar por mes para el chart (últimos 6 meses)
    const monthlyMap: Record<string, { ingresos: number; gastos: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
      monthlyMap[key] = { ingresos: 0, gastos: 0 };
    }
    entries.forEach(e => {
      const d = new Date(e.date);
      const key = d.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
      if (monthlyMap[key]) {
        if (e.type === 'ingreso') monthlyMap[key].ingresos += e.amount;
        else monthlyMap[key].gastos += e.amount;
      }
    });

    // Categorías del mes
    const catMap: Record<string, number> = {};
    thisMonth.filter(e => e.type === 'gasto').forEach(e => {
      catMap[e.category] = (catMap[e.category] ?? 0) + e.amount;
    });

    return {
      ingresos,
      gastos,
      balance: ingresos - gastos,
      monthly: Object.entries(monthlyMap).map(([mes, v]) => ({ mes, ...v })),
      categories: Object.entries(catMap).map(([cat, amount]) => ({ cat, amount })),
    };
  },
};
