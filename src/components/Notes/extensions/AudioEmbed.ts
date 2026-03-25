import { Node, mergeAttributes } from '@tiptap/core';

// Nodo simple para embebidos de audio (sin una extensión de terceros)
export const AudioEmbed = Node.create({
  name: 'audioEmbed',
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
        tag: 'audio[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Siempre renderizamos con controls para que sea usable.
    return ['audio', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { controls: 'controls' })];
  },
});

