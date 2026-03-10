import { TASK_CATEGORIES, CATEGORY_LABELS, type TaskCategory } from '../../utils/constants';

interface CategoryFilterProps {
  active: TaskCategory | null;
  onChange: (cat: TaskCategory | null) => void;
  counts: Record<string, number>;
}

export function CategoryFilter({ active, onChange, counts }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-150
          ${active === null
            ? 'bg-primary-500 border-primary-500 text-white'
            : 'bg-transparent border-white/10 text-gray-400 hover:border-primary-500/40 hover:text-gray-300'
          }`}
      >
        Todos
      </button>
      {TASK_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(active === cat ? null : cat)}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all duration-150
            ${active === cat
              ? 'bg-primary-500 border-primary-500 text-white'
              : 'bg-transparent border-white/10 text-gray-400 hover:border-primary-500/40 hover:text-gray-300'
            }`}
        >
          {CATEGORY_LABELS[cat]}
          {counts[cat] !== undefined && (
            <span className="ml-1.5 opacity-60">({counts[cat]})</span>
          )}
        </button>
      ))}
    </div>
  );
}
