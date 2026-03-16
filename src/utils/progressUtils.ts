import { XP_PER_LEVEL } from './constants';

export function getLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXpInCurrentLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function getXpToNextLevel(xp: number): number {
  return XP_PER_LEVEL - getXpInCurrentLevel(xp);
}

export function getLevelProgress(xp: number): number {
  return (getXpInCurrentLevel(xp) / XP_PER_LEVEL) * 100;
}

export function getProgressPercent(current: number, target: number): number {
  if (target === 0) return 100;
  return Math.min(100, Math.round((current / target) * 100));
}

export function getLevelTitle(level: number): string {
  const titles = [
    'Aprendiz', 'Explorador', 'Estudiante', 'Investigador',
    'Desarrollador', 'Especialista', 'Experto', 'Maestro',
    'Científico', 'Quantum Master',
  ];
  return titles[Math.min(level - 1, titles.length - 1)];
}

export function getGpaDelta(current: number, target: number): string {
  const diff = target - current;
  return diff > 0 ? `+${diff.toFixed(1)} needed` : 'Goal reached!';
}
