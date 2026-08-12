import React, { useState } from 'react';
import { X, Shield, Calendar, Clock, CheckCircle2, Lock, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, isExpired, updateUserValidity } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>(
    userProfile?.validUntil || '2027-12-31'
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSaveValidity = async (dateValue: string) => {
    if (!userProfile?.uid) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      await updateUserValidity(userProfile.uid, dateValue);
      setFeedback(`Validade do login atualizada com sucesso para ${dateValue} no Firestore!`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      alert('Erro ao atualizar validade no Firestore: ' + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreset = (presetType: 'expired' | '1month' | '1year' | 'default') => {
    const now = new Date();
    let targetStr = '2027-12-31';

    if (presetType === 'expired') {
      const past = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      targetStr = past.toISOString().slice(0, 10);
    } else if (presetType === '1month') {
      const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      targetStr = future.toISOString().slice(0, 10);
    } else if (presetType === '1year') {
      const future = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
      targetStr = future.toISOString().slice(0, 10);
    }

    setSelectedDate(targetStr);
    handleSaveValidity(targetStr);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">PAINEL ADMINISTRATIVO</h2>
              <p className="text-xs text-slate-400">Ajuste de Validade de Acesso no Firestore</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Active Status Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Usuário Atual</span>
              <span
                className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full border ${
                  isExpired
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {isExpired ? '🔒 Acesso Expirado' : '✅ Válido e Ativo'}
              </span>
            </div>

            <p className="text-sm font-extrabold text-slate-900">{userProfile?.displayName}</p>
            <p className="text-xs text-slate-500">{userProfile?.email}</p>

            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Validade Firestore:</span>
              <span className="font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                {userProfile?.validUntil || selectedDate}
              </span>
            </div>
          </div>

          {feedback && (
            <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          )}

          {/* Adjust Validity Date Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Ajustar Data de Validade do Login
            </label>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <button
                onClick={() => handleSaveValidity(selectedDate)}
                disabled={isSaving}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {isSaving ? 'Gravando...' : 'Salvar no Firestore'}
              </button>
            </div>

            {/* Quick Presets */}
            <div className="pt-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Atalhos Rápidos de Validade
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handlePreset('1month')}
                  className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl border border-slate-200 text-[11px]"
                >
                  + 1 Mês
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('1year')}
                  className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl border border-slate-200 text-[11px]"
                >
                  + 1 Ano
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('default')}
                  className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl border border-slate-200 text-[11px]"
                >
                  Dez/2027
                </button>
                <button
                  type="button"
                  onClick={() => handlePreset('expired')}
                  className="py-2 px-2 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl border border-red-200 text-[11px]"
                  title="Simula o estado expirado para testes"
                >
                  Expirar Agora
                </button>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Regra de Licenciamento em Tempo Real
            </p>
            <p className="text-amber-800/90 text-[11px] leading-relaxed">
              As alterações na validade são propagadas em tempo real via listener do Firestore (`users/{'{uid}'}`). Se a data for anterior à data atual, o sistema bloqueia novas gravações até que a validade seja renovada.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
