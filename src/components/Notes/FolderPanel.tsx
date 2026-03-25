// src/components/Notes/FolderPanel.tsx
// Panel de carpetas con soporte de subcarpetas anidadas

import { useState, useRef, useEffect } from 'react';
import { ChevronRight, FolderOpen, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';
import type { Folder as FolderType } from '../../store/useNotesStore';

// ── Menú contextual de carpeta ─────────────────────────────
function FolderMenu({
  folder,
  onClose,
}: {
  folder: FolderType;
  onClose: () => void;
}) {
  const { addFolder, renameFolder, deleteFolder, setFolder } = useNotesStore();
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(folder.name);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (renaming) {
    return (
      <div ref={ref} className="absolute right-0 top-6 z-50 bg-dark-800 border border-white/10 rounded-lg p-2 shadow-xl w-44">
        <input
          autoFocus
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { renameFolder(folder.id, newName); onClose(); }
            if (e.key === 'Escape') { setRenaming(false); }
          }}
          className="w-full text-xs bg-dark-700 border border-primary-500/30 rounded px-2 py-1.5 text-gray-300 outline-none"
        />
      </div>
    );
  }

  return (
    <div ref={ref} className="absolute right-0 top-6 z-50 bg-dark-800 border border-white/10 rounded-lg py-1 shadow-xl w-44">
      <button
        onClick={() => { addFolder('Nueva subcarpeta', folder.id); onClose(); }}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Plus size={12} />
        Nueva subcarpeta
      </button>
      <button
        onClick={() => setRenaming(true)}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Pencil size={12} />
        Renombrar
      </button>
      <div className="border-t border-white/5 my-1" />
      <button
        onClick={() => {
          if (confirm(`¿Eliminar "${folder.name}" y todas sus subcarpetas?`)) {
            deleteFolder(folder.id);
            setFolder(null);
          }
          onClose();
        }}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
      >
        <Trash2 size={12} />
        Eliminar
      </button>
    </div>
  );
}

// ── Fila de carpeta individual ─────────────────────────────
function FolderRow({
  folder,
  depth = 0,
}: {
  folder: FolderType;
  depth?: number;
}) {
  const {
    activeFolder,
    expandedFolders,
    setFolder,
    toggleExpand,
    getChildFolders,
    countNotesInFolder,
    addFolder,
  } = useNotesStore();

  const [menuOpen, setMenuOpen] = useState(false);
  const [addingChild, setAddingChild] = useState(false);
  const [childName, setChildName] = useState('');

  const children = getChildFolders(folder.id);
  const isExpanded = expandedFolders.includes(folder.id);
  const isActive = activeFolder === folder.id;
  const count = countNotesInFolder(folder.id);
  const hasChildren = children.length > 0;

  const handleAddChild = () => {
    if (childName.trim()) {
      addFolder(childName.trim(), folder.id);
      setChildName('');
      setAddingChild(false);
    }
  };

  return (
    <div>
      <div
        className={`group relative flex items-center gap-1 py-1.5 pr-2 rounded-md cursor-pointer transition-all
          ${isActive ? 'bg-primary-500/15 text-primary-300' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
        onClick={() => setFolder(folder.id)}
      >
        {/* Expand toggle */}
        <button
          onClick={e => { e.stopPropagation(); if (hasChildren) toggleExpand(folder.id); }}
          className={`flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''} ${!hasChildren ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ChevronRight size={11} className="text-gray-600" />
        </button>

        {/* Icono */}
        <span className="text-sm flex-shrink-0">
          {folder.icon ?? (depth > 0 ? '📄' : '📁')}
        </span>

        {/* Nombre */}
        <span className="text-xs truncate flex-1">{folder.name}</span>

        {/* Count */}
        {count > 0 && (
          <span className="text-[10px] text-gray-600 ml-auto">{count}</span>
        )}

        {/* Acciones — visibles al hover */}
        <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
          <button
            onClick={e => { e.stopPropagation(); setAddingChild(true); }}
            className="p-0.5 text-gray-600 hover:text-primary-400 transition-colors"
            title="Agregar subcarpeta"
          >
            <Plus size={11} />
          </button>
          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-0.5 text-gray-600 hover:text-gray-300 transition-colors"
            >
              <MoreHorizontal size={11} />
            </button>
            {menuOpen && (
              <FolderMenu folder={folder} onClose={() => setMenuOpen(false)} />
            )}
          </div>
        </div>
      </div>

      {/* Input nueva subcarpeta */}
      {addingChild && (
        <div style={{ paddingLeft: `${12 + (depth + 1) * 14}px` }} className="pr-2 py-1">
          <input
            autoFocus
            value={childName}
            onChange={e => setChildName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddChild();
              if (e.key === 'Escape') { setAddingChild(false); setChildName(''); }
            }}
            placeholder="Nombre de subcarpeta..."
            className="w-full text-xs bg-dark-800 border border-primary-500/30 rounded px-2 py-1 text-gray-300 outline-none placeholder-gray-600"
          />
        </div>
      )}

      {/* Subcarpetas */}
      {isExpanded && children.map(child => (
        <FolderRow key={child.id} folder={child} depth={depth + 1} />
      ))}
    </div>
  );
}

// ── Panel principal ────────────────────────────────────────
export function FolderPanel() {
  const {
    activeFolder,
    setFolder,
    notes,
    addFolder,
    getChildFolders,
  } = useNotesStore();

  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  // Solo carpetas raíz
  const rootFolders = getChildFolders(null);

  const handleAdd = () => {
    if (newName.trim()) {
      addFolder(newName.trim(), null);
      setNewName('');
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Carpetas</span>
        <button
          onClick={() => setAdding(!adding)}
          className="p-1 text-gray-600 hover:text-primary-400 transition-colors"
          title="Nueva carpeta raíz"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Input nueva carpeta raíz */}
      {adding && (
        <div className="px-3 py-2 border-b border-white/5">
          <input
            autoFocus
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') { setAdding(false); setNewName(''); }
            }}
            placeholder="Nueva carpeta..."
            className="w-full text-xs bg-dark-800 border border-primary-500/30 rounded-md px-2 py-1.5 text-gray-300 outline-none placeholder-gray-600"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-1 px-1">
        {/* Todas las notas */}
        <button
          onClick={() => setFolder(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all mb-0.5
            ${activeFolder === null
              ? 'bg-primary-500/15 text-primary-300'
              : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
            }`}
        >
          <FolderOpen size={14} />
          <span className="text-xs">Todas las notas</span>
          <span className="ml-auto text-[10px] text-gray-600">{notes.length}</span>
        </button>

        <div className="border-t border-white/5 my-1" />

        {/* Carpetas raíz con sus hijos */}
        {rootFolders.map(folder => (
          <FolderRow key={folder.id} folder={folder} depth={0} />
        ))}

        {rootFolders.length === 0 && (
          <div className="text-center py-6 text-xs text-gray-600">
            No hay carpetas.<br />
            Crea una con el + arriba.
          </div>
        )}
      </div>
    </div>
  );
}