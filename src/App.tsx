import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './ui/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ChecklistPage } from './pages/ChecklistPage';
import { NotesPage } from './pages/NotesPage';
import { AIPage } from './pages/AIPage';
import { TrackingPage } from './pages/TrackingPage';
import { GamificationPage } from './pages/GamificationPage';

export default function App() {
  return (
    <BrowserRouter>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
