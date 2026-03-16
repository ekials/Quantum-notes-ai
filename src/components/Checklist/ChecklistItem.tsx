import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { ChecklistTask } from '../../store/useChecklistStore';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../utils/constants';
import { Tag } from '../../ui/Tag';

interface ChecklistItemProps {
  task: ChecklistTask;
  onToggle: () => void;
  onDelete: () => void;
}

export function ChecklistItem({ task, onToggle, onDelete }: ChecklistItemProps) {
  const [hovered, setHovered] = useState(false);
  const catClass = CATEGORY_COLORS[task.category];

  return (
    <div
      className={`
        flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 group
        ${task.done
          ? 'bg-dark-900/30 border-white/5 opacity-60'
          : 'glass-card-hover'
        }
      `}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`
          flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center
          transition-all duration-200 cursor-pointer
          ${task.done
            ? 'bg-primary-500 border-primary-500'
            : 'border-gray-600 hover:border-primary-400'
          }
        `}
        aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.done && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Task text */}
      <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-500' : 'text-gray-300'}`}>
        {task.text}
      </span>

      {/* Category & XP */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Tag label={CATEGORY_LABELS[task.category]} variant={catClass} small />
        <span className="text-[10px] text-amber-400 font-mono">+{task.xpReward}xp</span>
      </div>

      {/* Delete button */}
      {hovered && (
        <button
          onClick={onDelete}
          className="p-1 text-gray-600 hover:text-rose-400 transition-colors"
          aria-label="Delete task"
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}
