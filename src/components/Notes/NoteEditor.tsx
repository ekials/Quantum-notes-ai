// src/components/Notes/NoteEditor.tsx
// Editor rico con Tiptap — slash commands, bubble menu, imágenes, dibujo, transcripción

import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import { createLowlight, common } from 'lowlight';
import katex from 'katex';
import {
  Bold, Italic, Code, Eye, Edit3, Pen,
  Mic, Image as ImageIcon, Minus,
} from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';
import { useAuthStore } from '../../store/useAuthStore';
import { SlashMenu } from './SlashMenu';
import { DrawingCanvas } from './DrawingCanvas';
import { TranscribeModal } from './TranscribeModal';
import { supabase } from '../../lib/supabase';

import { VideoEmbed } from './extensions/VideoEmbed';
import { AudioEmbed } from './extensions/AudioEmbed';

const lowlight = createLowlight(common);

function renderLatexInHtml(html: string): string {
  if (!html.includes('$$')) return html;
  return html.replace(/\$\$([\s\S]+?)\$\$/g, (_match, latex: string) => {
    try {
      // KaTeX ya genera el HTML correcto en modo display
      return katex.renderToString(latex, { displayMode: true, throwOnError: false });
    } catch {
      // Si KaTeX falla, dejamos el texto original para que no se pierda el contenido.
      return `$$${latex}$$`;
    }
  });
}

// Subir archivo a Supabase Storage y retornar URL pública
async function uploadToStorage(userId: string, file: File, folder: string): Promise<string | null> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('note-assets').upload(path, file);
  if (error) {
    // Si el bucket no existe, devolvemos URL de objeto local (fallback)
    console.warn('Supabase Storage no disponible:', error.message);
    return URL.createObjectURL(file);
  }
  const { data } = supabase.storage.from('note-assets').getPublicUrl(path);
  return data.publicUrl;
}

