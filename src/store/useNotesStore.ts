// src/store/useNotesStore.ts
// Actualizado con soporte de carpetas anidadas

import { create } from 'zustand';
import { storageService } from '../services/storageService';
import { DEFAULT_FOLDERS } from '../utils/constants';

export interface Note {
  id: string;
  title: string;
  content: string;
  folder: string; // path completo: "UCSP Sem 5/ADA" o "UCSP Sem 5"
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Carpeta con soporte de subcarpetas
export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // null = carpeta raíz
  icon?: string;
  color?: string;
}

interface NotesState {
  notes: Note[];
  folders: Folder[];
  activeFolder: string | null; // folder id
  searchQuery: string;
  activeNoteId: string | null;
  expandedFolders: string[]; // ids de carpetas abiertas en el panel

  // Actions — notas
  createNote: (folderId?: string) => Note;
  updateNote: (id: string, changes: Partial<Pick<Note, 'title' | 'content' | 'folder' | 'tags'>>) => void;
  deleteNote: (id: string) => void;
  setSearch: (query: string) => void;
  setActiveNote: (id: string | null) => void;
  getFilteredNotes: () => Note[];
  getNoteById: (id: string) => Note | undefined;

  // Actions — carpetas
  setFolder: (folderId: string | null) => void;
  addFolder: (name: string, parentId?: string | null, icon?: string) => Folder;
  renameFolder: (id: string, newName: string) => void;
  deleteFolder: (id: string) => void;
  toggleExpand: (id: string) => void;

  // Utils
  getFolderPath: (folderId: string) => string; // "UCSP Sem 5 / ADA"
  getChildFolders: (parentId: string | null) => Folder[];
  getFolderById: (id: string) => Folder | undefined;
  countNotesInFolder: (folderId: string, includeChildren?: boolean) => number;
}

// Convertir DEFAULT_FOLDERS (strings) a estructura Folder
const buildDefaultFolders = (): Folder[] => {
  return DEFAULT_FOLDERS.map((name, i) => ({
    id: `folder_default_${i}`,
    name,
    parentId: null,
    icon: getFolderIcon(name),
    color: '#7c6af5',
  }));
};

function getFolderIcon(name: string): string {
  if (name.includes('UCSP') || name.includes('Sem')) return '🏫';
  if (name.includes('Libro')) return '📚';
  if (name.includes('Competitive') || name.includes('CP')) return '💻';
  if (name.includes('Investigación') || name.includes('Research')) return '🔬';
  if (name.includes('Idioma')) return '🌍';
  if (name.includes('Negocio')) return '💼';
  if (name.includes('Personal')) return '💭';
  return '📁';
}

