import React from 'react';
import { X, FileText, MessageSquare, Download, CloudUpload, CheckCircle2, Clock, Calendar, Clock3, MapPin, User, HardHat, Utensils } from 'lucide-react';
import { MealList } from '../types';
import { generateMealListPDF } from '../utils/pdfGenerator';
import { shareMealListWhatsApp } from '../utils/whatsappShare';
import { exportMealListJSON } from '../utils/jsonExporter';
import { useMeal } from '../context/MealContext';

interface ListDetailModalProps {
  list: MealList | null;
  onClose: () => void;
}

export const ListDetailModal: React.FC<ListDetailModalProps> = ({ list, onClose }) => {
  const { syncListToFirestore, isOnline, syncing } = useMeal();

  if (!list) return null;

  const activeItems = list.items
    .filter(i => i.quantity > 0)
    .sort((a, b) => a.workerName.localeCompare(b.workerName, 'pt-BR'));

  const isSynced = list.status === 'sent';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase border ${
                  isSynced
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {isSynced ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enviado ao Sistema</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Apenas Offline</span>
                  </>
                )}
              </span>

              <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {list.shift}
              </span>
            </div>

            <h2 className="text-xl font-extrabold text-white tracking-tight">
              {list.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Banner */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Data</p>
              <p className="font-bold text-slate-800">{list.date}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Local / Frente</p>
              <p className="font-bold text-slate-800 truncate">{list.worksiteLocation || 'Canteiro'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Responsável</p>
              <p className="font-bold text-slate-800 truncate">{list.createdByName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <p className="text-slate-400 font-medium">Total Marmitas</p>
              <p className="font-extrabold text-amber-600 text-base font-serif">{list.totalMarmitas}</p>
            </div>
          </div>
        </div>

        {/* Workers Consuming List (A-Z Table) */}
        <div className="p-5 max-h-[380px] overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs uppercase tracking-wider font-extrabold text-slate-500">
              Consumidores de Refeições (A-Z) - {activeItems.length} Pessoas
            </h3>
            <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Total: {list.totalMarmitas} marmitas
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
            {activeItems.map((item, index) => (
              <div key={index} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-bold text-slate-400 w-6 text-center shrink-0">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{item.workerName}</p>
                    {item.sector && (
                      <p className="text-[11px] text-slate-500 font-medium">{item.sector}</p>
                    )}
                  </div>
                </div>

                <div className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-sm px-3 py-1 rounded-xl font-serif">
                  {item.quantity}x
                </div>
              </div>
            ))}
          </div>

          {list.notes && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-700 mb-0.5">Observações:</p>
              <p className="text-xs text-slate-600">{list.notes}</p>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                isSynced
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}
            >
              {isSynced ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sincronizado Automaticamente</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Sincronizando com o Banco de dados...</span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => shareMealListWhatsApp(list)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={async () => await generateMealListPDF(list)}
              className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-red-400" />
              <span>Gerar PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
