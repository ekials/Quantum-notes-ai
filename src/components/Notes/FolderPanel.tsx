import { useState } from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';

export function FolderPanel() {
  const { folders, activeFolder, setFolder, notes, addFolder } = useNotesStore();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const countByFolder = (folder: string) =>
    notes.filter((n) => n.folder === folder).length;

  const handleAdd = () => {
    if (newName.trim()) {
      addFolder(newName.trim());
      setNewName('');
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Carpetas</span>
        <button
          onClick={() => setAdding(!adding)}
          className="p-1 text-gray-600 hover:text-primary-400 transition-colors"
          aria-label="Add folder"
        >
          <Plus size={14} />
        </button>
      </div>

      {adding && (
        <div className="px-3 py-2 border-b border-white/5">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false); }}
            placeholder="Nueva carpeta..."
            className="w-full text-xs bg-dark-800 border border-primary-500/30 rounded-md px-2 py-1.5 text-gray-300 outline-none placeholder-gray-600"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto py-1">
        {/* All notes */}
        <button
          onClick={() => setFolder(null)}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-all
            ${activeFolder === null
              ? 'bg-primary-500/15 text-primary-300'
              : 'text-gray-400 hover:bg-white/5 hover:text-gray-300'
            }`}
        >
          <FolderOpen size={14} />
          <span>Todas las notas</span>
          <span className="ml-auto text-[10px] text-gray-600">{notes.length}</span>
        </button>

        {folders.map((folder) => (
          <button
            key={folder}
            onClick={() => setFolder(folder)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-all
              ${activeFolder === folder
                ? 'bg-primary-500/15 text-primary-300'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
          >
            <FolderOpen size={13} />
            <span className="truncate">{folder}</span>
            <span className="ml-auto text-[10px] text-gray-600">{countByFolder(folder)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
