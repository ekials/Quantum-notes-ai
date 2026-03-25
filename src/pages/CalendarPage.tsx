import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { useAuthStore } from '../store/useAuthStore';
import { deleteCalendarEvent, addCalendarEvent, getCalendarEvents, type CalendarEvent, type CalendarEventKind } from '../services/calendarService';
import { formatDate, formatTime } from '../utils/dateUtils';

type ViewMode = 'week' | 'month';

function toYMD(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function fromYMD(ymd: string) {
  // Evita problemas por timezone usando medianoche local.
  const [y, m, day] = ymd.split('-').map(Number);
  return new Date(y, m - 1, day, 0, 0, 0, 0);
}

function startOfWeekMonday(d: Date) {
  const date = new Date(d);
  const day = (date.getDay() + 6) % 7; // Lunes=0
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(d: Date, days: number) {
  const date = new Date(d);
  date.setDate(date.getDate() + days);
  return date;
}

function getEventDateTime(event: CalendarEvent) {
  const base = fromYMD(event.date);
  const [hh, mm] = (event.time ?? '09:00').split(':').map(Number);
  base.setHours(hh || 0, mm || 0, 0, 0);
  return base;
}

export function CalendarPage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';

  const [view, setView] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<string>(() => toYMD(new Date()));

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: selectedDate,
    time: '09:00',
    kind: 'event' as CalendarEventKind,
    reminder_enabled: true,
    reminder_minutes_before: 60,
  });

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getCalendarEvents(userId)
      .then((list) => setEvents(list))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    setForm((f) => ({ ...f, date: selectedDate }));
  }, [selectedDate]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      map[e.date] = map[e.date] ?? [];
      map[e.date].push(e);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => {
        const at = getEventDateTime(a).getTime();
        const bt = getEventDateTime(b).getTime();
        return at - bt;
      });
    }
    return map;
  }, [events]);

  const selectedEvents = eventsByDate[selectedDate] ?? [];

  const weekStart = useMemo(() => startOfWeekMonday(fromYMD(selectedDate)), [selectedDate]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const reminderList = useMemo(() => {
    const now = new Date();
    const horizon = new Date(now.getTime() + 48 * 60 * 1000);

    const reminders = events
      .filter((e) => e.reminder_enabled)
      .map((e) => {
        const dt = getEventDateTime(e);
        const reminderAt = new Date(dt.getTime() - e.reminder_minutes_before * 60 * 1000);
        return { e, reminderAt };
      })
      .filter((r) => r.reminderAt >= now && r.reminderAt <= horizon)
      .sort((a, b) => a.reminderAt.getTime() - b.reminderAt.getTime())
      .slice(0, 10);

    return reminders;
  }, [events]);

  const monthGrid = useMemo(() => {
    const sel = fromYMD(selectedDate);
    const y = sel.getFullYear();
    const m = sel.getMonth();

    const monthStart = new Date(y, m, 1, 0, 0, 0, 0);
    const weekday = (monthStart.getDay() + 6) % 7; // Lunes=0
    const gridStart = new Date(y, m, 1 - weekday, 0, 0, 0, 0);

    return Array.from({ length: 42 }, (_, i) => {
      const d = addDays(gridStart, i);
      return {
        date: d,
        inMonth: d.getMonth() === m,
        ymd: toYMD(d),
      };
    });
  }, [selectedDate]);

  const kindClasses = (kind: CalendarEventKind) => {
    if (kind === 'deadline') return 'bg-rose-500/20 text-rose-200 border-rose-500/30';
    return 'bg-primary-500/20 text-primary-200 border-primary-500/30';
  };

  const handleAdd = async () => {
    if (!userId) return;
    if (!form.title.trim()) return;

    const created = await addCalendarEvent(userId, {
      title: form.title.trim(),
      description: form.description.trim(),
      date: form.date,
      time: form.time.trim() ? form.time.trim() : null,
      kind: form.kind,
      reminder_enabled: form.reminder_enabled,
      reminder_minutes_before: form.reminder_minutes_before,
    });

    setEvents((prev) => [created, ...prev]);
    setShowAdd(false);
    setForm((f) => ({ ...f, title: '', description: '' }));
  };

  const handleDelete = async (eventId: string) => {
    if (!userId) return;
    await deleteCalendarEvent(userId, eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  if (!userId) {
    return (
      <div className="p-6 animate-fade-in">
        <h1 className="text-xl font-bold text-white">Calendario</h1>
        <p className="text-sm text-gray-500">Inicia sesión para ver y guardar eventos.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Calendario</h1>
          <p className="text-sm text-gray-500">Vista semanal y mensual · eventos y deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('week')}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-all ${
              view === 'week' ? 'bg-primary-500/15 border-primary-500/30 text-primary-200' : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium border transition-all ${
              view === 'month' ? 'bg-primary-500/15 border-primary-500/30 text-primary-200' : 'bg-transparent border-white/10 text-gray-400 hover:bg-white/5'
            }`}
          >
            Mes
          </button>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Nuevo
          </Button>
        </div>
      </div>

      {/* Recordatorios */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Recordatorios próximos</h2>
          <div className="text-xs text-gray-500">{formatDate(new Date())}</div>
        </div>
        {reminderList.length === 0 ? (
          <p className="text-xs text-gray-500">No tienes recordatorios en las próximas 48 horas.</p>
        ) : (
          <div className="space-y-2">
            {reminderList.map(({ e, reminderAt }) => (
              <div
                key={e.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-dark-900/30 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{e.title}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(fromYMD(e.date))} · {e.time ?? '09:00'} · {e.kind === 'deadline' ? 'Deadline' : 'Evento'}
                  </p>
                </div>
                <span className="text-[11px] px-2 py-1 rounded-xl border bg-white/5 text-primary-200">
                  {formatTime(reminderAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vistas */}
      {view === 'week' ? (
        <div className="glass-card p-4">
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((d) => {
              const ymd = toYMD(d);
              const dayEvents = eventsByDate[ymd] ?? [];
              const isSelected = ymd === selectedDate;
              return (
                <button
                  key={ymd}
                  onClick={() => setSelectedDate(ymd)}
                  className={`rounded-xl border p-2 text-left transition-all ${
                    isSelected ? 'border-primary-500/40 bg-primary-500/10' : 'border-white/5 bg-dark-900/30 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-400">{d.toLocaleDateString('es-PE', { weekday: 'short' })}</span>
                    <span className="text-xs font-semibold text-white">{d.getDate()}</span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {dayEvents.slice(0, 3).map((e) => (
                      <div key={e.id} className={`text-[11px] px-2 py-1 rounded-lg border ${kindClasses(e.kind)} truncate`}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[11px] text-gray-500">+{dayEvents.length - 3} más</div>
                    )}
                    {dayEvents.length === 0 && <div className="text-[11px] text-gray-600">—</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-card p-4">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((w) => (
              <div key={w} className="text-[11px] text-gray-500 text-center">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthGrid.map((cell) => {
              const dayEvents = eventsByDate[cell.ymd] ?? [];
              const isSelected = cell.ymd === selectedDate;
              return (
                <button
                  key={cell.ymd}
                  onClick={() => setSelectedDate(cell.ymd)}
                  className={`min-h-[84px] rounded-xl border p-2 text-left transition-all ${
                    isSelected
                      ? 'border-primary-500/40 bg-primary-500/10'
                      : cell.inMonth
                        ? 'border-white/5 bg-dark-900/30 hover:bg-white/5'
                        : 'border-white/5 bg-dark-950/20 opacity-60 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold ${isSelected ? 'text-primary-200' : 'text-white'}`}>
                      {cell.date.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[11px] text-gray-500">({dayEvents.length})</span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div key={e.id} className={`text-[11px] px-2 py-1 rounded-lg border ${kindClasses(e.kind)} truncate`}>
                        {e.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-[11px] text-gray-500">+{dayEvents.length - 2}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Eventos seleccionados */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-primary-300" />
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Eventos de {formatDate(fromYMD(selectedDate))}
            </h2>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> Agregar
          </Button>
        </div>

        {selectedEvents.length === 0 ? (
          <p className="text-xs text-gray-500">No hay eventos en este día.</p>
        ) : (
          <div className="space-y-2">
            {selectedEvents.map((e) => (
              <div key={e.id} className="rounded-xl border border-white/5 bg-dark-950/30 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] px-2 py-1 rounded-lg border ${kindClasses(e.kind)}`}>
                        {e.kind === 'deadline' ? 'Deadline' : 'Evento'}
                      </span>
                      <p className="text-sm font-semibold text-white truncate">{e.title}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {e.time ? `Hora: ${e.time}` : 'Sin hora'} · Recordatorio:{' '}
                      {e.reminder_enabled ? `${e.reminder_minutes_before} min antes` : 'desactivado'}
                    </p>
                    {e.description && <p className="text-xs text-gray-400 mt-2">{e.description}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="text-gray-600 hover:text-rose-300 transition-colors p-1 rounded-lg"
                    aria-label="Eliminar evento"
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal add */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nuevo evento" size="sm">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Título</label>
              <input
                autoFocus
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                placeholder="Ej: CP - Deadline paper"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
                <select
                  value={form.kind}
                  onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as CalendarEventKind }))}
                  className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                >
                  <option value="event">Evento</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Hora</label>
                <input
                  type="time"
                  value={form.time ?? '09:00'}
                  onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                  className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Recordatorio (min antes)</label>
                <input
                  type="number"
                  min={0}
                  max={1440}
                  value={form.reminder_minutes_before}
                  onChange={(e) => setForm((f) => ({ ...f, reminder_minutes_before: Number(e.target.value) }))}
                  className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                <input
                  type="checkbox"
                  checked={form.reminder_enabled}
                  onChange={(e) => setForm((f) => ({ ...f, reminder_enabled: e.target.checked }))}
                />
                Activar recordatorio
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
                placeholder="Notas / detalle (opcional)"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleAdd} disabled={!form.title.trim()}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>

      {loading && (
        <div className="text-xs text-gray-500">Cargando...</div>
      )}
    </div>
  );
}

