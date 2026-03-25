// Lista de comandos slash para `SlashMenu` (filtra e inserta en el editor)
import { type Editor } from '@tiptap/react';

export type SlashCommandItem = {
  title: string;
  description: string;
  icon: string;
  /**
   * Tokens contra los que filtramos en el menú (para soportar /code, /img, /math, etc).
   */
  aliases?: string[];
  command: (editor: Editor) => void;
};

function normalizeCodeLanguage(input: string) {
  const s = input.trim().toLowerCase();
  if (!s) return 'javascript';
  if (s === 'c++' || s === 'cpp') return 'cpp';
  if (s === 'js' || s === 'javascript') return 'javascript';
  if (s === 'ts' || s === 'typescript') return 'typescript';
  if (s === 'py' || s === 'python') return 'python';
  if (s === 'sh' || s === 'bash') return 'bash';
  return s;
}

function getItems(query: string): SlashCommandItem[] {
  const q = query.trim().toLowerCase();

  const allItems: SlashCommandItem[] = [
    {
      title: 'Código',
      description: 'Bloque con syntax highlighting',
      icon: '{ }',
      aliases: ['code'],
      command: (editor) => {
        const lang = window.prompt(
          'Lenguaje para syntax highlighting (ej: python, cpp, java, js):',
          'javascript',
        );
        const language = normalizeCodeLanguage(lang ?? 'javascript');
        editor.chain().focus().setCodeBlock({ language }).run();
      },
    },
    {
      title: 'Imagen',
      description: 'Subir imagen desde dispositivo',
      icon: '🖼',
      aliases: ['img', 'image'],
      command: (editor) => {
        editor.commands.command(() => {
          window.dispatchEvent(new CustomEvent('tiptap:insert-image'));
          return true;
        });
      },
    },
    {
      title: 'Video',
      description: 'Insertar video desde dispositivo',
      icon: '🎬',
      aliases: ['video', 'vid'],
      command: (editor) => {
        editor.commands.command(() => {
          window.dispatchEvent(new CustomEvent('tiptap:insert-video'));
          return true;
        });
      },
    },
    {
      title: 'Audio',
      description: 'Insertar audio desde dispositivo',
      icon: '🎵',
      aliases: ['audio', 'sound'],
      command: (editor) => {
        editor.commands.command(() => {
          window.dispatchEvent(new CustomEvent('tiptap:insert-audio'));
          return true;
        });
      },
    },
    {
      title: 'Ecuación LaTeX',
      description: 'Fórmula matemática con LaTeX',
      icon: '∑',
      aliases: ['math', 'latex', 'ecuacion', 'ecuación'],
      command: (editor) => {
        const formula = window.prompt('Ingresa ecuación LaTeX:', 'E = mc^2');
        if (!formula) return;
        // Insertamos LaTeX "crudo"; la preview se encarga de renderizar con KaTeX.
        editor.chain().focus().insertContent(`<p>$$${formula}$$</p>`).run();
      },
    },
    {
      title: 'Transcribir',
      description: 'Audio/Video -> texto con Whisper',
      icon: '🎙',
      aliases: ['transcribe', 'whisper', 'transcribir'],
      command: (editor) => {
        editor.commands.command(() => {
          window.dispatchEvent(new CustomEvent('tiptap:transcribe'));
          return true;
        });
      },
    },

    // Extras útiles
    {
      title: 'Título 1',
      description: 'Encabezado grande',
      icon: 'H1',
      command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      title: 'Título 2',
      description: 'Encabezado mediano',
      icon: 'H2',
      command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: 'Título 3',
      description: 'Encabezado pequeño',
      icon: 'H3',
      command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      title: 'Lista de viñetas',
      description: 'Bullets',
      icon: '•',
      command: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      title: 'Lista numerada',
      description: 'Lista con números',
      icon: '1.',
      command: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      title: 'Cita',
      description: 'Blockquote',
      icon: '"',
      command: (editor) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      title: 'Divisor',
      description: 'Línea horizontal',
      icon: '—',
      command: (editor) => editor.chain().focus().setHorizontalRule().run(),
    },
  ];

  if (!q) return allItems;

  return allItems.filter((item) => {
    const inText =
      item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
    const inAliases = item.aliases?.some((a) => a.toLowerCase().includes(q)) ?? false;
    return inText || inAliases;
  });
}

export { getItems };
