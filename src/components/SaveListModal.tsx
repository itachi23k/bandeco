import React, { useState } from 'react';
import { X, Utensils, Calendar, Clock, MapPin, FileText, CheckCircle2 } from 'lucide-react';
import { useMeal } from '../context/MealContext';
import { useAuth } from '../context/AuthContext';

interface SaveListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavedSuccess: () => void;
}

export const SaveListModal: React.FC<SaveListModalProps> = ({ isOpen, onClose, onSavedSuccess }) => {
  const { totalMarmitas, saveMealList, resetAllQuantities, currentQuantities } = useMeal();
  const { userProfile, isExpired } = useAuth();

  const todayStr = new Date().toISOString().slice(0, 10);

  const [title, setTitle] = useState(`Almoço Terraplanagem - ${todayStr}`);
  const [date, setDate] = useState(todayStr);
  const [shift, setShift] = useState<'Almoço' | 'Janta' | 'Lanche' | 'Ceia / Noturno'>('Almoço');
  const [location, setLocation] = useState('Frente de Lavra 01');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleShiftChange = (newShift: 'Almoço' | 'Janta' | 'Lanche' | 'Ceia / Noturno') => {
    setShift(newShift);
    setTitle(`${newShift} Terraplanagem - ${date}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (totalMarmitas === 0) return;

  setIsSubmitting(true);

  try {
    // Salva localmente e dispara sincronização em background
    const savedList = await saveMealList(title, date, shift, location, notes);
    
    // Limpa as quantidades
    resetAllQuantities();
    
    // Fecha o modal e abre o histórico
    onSavedSuccess();
    onClose();
    
    // Se estiver offline, mostra aviso rápido
    if (!navigator.onLine) {
      alert('Lista salva offline! Será sincronizada quando houver conexão.');
    }
  } catch (err) {
    alert('Erro ao salvar lista: ' + (err as Error).message);
  } finally {
    setIsSubmitting(false);
  }
};

  const itemsCount = Object.keys(currentQuantities).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">GRAVAR LISTA DE REFEIÇÕES</h2>
              <p className="text-xs text-slate-400">Gera histórico com suporte offline e Online</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Summary Callout */}
        <div className="bg-amber-50 p-4 border-b border-amber-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Marmitas Selecionadas</p>
            <p className="text-xs text-amber-900/80 mt-0.5">
              {itemsCount} pessoa{itemsCount !== 1 ? 's' : ''} na lista atual
            </p>
          </div>
          <div className="bg-amber-500 text-slate-950 px-4 py-1.5 rounded-2xl font-serif text-2xl font-extrabold shadow-sm">
            {totalMarmitas}
          </div>
        </div>

        {isExpired && (
          <div className="p-3 bg-red-100 text-red-900 border-b border-red-200 text-xs font-bold">
            ⚠️ Sua licença de uso expirou. Entre em contato com o administrador para revalidar.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Shift Selection Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Turno da Refeição
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Almoço', 'Janta', 'Lanche', 'Ceia / Noturno'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleShiftChange(s)}
                  className={`py-2 px-2 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                    shift === s
                      ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Título do Relatório
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Ex: Almoço Frente de Lavra 02"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Data
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTitle(`${shift} Terraplanagem - ${e.target.value}`);
                  }}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Frente / Canteiro
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex: Canteiro Central"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Observações Adicionais (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Ex: Entregar marmitas sem pimenta, 2 sucos extras..."
            ></textarea>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting || totalMarmitas === 0}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Gravando...' : 'Confirmar e Salvar Lista'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
