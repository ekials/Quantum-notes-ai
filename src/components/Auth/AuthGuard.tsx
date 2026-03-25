// src/components/Auth/AuthGuard.tsx
// Protege todas las rutas privadas — redirige a /login si no hay sesión

import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isInitialized } = useAuthStore();

  // Mientras se verifica la sesión inicial → mostrar loader
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a0a0f' }}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: 'linear-gradient(135deg, #7c6af5, #5b4de0)',
              boxShadow: '0 8px 32px rgba(124, 106, 245, 0.4)',
            }}
          >
            <span className="text-3xl">⚡</span>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-purple-800 border-t-purple-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Sin sesión → redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
