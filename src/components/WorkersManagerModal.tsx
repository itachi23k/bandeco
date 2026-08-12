import React, { useState } from 'react';
import { X, Users, Search, Edit2, Check, UserPlus, Power } from 'lucide-react';
import { useMeal } from '../context/MealContext';

interface WorkersManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddModal: () => void;
}

export const WorkersManagerModal: React.FC<WorkersManagerModalProps> = ({
  isOpen,
  onClose,
  onOpenAddModal
}) => {
  const { workers, updateWorker, toggleWorkerActive } = useMeal();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSector, setEditSector] = useState('');

  if (!isOpen) return null;

  const sortedWorkers = [...workers].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const filtered = sortedWorkers.filter((w) =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (id: string, name: string, sector: string) => {
    setEditingId(id);
    setEditName(name);
    setEditSector(sector);
  };

  const saveEdit = async (id: string) => {
    await updateWorker(id, editName, editSector);
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">GESTÃO DE CONSUMIDORES A-Z</h2>
              <p className="text-xs text-slate-400">
                {workers.length} trabalhadores cadastrados no Sistema
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

        {/* Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou setor..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenAddModal();
            }}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Novo</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-100">
          {filtered.map((w) => {
            const isEditing = editingId === w.id;

            return (
              <div key={w.id} className="py-3 flex items-center justify-between gap-3">
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                    />
                    <select
                      value={editSector}
                      onChange={(e) => setEditSector(e.target.value)}
                      className="px-2 py-1.5 text-xs font-bold border border-slate-300 rounded-lg"
                    >
                      <option value="Operadores">Operadores</option>
                      <option value="Motoristas">Motoristas</option>
                      <option value="Ajudantes">Ajudantes</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Engenharia / Encarregados">Engenharia</option>
                    </select>
                    <button
                      onClick={() => saveEdit(w.id)}
                      className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${w.active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
                          {w.name}
                        </span>
                        {!w.active && (
                          <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">Inativo</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{w.sector}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(w.id, w.name, w.sector)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                        title="Editar consumidor"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => toggleWorkerActive(w.id)}
                        className={`p-1.5 rounded-lg transition-all ${
                          w.active
                            ? 'text-emerald-600 hover:bg-emerald-50'
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title={w.active ? 'Desativar consumidor' : 'Ativar consumidor'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
