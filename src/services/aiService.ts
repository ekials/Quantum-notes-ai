// src/services/aiService.ts
// Conexión con Claude API — el cerebro de Quantum Notes AI

import type { Note } from '../lib/supabase'

const CLAUDE_MODEL = 'claude-sonnet-4-20250514'

// ============================================================
// SYSTEM PROMPT — Personalidad de Quantum AI
// ============================================================

const buildSystemPrompt = (profile?: {
  name?: string
  gpa_current?: number
  cf_current?: number
  papers_current?: number
}) => `Eres "Quantum AI", el asistente de estudio personal integrado en Quantum Notes AI.

USUARIO:
- Nombre: ${profile?.name || 'Alice'}
- Universidad: UCSP (Arequipa, Perú) — Ingeniería de Software
- Meta: KAIST Master's in Computer Science / Quantum Computing (2029)
- GPA actual: ${profile?.gpa_current || 13.8}/20 → meta: 16.0
- CF Rating: ${profile?.cf_current || 1250} → meta: 2000
- Papers publicados: ${profile?.papers_current || 0} → meta: 3

PERSONALIDAD:
- Eres directo, exigente pero motivador. Como un compañero de KAIST que ya logró lo que el usuario persigue.
- Hablas en español por defecto. Cambias a inglés si el tema lo requiere (papers, código, algoritmos).
- NO dices "¡Claro!" ni "¡Excelente pregunta!" — respondes y punto.
- Máximo 250 palabras por respuesta salvo que pidan más detalle.
- Usas emojis con moderación, solo cuando añaden valor.

MODOS (se activan automáticamente según el mensaje):
- CHAT: Responde cualquier pregunta académica, CP, quantum, ML, idiomas.
- QUIZ (trigger: "quiz me" / "quizéame" / "pregúntame"): Genera 3-5 preguntas de opción múltiple. NO reveles la respuesta hasta que el usuario responda.
- EXPLAIN (trigger: "explícame como..." / "no entiendo"): Usa analogías simples y diagramas ASCII si aplica.
- STUDY PLAN (trigger: "tengo examen" / "tengo parcial" / "deadline en X días"): Crea plan de estudio priorizado día a día.
- MOTIVATE (trigger: "motívame" / "estoy desmotivado" / "quiero rendirme"): Recuerda el objetivo KAIST, el rechazo de Hungría y PRONABEC como combustible.
- SUMMARIZE (trigger: "resúmeme" / "resumen de"): Resume notas en bullet points accionables.

REGLAS:
1. Cuando respondas basado en las notas del usuario, cita la fuente: "[Nota: Título]"
2. Para código usa Python o C++ según el contexto.
3. Si el usuario está desmotivado, recuérdale el rechazo de Hungría y PRONABEC como combustible hacia KAIST.
4. En respuestas largas termina con una pregunta de follow-up relevante.
5. Si no sabes algo, dilo directamente — no inventes.`

// ============================================================
// LLAMADA PRINCIPAL A CLAUDE
// ============================================================

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export const callClaude = async (
  messages: Message[],
  notes: Note[] = [],
  profile?: { name?: string; gpa_current?: number; cf_current?: number; papers_current?: number }
): Promise<string> => {

  // Construir contexto de notas para RAG básico
  const notesContext = notes.length > 0
    ? `\n\n[NOTAS DEL USUARIO — usa esto como contexto]\n${
        notes.slice(0, 10).map(n =>
          `📝 "${n.title}" (${n.tags?.join(', ') || 'sin tags'})\n${n.content?.slice(0, 300)}${(n.content?.length || 0) > 300 ? '...' : ''}`
        ).join('\n\n---\n\n')
      }`
    : ''

  // Inyectar contexto en el último mensaje del usuario
  const messagesWithContext = messages.map((m, i) => ({
    role: m.role,
    content: i === messages.length - 1 && m.role === 'user' && notesContext
      ? `${m.content}${notesContext}`
      : m.content
  }))

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY || '',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      system: buildSystemPrompt(profile) ,
      messages: messagesWithContext
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || `Error ${response.status}`)
  }

  const data = await response.json()
  return data.content?.map((b: { type: string; text?: string }) => b.text || '').join('') || 'Sin respuesta.'
}

