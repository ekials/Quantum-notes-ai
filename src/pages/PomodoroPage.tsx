import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock, Pause, Play, Plus, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../store/useAuthStore';
import {
  getPomodoroStats,
  getPomodoroSessionsHistory,
  savePomodoroSession,
  storageService as localStorageService,
  type PomodoroSessionRow,
} from '../services/storageService';
import { ProgressBar } from '../ui/ProgressBar';

type Mode = 'focus' | 'break';

const SUBJECTS_DEFAULT = ['Academic', 'Research', 'Competitive Programming', 'Languages'];

function clampInt(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function formatMMSS(totalSeconds: number) {
  const s = Math.max(0, totalSeconds);
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export function PomodoroPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';

  const [subjects, setSubjects] = useState<string[]>(SUBJECTS_DEFAULT);
  const [subject, setSubject] = useState<string>(SUBJECTS_DEFAULT[0]);

  const [focusMin, setFocusMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);

  const [mode, setMode] = useState<Mode>('focus');
  const [running, setRunning] = useState(false);
  const [remainingSec, setRemainingSec] = useState(focusMin * 60);

  const [stats, setStats] = useState<Awaited<ReturnType<typeof getPomodoroStats>> | null>(null);
  const [history, setHistory] = useState<PomodoroSessionRow[]>([]);

  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const settingsKey = useMemo(() => `pomodoro_settings_${userId}`, [userId]);
  const subjectsKey = useMemo(() => `pomodoro_subjects_${userId}`, [userId]);

  useEffect(() => {
    if (!userId) return;

    const storedSettings = localStorageService.get(settingsKey, { focusMin: 25, breakMin: 5, subject: SUBJECTS_DEFAULT[0] });
    const storedSubjects = localStorageService.get<string[]>(subjectsKey, SUBJECTS_DEFAULT);

    setFocusMin(clampInt(storedSettings.focusMin, 10, 120));
    setBreakMin(clampInt(storedSettings.breakMin, 1, 60));
    setSubjects(storedSubjects.length ? storedSubjects : SUBJECTS_DEFAULT);
    setSubject(storedSettings.subject && storedSubjects.includes(storedSettings.subject) ? storedSettings.subject : (storedSubjects[0] ?? SUBJECTS_DEFAULT[0]));
    setRemainingSec(clampInt(storedSettings.focusMin, 10, 120) * 60);
  }, [settingsKey, subjectsKey, userId]);

  useEffect(() => {
    if (!userId) return;
    localStorageService.set(settingsKey, { focusMin, breakMin, subject });
    localStorageService.set(subjectsKey, subjects);
  }, [focusMin, breakMin, subject, subjects, settingsKey, subjectsKey, userId]);

  const refresh = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [s, h] = await Promise.all([
        getPomodoroStats(userId),
        getPomodoroSessionsHistory(userId, 20),
      ]);
      setStats(s);
      setHistory(h);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    refresh().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const startInterval = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setRemainingSec((s) => Math.max(0, s - 1));
    }, 1000);
  };

  const stopInterval = () => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  useEffect(() => {
    if (!running) {
      stopInterval();
      return;
    }
    startInterval();
    return () => stopInterval();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const completePhase = async () => {
    if (!userId) return;

    if (mode === 'focus') {
      // Guardar sesión de estudio al finalizar el focus
      await savePomodoroSession(userId, subject, focusMin);
      await refresh();
      setMode('break');
      setRemainingSec(breakMin * 60);
      setRunning(true); // auto-continue break
      return;
    }

    // break -> nuevo focus
    setMode('focus');
    setRemainingSec(focusMin * 60);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;
    if (remainingSec > 0) return;
    setRunning(false);
    completePhase().catch(() => {
      // Si falla guardar sesión, no rompemos el flujo del timer.
      setMode('break');
      setRemainingSec(breakMin * 60);
      setRunning(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSec, running]);

  const progressPct = useMemo(() => {
    const total = (mode === 'focus' ? focusMin : breakMin) * 60;
    if (total <= 0) return 0;
    return Math.round(((total - remainingSec) / total) * 100);
  }, [mode, focusMin, breakMin, remainingSec]);

  const handleReset = () => {
    setRunning(false);
    setMode('focus');
    setRemainingSec(focusMin * 60);
  };

  const [newSubject, setNewSubject] = useState('');
  const canAddSubject = newSubject.trim().length >= 2 && !subjects.includes(newSubject.trim());

  const handleAddSubject = () => {
    if (!canAddSubject) return;
    const s = newSubject.trim();
    setSubjects((prev) => [s, ...prev]);
    setSubject(s);
    setNewSubject('');
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-white">Pomodoro</h1>
          <p className="text-sm text-gray-500">Timer configurable · historial · stats semanales</p>
        </div>
        <div className="glass-card p-4 min-w-[320px]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary-300" />
              <p className="text-sm font-semibold text-gray-300">Estado</p>
            </div>
            <span className="text-xs text-gray-500">{mode === 'focus' ? 'Focus' : 'Break'}</span>
          </div>
          <div className="text-4xl font-bold text-white tabular-nums text-center">{formatMMSS(remainingSec)}</div>
          <div className="mt-3">
            <ProgressBar value={progressPct} max={100} showPercent={true} size="sm" color={mode === 'focus' ? 'primary' : 'accent'} />
          </div>
          <div className="mt-3 flex items-center gap-2 justify-center">
            <Button
              size="sm"
              variant={running ? 'outline' : 'primary'}
              onClick={() => setRunning((r) => !r)}
              disabled={remainingSec === 0 && running}
            >
              {running ? <Pause size={14} /> : <Play size={14} />}
              {running ? 'Pausar' : 'Iniciar'}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              <RotateCcw size={14} /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Configuración</h2>
            <span className="text-xs text-gray-500">Auto-continúa al terminar</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Focus (min)</label>
              <input
                type="number"
                min={10}
                max={120}
                value={focusMin}
                onChange={(e) => setFocusMin(clampInt(Number(e.target.value), 10, 120))}
                className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                disabled={running}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Break (min)</label>
              <input
                type="number"
                min={1}
                max={60}
                value={breakMin}
                onChange={(e) => setBreakMin(clampInt(Number(e.target.value), 1, 60))}
                className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                disabled={running}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="text-xs text-gray-500 mb-1 block">Selecciona qué estás estudiando</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1 bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                disabled={running}
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Nueva materia"
                  className="w-48 bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                  disabled={running}
                />
                <Button size="sm" variant="outline" onClick={handleAddSubject} disabled={!canAddSubject || running}>
                  <Plus size={14} /> Agregar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">Stats</h2>
          {stats ? (
            <div className="space-y-3 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>Hoy</span>
                <span className="text-white font-medium">{stats.todayCount} pomodoros · {stats.todayMinutes} min</span>
              </div>
              <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                <span>Esta semana</span>
                <span className="text-white font-medium">{stats.weekCount} pomodoros · {stats.weekMinutes} min</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">Cargando...</p>
          )}
          {loading && <p className="text-xs text-gray-500 mt-2">Actualizando...</p>}
        </div>
      </div>

      {/* Historial */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Historial de sesiones</h2>
          <span className="text-xs text-gray-500">Últimas {history.length}</span>
        </div>
        {history.length === 0 ? (
          <p className="text-xs text-gray-500">Aún no tienes sesiones guardadas.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-dark-950/30 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{h.subject}</p>
                  <p className="text-xs text-gray-500">{h.date} · {h.duration_min} min</p>
                </div>
                <span className="text-[11px] px-2 py-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">
                  OK
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

