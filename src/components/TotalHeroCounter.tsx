import React from 'react';
import { Utensils, RotateCcw, CheckCheck, Users, HardHat } from 'lucide-react';
import { useMeal } from '../context/MealContext';

interface TotalHeroCounterProps {
  onSaveClick: () => void;
  onOpenAddWorker: () => void;
}

export const TotalHeroCounter: React.FC<TotalHeroCounterProps> = ({ onSaveClick, onOpenAddWorker }) => {
  const { 
    totalMarmitas, 
    resetAllQuantities, 
    setAllQuantitiesToOne, 
    setSectorQuantitiesToOne,
    currentQuantities 
  } = useMeal();

  const selectedWorkersCount = Object.keys(currentQuantities).length;

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-xs mb-5 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Capitulated Vibrant Total Counter */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center bg-red-50 text-red-600 border border-red-200 rounded-2xl px-4 py-2 min-w-[84px] shadow-xs shrink-0">
            <span className="text-[10px] font-black uppercase text-red-500 tracking-wider">Total</span>
            <span className="text-4xl sm:text-5xl font-black tracking-tighter leading-none font-serif drop-shadow-xs">
              {totalMarmitas}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                Resumo do Pedido
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {selectedWorkersCount} {selectedWorkersCount === 1 ? 'pessoa' : 'pessoas'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              REFEIÇÕES TRECHO
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Selecione as quantidades abaixo na lista A-Z.
            </p>
          </div>
        </div>

        {/* Right Actions Block */}
        <div className="flex items-center justify-between md:justify-end gap-2 flex-wrap pt-2 md:pt-0 border-t border-gray-100 md:border-t-0">
          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-200">
            <button
              onClick={setAllQuantitiesToOne}
              className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-slate-700 rounded-lg text-xs font-bold border border-gray-200 transition-all cursor-pointer flex items-center gap-1"
              title="Marcar 1 marmita para todos"
            >
              <CheckCheck className="w-3.5 h-3.5 text-slate-500" />
              <span>Todos 1x</span>
            </button>

            <button
              onClick={() => setSectorQuantitiesToOne('Operadores')}
              className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-slate-700 rounded-lg text-xs font-bold border border-gray-200 transition-all cursor-pointer flex items-center gap-1"
              title="Marcar 1x apenas para Operadores"
            >
              <HardHat className="w-3.5 h-3.5 text-slate-500" />
              <span>Op. 1x</span>
            </button>

            {totalMarmitas > 0 && (
              <button
                onClick={resetAllQuantities}
                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold border border-red-200 transition-all cursor-pointer"
                title="Zerar todas as quantidades"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Primary Save CTA */}
          <button
            onClick={onSaveClick}
            disabled={totalMarmitas === 0}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer ${
              totalMarmitas > 0
                ? 'bg-slate-900 hover:bg-black text-white active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-red-400" />
            <span>GRAVAR REFEIÇÕES ({totalMarmitas})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
