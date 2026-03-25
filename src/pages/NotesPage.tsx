import { Plus } from 'lucide-react';
import { FolderPanel } from '../components/Notes/FolderPanel';
import { NoteList } from '../components/Notes/NoteList';
import { NoteEditor } from '../components/Notes/NoteEditor';
import { SearchBar } from '../components/Notes/SearchBar';
import { Button } from '../ui/Button';
import { useNotesStore } from '../store/useNotesStore';
import { useAppStore } from '../store/useAppStore';

export function NotesPage() {
  const { createNote } = useNotesStore();
  const { incrementNotes } = useAppStore();

  const handleNew = async () => {
    await createNote();
    incrementNotes();
  };

  return (
    <div className="flex h-[calc(100vh-0px)] animate-fade-in">
      {/* Folder Panel */}
      <div className="w-44 flex-shrink-0 border-r border-white/5 bg-dark-950/50">
        <FolderPanel />
      </div>

      {/* Note List */}
      <div className="w-60 flex-shrink-0 border-r border-white/5 flex flex-col bg-dark-900/20">
        <div className="p-3 border-b border-white/5 space-y-2">
          <SearchBar />
          <Button variant="outline" size="sm" className="w-full" onClick={handleNew}>
            <Plus size={13} /> Nueva nota
          </Button>
        </div>
        <NoteList />
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <NoteEditor />
      </div>
    </div>
  );
}
