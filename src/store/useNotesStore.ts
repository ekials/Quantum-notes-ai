// src/store/useNotesStore.ts
// Conectado a Supabase — folders y notes se persisten en PostgreSQL

import { create } from 'zustand';
import { notesService } from '../services/notesService';
import { type Note as SupabaseNote, type Folder as SupabaseFolder } from '../lib/supabase';

export interface Note {
  id: string;
  title: string;
  content: string;
  folder: string | null; // folder_id de Supabase
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned?: boolean;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null; // null = carpeta raíz
  icon?: string;
  color?: string;
}

// Mapeo Supabase → tipos locales
function toLocalNote(n: SupabaseNote): Note {
  return {
    id: n.id,
    title: n.title,
    content: n.content,
    folder: n.folder_id,
    tags: n.tags ?? [],
    createdAt: n.created_at,
    updatedAt: n.updated_at,
    isPinned: n.is_pinned,
  };
}

function toLocalFolder(f: SupabaseFolder): Folder {
  return {
    id: f.id,
    name: f.name,
    parentId: null, // Supabase folders no tienen parentId en el schema actual
    icon: f.icon,
    color: f.color,
  };
}

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

interface NotesState {
  userId: string | null;
  notes: Note[];
  folders: Folder[];
  activeFolder: string | null;
  searchQuery: string;
  activeNoteId: string | null;
  expandedFolders: string[];
  isLoading: boolean;

  // Data loading
  loadFromSupabase: (userId: string) => Promise<void>;

  // Actions — notas
  createNote: (folderId?: string) => Promise<Note | null>;
  updateNote: (id: string, changes: Partial<Pick<Note, 'title' | 'content' | 'folder' | 'tags' | 'isPinned'>>) => void;
  deleteNote: (id: string) => void;
  setSearch: (query: string) => void;
  setActiveNote: (id: string | null) => void;
  getFilteredNotes: () => Note[];
  getNoteById: (id: string) => Note | undefined;

  // Actions — carpetas
  setFolder: (folderId: string | null) => void;
  addFolder: (name: string, parentId?: string | null, icon?: string) => Promise<Folder | null>;
  renameFolder: (id: string, newName: string) => void;
  deleteFolder: (id: string) => void;
  toggleExpand: (id: string) => void;

  // Utils
  getFolderPath: (folderId: string) => string;
  getChildFolders: (parentId: string | null) => Folder[];
  getFolderById: (id: string) => Folder | undefined;
  countNotesInFolder: (folderId: string, includeChildren?: boolean) => number;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  userId: null,
  notes: [],
  folders: [],
  activeFolder: null,
  searchQuery: '',
  activeNoteId: null,
  expandedFolders: [],
  isLoading: false,

  // ── CARGA DESDE SUPABASE ──────────────────────────────────

  loadFromSupabase: async (userId: string) => {
    set({ isLoading: true, userId });
    try {
      const [rawFolders, rawNotes] = await Promise.all([
        notesService.getFolders(userId),
        notesService.getNotes(userId),
      ]);
      const folders = rawFolders.map(toLocalFolder);
      const notes = rawNotes.map(toLocalNote);
      set({ folders, notes });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── NOTAS ──────────────────────────────────────────────

  createNote: async (folderId) => {
    const { userId, activeFolder, folders } = get();
    if (!userId) return null;

    const targetFolder = folderId ?? activeFolder ?? folders[0]?.id ?? null;
    const created = await notesService.createNote(
      userId,
      'Nueva nota',
      targetFolder ?? null,
      '# Nueva nota\n\nEmpieza a escribir aquí...'
    );
    if (!created) return null;

    const newNote = toLocalNote(created);
    set(s => ({ notes: [newNote, ...s.notes], activeNoteId: newNote.id }));
    return newNote;
  },

  updateNote: (id, changes) => {
    const updated = get().notes.map((n) =>
      n.id === id ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n
    );
    set({ notes: updated });

    // Mapear al formato Supabase
    const supabaseChanges: Parameters<typeof notesService.updateNote>[1] = {};
    if ('title' in changes) supabaseChanges.title = changes.title;
    if ('content' in changes) supabaseChanges.content = changes.content;
    if ('tags' in changes) supabaseChanges.tags = changes.tags;
    if ('folder' in changes) supabaseChanges.folder_id = changes.folder ?? null;
    if ('isPinned' in changes) supabaseChanges.is_pinned = changes.isPinned;

    notesService.updateNote(id, supabaseChanges);
  },

  deleteNote: (id) => {
    const updated = get().notes.filter((n) => n.id !== id);
    const wasActive = get().activeNoteId === id;
    set({ notes: updated, activeNoteId: wasActive ? (updated[0]?.id ?? null) : get().activeNoteId });
    notesService.deleteNote(id);
  },

  setSearch: (query) => set({ searchQuery: query }),
  setActiveNote: (id) => set({ activeNoteId: id }),

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

  // ── CARPETAS ───────────────────────────────────────────

  setFolder: (folderId) => set({ activeFolder: folderId }),

  addFolder: async (name, _parentId = null, icon) => {
    const { userId, folders } = get();
    if (!userId) return null;

    const resolvedIcon = icon ?? getFolderIcon(name);
    const created = await notesService.createFolder(
      userId,
      name.trim(),
      resolvedIcon,
      '#7c6af5',
      folders.length
    );
    if (!created) return null;

    const newFolder = toLocalFolder(created);
    set(s => ({ folders: [...s.folders, newFolder] }));
    return newFolder;
  },

  renameFolder: (id, newName) => {
    const updated = get().folders.map(f =>
      f.id === id ? { ...f, name: newName.trim() } : f
    );
    set({ folders: updated });
    notesService.renameFolder(id, newName.trim());
  },

  deleteFolder: (id) => {
    const updatedFolders = get().folders.filter(f => f.id !== id);
    const firstFolder = updatedFolders[0]?.id ?? null;
    const updatedNotes = get().notes.map(n =>
      n.folder === id ? { ...n, folder: firstFolder } : n
    );
    set({
      folders: updatedFolders,
      notes: updatedNotes,
      activeFolder: get().activeFolder === id ? null : get().activeFolder,
    });
    notesService.deleteFolder(id);
  },

  toggleExpand: (id) => {
    const expanded = get().expandedFolders;
    const updated = expanded.includes(id)
      ? expanded.filter(e => e !== id)
      : [...expanded, id];
    set({ expandedFolders: updated });
  },

  // ── UTILS ──────────────────────────────────────────────

  getFolderPath: (folderId) => {
    const { folders } = get();
    const folder = folders.find(f => f.id === folderId);
    return folder?.name ?? folderId;
  },

  getChildFolders: (parentId) => {
    return get().folders.filter(f => f.parentId === parentId);
  },

  getFolderById: (id) => {
    return get().folders.find(f => f.id === id);
  },

  countNotesInFolder: (folderId, _includeChildren = true) => {
    return get().notes.filter(n => n.folder === folderId).length;
  },
}));