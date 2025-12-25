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
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: 300,
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
          <h2 className="text-xl font-bold mb-2">Configuração necessária</h2>
          <p>Google Client ID não configurado.</p>
          <p className="text-sm mt-2">Configure VITE_GOOGLE_CLIENT_ID no arquivo .env</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">CartHub</h1>
          <p className="text-gray-600">Gerencie suas compras de forma simples</p>
        </div>

        <div className="flex justify-center">
          <div ref={buttonRef}></div>
        </div>
      </div>
    </div>
  );
};

