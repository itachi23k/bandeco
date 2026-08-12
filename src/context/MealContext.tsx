import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  deleteDoc, 
  query, 
  orderBy, 
  writeBatch 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Worker, MealList, MealItem } from '../types';
import { INITIAL_WORKERS } from '../data/defaultWorkers';
import { useAuth } from './AuthContext';

interface MealContextType {
  workers: Worker[];
  currentQuantities: Record<string, number>;
  mealLists: MealList[];
  totalMarmitas: number;
  isOnline: boolean;
  syncing: boolean;
  
  // Counter Actions
  updateQuantity: (workerName: string, delta: number) => void;
  setQuantity: (workerName: string, qty: number) => void;
  resetAllQuantities: () => void;
  setAllQuantitiesToOne: () => void;
  setSectorQuantitiesToOne: (sectorName: string) => void;
  repeatLastMealListSelections: () => void;
  
  // Worker Management
  addWorker: (name: string, sector: string) => Promise<void>;
  updateWorker: (id: string, name: string, sector: string) => Promise<void>;
  toggleWorkerActive: (id: string) => Promise<void>;
  
  // List History Actions
  saveMealList: (
    title: string, 
    date: string, 
    shift: 'Almoço' | 'Janta' | 'Lanche' | 'Ceia / Noturno', 
    worksiteLocation?: string, 
    notes?: string
  ) => Promise<MealList>;
  syncListToFirestore: (list: MealList) => Promise<boolean>;
  deleteMealList: (id: string) => Promise<void>;
  importMealLists: (lists: MealList[]) => void;
  syncAllOfflineLists: () => Promise<number>;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

const LOCAL_WORKERS_KEY = 'marmitas_workers_v1';
const LOCAL_LISTS_KEY = 'marmitas_lists_v1';

export const MealProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, currentUser } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [syncing, setSyncing] = useState<boolean>(false);

  // Registered Workers
  const [workers, setWorkers] = useState<Worker[]>(() => {
    const saved = localStorage.getItem(LOCAL_WORKERS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_WORKERS;
      }
    }
    return INITIAL_WORKERS;
  });

  // Current meal counters (WorkerName -> Quantity)
  const [currentQuantities, setCurrentQuantities] = useState<Record<string, number>>({});

  // History of Meal Lists (TODAS as listas, sem filtro)
  const [allMealLists, setAllMealLists] = useState<MealList[]>(() => {
    const saved = localStorage.getItem(LOCAL_LISTS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Online / Offline Detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save workers to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_WORKERS_KEY, JSON.stringify(workers));
  }, [workers]);

  // Save ALL meal lists to LocalStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_LISTS_KEY, JSON.stringify(allMealLists));
  }, [allMealLists]);

  // Real-time Firestore sync for Workers collection
  useEffect(() => {
    if (!currentUser) return;

    const workersCol = collection(db, 'workers');
    const unsub = onSnapshot(workersCol, (snapshot) => {
      if (!snapshot.empty) {
        const firestoreWorkers: Worker[] = [];
        snapshot.forEach((docSnap) => {
          firestoreWorkers.push({ id: docSnap.id, ...docSnap.data() } as Worker);
        });

        // Merge Firestore workers with local
        setWorkers((prev) => {
          const mergedMap = new Map<string, Worker>();
          // Put Firestore items first
          firestoreWorkers.forEach(w => mergedMap.set(w.name.toLowerCase().trim(), w));
          // Add local items if missing
          prev.forEach(w => {
            const key = w.name.toLowerCase().trim();
            if (!mergedMap.has(key)) {
              mergedMap.set(key, w);
            }
          });
          return Array.from(mergedMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        });
      }
    }, (err) => {
      console.warn('Firestore workers listener error (offline mode?):', err);
    });

    return () => unsub();
  }, [currentUser]);

  // Real-time Firestore sync for Meal Lists collection
  useEffect(() => {
    if (!currentUser) return;

    const listsCol = collection(db, 'meal_lists');
    const q = query(listsCol, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const remoteLists: MealList[] = [];
        snapshot.forEach((docSnap) => {
          remoteLists.push({ id: docSnap.id, ...docSnap.data() } as MealList);
        });

        setAllMealLists((localLists) => {
          const listMap = new Map<string, MealList>();
          localLists.forEach(l => listMap.set(l.id, l));
          remoteLists.forEach(r => {
            listMap.set(r.id, { ...r, status: 'sent' });
          });
          return Array.from(listMap.values()).sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      }
    }, (err) => {
      console.warn('Firestore meal_lists listener error (offline mode?):', err);
    });

    return () => unsub();
  }, [currentUser]);

  // Auto-sync offline lists automatically whenever user is online and logged in
  useEffect(() => {
    if (isOnline && currentUser) {
      const hasPending = allMealLists.some(l => l.status === 'draft' && l.createdByUid === currentUser.uid);
      if (hasPending) {
        syncAllOfflineLists();
      }
    }
  }, [isOnline, currentUser, allMealLists]);

  // ✅ FILTRO OFFLINE: Apenas listas do usuário atual
  const mealLists = allMealLists.filter(list => 
    list.createdByUid === currentUser?.uid || 
    list.createdByUid === 'anonymous' ||
    !list.createdByUid // para listas antigas sem uid
  );

  // Calculate Total Marmitas
  const totalMarmitas = Object.values(currentQuantities).reduce((acc: number, qty: number) => acc + (qty || 0), 0);

  // Counter Actions
  const updateQuantity = (workerName: string, delta: number) => {
    setCurrentQuantities((prev) => {
      const current = prev[workerName] || 0;
      const updated = Math.max(0, current + delta);
      const next = { ...prev };
      if (updated === 0) {
        delete next[workerName];
      } else {
        next[workerName] = updated;
      }
      return next;
    });
  };

  const setQuantity = (workerName: string, qty: number) => {
    setCurrentQuantities((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[workerName];
      } else {
        next[workerName] = qty;
      }
      return next;
    });
  };

  const resetAllQuantities = () => {
    setCurrentQuantities({});
  };

  const setAllQuantitiesToOne = () => {
    const next: Record<string, number> = {};
    workers.filter(w => w.active).forEach((w) => {
      next[w.name] = 1;
    });
    setCurrentQuantities(next);
  };

  const setSectorQuantitiesToOne = (sectorName: string) => {
    setCurrentQuantities((prev) => {
      const next = { ...prev };
      workers
        .filter(w => w.active && (w.sector === sectorName || sectorName === 'TODOS'))
        .forEach((w) => {
          next[w.name] = 1;
        });
      return next;
    });
  };

  // ✅ FUNÇÃO REPETIR ÚLTIMO (filtrada por usuário)
  const repeatLastMealListSelections = () => {
    if (mealLists.length === 0) {
      alert('Nenhum relatório anterior encontrado para este usuário.');
      return;
    }
    
    const lastList = mealLists.find(l => l.createdByUid === currentUser?.uid) || mealLists[0];
    
    if (!lastList || !lastList.items || lastList.items.length === 0) {
      alert('O último relatório não possui itens para repetir.');
      return;
    }

    const nextQuantities: Record<string, number> = {};
    lastList.items.forEach(item => {
      if (item.quantity > 0) {
        nextQuantities[item.workerName] = item.quantity;
      }
    });

    setCurrentQuantities(nextQuantities);
  };

  // Add Worker
  const addWorker = async (name: string, sector: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const newWorker: Worker = {
      id: 'w-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: trimmedName,
      sector: sector || 'Geral',
      active: true,
      createdAt: new Date().toISOString()
    };

    setWorkers((prev) => {
      const exists = prev.some(w => w.name.toLowerCase() === trimmedName.toLowerCase());
      if (exists) return prev;
      return [...prev, newWorker].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    });

    if (currentUser) {
      try {
        const workerRef = doc(db, 'workers', newWorker.id);
        await setDoc(workerRef, newWorker);
      } catch (err) {
        console.warn('Worker saved locally (Firestore offline):', err);
      }
    }
  };

  const updateWorker = async (id: string, name: string, sector: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setWorkers(prev => prev.map(w => w.id === id ? { ...w, name: trimmed, sector } : w));

    if (currentUser) {
      try {
        const workerRef = doc(db, 'workers', id);
        await setDoc(workerRef, { name: trimmed, sector, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Worker updated locally:', err);
      }
    }
  };

  const toggleWorkerActive = async (id: string) => {
    let newStatus = false;
    setWorkers(prev => prev.map(w => {
      if (w.id === id) {
        newStatus = !w.active;
        return { ...w, active: newStatus };
      }
      return w;
    }));

    if (currentUser) {
      try {
        const workerRef = doc(db, 'workers', id);
        await setDoc(workerRef, { active: newStatus, updatedAt: new Date().toISOString() }, { merge: true });
      } catch (err) {
        console.warn('Worker status toggled locally:', err);
      }
    }
  };

  // ✅ Save Meal List – NÃO BLOQUEANTE
  const saveMealList = async (
    title: string,
    date: string,
    shift: 'Almoço' | 'Janta' | 'Lanche' | 'Ceia / Noturno',
    worksiteLocation?: string,
    notes?: string
  ): Promise<MealList> => {
    const items: MealItem[] = (Object.entries(currentQuantities) as [string, number][])
      .filter(([, qty]) => qty > 0)
      .map(([workerName, quantity]) => {
        const workerObj = workers.find(w => w.name === workerName);
        return {
          workerId: workerObj?.id,
          workerName,
          sector: workerObj?.sector || 'Geral',
          quantity: Number(quantity)
        };
      })
      .sort((a, b) => a.workerName.localeCompare(b.workerName, 'pt-BR'));

    const listTotal = items.reduce((sum, item) => sum + item.quantity, 0);

    const newList: MealList = {
      id: 'list-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: title || `Almoço ${date}`,
      date: date || new Date().toISOString().slice(0, 10),
      shift: shift || 'Almoço',
      worksiteLocation: worksiteLocation || 'Canteiro Principal',
      totalMarmitas: listTotal,
      items,
      notes,
      createdByName: userProfile?.displayName || 'Operador de Campo',
      createdByUid: currentUser?.uid || 'anonymous',
      status: 'draft', // Sempre começa como draft
      createdAt: new Date().toISOString()
    };

    // 1. Salvar localmente IMEDIATAMENTE
    setAllMealLists(prev => [newList, ...prev]);

    // 2. Tentar sincronizar em segundo plano (não aguardar)
    if (currentUser && isOnline) {
      // Fire-and-forget: não bloqueia a UI
      (async () => {
        try {
          setSyncing(true);
          const listRef = doc(db, 'meal_lists', newList.id);
          const firestoreData = { ...newList, status: 'sent', syncedAt: new Date().toISOString() };
          await setDoc(listRef, firestoreData);

          // Atualizar status local para 'sent' após sucesso
          setAllMealLists(prev => 
            prev.map(l => l.id === newList.id ? { ...newList, status: 'sent' } : l)
          );
        } catch (err) {
          console.warn('List saved offline (Firestore sync deferred):', err);
          // Mantém status 'draft' – será sincronizada depois pela função syncAllOfflineLists
        } finally {
          setSyncing(false);
        }
      })().catch(err => console.error('Erro no sync em background:', err));
    }

    // 3. Retorna imediatamente para o modal fechar
    return newList;
  };

  // Sync single list to Firestore
  const syncListToFirestore = async (list: MealList): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      setSyncing(true);
      const listRef = doc(db, 'meal_lists', list.id);
      const updatedList: MealList = {
        ...list,
        status: 'sent',
        syncedAt: new Date().toISOString()
      };
      await setDoc(listRef, updatedList);

      setAllMealLists(prev => prev.map(l => l.id === list.id ? updatedList : l));
      return true;
    } catch (err) {
      console.error('Failed to sync list to Firestore:', err);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  // Sync all offline lists
  const syncAllOfflineLists = async (): Promise<number> => {
    if (!currentUser || !isOnline) return 0;

    // Filtra apenas os rascunhos do usuário atual
    const pendingLists = allMealLists.filter(l => l.status === 'draft' && l.createdByUid === currentUser.uid);
    if (pendingLists.length === 0) return 0;

    setSyncing(true);
    let syncedCount = 0;

    try {
      const batch = writeBatch(db);
      pendingLists.forEach(l => {
        const listRef = doc(db, 'meal_lists', l.id);
        const updated = { ...l, status: 'sent', syncedAt: new Date().toISOString() };
        batch.set(listRef, updated);
      });

      await batch.commit();

      setAllMealLists(prev => prev.map(l => {
        if (l.status === 'draft' && l.createdByUid === currentUser.uid) {
          return { ...l, status: 'sent', syncedAt: new Date().toISOString() };
        }
        return l;
      }));
      syncedCount = pendingLists.length;
    } catch (err) {
      console.error('Error batch syncing offline lists:', err);
    } finally {
      setSyncing(false);
    }

    return syncedCount;
  };

  const deleteMealList = async (id: string) => {
    setAllMealLists(prev => prev.filter(l => l.id !== id));
    if (currentUser) {
      try {
        const listRef = doc(db, 'meal_lists', id);
        await deleteDoc(listRef);
      } catch (err) {
        console.warn('List deleted locally:', err);
      }
    }
  };

  const importMealLists = (imported: MealList[]) => {
    setAllMealLists(prev => {
      const existingIds = new Set(prev.map(l => l.id));
      const newItems = imported.filter(l => !existingIds.has(l.id));
      return [...newItems, ...prev];
    });
  };

  return (
    <MealContext.Provider
      value={{
        workers,
        currentQuantities,
        mealLists, // ← JÁ FILTRADO por usuário
        totalMarmitas,
        isOnline,
        syncing,

        updateQuantity,
        setQuantity,
        resetAllQuantities,
        setAllQuantitiesToOne,
        setSectorQuantitiesToOne,
        repeatLastMealListSelections,

        addWorker,
        updateWorker,
        toggleWorkerActive,

        saveMealList,
        syncListToFirestore,
        deleteMealList,
        importMealLists,
        syncAllOfflineLists
      }}
    >
      {children}
    </MealContext.Provider>
  );
};

export const useMeal = () => {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error('useMeal must be used within a MealProvider');
  }
  return context;
};