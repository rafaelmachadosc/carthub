import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';

const Google_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

declare global {
  interface Window {
    google?: any;
  }
}

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = async (response: any) => {
    try {
      const { token, user } = await authService.loginWithGoogle(response.credential);
      login(token, user);
      navigate('/');
    } catch (error: any) {
      console.error('Erro ao autenticar:', error);
      alert(error.response?.data?.error || 'Erro ao fazer login. Tente novamente.');
    }
  };

  useEffect(() => {
    if (!Google_CLIENT_ID) {
      console.error('Google Client ID não configurado');
      return;
    }

    // Aguardar o script do Google carregar (já está no index.html)
    const initializeGoogleSignIn = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: Google_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        if (buttonRef.current) {
          // Detectar tamanho da tela
          const isMobile = window.innerWidth < 640;
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: isMobile ? 'medium' : 'large',
            text: 'signin_with',
            width: isMobile ? 280 : 300,
          });
        }
      } else {
        // Tentar novamente após um delay
        setTimeout(initializeGoogleSignIn, 100);
      }
    };

    initializeGoogleSignIn();
  }, []);

  if (!Google_CLIENT_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center p-8">
          <h2 className="text-xl mb-2">Configuração necessária</h2>
          <p>Google Client ID não configurado.</p>
          <p className="text-sm mt-2">Configure VITE_GOOGLE_CLIENT_ID no arquivo .env</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Modal tecnológico */}
      <div className="relative bg-slate-800/90 backdrop-blur-xl p-5 sm:p-8 rounded-2xl shadow-2xl max-w-sm w-full mx-3 sm:mx-4 border border-purple-500/20">
        {/* Brilho superior */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
        
        {/* Conteúdo */}
        <div className="relative z-10">
          {/* Logo/Título */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 mb-2 sm:mb-3 shadow-lg shadow-purple-500/50">
              <span className="text-xl sm:text-2xl text-white">C</span>
            </div>
            <h1 className="text-xl sm:text-2xl text-white mb-1 tracking-tight">
              CartHub
            </h1>
            <p className="text-xs text-gray-400">
              Gerencie suas compras de forma inteligente
            </p>
          </div>

          {/* Botão Google */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <div ref={buttonRef} className="scale-[0.85] sm:scale-100"></div>
          </div>

          {/* Info adicional */}
          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-700/50">
            <p className="text-[10px] sm:text-xs text-center text-gray-500">
              Login seguro com Google
            </p>
          </div>
        </div>

        {/* Efeito de brilho nas bordas */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-purple-600/0 pointer-events-none"></div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 20px) scale(1.05);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

