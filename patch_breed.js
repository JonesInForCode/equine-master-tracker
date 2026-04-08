import fs from 'fs';
let code = fs.readFileSync('src/components/BreedRegistry.tsx', 'utf8');

// remove baseValue state
code = code.replace("  const [baseValue, setBaseValue] = useState<number | ''>('');\n", "");

// update add
code = code.replace(
  "        wildLocation,\n        baseValue: Number(baseValue) || 0,\n      });",
  "        wildLocation,\n        baseValue: 0,\n      });"
);

// update reset form
code = code.replace("      setWildLocation('');\n      setBaseValue('');\n      setIsAdding(false);", "      setWildLocation('');\n      setIsAdding(false);");


// remove base value input
code = code.replace(
  "              <div>\n                <label className=\"block text-sm font-bold mb-1\">Base Value ($)</label>\n                <input\n                  type=\"number\"\n                  required\n                  min=\"0\"\n                  value={baseValue}\n                  onChange={(e) => setBaseValue(Number(e.target.value))}\n                  className=\"w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30\"\n                  placeholder=\"e.g., 500\"\n                />\n              </div>\n",
  ""
);

// remove base value display
code = code.replace("              <p><span className=\"font-bold\">Base Value:</span> ${breed.baseValue}</p>\n", "");


fs.writeFileSync('src/components/BreedRegistry.tsx', code);
