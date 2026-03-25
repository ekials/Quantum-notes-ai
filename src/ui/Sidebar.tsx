import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, FileText, Bot,
  TrendingUp, Trophy, Atom, ChevronRight, LogOut,
  CalendarDays, Timer, Wallet,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { getLevelTitle } from '../utils/progressUtils';

const NAV = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/checklist', label: 'Checklist', icon: CheckSquare },
  { path: '/notes', label: 'Notas', icon: FileText },
  { path: '/ai', label: 'Quantum AI', icon: Bot },
  { path: '/tracking', label: 'Progreso', icon: TrendingUp },
  { path: '/gamification', label: 'Logros', icon: Trophy },
  { path: '/calendar', label: 'Calendario', icon: CalendarDays },
  { path: '/pomodoro', label: 'Pomodoro', icon: Timer },
  { path: '/finance', label: 'Finanzas', icon: Wallet },
];

export function Sidebar() {
  const { level, xp, levelProgress, streak } = useAppStore();
  const { signOut, user } = useAuthStore();
  const navigate = useNavigate();
  const title = getLevelTitle(level);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="w-60 min-h-screen flex flex-col bg-dark-950/80 backdrop-blur border-r border-white/5">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-900/40">
            <Atom size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold gradient-text leading-tight">Quantum Notes</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">AI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {NAV.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-l-lg text-sm font-medium
               transition-all duration-150 group relative
               ${isActive
                ? 'nav-active'
                : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-300'} />
                <span>{label}</span>
                {isActive && <ChevronRight size={12} className="ml-auto text-primary-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Stats */}
      <div className="p-3 border-t border-white/5">
        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center gap-2 px-2 py-1.5 mb-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-sm">🔥</span>
            <span className="text-xs text-amber-300 font-medium">{streak} días de racha</span>
          </div>
        )}

        {/* Level & XP */}
        <div className="px-1">
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <span className="text-xs font-bold text-primary-300">Nv. {level}</span>
              <span className="text-[10px] text-gray-500 ml-1.5">{title}</span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">{xp} XP</span>
          </div>
          <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-600 to-accent-500 rounded-full transition-all duration-700"
              style={{ width: `${levelProgress}%` }}
            />
          </div>
        </div>

        {/* Target */}
        <div className="mt-3 px-2 py-2 rounded-lg bg-primary-500/5 border border-primary-500/10">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Objetivo</p>
          <p className="text-xs text-primary-300 font-semibold mt-0.5">KAIST 2029 🇰🇷</p>
        </div>

        {/* User + Sign Out */}
        {user && (
          <div className="mt-3 flex items-center gap-2">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                className="w-7 h-7 rounded-full border border-primary-500/30"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-400 truncate">
                {user.user_metadata?.full_name ?? user.email}
              </p>
            </div>
            <button
              id="btn-signout"
              onClick={handleSignOut}
              title="Cerrar sesión"
              className="text-gray-600 hover:text-red-400 transition-colors p-1"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
