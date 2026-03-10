import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Bot, TrendingUp } from 'lucide-react';
import { QuickAction } from '../../ui/QuickAction';
import { useNotesStore } from '../../store/useNotesStore';
import { useAppStore } from '../../store/useAppStore';

export function QuickActions() {
  const navigate = useNavigate();
  const createNote = useNotesStore((s) => s.createNote);
  const incrementNotes = useAppStore((s) => s.incrementNotes);

  const handleNewNote = () => {
    createNote();
    incrementNotes();
    navigate('/notes');
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <QuickAction
        icon={<Plus size={20} />}
        label="Nueva Nota"
        color="primary"
        onClick={handleNewNote}
      />
      <QuickAction
        icon={<FileText size={20} />}
        label="Ver Notas"
        color="primary"
        onClick={() => navigate('/notes')}
      />
      <QuickAction
        icon={<Bot size={20} />}
        label="Quantum AI"
        color="accent"
        onClick={() => navigate('/ai')}
      />
      <QuickAction
        icon={<TrendingUp size={20} />}
        label="Mi Progreso"
        color="warning"
        onClick={() => navigate('/tracking')}
      />
    </div>
  );
}
