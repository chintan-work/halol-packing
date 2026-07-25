import { useState, useCallback, useEffect } from 'react';
import {
  PalletType,
  PlankStock,
  PalletStock,
  StockRecord,
  Profile,
  DEFAULT_PROFILE,
  SEED_PALLETS,
  RecordType,
} from './types';

const KEYS = {
  PALLETS: 'hp_pallets',
  PLANK_STOCK: 'hp_plank_stock',
  PALLET_STOCK: 'hp_pallet_stock',
  RECORDS: 'hp_records',
  PROFILE: 'hp_profile',
  CHALLAN_COUNTER: 'hp_challan_counter',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Initialize seed data if empty
function initPallets(): PalletType[] {
  const existing = load<PalletType[] | null>(KEYS.PALLETS, null);
  if (existing === null || existing.length === 0) {
    save(KEYS.PALLETS, SEED_PALLETS);
    return SEED_PALLETS;
  }
  return existing;
}

export function useStore() {
  const [pallets, setPalletsState] = useState<PalletType[]>(() => initPallets());
  const [plankStock, setPlankStockState] = useState<PlankStock>(() => load(KEYS.PLANK_STOCK, {}));
  const [palletStock, setPalletStockState] = useState<PalletStock>(() => load(KEYS.PALLET_STOCK, {}));
  const [records, setRecordsState] = useState<StockRecord[]>(() => load(KEYS.RECORDS, []));
  const [profile, setProfileState] = useState<Profile>(() => load(KEYS.PROFILE, DEFAULT_PROFILE));
  const [challanCounter, setChallanCounterState] = useState<number>(() => load(KEYS.CHALLAN_COUNTER, 0));

  // Persist helpers
  const setPallets = useCallback((val: PalletType[] | ((prev: PalletType[]) => PalletType[])) => {
    setPalletsState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      save(KEYS.PALLETS, next);
      return next;
    });
  }, []);

  const setPlankStock = useCallback((val: PlankStock | ((prev: PlankStock) => PlankStock)) => {
    setPlankStockState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      save(KEYS.PLANK_STOCK, next);
      return next;
    });
  }, []);

  const setPalletStock = useCallback((val: PalletStock | ((prev: PalletStock) => PalletStock)) => {
    setPalletStockState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      save(KEYS.PALLET_STOCK, next);
      return next;
    });
  }, []);

  const addRecord = useCallback((
    date: string,
    type: RecordType,
    description: string,
    details: Record<string, unknown>,
    currentPlankStock: PlankStock,
    currentPalletStock: PalletStock
  ) => {
    const record: StockRecord = {
      id: genId(),
      date,
      type,
      description,
      details,
      plankSnapshot: { ...currentPlankStock },
      palletSnapshot: { ...currentPalletStock },
      createdAt: new Date().toISOString(),
    };
    setRecordsState(prev => {
      const next = [record, ...prev];
      save(KEYS.RECORDS, next);
      return next;
    });
    return record;
  }, []);

  const setProfile = useCallback((val: Profile | ((prev: Profile) => Profile)) => {
    setProfileState(prev => {
      const next = typeof val === 'function' ? val(prev) : val;
      save(KEYS.PROFILE, next);
      return next;
    });
  }, []);

  const nextChallanNumber = useCallback((): number => {
    const next = challanCounter + 1;
    setChallanCounterState(next);
    save(KEYS.CHALLAN_COUNTER, next);
    return next;
  }, [challanCounter]);

  // Reload from localStorage on focus (multi-tab sync)
  useEffect(() => {
    const onFocus = () => {
      setPalletsState(initPallets());
      setPlankStockState(load(KEYS.PLANK_STOCK, {}));
      setPalletStockState(load(KEYS.PALLET_STOCK, {}));
      setRecordsState(load(KEYS.RECORDS, []));
      setProfileState(load(KEYS.PROFILE, DEFAULT_PROFILE));
      setChallanCounterState(load(KEYS.CHALLAN_COUNTER, 0));
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Get all unique plank keys across all pallets
  const allPlankKeys = useCallback((): string[] => {
    const keys = new Set<string>();
    pallets.forEach(p => p.components.forEach(c => keys.add(c.key)));
    return Array.from(keys);
  }, [pallets]);

  // Vendor Inward
  const vendorInward = useCallback((
    date: string,
    vendorName: string,
    plankKey: string,
    qty: number,
    rate: number,
    amount: number
  ) => {
    let newPlankStock: PlankStock = {};
    setPlankStock(prev => {
      newPlankStock = { ...prev, [plankKey]: (prev[plankKey] || 0) + qty };
      return newPlankStock;
    });
    // Capture after update via setTimeout trick not needed — we compute inline
    setTimeout(() => {
      const ps = load<PlankStock>(KEYS.PLANK_STOCK, {});
      const pls = load<PalletStock>(KEYS.PALLET_STOCK, {});
      addRecord(date, 'vendor_inward', `Vendor Inward: ${plankKey} x${qty} from ${vendorName}`, {
        vendorName, plankKey, qty, rate, amount,
      }, ps, pls);
    }, 50);
  }, [setPlankStock, addRecord]);

  // Production
  const recordProduction = useCallback((
    date: string,
    palletId: string,
    qtyProduced: number
  ): { success: boolean; error?: string } => {
    const pallet = pallets.find(p => p.id === palletId);
    if (!pallet) return { success: false, error: 'Pallet type not found' };

    const currentPlankStock = load<PlankStock>(KEYS.PLANK_STOCK, {});
    // Check stock sufficiency
    for (const comp of pallet.components) {
      const needed = comp.qty * qtyProduced;
      const available = currentPlankStock[comp.key] || 0;
      if (available < needed) {
        return {
          success: false,
          error: `Insufficient plank ${comp.key}: need ${needed}, have ${available}`,
        };
      }
    }

    // Deduct planks
    const newPlankStock = { ...currentPlankStock };
    for (const comp of pallet.components) {
      newPlankStock[comp.key] = (newPlankStock[comp.key] || 0) - comp.qty * qtyProduced;
    }
    setPlankStock(newPlankStock);

    // Add to pallet stock
    let newPalletStock: PalletStock = {};
    setPalletStock(prev => {
      newPalletStock = { ...prev, [palletId]: (prev[palletId] || 0) + qtyProduced };
      return newPalletStock;
    });

    setTimeout(() => {
      const ps = load<PlankStock>(KEYS.PLANK_STOCK, {});
      const pls = load<PalletStock>(KEYS.PALLET_STOCK, {});
      addRecord(date, 'production', `Production: ${pallet.name} x${qtyProduced}`, {
        palletId, palletName: pallet.name, qtyProduced,
        planksUsed: pallet.components.map(c => ({ key: c.key, qty: c.qty * qtyProduced })),
      }, ps, pls);
    }, 50);

    return { success: true };
  }, [pallets, setPlankStock, setPalletStock, addRecord]);

  // Challan
  const recordChallan = useCallback((
    date: string,
    challanNo: number,
    companyName: string,
    vehicleNo: string,
    materialType: 'pallet' | 'plank',
    itemId: string,
    qty: number,
    rate: number,
    amount: number,
    remarks: string
  ): { success: boolean; error?: string } => {
    if (materialType === 'pallet') {
      const currentStock = load<PalletStock>(KEYS.PALLET_STOCK, {});
      const available = currentStock[itemId] || 0;
      if (available < qty) {
        return { success: false, error: `Insufficient pallet stock: need ${qty}, have ${available}` };
      }
      setPalletStock(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) - qty }));
    } else {
      const currentStock = load<PlankStock>(KEYS.PLANK_STOCK, {});
      const available = currentStock[itemId] || 0;
      if (available < qty) {
        return { success: false, error: `Insufficient plank stock: need ${qty}, have ${available}` };
      }
      setPlankStock(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) - qty }));
    }

    const palletName = pallets.find(p => p.id === itemId)?.name;
    const itemName = materialType === 'pallet' ? (palletName || itemId) : itemId;

    setTimeout(() => {
      const ps = load<PlankStock>(KEYS.PLANK_STOCK, {});
      const pls = load<PalletStock>(KEYS.PALLET_STOCK, {});
      addRecord(date, 'challan', `Challan #${challanNo}: ${itemName} x${qty} to ${companyName}`, {
        challanNo, companyName, vehicleNo, materialType, itemId, itemName, qty, rate, amount, remarks,
      }, ps, pls);
    }, 50);

    return { success: true };
  }, [pallets, setPalletStock, setPlankStock, addRecord]);

  // Adjustment
  const recordAdjustment = useCallback((
    date: string,
    adjType: 'add' | 'deduct',
    material: 'plank' | 'pallet',
    itemId: string,
    qty: number,
    reason: string
  ): { success: boolean; error?: string } => {
    if (material === 'pallet') {
      if (adjType === 'deduct') {
        const currentStock = load<PalletStock>(KEYS.PALLET_STOCK, {});
        if ((currentStock[itemId] || 0) < qty) {
          return { success: false, error: 'Insufficient pallet stock for deduction' };
        }
      }
      setPalletStock(prev => ({
        ...prev,
        [itemId]: Math.max(0, (prev[itemId] || 0) + (adjType === 'add' ? qty : -qty)),
      }));
    } else {
      if (adjType === 'deduct') {
        const currentStock = load<PlankStock>(KEYS.PLANK_STOCK, {});
        if ((currentStock[itemId] || 0) < qty) {
          return { success: false, error: 'Insufficient plank stock for deduction' };
        }
      }
      setPlankStock(prev => ({
        ...prev,
        [itemId]: Math.max(0, (prev[itemId] || 0) + (adjType === 'add' ? qty : -qty)),
      }));
    }

    const palletName = pallets.find(p => p.id === itemId)?.name;
    const itemName = material === 'pallet' ? (palletName || itemId) : itemId;

    setTimeout(() => {
      const ps = load<PlankStock>(KEYS.PLANK_STOCK, {});
      const pls = load<PalletStock>(KEYS.PALLET_STOCK, {});
      addRecord(date, 'adjustment', `Adjustment: ${adjType} ${material} ${itemName} x${qty} — ${reason}`, {
        adjType, material, itemId, itemName, qty, reason,
      }, ps, pls);
    }, 50);

    return { success: true };
  }, [pallets, setPalletStock, setPlankStock, addRecord]);

  // Pallet management
  const addPallet = useCallback((pallet: PalletType) => {
    setPallets(prev => [...prev, pallet]);
  }, [setPallets]);

  const updatePallet = useCallback((pallet: PalletType) => {
    setPallets(prev => prev.map(p => p.id === pallet.id ? pallet : p));
  }, [setPallets]);

  const deletePallet = useCallback((id: string) => {
    setPallets(prev => prev.filter(p => p.id !== id));
  }, [setPallets]);

  return {
    pallets,
    plankStock,
    palletStock,
    records,
    profile,
    challanCounter,
    // actions
    vendorInward,
    recordProduction,
    recordChallan,
    recordAdjustment,
    setProfile,
    nextChallanNumber,
    addPallet,
    updatePallet,
    deletePallet,
    allPlankKeys,
  };
}

export type Store = ReturnType<typeof useStore>;
