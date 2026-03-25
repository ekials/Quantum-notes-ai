import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Plus, Trash2, Wallet } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { useAuthStore } from '../store/useAuthStore';
import { financeService, type FinanceGoal } from '../services/financeService';
import {
  storageService as localStorageService,
} from '../services/storageService';
import { type FinanceEntry } from '../lib/supabase';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Modal } from '../ui/Modal';
import { formatDate } from '../utils/dateUtils';

const DEFAULT_CATEGORIES = [
  'Comida',
  'Transporte',
  'Alquiler',
  'Educación',
  'Tecnología',
  'Salud',
  'Ocio',
  'Otros',
];

const GOAL_COLORS = ['#7c6af5', '#00f5c4', '#f472b6', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#ffffff'];

function getCurrentMonthRange(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}

function parseAmount(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function FinancePage() {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';

  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [goals, setGoals] = useState<FinanceGoal[]>([]);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState('');

  const categoriesKey = useMemo(() => `finance_categories_${userId}`, [userId]);

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalForm, setGoalForm] = useState({
    name: 'Ahorro',
    target: 1000,
    deadline: '',
    color: GOAL_COLORS[0],
  });

  const [showAddEntry, setShowAddEntry] = useState(false);
  const [entryForm, setEntryForm] = useState({
    type: 'ingreso' as 'ingreso' | 'gasto',
    amount: '0',
    category: DEFAULT_CATEGORIES[0],
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const refresh = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [e, g] = await Promise.all([
        financeService.getEntries(userId, 300),
        financeService.getGoals(userId),
      ]);
      setEntries(e);
      setGoals(g);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    const stored = localStorageService.get<string[]>(categoriesKey, DEFAULT_CATEGORIES);
    setCategories(stored.length ? stored : DEFAULT_CATEGORIES);
    refresh().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    localStorageService.set(categoriesKey, categories);
  }, [categories, categoriesKey, userId]);

  const stats = useMemo(() => financeService.calcStats(entries), [entries]);
  const activeGoal = goals[0] ?? null;

  const { start: monthStart, end: monthEnd } = useMemo(() => getCurrentMonthRange(), []);

  const currentMonthEntries = useMemo(() => {
    return entries
      .filter((e) => {
        const d = new Date(e.date);
        return d >= monthStart && d <= monthEnd;
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [entries, monthStart, monthEnd]);

  const monthBalance = stats.balance;
  const ratio = activeGoal ? (activeGoal.target > 0 ? activeGoal.saved / activeGoal.target : 0) : 0;
  const goalProgressColor = ratio >= 0.8 ? 'success' : ratio >= 0.4 ? 'primary' : 'warning';

  const chartData = stats.monthly.map((m) => ({
    mes: m.mes,
    ingresos: m.ingresos,
    gastos: m.gastos,
  }));

  const handleAddEntry = async () => {
    if (!userId) return;
    const amount = parseAmount(entryForm.amount);
    if (!amount || !entryForm.category.trim()) return;

    const created = await financeService.addEntry(userId, {
      type: entryForm.type,
      amount,
      category: entryForm.category.trim(),
      description: entryForm.description.trim() || '—',
      date: entryForm.date,
    });

    if (created) {
      setShowAddEntry(false);
      setEntryForm((f) => ({ ...f, amount: '0', description: '' }));
      await refresh();
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!userId) return;
    await financeService.deleteEntry(id);
    await refresh();
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    const c = newCategory.trim();
    if (categories.includes(c)) return;
    setCategories((prev) => [c, ...prev]);
    setNewCategory('');
  };

  const handleAddGoal = async () => {
    if (!userId) return;
    const target = parseAmount(String(goalForm.target));
    if (!target || !goalForm.name.trim()) return;
    const created = await financeService.addGoal(userId, {
      name: goalForm.name.trim(),
      target,
      saved: 0,
      deadline: goalForm.deadline ? goalForm.deadline : null,
      color: goalForm.color,
    });
    if (created) {
      setShowAddGoal(false);
      await refresh();
    }
  };

  const handleSumBalanceToGoal = async () => {
    if (!userId || !activeGoal) return;
    const added = Math.max(0, monthBalance);
    const newSaved = activeGoal.saved + added;
    await financeService.updateGoalSaved(activeGoal.id, newSaved);
    await refresh();
  };

  if (!userId) {
    return (
      <div className="p-6 animate-fade-in">
        <h1 className="text-xl font-bold text-white">Finanzas</h1>
        <p className="text-sm text-gray-500">Inicia sesión para guardar entradas y metas.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Financial Tracker</h1>
          <p className="text-sm text-gray-500">Ingresos/gastos, categorías, gráfica mensual y meta de ahorro</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowAddEntry(true)}>
            <Plus size={14} /> Entrada
          </Button>
          <Button size="sm" onClick={() => setShowAddGoal(true)}>
            <Plus size={14} /> Meta
          </Button>
        </div>
      </div>

      {/* Stats month */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Ingresos</p>
            <span className="text-xs text-gray-500">{formatDate(monthStart)}</span>
          </div>
          <div className="text-3xl font-bold text-white mt-2 tabular-nums">+{stats.ingresos.toFixed(2)}</div>
          <p className="text-xs text-gray-500 mt-1">Mes actual</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Gastos</p>
            <span className="text-xs text-gray-500">{formatDate(monthStart)}</span>
          </div>
          <div className="text-3xl font-bold text-white mt-2 tabular-nums">-{stats.gastos.toFixed(2)}</div>
          <p className="text-xs text-gray-500 mt-1">Mes actual</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Balance</p>
            <Wallet size={16} className="text-primary-300" />
          </div>
          <div className="text-3xl font-bold text-white mt-2 tabular-nums">{stats.balance.toFixed(2)}</div>
          <p className="text-xs text-gray-500 mt-1">{stats.balance >= 0 ? 'Ahorro neto' : 'Déficit neto'}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-primary-300" />
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Gráfica mes a mes</h2>
          </div>
          <span className="text-xs text-gray-500">Últimos 6 meses</span>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="mes" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(20,20,35,0.98)', border: '1px solid rgba(124,106,245,0.25)' }}
                formatter={(value: any, name: any) => [Number(value).toFixed(2), name]}
              />
              <Bar dataKey="ingresos" fill="rgba(0,245,196,0.65)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="gastos" fill="rgba(244,114,182,0.55)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Categories + Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Categorías</h2>
            <span className="text-xs text-gray-500">{stats.categories.length} en este mes</span>
          </div>

          <div className="flex gap-2 mt-3">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nueva categoría"
              className="flex-1 bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
            />
            <Button size="sm" variant="outline" onClick={handleAddCategory} disabled={!newCategory.trim()}>
              <Plus size={14} /> Add
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span key={c} className="text-[11px] px-2 py-1 rounded-xl border border-white/10 bg-white/5 text-gray-300">
                {c}
              </span>
            ))}
          </div>

          <div className="mt-5 border-t border-white/5 pt-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Gastos del mes</h3>
            {stats.categories.length === 0 ? (
              <p className="text-xs text-gray-500">Aún no hay gastos.</p>
            ) : (
              <div className="space-y-2">
                {stats.categories
                  .slice()
                  .sort((a, b) => b.amount - a.amount)
                  .map((c) => (
                    <div key={c.cat} className="flex items-center justify-between gap-3">
                      <span className="text-xs text-gray-300">{c.cat}</span>
                      <span className="text-xs font-mono text-rose-200">-{c.amount.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Entradas del mes</h2>
            <span className="text-xs text-gray-500">{currentMonthEntries.length} movimientos</span>
          </div>

          {currentMonthEntries.length === 0 ? (
            <p className="text-xs text-gray-500 mt-3">No hay entradas este mes.</p>
          ) : (
            <div className="space-y-2 mt-3">
              {currentMonthEntries.slice(0, 50).map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-dark-950/30 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {e.type === 'ingreso' ? 'Ingreso' : 'Gasto'} · {e.category}
                    </p>
                    <p className="text-xs text-gray-500">{e.date} · {e.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono px-2 py-1 rounded-lg border ${
                      e.type === 'ingreso' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/20 bg-rose-500/10 text-rose-300'
                    }`}>
                      {e.type === 'ingreso' ? '+' : '-'}{e.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteEntry(e.id)}
                      className="text-gray-600 hover:text-rose-300 transition-colors p-1 rounded-lg"
                      aria-label="Eliminar entrada"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Meta ahorro */}
          <div className="glass-card p-4 mt-5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Meta de ahorro</h3>
                <p className="text-xs text-gray-500">{activeGoal ? activeGoal.name : 'Sin metas activas'}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-xl border ${activeGoal ? 'border-primary-500/30 bg-primary-500/10 text-primary-200' : 'border-white/10 bg-white/5 text-gray-400'}`}>
                {activeGoal ? `${activeGoal.saved.toFixed(2)}/${activeGoal.target.toFixed(2)}` : '—'}
              </span>
            </div>

            {activeGoal ? (
              <>
                <ProgressBar
                  value={Math.min(activeGoal.saved, activeGoal.target)}
                  max={activeGoal.target}
                  showPercent={true}
                  size="sm"
                  color={goalProgressColor as any}
                  label="Progreso"
                />
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleSumBalanceToGoal}>
                    <Wallet size={14} /> Sumar balance del mes ({monthBalance >= 0 ? '+' : ''}{monthBalance.toFixed(2)})
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-500 mt-2">Crea una meta para empezar a acumular.</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      <Modal open={showAddEntry} onClose={() => setShowAddEntry(false)} title="Nueva entrada" size="sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
              <select
                value={entryForm.type}
                onChange={(e) => setEntryForm((f) => ({ ...f, type: e.target.value as 'ingreso' | 'gasto' }))}
                className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
              >
                <option value="ingreso">Ingreso</option>
                <option value="gasto">Gasto</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Fecha</label>
              <input
                type="date"
                value={entryForm.date}
                onChange={(e) => setEntryForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Monto</label>
            <input
              type="number"
              step="0.01"
              value={entryForm.amount}
              onChange={(e) => setEntryForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
            <select
              value={entryForm.category}
              onChange={(e) => setEntryForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Descripción</label>
            <textarea
              value={entryForm.description}
              onChange={(e) => setEntryForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
              rows={3}
              placeholder="Detalle (opcional)"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowAddEntry(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAddEntry} disabled={!entryForm.amount || Number(entryForm.amount) <= 0}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Goal Modal */}
      <Modal open={showAddGoal} onClose={() => setShowAddGoal(false)} title="Nueva meta de ahorro" size="sm">
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
            <input
              value={goalForm.name}
              onChange={(e) => setGoalForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Target (monto)</label>
            <input
              type="number"
              step="0.01"
              value={goalForm.target}
              onChange={(e) => setGoalForm((f) => ({ ...f, target: Number(e.target.value) }))}
              className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Deadline (opcional)</label>
            <input
              type="date"
              value={goalForm.deadline}
              onChange={(e) => setGoalForm((f) => ({ ...f, deadline: e.target.value }))}
              className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Color</label>
            <select
              value={goalForm.color}
              onChange={(e) => setGoalForm((f) => ({ ...f, color: e.target.value }))}
              className="w-full bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 outline-none"
            >
              {GOAL_COLORS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setShowAddGoal(false)}>Cancelar</Button>
            <Button size="sm" onClick={handleAddGoal} disabled={goalForm.target <= 0 || !goalForm.name.trim()}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>

      {loading && <div className="text-xs text-gray-500">Actualizando...</div>}
    </div>
  );
}

