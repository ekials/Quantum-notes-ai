import React from 'react';

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: 'primary' | 'accent' | 'warning';
}

const colorMap = {
  primary: {
    bg: 'bg-primary-500/10 hover:bg-primary-500/20',
    border: 'border-primary-500/20 hover:border-primary-500/40',
    icon: 'text-primary-400',
    text: 'text-primary-300',
  },
  accent: {
    bg: 'bg-accent-500/10 hover:bg-accent-500/20',
    border: 'border-accent-500/20 hover:border-accent-500/40',
    icon: 'text-accent-400',
    text: 'text-accent-300',
  },
  warning: {
    bg: 'bg-amber-500/10 hover:bg-amber-500/20',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    icon: 'text-amber-400',
    text: 'text-amber-300',
  },
};

export function QuickAction({ icon, label, onClick, color = 'primary' }: QuickActionProps) {
  const c = colorMap[color];
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-2 p-4 rounded-xl
        border transition-all duration-200 cursor-pointer
        ${c.bg} ${c.border}
      `}
    >
      <span className={`${c.icon}`}>{icon}</span>
      <span className={`text-xs font-medium ${c.text}`}>{label}</span>
    </button>
  );
}
