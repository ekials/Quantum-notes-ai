import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './ui/Sidebar';
import { AuthGuard } from './components/Auth/AuthGuard';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChecklistPage } from './pages/ChecklistPage';
import { NotesPage } from './pages/NotesPage';
import { AIPage } from './pages/AIPage';
import { TrackingPage } from './pages/TrackingPage';
import { GamificationPage } from './pages/GamificationPage';
import { CalendarPage } from './pages/CalendarPage';
import { PomodoroPage } from './pages/PomodoroPage';
import { FinancePage } from './pages/FinancePage';
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';
import { useNotesStore } from './store/useNotesStore';
import { useChecklistStore } from './store/useChecklistStore';
import { useProfileStore } from './store/useProfileStore';

// Componente interno que carga datos cuando hay sesión activa
function AppContent() {
  const { user } = useAuthStore();
  const { loadFromSupabase: loadApp } = useAppStore();
  const { loadFromSupabase: loadNotes } = useNotesStore();
  const { loadFromSupabase: loadChecklist } = useChecklistStore();
  const { loadProfile } = useProfileStore();

  useEffect(() => {
    if (!user) return;
    // Bootstrap: cargar todos los stores al iniciar sesión
    const name = user.user_metadata?.full_name ?? user.email ?? 'Alice';
    loadProfile(user.id, name);
    loadApp(user.id);
    loadNotes(user.id);
    loadChecklist(user.id);
  }, [user, loadApp, loadNotes, loadChecklist, loadProfile]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-h-screen">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/gamification" element={<GamificationPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/pomodoro" element={<PomodoroPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const { initialize } = useAuthStore();

  // Inicializar listener de sesión Supabase al montar la app
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas protegidas */}
        <Route
          path="/*"
          element={
            <AuthGuard>
              <AppContent />
            </AuthGuard>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
