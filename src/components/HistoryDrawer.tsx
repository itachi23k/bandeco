import React from 'react';
import { 
  X, 
  FileText, 
  MessageSquare, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Eye, 
  FolderOpen,
  Store
} from 'lucide-react';
import { useMeal } from '../context/MealContext';
import { MealList } from '../types';
import { generateMealListPDF } from '../utils/pdfGenerator';
import { shareMealListWhatsApp } from '../utils/whatsappShare';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMealList: (list: MealList) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectMealList
}) => {
  const { 
    mealLists,
    deleteMealList
  } = useMeal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">HISTÓRICO DE LISTAS</h2>
              <p className="text-xs text-slate-400">
                Suas listas de refeições
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Items Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {mealLists.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-bold text-slate-600">Nenhuma lista encontrada</p>
              <p className="text-xs text-slate-400 mt-1">
                Grave a primeira lista de refeições para visualizá-la no histórico.
              </p>
            </div>
          ) : (
            mealLists.map((list) => {
              const isSynced = list.status === 'sent';

              return (
                <div
                  key={list.id}
                  className={`p-4 rounded-2xl border-2 transition-all shadow-2xs ${
                    isSynced
                      ? 'bg-white border-emerald-500'
                      : 'bg-white border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                            isSynced
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {isSynced ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Sincronizado na Nuvem</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>Local / Salvo Offline</span>
                            </>
                          )}
                        </span>

                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {list.shift}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm text-slate-900 tracking-tight leading-snug">
                        {list.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {list.date} • Resp: {list.createdByName}
                      </p>
                      {list.restaurant && (
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Store className="w-3 h-3 text-slate-400" />
                          {list.restaurant}
                        </p>
                      )}
                    </div>

                    {/* Total Marmitas Badge */}
                    <div className="bg-slate-900 text-white rounded-xl px-3 py-1 text-center shrink-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Total</span>
                      <span className="text-base font-black font-serif leading-none">{list.totalMarmitas}</span>
                    </div>
                  </div>

                  {/* Card Actions Toolbar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => onSelectMealList(list)}
                        className="px-2.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer text-xs"
                        title="Ver detalhes da lista"
                      >
                        <Eye className="w-3.5 h-3.5 text-red-400" />
                        <span>Ver</span>
                      </button>

                      <button
                        onClick={async () => await generateMealListPDF(list)}
                        className="px-2.5 py-1.5 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer text-xs"
                        title="Baixar Relatório PDF"
                      >
                        <FileText className="w-3.5 h-3.5 text-red-600" />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={() => shareMealListWhatsApp(list)}
                        className="px-2.5 py-1.5 bg-emerald-100 text-emerald-900 hover:bg-emerald-200 rounded-lg font-semibold flex items-center gap-1 transition-all cursor-pointer text-xs"
                        title="Compartilhar via WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente excluir a lista "${list.title}"?`)) {
                          deleteMealList(list.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                      title="Excluir Lista"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-300 font-bold">
            Total Registrado: {mealLists.length} lista(s)
          </p>
          <span className="text-[10px] text-emerald-400 font-medium">
            ⚡ Sincronização em segundo plano ativada
          </span>
        </div>
      </div>
    </div>
  );
};