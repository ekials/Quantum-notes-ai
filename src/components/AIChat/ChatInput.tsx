import { useState, useRef, useCallback } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  notesCount?: number;
}

export function ChatInput({ onSend, disabled = false, notesCount = 0 }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
  };

  return (
    <div className="p-4 border-t border-white/5">
      {notesCount > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <Paperclip size={11} className="text-accent-500" />
          <span className="text-[10px] text-gray-600">{notesCount} nota(s) incluidas como contexto</span>
        </div>
      )}
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Pregunta algo a Quantum AI... (Enter para enviar, Shift+Enter para nueva línea)"
          disabled={disabled}
          rows={1}
          className="
            flex-1 bg-dark-900/60 border border-white/5 rounded-xl px-4 py-3
            text-sm text-gray-300 placeholder-gray-600 outline-none resize-none
            focus:border-primary-500/40 transition-colors disabled:opacity-50
            max-h-[150px]
          "
          style={{ height: 'auto' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className="
            flex-shrink-0 w-10 h-10 rounded-xl
            bg-gradient-to-br from-primary-600 to-primary-500
            flex items-center justify-center
            transition-all duration-150 cursor-pointer
            disabled:opacity-40 disabled:cursor-not-allowed
            hover:shadow-lg hover:shadow-primary-900/40
            active:scale-95
          "
          aria-label="Send message"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}
