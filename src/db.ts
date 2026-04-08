import Dexie, { Table } from 'dexie';

export interface BreedTemplate {
  id?: number;
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  temperament: string;
  wildLocation: string;
  baseValue: number;
  baseStats: Record<string, number>;
}

export interface IndividualHorse {
  id?: number;
  breedId: number;
  name: string;
  currentXP: number;
  isTrained: boolean;
  customStats: Record<string, number>;
  notes: string;
  status: 'Stabled' | 'Training' | 'Sold';
}

export interface SaleRecord {
  id?: number;
  horseId: number;
  buyerName: string;
  salePrice: number;
  date: Date;
}

export interface CraftableItem {
  id?: number;
  name: string;
  isCrafted: boolean;
  baseCost: number;
  yieldQty: number;
  requirements?: {itemId: number, qty: number}[];
}

export class StableDatabase extends Dexie {
  breeds!: Table<BreedTemplate>;
  horses!: Table<IndividualHorse>;
  sales!: Table<SaleRecord>;
  items!: Table<CraftableItem>;

  constructor() {
    super('RedMStableDB');
    this.version(1).stores({
      breeds: '++id, name, rarity',
      horses: '++id, breedId, status',
      sales: '++id, horseId, buyerName',
      items: '++id, name, isCrafted'
    });
  }
}

export const db = new StableDatabase();
