// src/services/storageService.ts
// Todas las funciones para interactuar con Supabase
// Importar estas funciones en los stores y componentes

import { supabase } from '../lib/supabase'
import type { Note, Folder, ChecklistItem, Goal, FinanceEntry, TrackingEntry, UserProfile } from '../lib/supabase'

// ============================================================
// AUTH — Login y registro
// ============================================================

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ============================================================
// USER PROFILE — Perfil y metas TIER 1
// ============================================================

export const getProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('users_profile')
    .select('*')
    .eq('user_id', userId)
    .single()
  if (error) return null
  return data
}

export const createProfile = async (userId: string, name: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('users_profile')
    .insert({ user_id: userId, name })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('users_profile')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

// Actualizar XP y nivel
export const addXP = async (userId: string, xp: number) => {
  const profile = await getProfile(userId)
  if (!profile) return
  const newXP = profile.xp_total + xp
  const newLevel = Math.floor(newXP / 500) + 1 // cada 500 XP sube de nivel
  await updateProfile(userId, { xp_total: newXP, level: newLevel })
}

// ============================================================
// FOLDERS — Carpetas de notas
// ============================================================

export const getFolders = async (userId: string): Promise<Folder[]> => {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('position')
  if (error) throw error
  return data || []
}

export const createFolder = async (userId: string, name: string, icon = '📁', color = '#7c6af5'): Promise<Folder> => {
  const { data, error } = await supabase
    .from('folders')
    .insert({ user_id: userId, name, icon, color })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateFolder = async (folderId: string, updates: Partial<Folder>): Promise<Folder> => {
  const { data, error } = await supabase
    .from('folders')
    .update(updates)
    .eq('id', folderId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteFolder = async (folderId: string) => {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId)
  if (error) throw error
}

// ============================================================
// NOTES — Notas
// ============================================================

export const getNotes = async (userId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const getNotesByFolder = async (userId: string, folderId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('folder_id', folderId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const searchNotes = async (userId: string, query: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data || []
}

export const createNote = async (userId: string, note: Partial<Note>): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .insert({ ...note, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateNote = async (noteId: string, updates: Partial<Note>): Promise<Note> => {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', noteId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteNote = async (noteId: string) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
  if (error) throw error
}

export const archiveNote = async (noteId: string) => {
  return updateNote(noteId, { is_archived: true })
}

// ============================================================
// CHECKLIST — Tareas
// ============================================================

export const getChecklist = async (userId: string, type?: string): Promise<ChecklistItem[]> => {
  let query = supabase
    .from('checklist_items')
    .select('*')
    .eq('user_id', userId)
    .order('position')

  if (type) query = query.eq('type', type)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export const createChecklistItem = async (userId: string, item: Partial<ChecklistItem>): Promise<ChecklistItem> => {
  const { data, error } = await supabase
    .from('checklist_items')
    .insert({ ...item, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export const toggleChecklistItem = async (itemId: string, done: boolean, userId: string) => {
  const { error } = await supabase
    .from('checklist_items')
    .update({ done })
    .eq('id', itemId)
  if (error) throw error

  // Si se completó, registrar en historial y dar XP
  if (done) {
    await supabase.from('checklist_history').insert({
      user_id: userId,
      item_id: itemId,
      date: new Date().toISOString().split('T')[0]
    })
    await addXP(userId, 10)
  }
}

export const deleteChecklistItem = async (itemId: string) => {
  const { error } = await supabase
    .from('checklist_items')
    .delete()
    .eq('id', itemId)
  if (error) throw error
}

export const resetDailyChecklist = async (userId: string) => {
  await supabase.rpc('reset_checklist', { p_user_id: userId })
}

// ============================================================
// GOALS — Metas personalizadas
// ============================================================

export const getGoals = async (userId: string): Promise<Goal[]> => {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('position')
  if (error) throw error
  return data || []
}

export const createGoal = async (userId: string, goal: Partial<Goal>): Promise<Goal> => {
  const { data, error } = await supabase
    .from('goals')
    .insert({ ...goal, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateGoal = async (goalId: string, updates: Partial<Goal>): Promise<Goal> => {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteGoal = async (goalId: string) => {
  const { error } = await supabase
    .from('goals')
    .update({ is_active: false })
    .eq('id', goalId)
  if (error) throw error
}

// ============================================================
// FINANCE — Ingresos y gastos
// ============================================================

export const getFinanceEntries = async (userId: string, month?: string): Promise<FinanceEntry[]> => {
  let query = supabase
    .from('finance_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (month) {
    // month formato: '2026-03'
    query = query.gte('date', `${month}-01`).lte('date', `${month}-31`)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export const createFinanceEntry = async (userId: string, entry: Partial<FinanceEntry>): Promise<FinanceEntry> => {
  const { data, error } = await supabase
    .from('finance_entries')
    .insert({ ...entry, user_id: userId })
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteFinanceEntry = async (entryId: string) => {
  const { error } = await supabase
    .from('finance_entries')
    .delete()
    .eq('id', entryId)
  if (error) throw error
}

// ============================================================
// TRACKING — Historial de métricas para gráficas
// ============================================================

export const getTrackingHistory = async (userId: string, metric: string): Promise<TrackingEntry[]> => {
  const { data, error } = await supabase
    .from('tracking_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('metric', metric)
    .order('date', { ascending: true })
  if (error) throw error
  return data || []
}

export const addTrackingEntry = async (userId: string, metric: string, value: number, notes = ''): Promise<TrackingEntry> => {
  const { data, error } = await supabase
    .from('tracking_entries')
    .insert({
      user_id: userId,
      metric,
      value,
      notes,
      date: new Date().toISOString().split('T')[0]
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// POMODORO — Sesiones de estudio
// ============================================================

export const savePomodoroSession = async (userId: string, subject: string, durationMin = 25) => {
  const { error } = await supabase
    .from('pomodoro_sessions')
    .insert({
      user_id: userId,
      subject,
      duration_min: durationMin,
      completed: true,
      date: new Date().toISOString().split('T')[0]
    })
  if (error) throw error
  await addXP(userId, 15) // +15 XP por cada pomodoro completado
}

export const getPomodoroStats = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0]
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', weekAgo)
    .order('date', { ascending: false })

  if (error) throw error

  const todaySessions = (data || []).filter(s => s.date === today)
  const weekSessions = data || []

  return {
    todayCount: todaySessions.length,
    todayMinutes: todaySessions.reduce((acc, s) => acc + s.duration_min, 0),
    weekCount: weekSessions.length,
    weekMinutes: weekSessions.reduce((acc, s) => acc + s.duration_min, 0),
  }
}

// ============================================================
// QUOTES — Frases motivacionales
// ============================================================

export const getQuotes = async (userId: string) => {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
  if (error) throw error
  return data || []
}

export const getRandomQuote = async (userId: string) => {
  const quotes = await getQuotes(userId)
  if (quotes.length === 0) return null
  return quotes[Math.floor(Math.random() * quotes.length)]
}

export const createQuote = async (userId: string, text: string, source = 'Tu Plan TIER 1') => {
  const { data, error } = await supabase
    .from('quotes')
    .insert({ user_id: userId, text, source })
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================================
// STORAGE — Subir imágenes y PDFs
// ============================================================

export const uploadImage = async (userId: string, file: File): Promise<string> => {
  const ext = file.name.split('.').pop()
  const fileName = `${userId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('note-images')
    .upload(fileName, file)

  if (error) throw error

  const { data } = supabase.storage
    .from('note-images')
    .getPublicUrl(fileName)

  return data.publicUrl
}

export const uploadPDF = async (userId: string, file: File): Promise<string> => {
  const fileName = `${userId}/${Date.now()}_${file.name}`

  const { error } = await supabase.storage
    .from('note-pdfs')
    .upload(fileName, file)

  if (error) throw error
  return fileName // retorna el path para acceder después con signed URL
}

export const getPDFUrl = async (filePath: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('note-pdfs')
    .createSignedUrl(filePath, 3600) // válida por 1 hora

  if (error) throw error
  return data.signedUrl
}

// ============================================================
// AI CONVERSATIONS — Guardar historial de chats
// ============================================================

export const saveConversation = async (
  userId: string,
  title: string,
  messages: { role: string; content: string; timestamp: string }[]
) => {
  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({ user_id: userId, title, messages })
    .select()
    .single()
  if (error) throw error
  return data
}

export const getConversations = async (userId: string) => {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('id, title, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(20)
  if (error) throw error
  return data || []
}

export const updateConversation = async (
  convId: string,
  messages: { role: string; content: string; timestamp: string }[]
) => {
  const { error } = await supabase
    .from('ai_conversations')
    .update({ messages })
    .eq('id', convId)
  if (error) throw error
}

//capa local de compatibilidad owo
export const storageService = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch {
      return defaultValue
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      console.error('Error saving to localStorage:', key)
    }
  },
  remove: (key: string): void => {
    localStorage.removeItem(key)
  }
}