// src/pages/LoginPage.tsx
// Pantalla de inicio de sesión con Google OAuth

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function LoginPage() {
  const { user, signInWithGoogle, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Si ya hay sesión activa → redirigir al dashboard
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)' }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #7c6af5 0%, transparent 70%)' }}
        />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00f5c4 0%, transparent 70%)' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #7c6af5 0%, transparent 70%)' }}
        />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'linear-gradient(#7c6af5 1px, transparent 1px), linear-gradient(90deg, #7c6af5 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(26, 26, 46, 0.8)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(124, 106, 245, 0.2)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(124, 106, 245, 0.05) inset',
          }}
        >
          {/* Logo */}
          <div className="mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'linear-gradient(135deg, #7c6af5, #5b4de0)',
                boxShadow: '0 8px 32px rgba(124, 106, 245, 0.4)',
              }}
            >
              <span className="text-4xl">⚡</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Quantum Notes AI</h1>
            <p className="text-sm" style={{ color: '#00f5c4' }}>
              UCSP → KAIST 2029
            </p>
          </div>

          {/* Tagline */}
          <div className="mb-8 p-4 rounded-xl"
            style={{ background: 'rgba(124, 106, 245, 0.08)', border: '1px solid rgba(124, 106, 245, 0.12)' }}
          >
            <p className="text-gray-400 text-sm leading-relaxed">
              Tu plataforma all-in-one para el journey hacia<br />
              <span className="text-white font-semibold">KAIST Master 2029</span>
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            id="btn-google-signin"
            onClick={signInWithGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: isLoading ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'white',
            }}
            onMouseEnter={e => {
              if (!isLoading) {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.25)';
              }
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)';
            }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-gray-500 border-t-white animate-spin" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                {/* Google SVG icon */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continuar con Google</span>
              </>
            )}
          </button>

          {/* Footer */}
          <p className="mt-6 text-xs text-gray-600">
            Al iniciar sesión aceptas que tus datos se guardan<br />
            de forma segura en Supabase con cifrado end-to-end.
          </p>
        </div>

        {/* Motivational quote */}
        <p className="text-center mt-6 text-sm text-gray-600 italic px-4">
          "Los que llegan a las top universities no son los más inteligentes.<br />
          Son los más <span className="text-gray-400">consistentes</span>."
        </p>
      </div>
    </div>
  );
}
