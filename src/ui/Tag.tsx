interface TagProps {
  label: string;
  variant?: 'primary' | 'accent' | 'ghost' | string;
  onRemove?: () => void;
  small?: boolean;
}

export function Tag({ label, variant = 'primary', onRemove, small = false }: TagProps) {
  const base = small ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  const variantClass =
    variant === 'primary'
      ? 'bg-primary-500/15 text-primary-300 border border-primary-500/25'
      : variant === 'accent'
      ? 'bg-accent-500/15 text-accent-300 border border-accent-500/25'
      : variant === 'ghost'
      ? 'bg-white/5 text-gray-400 border border-white/10'
      : variant; // allow passing custom class

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${base} ${variantClass}`}>
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-0.5 text-current opacity-60 hover:opacity-100 transition-opacity"
          aria-label={`Remove tag ${label}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
