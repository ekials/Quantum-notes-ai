// src/services/checklistService.ts
// CRUD para checklist_items + auto-reset via RPC de Supabase

import { supabase, type ChecklistItem } from '../lib/supabase';

export const checklistService = {
  async getItems(userId: string): Promise<ChecklistItem[]> {
    const { data, error } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('user_id', userId)
      .order('type', { ascending: true })
      .order('position', { ascending: true });

    if (error) { console.error('Error cargando checklist:', error); return []; }
    return data as ChecklistItem[];
  },

  async createItem(userId: string, item: Omit<ChecklistItem, 'id' | 'user_id' | 'created_at' | 'last_reset'>): Promise<ChecklistItem | null> {
    const { data, error } = await supabase
      .from('checklist_items')
      .insert({
        user_id: userId,
        ...item,
        done: false,
        last_reset: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) { console.error('Error creando item:', error); return null; }
    return data as ChecklistItem;
  },

  async toggleItem(userId: string, id: string, done: boolean): Promise<void> {
    const { error } = await supabase
      .from('checklist_items')
      .update({ done })
      .eq('id', id);

    if (error) { console.error('Error toggleando item:', error); return; }

    // Registrar en el historial si se completó
    if (done) {
      await supabase.from('checklist_history').insert({
        user_id: userId,
        item_id: id,
        date: new Date().toISOString().split('T')[0],
      });
    }
  },

  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('checklist_items')
      .delete()
      .eq('id', id);

    if (error) console.error('Error eliminando item:', error);
  },

  // Llama la función SQL que hace auto-reset de daily/weekly/monthly
  async resetItems(userId: string): Promise<void> {
    const { error } = await supabase.rpc('reset_checklist', { p_user_id: userId });
    if (error) console.error('Error reseteando checklist:', error);
  },
};
