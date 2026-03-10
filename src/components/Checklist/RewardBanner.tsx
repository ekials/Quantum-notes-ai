interface RewardBannerProps {
  percent: number;
  xpEarned: number;
}

export function RewardBanner({ percent, xpEarned }: RewardBannerProps) {
  if (percent < 100) return null;

  return (
    <div className="glass-card border border-accent-500/30 p-5 text-center animate-fade-in relative overflow-hidden">
      {/* Animated glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 via-accent-500/10 to-primary-500/5 animate-pulse-slow" />
      <div className="relative">
        <div className="text-3xl mb-2">🎉</div>
        <h3 className="text-lg font-bold gradient-text">¡Día Perfecto!</h3>
        <p className="text-sm text-gray-400 mt-1">Completaste todas tus tareas de hoy</p>
        <div className="mt-3 inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/30 rounded-full px-4 py-1.5">
          <span className="text-amber-400 font-bold">+{xpEarned} XP</span>
          <span className="text-amber-300/60 text-sm">ganados hoy</span>
        </div>
      </div>
    </div>
  );
}
