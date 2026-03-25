// src/services/profileService.ts
// CRUD para users_profile + inicialización de nuevos usuarios

import { supabase, type UserProfile } from '../lib/supabase';

// Checklist items por defecto — los mismos del store actual
const DEFAULT_CHECKLIST_ITEMS = [
  // Daily
  { text: 'Meditación / respiración (5 min)', category: 'mañana', type: 'daily', xp_reward: 10, position: 0 },
  { text: 'Ejercicio o gimnasio (30 min)', category: 'salud', type: 'daily', xp_reward: 20, position: 1 },
  { text: 'Leer 20 páginas de un libro técnico', category: 'académico', type: 'daily', xp_reward: 15, position: 2 },
  { text: 'Resolver 2 problemas en Codeforces', category: 'técnico', type: 'daily', xp_reward: 25, position: 3 },
  { text: 'Estudiar coreano (30 min Duolingo/TOPIK)', category: 'idiomas', type: 'daily', xp_reward: 15, position: 4 },
  { text: 'Repasar notas del día (15 min)', category: 'académico', type: 'daily', xp_reward: 10, position: 5 },
  { text: 'Commit en GitHub (al menos 1)', category: 'técnico', type: 'daily', xp_reward: 15, position: 6 },
  { text: 'Revisar finanzas / gastos del día', category: 'finanzas', type: 'daily', xp_reward: 5, position: 7 },
  { text: 'Dormir 8 horas (planificación nocturna)', category: 'salud', type: 'daily', xp_reward: 10, position: 8 },
  { text: 'Practicar inglés (30 min)', category: 'idiomas', type: 'daily', xp_reward: 15, position: 9 },
  // Weekly
  { text: 'Participar en un Codeforces Round', category: 'técnico', type: 'weekly', xp_reward: 50, position: 0 },
  { text: 'Leer un paper de investigación', category: 'research', type: 'weekly', xp_reward: 40, position: 1 },
  { text: 'Revisar syllabus y notas de UCSP', category: 'académico', type: 'weekly', xp_reward: 20, position: 2 },
  { text: 'Sesión de inglés avanzado (TOEFL prep)', category: 'idiomas', type: 'weekly', xp_reward: 30, position: 3 },
  { text: 'Actualizar portfolio / LinkedIn / GitHub', category: 'técnico', type: 'weekly', xp_reward: 25, position: 4 },
  { text: 'Planificar objetivos de la próxima semana', category: 'académico', type: 'weekly', xp_reward: 20, position: 5 },
  { text: 'Revisar movimientos financieros semanales', category: 'finanzas', type: 'weekly', xp_reward: 15, position: 6 },
  { text: 'Escribir reflexión semanal de progreso', category: 'research', type: 'weekly', xp_reward: 20, position: 7 },
];

const DEFAULT_FOLDERS = [
  { name: 'UCSP Sem 5', icon: '🏫', color: '#7c6af5', position: 0 },
  { name: 'Libros Técnicos', icon: '📚', color: '#7c6af5', position: 1 },
  { name: 'Competitive Programming', icon: '💻', color: '#7c6af5', position: 2 },
  { name: 'Investigación / Research', icon: '🔬', color: '#7c6af5', position: 3 },
  { name: 'Idiomas', icon: '🌍', color: '#7c6af5', position: 4 },
  { name: 'Personal', icon: '💭', color: '#7c6af5', position: 5 },
];

const DEFAULT_QUOTES = [
  { text: 'Hungría te rechazó. PRONABEC no te nominó. Ese dolor es COMBUSTIBLE.', source: 'Tu Plan TIER 1' },
  { text: 'En 987 días estarás en KAIST. Cada problema de CF es un paso.', source: 'Tu Plan TIER 1' },
  { text: 'Los que llegan a las top universities no son los más inteligentes. Son los más consistentes.', source: 'Tu Plan TIER 1' },
  { text: 'El streak no se rompe. Ni hoy, ni mañana.', source: 'Quantum Notes AI' },
];

export const profileService = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      console.error('Error cargando perfil:', error);
      return null;
    }
    return data as UserProfile;
  },

  async createProfile(userId: string, name: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users_profile')
      .insert({ user_id: userId, name })
      .select()
      .single();

    if (error) {
      console.error('Error creando perfil:', error);
      return null;
    }
    return data as UserProfile;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
    const { error } = await supabase
      .from('users_profile')
      .update(updates)
      .eq('user_id', userId);

    if (error) console.error('Error actualizando perfil:', error);
  },

  // Inicializar todos los datos por defecto para un nuevo usuario
  async initializeNewUser(userId: string, name: string): Promise<void> {
    // 1. Crear perfil
    await profileService.createProfile(userId, name);

    // 2. Crear carpetas por defecto
    const foldersToInsert = DEFAULT_FOLDERS.map(f => ({ ...f, user_id: userId }));
    await supabase.from('folders').insert(foldersToInsert);

    // 3. Crear checklist items por defecto
    const itemsToInsert = DEFAULT_CHECKLIST_ITEMS.map(item => ({
      ...item,
      user_id: userId,
      done: false,
      last_reset: new Date().toISOString().split('T')[0],
    }));
    await supabase.from('checklist_items').insert(itemsToInsert);

    // 4. Insertar frases motivacionales
    const quotesToInsert = DEFAULT_QUOTES.map(q => ({ ...q, user_id: userId }));
    await supabase.from('quotes').insert(quotesToInsert);
  },
};
