import fs from 'fs';
let code = fs.readFileSync('src/components/HorseManager.tsx', 'utf8');

code = code.replace(
  "        status: 'Stabled',\n      });\n\n      setBreedId('');",
  "        status: 'Stabled',\n        acquisitionMethod,\n        purchasePrice: Number(purchasePrice) || 0,\n        trainingFee: Number(trainingFee) || 0\n      });\n\n      setBreedId('');"
);

fs.writeFileSync('src/components/HorseManager.tsx', code);