const SAMPLE_NOTES: Note[] = [
  {
    id: 'note_sample_1',
    title: 'Plan de ataque: Codeforces 2000',
    folder: 'folder_default_2', // Competitive Programming
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

\`\`\`cpp
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
    folder: 'folder_default_3', // Investigación
    tags: ['quantum', 'kaist', 'papers'],
    content: `# Quantum Computing — Conceptos Base

## Principios fundamentales
1. **Superposición**: Un qubit puede ser 0 y 1 simultáneamente
2. **Entrelazamiento**: Correlación cuántica entre qubits
3. **Interferencia**: Amplitud de probabilidades

## Papers prioritarios
- Grover (1996): Búsqueda en O(√N)
- Nielsen & Chuang (2000): Textbook base
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const savedNotes = storageService.get<Note[]>('notes_v2', SAMPLE_NOTES);
const savedFolders = storageService.get<Folder[]>('folders_v2', buildDefaultFolders());
const savedExpanded = storageService.get<string[]>('expanded_folders', []);

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: savedNotes,
  folders: savedFolders,
  activeFolder: null,
  searchQuery: '',
  activeNoteId: null,
  expandedFolders: savedExpanded,

  // ── NOTAS ──────────────────────────────────────────────

  createNote: (folderId) => {
    const targetFolder = folderId ?? get().activeFolder ?? savedFolders[0]?.id ?? '';
    const newNote: Note = {
      id: `note_${Date.now()}`,
      title: 'Nueva nota',
      content: '# Nueva nota\n\nEmpieza a escribir aquí...',
      folder: targetFolder,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newNote, ...get().notes];
    set({ notes: updated, activeNoteId: newNote.id });
    storageService.set('notes_v2', updated);
    return newNote;
  },

  updateNote: (id, changes) => {
    const updated = get().notes.map((n) =>
      n.id === id ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n
    );
    set({ notes: updated });
    storageService.set('notes_v2', updated);
  },

  deleteNote: (id) => {
    const updated = get().notes.filter((n) => n.id !== id);
    const wasActive = get().activeNoteId === id;
    set({ notes: updated, activeNoteId: wasActive ? (updated[0]?.id ?? null) : get().activeNoteId });
    storageService.set('notes_v2', updated);
  },

  setSearch: (query) => set({ searchQuery: query }),
  setActiveNote: (id) => set({ activeNoteId: id }),

  getFilteredNotes: () => {
    const { notes, activeFolder, searchQuery, folders } = get();

    // Si hay carpeta activa, incluir también notas de subcarpetas
    const getDescendantIds = (folderId: string): string[] => {
      const children = folders.filter(f => f.parentId === folderId).map(f => f.id);
      return [folderId, ...children.flatMap(id => getDescendantIds(id))];
    };

    return notes.filter((note) => {
      const matchesFolder = !activeFolder ||
        getDescendantIds(activeFolder).includes(note.folder);

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

  // ── CARPETAS ───────────────────────────────────────────

  setFolder: (folderId) => set({ activeFolder: folderId }),

  addFolder: (name, parentId = null, icon) => {
    const newFolder: Folder = {
      id: `folder_${Date.now()}`,
      name: name.trim(),
      parentId,
      icon: icon ?? (parentId ? '📄' : getFolderIcon(name)),
      color: '#7c6af5',
    };
    const updated = [...get().folders, newFolder];
    set({ folders: updated });
    storageService.set('folders_v2', updated);

    // Auto-expandir la carpeta padre
    if (parentId) {
      const expanded = [...get().expandedFolders];
      if (!expanded.includes(parentId)) {
        set({ expandedFolders: [...expanded, parentId] });
        storageService.set('expanded_folders', [...expanded, parentId]);
      }
    }
    return newFolder;
  },

  renameFolder: (id, newName) => {
    const updated = get().folders.map(f =>
      f.id === id ? { ...f, name: newName.trim() } : f
    );
    set({ folders: updated });
    storageService.set('folders_v2', updated);
  },

  deleteFolder: (id) => {
    // Obtener todos los descendientes para borrarlos también
    const getDescendantIds = (folderId: string): string[] => {
      const children = get().folders.filter(f => f.parentId === folderId).map(f => f.id);
      return [folderId, ...children.flatMap(childId => getDescendantIds(childId))];
    };

    const toDelete = getDescendantIds(id);
    const updatedFolders = get().folders.filter(f => !toDelete.includes(f.id));

    // Mover notas huérfanas a la raíz (primera carpeta)
    const firstFolder = updatedFolders[0]?.id ?? '';
    const updatedNotes = get().notes.map(n =>
      toDelete.includes(n.folder) ? { ...n, folder: firstFolder } : n
    );

    set({
      folders: updatedFolders,
      notes: updatedNotes,
      activeFolder: get().activeFolder && toDelete.includes(get().activeFolder!) ? null : get().activeFolder
    });
    storageService.set('folders_v2', updatedFolders);
    storageService.set('notes_v2', updatedNotes);
  },

  toggleExpand: (id) => {
    const expanded = get().expandedFolders;
    const updated = expanded.includes(id)
      ? expanded.filter(e => e !== id)
      : [...expanded, id];
    set({ expandedFolders: updated });
    storageService.set('expanded_folders', updated);
  },

  // ── UTILS ──────────────────────────────────────────────

  getFolderPath: (folderId) => {
    const { folders } = get();
    const parts: string[] = [];
    let current = folders.find(f => f.id === folderId);
    while (current) {
      parts.unshift(current.name);
      current = current.parentId ? folders.find(f => f.id === current!.parentId) : undefined;
    }
    return parts.join(' / ');
  },

  getChildFolders: (parentId) => {
    return get().folders.filter(f => f.parentId === parentId);
  },

  getFolderById: (id) => {
    return get().folders.find(f => f.id === id);
  },

  countNotesInFolder: (folderId, includeChildren = true) => {
    const { notes, folders } = get();
    if (!includeChildren) {
      return notes.filter(n => n.folder === folderId).length;
    }
    const getDescendantIds = (id: string): string[] => {
      const children = folders.filter(f => f.parentId === id).map(f => f.id);
      return [id, ...children.flatMap(childId => getDescendantIds(childId))];
    };
    const allIds = getDescendantIds(folderId);
    return notes.filter(n => allIds.includes(n.folder)).length;
  },
}));