// src/services/notesService.ts
// CRUD para folders y notes en Supabase

import { supabase, type Note, type Folder } from '../lib/supabase';

export const notesService = {
  // ── FOLDERS ──────────────────────────────────────────────

  async getFolders(userId: string): Promise<Folder[]> {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true });

    if (error) { console.error('Error cargando carpetas:', error); return []; }
    return data as Folder[];
  },

  async createFolder(userId: string, name: string, icon: string = '📁', color: string = '#7c6af5', position: number = 0): Promise<Folder | null> {
    const { data, error } = await supabase
      .from('folders')
      .insert({ user_id: userId, name, icon, color, position })
      .select()
      .single();

    if (error) { console.error('Error creando carpeta:', error); return null; }
    return data as Folder;
  },

  async renameFolder(id: string, name: string): Promise<void> {
    const { error } = await supabase
      .from('folders')
      .update({ name })
      .eq('id', id);

    if (error) console.error('Error renombrando carpeta:', error);
  },

  async deleteFolder(id: string): Promise<void> {
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id);

    if (error) console.error('Error eliminando carpeta:', error);
  },

  // ── NOTES ────────────────────────────────────────────────

  async getNotes(userId: string, folderId?: string): Promise<Note[]> {
    let query = supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    if (folderId) {
      query = query.eq('folder_id', folderId);
    }

    const { data, error } = await query;
    if (error) { console.error('Error cargando notas:', error); return []; }
    return data as Note[];
  },

  async createNote(userId: string, title: string, folderId?: string | null, content: string = ''): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .insert({
        user_id: userId,
        title,
        folder_id: folderId ?? null,
        content,
        tags: [],
      })
      .select()
      .single();

    if (error) { console.error('Error creando nota:', error); return null; }
    return data as Note;
  },

  async updateNote(id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'folder_id' | 'is_pinned' | 'ai_summary'>>): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .update(updates)
      .eq('id', id);

    if (error) console.error('Error actualizando nota:', error);
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) console.error('Error eliminando nota:', error);
  },
};
