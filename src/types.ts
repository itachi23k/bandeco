export interface Worker {
  id: string;
  name: string;
  sector: string; // e.g. "Operadores de Máquina", "Motoristas de Caçamba", "Ajudantes Geral", "Mecânica/Manutenção", "Engenharia/Geral"
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MealItem {
  workerId?: string;
  workerName: string;
  sector?: string;
  quantity: number; // usually 1, but can be higher if extra meals are picked up
  notes?: string;
}

export interface MealList {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  shift: 'Almoço' | 'Janta' | 'Lanche' | 'Ceia / Noturno';
  worksiteLocation?: string; // e.g., "Frente de Lavra 02", "Canteiro Central"
  totalMarmitas: number;
  items: MealItem[];
  notes?: string;
  createdByName: string;
  createdByUid: string;
  status: 'sent' | 'draft'; // 'sent' = synchronized with Firestore (green), 'draft' = offline only (gray)
  syncedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'operator';
  validUntil: string; // ISO date string YYYY-MM-DD or ISO timestamp
  createdAt: string;
}

export type SectorFilter = 'TODOS' | 'Operadores' | 'Motoristas' | 'Ajudantes' | 'Manutenção' | 'Engenharia / Encarregados';
