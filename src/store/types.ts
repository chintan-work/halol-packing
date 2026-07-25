export interface PlankComponent {
  key: string; // "LxWxH"
  length: number;
  width: number;
  height: number;
  qty: number;
}

export interface PalletType {
  id: string;
  name: string;
  components: PlankComponent[];
}

export type PlankStock = Record<string, number>; // key -> qty
export type PalletStock = Record<string, number>; // palletId -> qty

export type RecordType = 'vendor_inward' | 'production' | 'challan' | 'adjustment';

export interface StockRecord {
  id: string;
  date: string; // ISO date string
  type: RecordType;
  description: string;
  details: Record<string, unknown>;
  plankSnapshot: PlankStock;
  palletSnapshot: PalletStock;
  createdAt: string;
}

export interface Profile {
  companyName: string;
  address: string;
  phone: string;
  gst: string;
  logo: string; // base64
}

export const DEFAULT_PROFILE: Profile = {
  companyName: 'Halol Packing',
  address: '',
  phone: '',
  gst: '',
  logo: '',
};

export function makePlankKey(length: number, width: number, height: number): string {
  return `${length}x${width}x${height}`;
}

export function parsePlankKey(key: string): { length: number; width: number; height: number } {
  const parts = key.split('x');
  return {
    length: parseFloat(parts[0]),
    width: parseFloat(parts[1]),
    height: parseFloat(parts[2]),
  };
}

export const SEED_PALLETS: PalletType[] = [
  {
    id: 'pallet-45',
    name: '45" Pallet',
    components: [
      { key: '45x5.5x0.75', length: 45, width: 5.5, height: 0.75, qty: 4 },
      { key: '45x3.5x0.75', length: 45, width: 3.5, height: 0.75, qty: 6 },
      { key: '45x3.5x1.25', length: 45, width: 3.5, height: 1.25, qty: 4 },
    ],
  },
  {
    id: 'pallet-35',
    name: '35" Pallet',
    components: [
      { key: '35x2.75x2.75', length: 35, width: 2.75, height: 2.75, qty: 3 },
      { key: '35x2.75x1', length: 35, width: 2.75, height: 1, qty: 9 },
    ],
  },
  {
    id: 'pallet-65',
    name: '65" Pallet',
    components: [
      { key: '65x4x2', length: 65, width: 4, height: 2, qty: 2 },
      { key: '65x4x1.25', length: 65, width: 4, height: 1.25, qty: 4 },
      { key: '35x4x2', length: 35, width: 4, height: 2, qty: 2 },
      { key: '33x4x1.25', length: 33, width: 4, height: 1.25, qty: 4 },
      { key: '18x4x2', length: 18, width: 4, height: 2, qty: 4 },
      { key: '18x4x1.25', length: 18, width: 4, height: 1.25, qty: 6 },
    ],
  },
  {
    id: 'pallet-42',
    name: '42" Pallet',
    components: [
      { key: '42x3x1', length: 42, width: 3, height: 1, qty: 9 },
      { key: '33x4x1', length: 33, width: 4, height: 1, qty: 4 },
      { key: '22x5x1', length: 22, width: 5, height: 1, qty: 4 },
      { key: '4x3x3', length: 4, width: 3, height: 3, qty: 6 },
      { key: '7x3x3', length: 7, width: 3, height: 3, qty: 3 },
      { key: '5x2x1', length: 5, width: 2, height: 1, qty: 4 },
    ],
  },
];
