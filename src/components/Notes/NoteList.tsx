import { useNotesStore } from '../../store/useNotesStore';
import { formatDate } from '../../utils/dateUtils';
import { Tag } from '../../ui/Tag';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export function NoteList() {
  const { getFilteredNotes, activeNoteId, setActiveNote, deleteNote } = useNotesStore();
  const notes = getFilteredNotes();
  const [hoverId, setHoverId] = useState<string | null>(null);

  if (notes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600 p-4">
        <div className="text-center">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-sm">No hay notas aquí</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 overflow-y-auto flex-1 p-2">
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => setActiveNote(note.id)}
          onMouseEnter={() => setHoverId(note.id)}
          onMouseLeave={() => setHoverId(null)}
          className={`
            relative p-3 rounded-lg cursor-pointer transition-all duration-150 group
            ${activeNoteId === note.id
              ? 'bg-primary-500/15 border border-primary-500/30'
              : 'hover:bg-white/5 border border-transparent'
            }
          `}
        >
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-gray-200 truncate">{note.title}</h3>
            {hoverId === note.id && (
              <button
                onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                className="flex-shrink-0 p-0.5 text-gray-600 hover:text-rose-400 transition-colors"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-0.5 truncate">
            {note.content.replace(/[#*`\[\]]/g, '').slice(0, 60)}...
          </p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[10px] text-gray-600">{formatDate(note.updatedAt)}</span>
            {note.tags.slice(0, 2).map((t) => (
              <Tag key={t} label={t} variant="ghost" small />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
