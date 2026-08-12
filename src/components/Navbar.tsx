import React from 'react';
import { HardHat, Folders, Users, ShieldAlert, LogIn, LogOut, Wifi, WifiOff, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMeal } from '../context/MealContext';

interface NavbarProps {
  onOpenDrawer: () => void;
  onOpenWorkersModal: () => void;
  onOpenAuthModal: () => void;
  onOpenAdminModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDrawer,
  onOpenWorkersModal,
  onOpenAuthModal,
  onOpenAdminModal
}) => {
  const { userProfile, currentUser, isExpired, logout } = useAuth();
  const { totalMarmitas, isOnline, mealLists } = useMeal();

  const draftCount = mealLists.filter((l) => l.status === 'draft').length;

  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Left Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-xs shrink-0">
            M
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-base sm:text-lg text-slate-900 leading-tight">
                Pedidos
              </span>
              <span className="bg-red-50 text-red-600 border border-red-100 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase hidden xs:inline-block">
                Obra
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider hidden sm:block">
              Gestão A-Z
            </p>
          </div>
        </div>

        {/* Center: Selected Counter Pill (hidden on very small screen if crowded) */}
        {totalMarmitas > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>{totalMarmitas} {totalMarmitas === 1 ? 'Marmita' : 'Marmitas'}</span>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Online/Offline Status Indicator */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-gray-100 text-gray-500 border-gray-200'
            }`}
            title={isOnline ? 'Sincronizado Firestore' : 'Modo Offline Ativo'}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]' : 'bg-gray-400'
              }`}
            />
            <span className="hidden md:inline">{isOnline ? 'Nuvem OK' : 'Offline'}</span>
          </div>

          {/* Workers Manager Trigger */}
          <button
            onClick={onOpenWorkersModal}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-slate-700 rounded-xl text-xs font-bold border border-gray-200 transition-all cursor-pointer shrink-0"
            title="Gerenciar nomes A-Z"
          >
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Nomes A-Z</span>
          </button>

          {/* Drawer Trigger */}
          <button
            onClick={onOpenDrawer}
            className="relative flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Folders className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden xs:inline">Listas</span>
            {draftCount > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center -mr-1">
                {draftCount}
              </span>
            )}
          </button>

          {/* User Auth / Profile Badge */}
          {currentUser ? (
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 shrink-0">
              <button
                onClick={userProfile?.role === 'admin' ? onOpenAdminModal : onOpenAuthModal}
                className="flex items-center gap-1 px-1.5 py-0.5 text-xs font-bold text-slate-700 hover:text-slate-900"
              >
                <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-extrabold flex items-center justify-center text-[10px]">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[70px] truncate hidden lg:inline text-[11px]">
                  {userProfile?.displayName || 'Usuário'}
                </span>

                {isExpired && (
                  <span className="bg-red-100 text-red-700 text-[9px] px-1 py-0.2 rounded font-bold">
                    <Lock className="w-2.5 h-2.5 inline" /> Expirado
                  </span>
                )}
              </button>

              <button
                onClick={() => logout()}
                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                title="Sair"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 text-slate-700 rounded-xl text-xs font-bold border border-gray-200 transition-all cursor-pointer shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xs:inline">Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
