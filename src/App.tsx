import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MealProvider } from './context/MealContext';
import { Navbar } from './components/Navbar';
import { TotalHeroCounter } from './components/TotalHeroCounter';
import { IFoodWorkerList } from './components/IFoodWorkerList';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ListDetailModal } from './components/ListDetailModal';
import { SaveListModal } from './components/SaveListModal';
import { AddWorkerModal } from './components/AddWorkerModal';
import { WorkersManagerModal } from './components/WorkersManagerModal';
import { AuthModal } from './components/AuthModal';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { OfflineBanner } from './components/OfflineBanner';
import { MealList } from './types';
import { HardHat, Lock, ShieldAlert, LogIn, RefreshCw, KeyRound } from 'lucide-react';

function MainAppContent() {
  const { currentUser, isAuthorized, loading, licenseError, logout } = useAuth();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isAddWorkerModalOpen, setIsAddWorkerModalOpen] = useState(false);
  const [isWorkersManagerOpen, setIsWorkersManagerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedMealList, setSelectedMealList] = useState<MealList | null>(null);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-extrabold tracking-tight">Verificando Licença de Acesso...</h2>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Consultando a coleção de usuários autorizados no servidor Firestore.
        </p>
      </div>
    );
  }

  // 2. Strict License Lockout Guard
  if (!currentUser || !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between items-center p-4 sm:p-8">
        <div className="w-full max-w-md mx-auto my-auto space-y-6 text-center">
          <div className="w-20 h-20 bg-red-500/20 border-2 border-red-500 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
            <Lock className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-red-950 text-red-400 border border-red-800 rounded-full text-xs font-extrabold uppercase tracking-wider">
              Trava de Segurança & Licença
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Aplicativo Indisponível
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              {licenseError || 'O acesso a este aplicativo exige que o usuário esteja logado com uma conta previamente autorizada e cadastrada na coleção Firestore do administrador.'}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-3xl space-y-4 text-left shadow-xl">
            <div className="flex items-center gap-3">
              <KeyRound className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-white">Verificação de Licença em Tempo Real</p>
                <p className="text-[11px] text-slate-400">Entre com seu e-mail e senha cadastrados para liberar o lançamento de refeições.</p>
              </div>
            </div>

            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="w-full py-3.5 bg-red-500 hover:bg-red-600 active:scale-95 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{currentUser ? 'Verificar Licença / Trocar Conta' : 'Acessar com E-mail Cadastrado'}</span>
            </button>

            {currentUser && (
              <button
                onClick={() => logout()}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition-all cursor-pointer"
              >
                Encerrar Sessão Atual
              </button>
            )}
          </div>
        </div>

        {/* Lockout Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onOpenAdmin={() => setIsAdminModalOpen(false)}
        />

        <footer className="text-slate-600 text-[11px] text-center pt-6">
          Controle de Refeições Terraplanagem • 
        </footer>
      </div>
    );
  }

  // 3. Main Authorized Application Content
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-800 font-sans flex flex-col antialiased">
      {/* Navigation Top Bar */}
      <Navbar
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenWorkersModal={() => setIsWorkersManagerOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 space-y-4">
        {/* Banner for Offline & Expiration Alerts */}
        <OfflineBanner
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
        />

        {/* Hero Counter Header */}
        <TotalHeroCounter
          onSaveClick={() => setIsSaveModalOpen(true)}
          onOpenAddWorker={() => setIsAddWorkerModalOpen(true)}
        />

        {/* iFood-Style A-Z Workers List */}
        <IFoodWorkerList
          onOpenAddWorkerModal={() => setIsAddWorkerModalOpen(true)}
          onSaveClick={() => setIsSaveModalOpen(true)}
        />
      </main>

      {/* Modals & Slide-out Drawers */}
      <HistoryDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectMealList={(list) => setSelectedMealList(list)}
      />

      <ListDetailModal
        list={selectedMealList}
        onClose={() => setSelectedMealList(null)}
      />

      <SaveListModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSavedSuccess={() => setIsDrawerOpen(true)}
      />

      <AddWorkerModal
        isOpen={isAddWorkerModalOpen}
        onClose={() => setIsAddWorkerModalOpen(false)}
      />

      <WorkersManagerModal
        isOpen={isWorkersManagerOpen}
        onClose={() => setIsWorkersManagerOpen(false)}
        onOpenAddModal={() => setIsAddWorkerModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
      />

      <AdminSettingsModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 border-t border-slate-800 mt-12 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <HardHat className="w-4 h-4 text-red-500" />
            <span>Controle de Marmitas Terraplanagem</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
              A-Z • Firestore Auto-Sync
            </span>
          </div>

          <p className="text-slate-500 text-[11px] text-center sm:text-right">
            Sincronização automática via Firestore com relatórios PDF enxutos e envio via WhatsApp.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MealProvider>
        <MainAppContent />
      </MealProvider>
    </AuthProvider>
  );
}

