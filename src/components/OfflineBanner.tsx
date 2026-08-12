import React from 'react';
import { WifiOff, CloudUpload, Lock, ShieldAlert } from 'lucide-react';
import { useMeal } from '../context/MealContext';
import { useAuth } from '../context/AuthContext';

export const OfflineBanner: React.FC<{ onOpenDrawer: () => void; onOpenAdmin: () => void }> = ({
  onOpenDrawer,
  onOpenAdmin
}) => {
  const { isOnline, mealLists, syncAllOfflineLists, syncing } = useMeal();
  const { isExpired, userProfile } = useAuth();

  const offlineDrafts = mealLists.filter((l) => l.status === 'draft').length;

  if (isOnline && !isExpired && offlineDrafts === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {/* Expired Validity Warning Banner */}
      {isExpired && (
        <div className="bg-red-600 text-white px-4 py-3 rounded-2xl shadow-md border border-red-500 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <Lock className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-extrabold">Atenção: Licença de Login Expirada ({userProfile?.validUntil})</p>
              <p className="text-red-100 text-xs">
                Sua validade de acesso expirou no Firestore. Entre em contato com o administrador para renovar o uso.
              </p>
            </div>
          </div>

          {userProfile?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1.5 bg-white text-red-900 font-extrabold text-xs rounded-xl shadow-xs hover:bg-red-50 shrink-0 cursor-pointer"
            >
              Renovar
            </button>
          )}
        </div>
      )}

      {/* Offline Mode Banner */}
      {!isOnline && (
        <div className="bg-slate-800 text-slate-200 px-4 py-2.5 rounded-2xl border border-slate-700 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Modo Offline Ativo.</strong> Suas listas estão sendo gravadas localmente no dispositivo.
            </span>
          </div>

          {offlineDrafts > 0 && (
            <span className="bg-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-amber-300">
              {offlineDrafts} pendente(s)
            </span>
          )}
        </div>
      )}

      {/* Pending Offline Drafts Banner when back Online */}
      {isOnline && offlineDrafts > 0 && (
        <div className="bg-emerald-900 text-emerald-100 px-4 py-2.5 rounded-2xl border border-emerald-700 flex items-center justify-between gap-3 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <CloudUpload className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
            <span>
              Você tem <strong>{offlineDrafts} lista(s) offline</strong> pendentes para sincronizar com o Firestore.
            </span>
          </div>

          <button
            onClick={() => syncAllOfflineLists()}
            disabled={syncing}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
          >
            {syncing ? 'Sincronizando...' : 'Enviar Agora'}
          </button>
        </div>
      )}
    </div>
  );
};
