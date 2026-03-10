// User Profile
export const USER_PROFILE = {
  name: 'Estudiante UCSP',
  university: 'Universidad Católica San Pablo',
  location: 'Arequipa, Perú',
  targetSchool: 'KAIST',
  targetDegree: 'Master en Computer Science / Quantum Computing',
  targetYear: 2029,
  graduationDate: new Date('2026-12-15'), // UCSP graduation estimate
};

// Tier 1 Goals
export const TIER1_GOALS = {
  gpa: { current: 13.8, target: 16.0, label: 'GPA', unit: '/20' },
  codeforces: { current: 1250, target: 2000, label: 'Codeforces', unit: ' rating' },
  papers: { current: 0, target: 3, label: 'Papers', unit: ' pubs' },
  toefl: { current: 78, target: 110, label: 'TOEFL', unit: '/120' },
  topik: { current: 1, target: 6, label: 'TOPIK', unit: '/6' }, // A2≈1, C1≈6
  github: { current: 0, target: 500, label: 'GitHub Commits', unit: '' },
};

// Task Categories
export const TASK_CATEGORIES = [
  'morning',
  'academic',
  'languages',
  'technical',
  'research',
  'finance',
  'health',
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  morning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  academic: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
  languages: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  technical: 'bg-accent-500/20 text-accent-300 border-accent-500/30',
  research: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  finance: 'bg-green-500/20 text-green-300 border-green-500/30',
  health: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  morning: 'Mañana',
  academic: 'Académico',
  languages: 'Idiomas',
  technical: 'Técnico',
  research: 'Investigación',
  finance: 'Finanzas',
  health: 'Salud',
};

// Note Folders
export const DEFAULT_FOLDERS = [
  'UCSP Sem 5',
  'Libros',
  'Competitive Programming',
  'Investigación',
  'Idiomas',
  'Negocios',
  'Personal',
];

// XP System
export const XP_PER_TASK = 15;
export const XP_PER_LEVEL = 500;
export const XP_STUDY_HOUR = 50;

// Motivation Quotes
export const MOTIVATION_QUOTES = [
  { text: 'El camino a KAIST se construye con hábitos diarios, no con esfuerzos esporádicos.', author: 'Quantum AI' },
  { text: 'Cada algoritmo que dominas es un paso más cerca de Seoul.', author: 'Quantum AI' },
  { text: 'La excelencia académica no es un evento, es un sistema.', author: 'James Clear' },
  { text: 'La disciplina es elegir entre lo que quieres ahora y lo que quieres más.', author: 'Abraham Lincoln' },
  { text: 'El quantum computing del futuro lo construyen las mentes que estudian hoy.', author: 'Quantum AI' },
  { text: 'GPA 16.0 no es un sueño, es el resultado de decisiones correctas repetidas.', author: 'Quantum AI' },
  { text: '먹고 자야 코딩이 된다 — Come, duerme, programa.', author: 'Sabiduría coreana' },
  { text: 'Tu Codeforces rating refleja exactamente cuánto te esforzaste hoy.', author: 'Quantum AI' },
  { text: 'The best time to start was yesterday. The second best time is now.', author: 'Proverbio' },
  { text: 'Investigar no es solo leer papers, es cuestionar el mundo con rigor.', author: 'Quantum AI' },
];

// Navigation items
export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', iconName: 'LayoutDashboard' },
  { path: '/checklist', label: 'Checklist', iconName: 'CheckSquare' },
  { path: '/notes', label: 'Notas', iconName: 'FileText' },
  { path: '/ai', label: 'Quantum AI', iconName: 'Bot' },
  { path: '/tracking', label: 'Progreso', iconName: 'TrendingUp' },
  { path: '/gamification', label: 'Logros', iconName: 'Trophy' },
] as const;

// AI System Prompt
export const AI_SYSTEM_PROMPT = `Eres "Quantum AI", un asistente académico exigente pero motivador para un estudiante de Ingeniería de Software en UCSP, Arequipa, Perú, con el objetivo de obtener un master en KAIST (Computer Science / Quantum Computing) en 2029.

Hablas en español.

Metas actuales del usuario:
- GPA: 13.8 → 16.0 (escala /20)
- Codeforces: 1250 → 2000
- TOEFL: 78 → 110  
- TOPIK: A2 → C1
- Papers publicados: 0 → 3

Ayudas con:
- Algoritmos y estructuras de datos (CP, leetcode, codeforces)
- Computer Science teórico y aplicado
- Quantum Computing (introducción, papers, conceptos)
- Planes de estudio personalizados
- Quizzes y ejercicios de práctica
- Motivación y gestión del tiempo
- Revisión de código
- Preparación para exámenes

Respuestas:
- Claras, directas y estructuradas
- Máximo 250 palabras por respuesta
- Usa emojis ocasionalmente para motivar
- Cuando sea relevante, menciona recursos específicos (libros, cursos, papers)
- Si el usuario comparte notas, úsalas como contexto adicional`;
