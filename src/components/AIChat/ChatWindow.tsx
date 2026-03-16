import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User } from 'lucide-react';
import type { ChatMessage } from '../../services/aiService';

interface ChatWindowProps {
  messages: ChatMessage[];
  loading: boolean;
}

export function ChatWindow({ messages, loading }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-900/40">
            <Bot size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold gradient-text mb-2">Quantum AI</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Tu asistente académico personal. Pregúntame sobre algoritmos, quantum computing, planes de estudio, o pídeme que te motive para KAIST 2029 🚀
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}
      {loading && (
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center flex-shrink-0">
            <Bot size={14} className="text-white" />
          </div>
          <div className="glass-card px-4 py-3 border border-primary-500/20">
            <div className="flex gap-1.5 items-center h-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-dark-700 border border-white/10' : 'bg-gradient-to-br from-primary-600 to-accent-500 shadow-lg shadow-primary-900/30'
      }`}>
        {isUser ? <User size={14} className="text-gray-400" /> : <Bot size={14} className="text-white" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
        isUser
          ? 'bg-primary-600/30 border border-primary-500/30 text-gray-200 rounded-tr-sm'
          : 'glass-card border border-white/5 rounded-tl-sm'
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose-quantum">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
