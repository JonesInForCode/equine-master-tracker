import fs from 'fs';
let code = fs.readFileSync('src/db.ts', 'utf8');

// Update IndividualHorse interface
code = code.replace(
  "status: 'Stabled' | 'Training' | 'Sold';",
  "status: 'Stabled' | 'Training' | 'Sold';\n  acquisitionMethod: 'Wild Caught' | 'Bought' | 'Transferred' | '';\n  purchasePrice: number;\n  trainingFee: number;"
);

// Update DB migration
code = code.replace(
  "    this.version(2).stores({\n      breeds: '++id, name, rarity',\n      horses: '++id, breedId, status, gender, personality',\n      sales: '++id, horseId, buyerName',\n      items: '++id, name, isCrafted',\n      orders: '++id, customerName, status'\n    }).upgrade(tx => {\n      return tx.table('horses').toCollection().modify(horse => {\n        if (horse.gender === undefined) horse.gender = '';\n        if (horse.personality === undefined) horse.personality = '';\n        if (horse.genes === undefined) horse.genes = '';\n        if (horse.baseStats === undefined) horse.baseStats = {};\n        if (horse.finalStats === undefined) horse.finalStats = {};\n      });\n    });\n  }\n}",
  `    this.version(2).stores({
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

    this.version(3).stores({
      breeds: '++id, name, rarity',
      horses: '++id, breedId, status, gender, personality, acquisitionMethod',
      sales: '++id, horseId, buyerName',
      items: '++id, name, isCrafted',
      orders: '++id, customerName, status'
    }).upgrade(tx => {
      return tx.table('horses').toCollection().modify(horse => {
        if (horse.acquisitionMethod === undefined) horse.acquisitionMethod = 'Wild Caught';
        if (horse.purchasePrice === undefined) horse.purchasePrice = 200;
        if (horse.trainingFee === undefined) horse.trainingFee = 200;
      });
    });
  }
}`
);

fs.writeFileSync('src/db.ts', code);
