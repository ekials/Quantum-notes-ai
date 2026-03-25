import { Node, mergeAttributes } from '@tiptap/core';

// Nodo simple para embebidos de video (sin una extensión de terceros)
export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'video[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Siempre renderizamos con controls para que sea usable.
    return ['video', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { controls: 'controls' })];
  },
});

