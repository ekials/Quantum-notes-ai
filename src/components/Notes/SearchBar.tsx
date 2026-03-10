import { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';

export function SearchBar() {
  const { searchQuery, setSearch } = useNotesStore();
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
      <input
        ref={inputRef}
        value={searchQuery}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar notas... (Ctrl+K)"
        className="w-full bg-dark-900/60 border border-white/5 rounded-lg pl-9 pr-8 py-2
          text-sm text-gray-300 placeholder-gray-600 outline-none
          focus:border-primary-500/40 transition-colors"
      />
      {searchQuery && (
        <button
          onClick={() => setSearch('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
