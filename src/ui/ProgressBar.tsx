interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  color?: 'primary' | 'accent' | 'warning' | 'success';
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const colorClasses = {
  primary: 'from-primary-600 to-primary-400',
  accent: 'from-accent-600 to-accent-400',
  warning: 'from-amber-600 to-amber-400',
  success: 'from-emerald-600 to-emerald-400',
};

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({
  value,
  max = 100,
  label,
  sublabel,
  color = 'primary',
  showPercent = true,
  size = 'md',
  animated = true,
  className = '',
}: ProgressBarProps) {
  const percent = Math.min(100, Math.round((value / max) * 100));

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-2">
          <div>
            {label && <span className="text-sm font-medium text-gray-300">{label}</span>}
            {sublabel && <span className="text-xs text-gray-500 ml-2">{sublabel}</span>}
          </div>
          {showPercent && (
            <span className="text-xs font-mono text-gray-400">
              {value}/{max} <span className="text-primary-400">({percent}%)</span>
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-dark-800 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`
            ${sizeClasses[size]} rounded-full bg-gradient-to-r ${colorClasses[color]}
            transition-all duration-700 ease-out relative
            ${animated ? 'after:absolute after:inset-0 after:bg-white/10 after:rounded-full after:animate-pulse-slow' : ''}
          `}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