export function NoteEditor() {
  const { activeNoteId, getNoteById, updateNote } = useNotesStore();
  const { user } = useAuthStore();
  const note = activeNoteId ? getNoteById(activeNoteId) : undefined;

  const [showDraw, setShowDraw] = useState(false);
  const [showTranscribe, setShowTranscribe] = useState(false);
  const [isPreview, setIsPreview] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // usamos CodeBlockLowlight
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ inline: false, allowBase64: true }),
      VideoEmbed,
      AudioEmbed,
      Placeholder.configure({ placeholder: 'Escribe algo... o usa "/" para comandos' }),
    ],
    content: note?.content ?? '',
    editorProps: {
      attributes: {
        class: 'prose-quantum focus:outline-none min-h-full p-5 text-sm leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      if (!activeNoteId) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateNote(activeNoteId, { content: editor.getHTML() });
      }, 600);
    },
  });

  // Sincronizar contenido cuando cambia la nota activa
  useEffect(() => {
    if (editor && note) {
      const currentHtml = editor.getHTML();
      if (currentHtml !== note.content) {
        editor.commands.setContent(note.content ?? '', { emitUpdate: false });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]);

  // Limpiar timer al desmontar
  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  // Handlers para eventos de slash commands
  useEffect(() => {
    const onInsertImage = () => imageInputRef.current?.click();
    const onInsertVideo = () => videoInputRef.current?.click();
    const onInsertAudio = () => audioInputRef.current?.click();
    const onTranscribe = () => setShowTranscribe(true);

    window.addEventListener('tiptap:insert-image', onInsertImage);
    window.addEventListener('tiptap:insert-video', onInsertVideo);
    window.addEventListener('tiptap:insert-audio', onInsertAudio);
    window.addEventListener('tiptap:transcribe', onTranscribe);
    return () => {
      window.removeEventListener('tiptap:insert-image', onInsertImage);
      window.removeEventListener('tiptap:insert-video', onInsertVideo);
      window.removeEventListener('tiptap:insert-audio', onInsertAudio);
      window.removeEventListener('tiptap:transcribe', onTranscribe);
    };
  }, []);

  // Drag & drop de imágenes en el editor
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    if (!editor || !user) return;
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
    if (!file) return;
    const url = await uploadToStorage(user.id, file, 'images');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  }, [editor, user]);

  const handleImageFile = async (file: File, mediaType: 'images' | 'videos' | 'audio') => {
    if (!editor || !user) return;
    const url = await uploadToStorage(user.id, file, mediaType);
    if (!url) return;

    if (mediaType === 'images') {
      editor.chain().focus().setImage({ src: url }).run();
    } else if (mediaType === 'videos') {
      editor.chain().focus().insertContent(
        `<video controls src="${url}" style="max-width: 100%; border-radius: 10px;"></video>`,
      ).run();
    } else {
      editor.chain().focus().insertContent(
        `<audio controls src="${url}" style="width: 100%;"></audio>`,
      ).run();
    }
  };

  const handleDrawingInsert = (dataUrl: string) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: dataUrl }).run();
  };

  const handleTranscribed = (text: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(`<p>${text}</p>`).run();
  };

  const handleTitleChange = useCallback((value: string) => {
    if (!activeNoteId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateNote(activeNoteId, { title: value });
    }, 400);
  }, [activeNoteId, updateNote]);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-600">
        <div className="text-center">
          <p className="text-5xl mb-4">⚡</p>
          <p className="text-base font-medium text-gray-500">Selecciona o crea una nota</p>
          <p className="text-sm text-gray-700 mt-1">Usa "/" en el editor para slash commands</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0" onDrop={handleDrop} onDragOver={e => e.preventDefault()}>
      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
        <input
          key={note.id}
          defaultValue={note.title}
          onChange={e => handleTitleChange(e.target.value)}
          className="flex-1 bg-transparent text-lg font-semibold text-white outline-none placeholder-gray-600"
          placeholder="Título de la nota..."
        />

        {/* Toolbar buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => imageInputRef.current?.click()}
            title="Insertar imagen"
            className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all"
          >
            <ImageIcon size={14} />
          </button>
          <button
            onClick={() => setShowDraw(true)}
            title="Canvas de dibujo"
            className="p-1.5 rounded-lg text-gray-600 hover:text-purple-400 hover:bg-white/5 transition-all"
          >
            <Pen size={14} />
          </button>
          <button
            onClick={() => setShowTranscribe(true)}
            title="Transcribir con Whisper"
            className="p-1.5 rounded-lg text-gray-600 hover:text-purple-400 hover:bg-white/5 transition-all"
          >
            <Mic size={14} />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={() => setIsPreview(p => !p)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              isPreview
                ? 'bg-primary-500/20 border-primary-500/40 text-primary-300'
                : 'border-white/10 text-gray-500 hover:border-white/20 hover:text-gray-400'
            }`}
          >
            {isPreview ? <Edit3 size={12} /> : <Eye size={12} />}
            {isPreview ? 'Editar' : 'Preview'}
          </button>
        </div>
      </div>

      {/* Bubble Menu */}
      {editor && !isPreview && (
        <BubbleMenu
          editor={editor}
          className="flex items-center gap-0.5 p-1 rounded-lg shadow-xl"
          style={{
            background: 'rgba(20, 20, 35, 0.98)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(124, 106, 245, 0.25)',
          }}
        >
          {[
            { action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), Icon: Bold, title: 'Negrita' },
            { action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), Icon: Italic, title: 'Cursiva' },
            { action: () => editor.chain().focus().toggleCode().run(), active: editor.isActive('code'), Icon: Code, title: 'Código' },
            { action: () => editor.chain().focus().setHorizontalRule().run(), active: false, Icon: Minus, title: 'Divisor' },
          ].map(({ action, active, Icon, title }) => (
            <button
              key={title}
              onClick={action}
              title={title}
              className="p-1.5 rounded-md transition-all"
              style={{
                background: active ? 'rgba(124,106,245,0.3)' : 'transparent',
              }}
            >
              <Icon size={13} className={active ? 'text-purple-300' : 'text-gray-400'} />
            </button>
          ))}
        </BubbleMenu>
      )}

      {/* Editor area */}
      <div className="flex-1 min-h-0 overflow-auto relative">
        {isPreview ? (
          <div
            className="p-5 prose-quantum"
            dangerouslySetInnerHTML={{ __html: renderLatexInHtml(note.content ?? '') }}
          />
        ) : (
          <div className="relative h-full">
            <EditorContent editor={editor} className="h-full" />
            <SlashMenu editor={editor} />
          </div>
        )}
      </div>

      {/* Slash commands helper hint */}
      {!isPreview && (
        <div className="flex items-center gap-3 px-4 py-1.5 border-t border-white/5">
          <p className="text-[10px] text-gray-700">
            Escribe <kbd className="text-gray-600 font-mono bg-white/5 px-1 rounded">/</kbd> para slash commands
          </p>
          <p className="text-[10px] text-gray-700">Drag & drop imágenes</p>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" className="hidden" accept="image/*"
        onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0], 'images')} />
      <input ref={videoInputRef} type="file" className="hidden" accept="video/*"
        onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0], 'videos')} />
      <input ref={audioInputRef} type="file" className="hidden" accept="audio/*"
        onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0], 'audio')} />

      {/* Modals */}
      {showDraw && (
        <DrawingCanvas onClose={() => setShowDraw(false)} onInsert={handleDrawingInsert} />
      )}
      {showTranscribe && (
        <TranscribeModal onClose={() => setShowTranscribe(false)} onTranscribed={handleTranscribed} />
      )}
    </div>
  );
}
