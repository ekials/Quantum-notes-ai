// src/lib/supabase.ts
// Conexión central a Supabase — importar esto en todos los servicios

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan las variables de entorno de Supabase en el .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipos de las tablas — coinciden exactamente con el schema SQL
export type UserProfile = {
  id: string
  user_id: string
  name: string
  university: string
  goal: string
  grad_date: string
  gpa_current: number
  gpa_target: number
  cf_current: number
  cf_target: number
  papers_current: number
  papers_target: number
  toefl_current: number
  toefl_target: number
  topik_current: number
  topik_target: number
  xp_total: number
  level: number
  streak_days: number
  last_active: string
}

export type Folder = {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  position: number
  created_at: string
}

export type Note = {
  id: string
  user_id: string
  folder_id: string | null
  title: string
  content: string
  tags: string[]
  is_pinned: boolean
  is_archived: boolean
  ai_summary: string
  created_at: string
  updated_at: string
}

export type ChecklistItem = {
  id: string
  user_id: string
  text: string
  done: boolean
  category: string
  type: 'daily' | 'weekly' | 'monthly' | 'semestral'
  position: number
  xp_reward: number
  last_reset: string
  created_at: string
}

export type Goal = {
  id: string
  user_id: string
  label: string
  description: string
  current_value: number
  target_value: number
  unit: string
  color: string
  icon: string
  category: string
  deadline: string | null
  is_active: boolean
  position: number
}

export type Project = {
  id: string
  user_id: string
  name: string
  description: string
  tech_stack: string[]
  github_url: string
  status: 'planning' | 'in_progress' | 'completed' | 'paused'
  progress_pct: number
  deadline: string | null
  is_portfolio: boolean
  github_commits: number
  github_stars: number
  last_commit: string | null
}

export type FinanceEntry = {
  id: string
  user_id: string
  type: 'ingreso' | 'gasto'
  amount: number
  description: string
  category: string
  date: string
  created_at: string
}

export type TrackingEntry = {
  id: string
  user_id: string
  metric: string
  value: number
  notes: string
  date: string
}

export type AIConversation = {
  id: string
  user_id: string
  title: string
  messages: { role: string; content: string; timestamp: string }[]
  model_used: string
  created_at: string
  updated_at: string
}

export type Quote = {
  id: string
  user_id: string
  text: string
  source: string
  is_active: boolean
}