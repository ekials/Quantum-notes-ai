import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-900/30 border border-primary-500/30',
  accent: 'bg-accent-600/80 hover:bg-accent-500/80 text-dark-950 font-semibold shadow-lg shadow-accent-900/20',
  ghost: 'bg-transparent hover:bg-white/5 text-gray-300 hover:text-white border border-transparent hover:border-white/10',
  danger: 'bg-rose-600/80 hover:bg-rose-500/80 text-white border border-rose-500/30',
  outline: 'bg-transparent border border-primary-500/40 text-primary-300 hover:bg-primary-500/10 hover:border-primary-500/70',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        transition-all duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
