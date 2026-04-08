import Dexie, { Table } from 'dexie';

export interface BreedTemplate {
  id?: number;
  name: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  temperament: string;
  wildLocation: string;
  baseValue: number;
}

export interface IndividualHorse {
  id?: number;
  breedId: number;
  name: string;
  gender: 'Stallion' | 'Mare' | 'Gelding' | '';
  personality: string;
  genes: string;
  currentXP: number;
  isTrained: boolean;
  baseStats: Record<string, number>;
  finalStats: Record<string, number>;
  customStats: Record<string, number>;
  notes: string;
  status: 'Stabled' | 'Training' | 'Sold';
}

export interface HorseOrder {
  id?: number;
  customerName: string;
  orderType: 'Full Order' | 'Training Only';
  color: string;
  gender: string;
  personality: string;
  notes: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  date: Date;
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
  orders!: Table<HorseOrder>;

  constructor() {
    super('RedMStableDB');
    this.version(1).stores({
      breeds: '++id, name, rarity',
      horses: '++id, breedId, status',
      sales: '++id, horseId, buyerName',
      items: '++id, name, isCrafted'
    });

    this.version(2).stores({
      breeds: '++id, name, rarity',
      horses: '++id, breedId, status, gender, personality',
      sales: '++id, horseId, buyerName',
      items: '++id, name, isCrafted',
      orders: '++id, customerName, status'
    }).upgrade(tx => {
      return tx.table('horses').toCollection().modify(horse => {
        if (horse.gender === undefined) horse.gender = '';
        if (horse.personality === undefined) horse.personality = '';
        if (horse.genes === undefined) horse.genes = '';
        if (horse.baseStats === undefined) horse.baseStats = {};
        if (horse.finalStats === undefined) horse.finalStats = {};
      });
    });
  }
}

export const db = new StableDatabase();
