import { useState, useCallback } from 'react';
import { Bot, BookOpen } from 'lucide-react';
import { ChatWindow } from '../components/AIChat/ChatWindow';
import { ChatInput } from '../components/AIChat/ChatInput';
import { type ChatMessage, sendMessage } from '../services/aiService';
import { useNotesStore } from '../store/useNotesStore';

export function AIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { notes } = useNotesStore();

  // Build notes context (RAG-style)
  const buildNotesContext = useCallback(() => {
    if (notes.length === 0) return undefined;
    return notes
      .slice(0, 5) // limit context size
      .map((n) => `[${n.folder}] ${n.title}:\n${n.content.slice(0, 500)}`)
      .join('\n\n---\n\n');
  }, [notes]);

  const handleSend = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { role: 'user', content: text };
    const newMessages: ChatMessage[] = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const context = buildNotesContext();
      const reply = await sendMessage(newMessages, context);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } finally {
      setLoading(false);
    }
  }, [messages, buildNotesContext]);

  const handleClear = () => setMessages([]);

  return (
    <div className="flex flex-col h-screen animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Quantum AI</h1>
            <p className="text-[10px] text-gray-500">Asistente académico · español 🔬</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
            <BookOpen size={11} />
            <span>{notes.length} notas en contexto</span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors px-2 py-1 rounded hover:bg-white/5"
            >
              Limpiar chat
            </button>
          )}
        </div>
      </div>

      {/* Chat Window */}
      <ChatWindow messages={messages} loading={loading} />

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={loading} notesCount={notes.length} />
    </div>
  );
}
