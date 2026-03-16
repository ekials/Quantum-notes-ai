import { USER_PROFILE } from './constants';

export function daysUntilGraduation(): number {
  const today = new Date();
  const diff = USER_PROFILE.graduationDate.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function daysUntilKAIST(): number {
  const target = new Date(`${USER_PROFILE.targetYear}-09-01`);
  const today = new Date();
  const diff = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function getWeekLabel(): string {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return `${formatDate(weekStart)} - ${formatDate(weekEnd)}`;
}

export function getStreakLabel(streak: number): string {
  if (streak === 0) return 'Sin racha aún';
  if (streak === 1) return '¡1 día! Empieza bien 🔥';
  if (streak < 7) return `${streak} días seguidos 🔥`;
  if (streak < 30) return `${streak} días — ¡Imparable! 🔥🔥`;
  return `${streak} días — ¡Leyenda! 🔥🔥🔥`;
}

export function getCurrentDateKey(): string {
  return new Date().toISOString().split('T')[0];
}
