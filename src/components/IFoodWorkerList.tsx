import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, X, UserPlus, Filter, Check, HardHat, Truck, Wrench, Shield, Users, ArrowRight } from 'lucide-react';
import { useMeal } from '../context/MealContext';
import { SectorFilter } from '../types';

interface IFoodWorkerListProps {
  onOpenAddWorkerModal: () => void;
  onSaveClick?: () => void;
}

const SECTORS: SectorFilter[] = [
  'TODOS',
  'Operadores',
  'Motoristas',
  'Ajudantes',
  'Manutenção',
  'Engenharia / Encarregados'
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const IFoodWorkerList: React.FC<IFoodWorkerListProps> = ({ onOpenAddWorkerModal, onSaveClick }) => {
  const { workers, currentQuantities, updateQuantity, setQuantity, totalMarmitas } = useMeal();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState<SectorFilter>('TODOS');
  const [selectedLetter, setSelectedLetter] = useState<string>('TODOS');
  const [onlySelected, setOnlySelected] = useState<boolean>(false);

  // Filter workers based on search, sector, letter, active status
  const filteredWorkers = useMemo(() => {
    return workers
      .filter((worker) => worker.active)
      .filter((worker) => {
        // Sector filter
        if (selectedSector !== 'TODOS' && worker.sector !== selectedSector) {
          return false;
        }
        // Letter filter
        if (selectedLetter !== 'TODOS') {
          const firstChar = worker.name.trim().charAt(0).toUpperCase();
          if (firstChar !== selectedLetter) return false;
        }
        // Search term
        if (searchTerm.trim() !== '') {
          const term = searchTerm.toLowerCase();
          const nameMatch = worker.name.toLowerCase().includes(term);
          const sectorMatch = worker.sector.toLowerCase().includes(term);
          if (!nameMatch && !sectorMatch) return false;
        }
        // Only selected filter
        if (onlySelected) {
          const qty = currentQuantities[worker.name] || 0;
          if (qty <= 0) return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [workers, selectedSector, selectedLetter, searchTerm, onlySelected, currentQuantities]);

  const getSectorIcon = (sector: string) => {
    switch (sector) {
      case 'Operadores':
        return <HardHat className="w-3 h-3 text-slate-500" />;
      case 'Motoristas':
        return <Truck className="w-3 h-3 text-slate-500" />;
      case 'Manutenção':
        return <Wrench className="w-3 h-3 text-slate-500" />;
      case 'Engenharia / Encarregados':
        return <Shield className="w-3 h-3 text-slate-500" />;
      default:
        return <Users className="w-3 h-3 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden relative mb-12">
      {/* Header Controls Bar */}
      <div className="p-3 sm:p-4 border-b border-[#E5E7EB] bg-[#F9FAFB] space-y-3">
        {/* Search Bar & Primary Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar colaborador A-Z..."
              className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-gray-200 text-xs font-medium text-slate-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setOnlySelected(!onlySelected)}
            className={`px-2.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
              onlySelected
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
            title="Mostrar apenas colaboradores com refeição selecionada"
          >
            <Check className={`w-3.5 h-3.5 ${onlySelected ? 'text-red-600' : 'text-gray-400'}`} />
            <span className="hidden sm:inline">Selecionados</span>
          </button>

          <button
            onClick={onOpenAddWorkerModal}
            className="flex items-center gap-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">+ Nome</span>
          </button>
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {SECTORS.map((sector) => {
            const isSelected = selectedSector === sector;
            return (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {sector !== 'TODOS' && getSectorIcon(sector)}
                <span>{sector}</span>
              </button>
            );
          })}
        </div>

        {/* Alphabet A-Z Quick Jump Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pt-1 scrollbar-none border-t border-gray-200/60">
          <button
            onClick={() => setSelectedLetter('TODOS')}
            className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-all ${
              selectedLetter === 'TODOS'
                ? 'bg-red-500 text-white'
                : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            A-Z
          </button>
          {ALPHABET.map((letter) => {
            const isSelected = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(letter)}
                className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center transition-all shrink-0 ${
                  isSelected
                    ? 'bg-red-500 text-white font-black'
                    : 'text-gray-500 hover:bg-gray-200'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workers Filter Summary */}
      <div className="px-4 py-1.5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-semibold">
        <span>{filteredWorkers.length} colaborador(es) na lista</span>
        {(selectedLetter !== 'TODOS' || selectedSector !== 'TODOS' || searchTerm || onlySelected) && (
          <button
            onClick={() => {
              setSelectedLetter('TODOS');
              setSelectedSector('TODOS');
              setSearchTerm('');
              setOnlySelected(false);
            }}
            className="text-red-600 hover:underline font-bold"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* List Body - Lean Item Card Layout */}
      <div className="divide-y divide-gray-100 max-h-[580px] overflow-y-auto">
        {filteredWorkers.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Nenhum consumidor encontrado</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Ajuste o filtro A-Z ou cadastre um novo trabalhador.</p>
            <button
              onClick={onOpenAddWorkerModal}
              className="mt-3 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-all inline-flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Cadastrar Consumidor</span>
            </button>
          </div>
        ) : (
          filteredWorkers.map((worker) => {
            const qty = currentQuantities[worker.name] || 0;
            const isSelected = qty > 0;

            return (
              <div
                key={worker.id || worker.name}
                className={`px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2 transition-colors ${
                  isSelected ? 'bg-red-50/50' : 'hover:bg-gray-50/80'
                }`}
              >
                {/* Left: Avatar Initial & Name Details */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}
                  >
                    {worker.name.trim().charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h3 className={`text-xs sm:text-sm font-bold truncate ${isSelected ? 'text-slate-900 font-extrabold' : 'text-slate-700'}`}>
                      {worker.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-gray-500 font-medium truncate">
                        {worker.sector}
                      </span>
                      {isSelected && (
                        <span className="text-[9px] font-black text-red-600 bg-red-100 px-1.5 py-0.2 rounded-full uppercase">
                          {qty}x
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Quantity Controller (- QTY +) */}
                <div className="flex items-center gap-1 shrink-0 bg-gray-100 p-0.5 rounded-xl border border-gray-200">
                  <button
                    onClick={() => updateQuantity(worker.name, -1)}
                    disabled={qty === 0}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      qty > 0
                        ? 'bg-white hover:bg-gray-200 text-slate-800 shadow-2xs active:scale-90 cursor-pointer'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                    title="Diminuir"
                  >
                    <Minus className="w-3 h-3 stroke-[2.5]" />
                  </button>

                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={qty}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setQuantity(worker.name, Math.max(0, val));
                    }}
                    className={`w-8 h-7 text-center text-xs font-black bg-transparent focus:outline-none focus:bg-white rounded-lg transition-all ${
                      qty > 0 ? 'text-red-600 font-serif text-sm' : 'text-gray-400'
                    }`}
                  />

                  <button
                    onClick={() => updateQuantity(worker.name, 1)}
                    className="w-7 h-7 rounded-lg bg-red-500 hover:bg-red-600 active:scale-90 text-white font-extrabold flex items-center justify-center shadow-2xs transition-all cursor-pointer"
                    title="Aumentar"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Bar for Mobile - Instant Access to Save List */}
      {totalMarmitas > 0 && onSaveClick && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={onSaveClick}
            className="w-full bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 flex items-center justify-between active:scale-98 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-red-500 text-white font-black text-xs flex items-center justify-center">
                {totalMarmitas}
              </span>
              <span className="text-xs font-bold text-slate-200">Refeições Selecionadas</span>
            </div>

            <div className="flex items-center gap-1 text-xs font-black text-red-400">
              <span>GRAVAR AGORA</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
