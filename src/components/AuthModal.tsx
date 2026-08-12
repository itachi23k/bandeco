import React, { useState } from 'react';
import { X, Lock, Mail, Shield, AlertTriangle, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenAdmin }) => {
  const { currentUser, userProfile, isExpired, isAuthorized, licenseError, login, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setErrorMsg('Erro na autenticação: E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500 text-white font-bold flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">AUTENTICAÇÃO & LICENÇA</h2>
              <p className="text-xs text-slate-400">Acesso Restrito ao Sistema</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Logged In */}
        {currentUser ? (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-extrabold text-lg flex items-center justify-center mx-auto shadow-sm">
                {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3 className="text-base font-extrabold text-slate-900">{userProfile?.displayName || currentUser.email}</h3>
              <p className="text-xs text-slate-500">{currentUser.email}</p>

              <div className="flex items-center justify-center gap-2 pt-2">
                {userProfile && (
                  <span className="px-2.5 py-0.5 bg-slate-200 text-slate-800 text-[10px] font-extrabold rounded-full uppercase">
                    Função: {userProfile.role || 'operator'}
                  </span>
                )}

                <span
                  className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border ${
                    isAuthorized
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-red-100 text-red-800 border-red-300'
                  }`}
                >
                  {isAuthorized ? '✅ Licença Ativa' : '🔒 Sem Acesso'}
                </span>
              </div>

              {licenseError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl mt-2 text-left flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{licenseError}</span>
                </div>
              )}
            </div>

            {userProfile?.role === 'admin' && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdmin();
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-red-400 text-xs font-extrabold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Shield className="w-4 h-4 text-red-400" />
                <span>Painel do Administrador (Ajuste de Validade)</span>
              </button>
            )}

            <button
              onClick={() => logout()}
              className="w-full py-2.5 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Encerrar Sessão / Trocar Conta
            </button>
          </div>
        ) : (
          /* Login Form ONLY */
          <div className="p-6 space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed font-medium">
              🔒 O acesso ao aplicativo exige uma conta previamente cadastrada pelo administrador.
            </div>

            {(errorMsg || licenseError) && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 text-xs font-semibold rounded-xl flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg || licenseError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  E-mail Cadastrado
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="seu.email@terraplanagem.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{loading ? 'Verificando...' : 'Entrar na Conta'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

