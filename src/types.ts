export interface Worker {
  id: string;
  name: string;
  sector: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface MealItem {
  workerId?: string;
  workerName: string;
  sector?: string;
  quantity: number;
  notes?: string;
}

export interface MealList {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  shift: 'Almoço' | 'Janta' | 'Lanche' | 'Ceia / Noturno';
  worksiteLocation?: string;
  restaurant?: string; // ✅ Novo campo
  totalMarmitas: number;
  items: MealItem[];
  notes?: string;
  createdByName: string;
  createdByUid: string;
  status: 'sent' | 'draft';
  syncedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'operator';
  validUntil: string;
  createdAt: string;
}

export type SectorFilter = 'TODOS' | 'Operadores' | 'Motoristas' | 'Ajudantes' | 'Manutenção' | 'Engenharia / Encarregados';