// ============================================================
// GENERAR TÍTULO AUTOMÁTICO PARA CONVERSACIÓN
// ============================================================

export const generateConversationTitle = async (firstMessage: string): Promise<string> => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY || '',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 20,
      system: 'Genera un título de máximo 5 palabras para esta conversación. Solo el título, sin comillas ni puntuación.',
      messages: [{ role: 'user', content: firstMessage }]
    })
  })

  if (!response.ok) return 'Nueva conversación'
  const data = await response.json()
  return data.content?.[0]?.text || 'Nueva conversación'
}

// ============================================================
// GENERAR RESUMEN DE NOTA PARA AI CONTEXT
// ============================================================

export const generateNoteSummary = async (title: string, content: string): Promise<string> => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY || '',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 100,
      system: 'Genera un resumen de máximo 2 oraciones de esta nota. Solo el resumen, sin introducción.',
      messages: [{ role: 'user', content: `Título: ${title}\n\nContenido: ${content}` }]
    })
  })

  if (!response.ok) return ''
  const data = await response.json()
  return data.content?.[0]?.text || ''
}

// ============================================================
// GENERAR QUIZ DESDE NOTAS
// ============================================================

export const generateQuiz = async (notes: Note[], topic?: string): Promise<string> => {
  const notesText = notes.slice(0, 5).map(n =>
    `"${n.title}": ${n.content?.slice(0, 500)}`
  ).join('\n\n')

  const prompt = topic
    ? `Genera 5 preguntas de opción múltiple sobre "${topic}" basadas en estas notas:\n\n${notesText}`
    : `Genera 5 preguntas de opción múltiple basadas en estas notas:\n\n${notesText}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY || '',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 800,
      system: 'Eres un generador de quizzes académicos. Crea preguntas claras con 4 opciones (a, b, c, d). Marca la correcta con ✓. Incluye una explicación breve de cada respuesta.',
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) throw new Error('Error generando quiz')
  const data = await response.json()
  return data.content?.[0]?.text || ''
}

//capa de compatiblidad para aipage.tsx
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const sendMessage = async (
  messages: ChatMessage[],
  notesContext?: string
): Promise<string> => {
  const contextSuffix = notesContext
    ? `\n\n[NOTAS DEL USUARIO]\n${notesContext}`
    : ''

  const messagesWithContext = messages.map((m, i) => ({
    role: m.role,
    content: i === messages.length - 1 && m.role === 'user' && contextSuffix
      ? `${m.content}${contextSuffix}`
      : m.content
  }))

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY || '',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `Eres "Quantum AI", el asistente de estudio personal de Alice. 
Estudiante de CS en UCSP (Arequipa, Perú), meta: KAIST Master's 2029.
GPA actual: owo → meta 16.0. CF Rating: 1250 → meta 2000.

PERSONALIDAD:
- Directo, exigente pero motivador. Como un compañero de KAIST.
- Español por defecto, inglés para código/papers.
- NO dices "¡Claro!" ni "¡Excelente pregunta!"
- Máximo 250 palabras salvo que pidan más detalle.

MODOS:
- QUIZ (trigger: "quiz me"): genera preguntas de opción múltiple, no reveles respuesta hasta que el usuario responda.
- EXPLAIN (trigger: "explícame como..."): usa analogías simples y ASCII si aplica.
- STUDY PLAN (trigger: "tengo examen en X"): plan día a día priorizado.
- MOTIVATE (trigger: "motívame"): recuerda KAIST, el rechazo de Hungría como combustible.`,
      messages: messagesWithContext
    })
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || `Error ${response.status}`)
  }

  const data = await response.json()
  return data.content?.map((b: { type: string; text?: string }) => b.text || '').join('') || 'Sin respuesta.'
}