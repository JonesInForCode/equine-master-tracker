import fs from 'fs';
let code = fs.readFileSync('src/components/HorseManager.tsx', 'utf8');

// Update state variables for new fields
code = code.replace(
  "  const [baseStatsStr, setBaseStatsStr] = useState('');",
  "  const [baseStatsStr, setBaseStatsStr] = useState('');\n  const [acquisitionMethod, setAcquisitionMethod] = useState<'Wild Caught' | 'Bought' | 'Transferred' | ''>('Wild Caught');\n  const [purchasePrice, setPurchasePrice] = useState<number>(200);\n  const [trainingFee, setTrainingFee] = useState<number>(200);"
);

// Update add submission
code = code.replace(
  "      await db.horses.add({\n        breedId: Number(breedId),\n        name,\n        gender: gender as any,\n        personality,\n        genes,\n        currentXP: 0,\n        isTrained: false,\n        baseStats: parsedStats,\n        finalStats: {},\n        customStats: {},\n        notes,\n        status: 'Stabled'\n      });",
  "      await db.horses.add({\n        breedId: Number(breedId),\n        name,\n        gender: gender as any,\n        personality,\n        genes,\n        currentXP: 0,\n        isTrained: false,\n        baseStats: parsedStats,\n        finalStats: {},\n        customStats: {},\n        notes,\n        status: 'Stabled',\n        acquisitionMethod,\n        purchasePrice: Number(purchasePrice) || 0,\n        trainingFee: Number(trainingFee) || 0\n      });"
);

// Update reset form
code = code.replace(
  "      setGenes('');\n      setBaseStatsStr('');\n      setNotes('');\n      setIsAdding(false);",
  "      setGenes('');\n      setBaseStatsStr('');\n      setNotes('');\n      setAcquisitionMethod('Wild Caught');\n      setPurchasePrice(200);\n      setTrainingFee(200);\n      setIsAdding(false);"
);

// Update getSuggestedPrice
code = code.replace(
  "  const getSuggestedPrice = (horse: { breedId: number; currentXP: number }) => {\n    const breed = breeds?.find((b: any) => b.id === horse.breedId);\n    if (!breed) return 0;\n\n    let price = breed.baseValue;\n\n    // Rarity Premium\n    if (breed.rarity === 'Legendary') price += 1000;\n    else if (breed.rarity === 'Rare') price += 500;\n    else if (breed.rarity === 'Uncommon') price += 200;\n\n    // Training Bundle Fee\n    if (horse.currentXP >= 2000) {\n      price += 200;\n    }\n\n    return price;\n  };",
  "  const getSuggestedPrice = (horse: { breedId: number; currentXP: number; purchasePrice?: number; trainingFee?: number }) => {\n    const breed = breeds?.find((b: any) => b.id === horse.breedId);\n    if (!breed) return 0;\n\n    let price = horse.purchasePrice || 0;\n\n    // Rarity Premium\n    if (breed.rarity === 'Legendary') price += 1000;\n    else if (breed.rarity === 'Rare') price += 500;\n    else if (breed.rarity === 'Uncommon') price += 200;\n\n    // Training Bundle Fee\n    if (horse.currentXP >= 2000) {\n      price += (horse.trainingFee || 0);\n    }\n\n    return price;\n  };"
);

// Update genes placeholder
code = code.replace(
  "                  placeholder=\"e.g., Fast Learner\"",
  "                  placeholder=\"e.g., Base Coat Genes: ee, E-, BLK\""
);


// Add inputs for Acquisition Method, Purchase Price, Training Fee
const additionalInputs = `
              <div>
                <label className="block text-sm font-bold mb-1">Acquisition Method</label>
                <select
                  value={acquisitionMethod}
                  onChange={(e) => setAcquisitionMethod(e.target.value as any)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                >
                  <option value="Wild Caught">Wild Caught</option>
                  <option value="Bought">Bought</option>
                  <option value="Transferred">Transferred</option>
                  <option value="">Unknown</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Base Value / Purchase Price ($)</label>
                <input
                  type="number"
                  min="0"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Training Fee ($)</label>
                <input
                  type="number"
                  min="0"
                  value={trainingFee}
                  onChange={(e) => setTrainingFee(Number(e.target.value))}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                />
              </div>
`;

code = code.replace(
  "              <div>\n                <label className=\"block text-sm font-bold mb-1\">Base Stats</label>",
  additionalInputs + "              <div>\n                <label className=\"block text-sm font-bold mb-1\">Base Stats</label>"
);

fs.writeFileSync('src/components/HorseManager.tsx', code);
