// src/components/Notes/SlashMenu.tsx
// Menú flotante de slash commands — aparece al escribir "/" en el editor

import { useState, useEffect, useCallback, useRef } from 'react';
import { type Editor } from '@tiptap/react';
import { getItems, type SlashCommandItem } from './extensions/SlashCommands';

interface SlashMenuProps {
  editor: Editor | null;
}

interface MenuState {
  isOpen: boolean;
  query: string;
  items: SlashCommandItem[];
  selectedIndex: number;
  position: { x: number; y: number };
  range: { from: number; to: number } | null;
  commandProps: Record<string, unknown> | null;
}

export function SlashMenu({ editor }: SlashMenuProps) {
  const [state, setState] = useState<MenuState>({
    isOpen: false,
    query: '',
    items: [],
    selectedIndex: 0,
    position: { x: 0, y: 0 },
    range: null,
    commandProps: null,
  });

  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setState(s => ({ ...s, isOpen: false, query: '', selectedIndex: 0, range: null }));
  }, []);

  const selectItem = useCallback((item: SlashCommandItem) => {
    if (!editor || !state.range) return;
    editor.chain().focus().deleteRange(state.range).run();
    item.command(editor);
    close();
  }, [editor, state.range, close]);

  // Detectar "/" y seguir el texto que escribe el usuario
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setState(s => ({ ...s, selectedIndex: (s.selectedIndex + 1) % Math.max(s.items.length, 1) }));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setState(s => ({ ...s, selectedIndex: (s.selectedIndex - 1 + Math.max(s.items.length, 1)) % Math.max(s.items.length, 1) }));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = state.items[state.selectedIndex];
        if (item) selectItem(item);
      } else if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [state.isOpen, state.items, state.selectedIndex, selectItem, close]);

  // Escuchar cambios de texto para detectar "/"
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const { state: editorState } = editor;
      const { selection } = editorState;
      const { from } = selection;

      // Buscar "/" antes de la posición actual
      const textBefore = editorState.doc.textBetween(
        Math.max(0, from - 30),
        from,
        '\n',
        '\0'
      );

      const slashMatch = textBefore.match(/\/(\w*)$/);

      if (slashMatch) {
        const query = slashMatch[1] || '';
        const slashPos = from - slashMatch[0].length;
        const items = getItems(query);

        // Posición del cursor en el DOM
        const coords = editor.view.coordsAtPos(from);
        const editorEl = editor.view.dom as HTMLElement;
        const editorRect = editorEl.getBoundingClientRect();

        setState({
          isOpen: true,
          query,
          items,
          selectedIndex: 0,
          position: {
            x: coords.left - editorRect.left,
            y: coords.bottom - editorRect.top + 4,
          },
          range: { from: slashPos, to: from },
          commandProps: null,
        });
      } else {
        setState(s => s.isOpen ? { ...s, isOpen: false } : s);
      }
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);
    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor, close]);

  // Cerrar si se hace click fuera
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [close]);

  if (!state.isOpen || state.items.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 rounded-xl shadow-2xl overflow-hidden"
      style={{
        left: state.position.x,
        top: state.position.y,
        background: 'rgba(20, 20, 35, 0.98)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(124, 106, 245, 0.25)',
        minWidth: '260px',
        maxHeight: '320px',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
      }}
    >
      <div className="p-1.5">
        {state.query && (
          <p className="text-[10px] text-gray-600 px-2 py-1 uppercase tracking-widest">
            Resultados para "/{state.query}"
          </p>
        )}
        {!state.query && (
          <p className="text-[10px] text-gray-600 px-2 py-1 uppercase tracking-widest">
            Insertar bloque
          </p>
        )}
        {state.items.map((item, i) => (
          <button
            key={item.title}
            onMouseDown={(e) => {
              e.preventDefault();
              selectItem(item);
            }}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-all"
            style={{
              background: i === state.selectedIndex
                ? 'rgba(124, 106, 245, 0.2)'
                : 'transparent',
              border: i === state.selectedIndex
                ? '1px solid rgba(124, 106, 245, 0.3)'
                : '1px solid transparent',
            }}
          >
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-mono font-bold flex-shrink-0"
              style={{
                background: 'rgba(124, 106, 245, 0.15)',
                color: '#a78bfa',
                fontSize: item.icon.length > 2 ? '14px' : '12px',
              }}
            >
              {item.icon}
            </span>
            <div>
              <p className="text-sm text-white font-medium leading-tight">{item.title}</p>
              <p className="text-xs text-gray-500 leading-tight">{item.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
