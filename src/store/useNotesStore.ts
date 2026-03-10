import { create } from 'zustand';
import { storageService } from '../services/storageService';
import { DEFAULT_FOLDERS } from '../utils/constants';

export interface Note {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface NotesState {
  notes: Note[];
  folders: string[];
  activeFolder: string | null;
  searchQuery: string;
  activeNoteId: string | null;
  // Actions
  createNote: (folder?: string) => Note;
  updateNote: (id: string, changes: Partial<Pick<Note, 'title' | 'content' | 'folder' | 'tags'>>) => void;
  deleteNote: (id: string) => void;
  setFolder: (folder: string | null) => void;
  setSearch: (query: string) => void;
  setActiveNote: (id: string | null) => void;
  addFolder: (name: string) => void;
  getFilteredNotes: () => Note[];
  getNoteById: (id: string) => Note | undefined;
}

const SAMPLE_NOTES: Note[] = [
  {
    id: 'note_sample_1',
    title: 'Plan de ataque: Codeforces 2000',
    folder: 'Competitive Programming',
    tags: ['algoritmos', 'codeforces', 'plan'],
    content: `# Roadmap Codeforces 1250 → 2000

## Etapa 1: 1250 → 1400
- [ ] DP básica (0/1 knapsack, LCS, LIS)
- [ ] BFS/DFS y variaciones
- [ ] Implementación rápida

## Etapa 2: 1400 → 1600
- [ ] Grafos (Dijkstra, Floyd, MST)
- [ ] DP con optimizaciones
- [ ] Matemáticas: primos, modular arithmetic

## Recursos
- USACO Guide
- CP-algorithms.com
- AtCoder Educational DP

\`\`\`cpp
// Ejemplo: DP clásica
int dp[MAXN];
dp[0] = 0;
for (int i = 1; i <= n; i++) {
    dp[i] = max(dp[i-1], dp[i-2] + val[i]);
}
\`\`\`
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note_sample_2',
    title: 'Introducción al Quantum Computing',
    folder: 'Investigación',
    tags: ['quantum', 'kaist', 'papers'],
    content: `# Quantum Computing — Conceptos Base

## Principios fundamentales
1. **Superposición**: Un qubit puede ser 0 y 1 simultáneamente
2. **Entrelazamiento**: Correlación cuántica entre qubits
3. **Interferencia**: Amplitud de probabilidades

## Compuertas cuánticas
- **Hadamard (H)**: Crea superposición uniforme
- **CNOT**: Entrelaza dos qubits
- **Toffoli**: Computación reversible

## Papers prioritarios
- Shor (1994): Factorización en tiempo polinomial
- Grover (1996): Búsqueda en O(√N)
- Nielsen & Chuang (2000): Textbook base

## Herramientas
- Qiskit (IBM): Python + simulador + hardware real
- Cirq (Google): Circuitos cuánticos
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const savedNotes = storageService.get<Note[]>('notes', SAMPLE_NOTES);
const savedFolders = storageService.get<string[]>('folders', DEFAULT_FOLDERS);

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: savedNotes,
  folders: savedFolders,
  activeFolder: null,
  searchQuery: '',
  activeNoteId: null,

  createNote: (folder) => {
    const newNote: Note = {
      id: `note_${Date.now()}`,
      title: 'Nueva nota',
      content: '# Nueva nota\n\nEmpieza a escribir aquí...',
      folder: folder ?? get().activeFolder ?? DEFAULT_FOLDERS[0],
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newNote, ...get().notes];
    set({ notes: updated, activeNoteId: newNote.id });
    storageService.set('notes', updated);
    return newNote;
  },

  updateNote: (id, changes) => {
    const updated = get().notes.map((n) =>
      n.id === id ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n
    );
    set({ notes: updated });
    storageService.set('notes', updated);
  },

  deleteNote: (id) => {
    const updated = get().notes.filter((n) => n.id !== id);
    const wasActive = get().activeNoteId === id;
    set({ notes: updated, activeNoteId: wasActive ? (updated[0]?.id ?? null) : get().activeNoteId });
    storageService.set('notes', updated);
  },

  setFolder: (folder) => set({ activeFolder: folder }),

  setSearch: (query) => set({ searchQuery: query }),

  setActiveNote: (id) => set({ activeNoteId: id }),

  addFolder: (name) => {
    if (get().folders.includes(name)) return;
    const updated = [...get().folders, name];
    set({ folders: updated });
    storageService.set('folders', updated);
  },

  getFilteredNotes: () => {
    const { notes, activeFolder, searchQuery } = get();
    return notes.filter((note) => {
      const matchesFolder = !activeFolder || note.folder === activeFolder;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q) ||
        note.tags.some((t) => t.toLowerCase().includes(q));
      return matchesFolder && matchesSearch;
    });
  },

  getNoteById: (id) => get().notes.find((n) => n.id === id),
}));
