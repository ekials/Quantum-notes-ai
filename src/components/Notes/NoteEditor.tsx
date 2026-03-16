import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNotesStore } from '../../store/useNotesStore';
import { Eye, Code2 } from 'lucide-react';

export function NoteEditor() {
  const { activeNoteId, getNoteById, updateNote } = useNotesStore();
  const note = activeNoteId ? getNoteById(activeNoteId) : undefined;
  const [preview, setPreview] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (field: 'title' | 'content', value: string) => {
      if (!activeNoteId) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateNote(activeNoteId, { [field]: value });
      }, 400);
    },
    [activeNoteId, updateNote]
  );

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600">
        <div className="text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm">Selecciona o crea una nota</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-3 border-b border-white/5">
        <input
          ref={titleRef}
          defaultValue={note.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="flex-1 bg-transparent text-lg font-semibold text-white outline-none placeholder-gray-600"
          placeholder="Título de la nota..."
        />
        <button
          onClick={() => setPreview((p) => !p)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all
            ${preview
              ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
              : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-400'
            }`}
        >
          {preview ? <Code2 size={13} /> : <Eye size={13} />}
          {preview ? 'Editor' : 'Preview'}
        </button>
      </div>

      {/* Editor / Preview */}
      <div className="flex-1 min-h-0 overflow-auto">
        {preview ? (
          <div className="p-5 prose-quantum">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
          </div>
        ) : (
          <textarea
            key={note.id}
            defaultValue={note.content}
            onChange={(e) => handleChange('content', e.target.value)}
            className="w-full h-full bg-transparent text-sm font-mono text-gray-300 p-5 outline-none resize-none leading-relaxed placeholder-gray-700"
            placeholder="Escribe en Markdown... # Título, **negrita**, `código`"
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}
