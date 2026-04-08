import fs from 'fs';
let code = fs.readFileSync('src/components/HorseManager.tsx', 'utf8');

// Add edit modal state
code = code.replace(
  "  const [isAdding, setIsAdding] = useState(false);",
  "  const [isAdding, setIsAdding] = useState(false);\n\n  // Edit state\n  const [editModalHorseId, setEditModalHorseId] = useState<number | null>(null);\n  const [editName, setEditName] = useState('');\n  const [editGender, setEditGender] = useState('');\n  const [editPersonality, setEditPersonality] = useState('');\n  const [editGenes, setEditGenes] = useState('');\n  const [editBaseStatsStr, setEditBaseStatsStr] = useState('');\n  const [editFinalStatsStr, setEditFinalStatsStr] = useState('');\n  const [editNotes, setEditNotes] = useState('');\n  const [editAcquisitionMethod, setEditAcquisitionMethod] = useState<'Wild Caught' | 'Bought' | 'Transferred' | ''>('Wild Caught');\n  const [editPurchasePrice, setEditPurchasePrice] = useState<number>(200);\n  const [editTrainingFee, setEditTrainingFee] = useState<number>(200);"
);

// Add handleEditSubmit function
const handleEditSubmit = `
  const openEditModal = (horse: any) => {
    setEditModalHorseId(horse.id!);
    setEditName(horse.name || '');
    setEditGender(horse.gender || '');
    setEditPersonality(horse.personality || '');
    setEditGenes(horse.genes || '');
    setEditBaseStatsStr(horse.baseStats ? Object.entries(horse.baseStats).map(([k, v]) => \`\${k}: \${v}\`).join(', ') : '');
    setEditFinalStatsStr(horse.finalStats ? Object.entries(horse.finalStats).map(([k, v]) => \`\${k}: \${v}\`).join(', ') : '');
    setEditNotes(horse.notes || '');
    setEditAcquisitionMethod(horse.acquisitionMethod || 'Wild Caught');
    setEditPurchasePrice(horse.purchasePrice ?? 200);
    setEditTrainingFee(horse.trainingFee ?? 200);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalHorseId) return;
    try {
      const parsedBaseStats = editBaseStatsStr.split(',').reduce((acc: any, curr) => {
        const [key, val] = curr.split(':').map(s => s.trim());
        if (key && val) acc[key] = Number(val);
        return acc;
      }, {});
      const parsedFinalStats = editFinalStatsStr.split(',').reduce((acc: any, curr) => {
        const [key, val] = curr.split(':').map(s => s.trim());
        if (key && val) acc[key] = Number(val);
        return acc;
      }, {});

      await db.horses.update(editModalHorseId, {
        name: editName,
        gender: editGender as any,
        personality: editPersonality,
        genes: editGenes,
        baseStats: parsedBaseStats,
        finalStats: parsedFinalStats,
        notes: editNotes,
        acquisitionMethod: editAcquisitionMethod,
        purchasePrice: Number(editPurchasePrice) || 0,
        trainingFee: Number(editTrainingFee) || 0
      });
      setEditModalHorseId(null);
    } catch (error) {
      console.error('Failed to update horse', error);
      alert('Failed to update horse. Check console for details.');
    }
  };
`;

code = code.replace(
  "  const handleSell = async (e: React.FormEvent) => {",
  handleEditSubmit + "\n  const handleSell = async (e: React.FormEvent) => {"
);

// Add Edit Modal JSX
const editModalJSX = `
      {/* Edit Modal */}
      {editModalHorseId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="aged-paper p-6 rounded-lg w-full max-w-2xl my-8">
            <h3 className="text-2xl font-bold mb-4 ink-text">Edit Horse</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  >
                    <option value="">Unknown</option>
                    <option value="Stallion">Stallion</option>
                    <option value="Mare">Mare</option>
                    <option value="Gelding">Gelding</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Personality</label>
                  <input
                    type="text"
                    value={editPersonality}
                    onChange={(e) => setEditPersonality(e.target.value)}
                    className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Genes</label>
                  <input
                    type="text"
                    value={editGenes}
                    onChange={(e) => setEditGenes(e.target.value)}
                    className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Acquisition Method</label>
                  <select
                    value={editAcquisitionMethod}
                    onChange={(e) => setEditAcquisitionMethod(e.target.value as any)}
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
                    value={editPurchasePrice}
                    onChange={(e) => setEditPurchasePrice(Number(e.target.value))}
                    className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Training Fee ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={editTrainingFee}
                    onChange={(e) => setEditTrainingFee(Number(e.target.value))}
                    className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Base Stats</label>
                  <input
                    type="text"
                    value={editBaseStatsStr}
                    onChange={(e) => setEditBaseStatsStr(e.target.value)}
                    className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Final Stats</label>
                  <input
                    type="text"
                    value={editFinalStatsStr}
                    onChange={(e) => setEditFinalStatsStr(e.target.value)}
                    className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-1">Notes</label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalHorseId(null)}
                  className="px-4 py-2 border border-[#d3cbb8] rounded hover:bg-[#d3cbb8]/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#2c3e50] text-white px-4 py-2 rounded hover:bg-[#1a252f] transition-colors font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
`;

code = code.replace(
  "      {/* Sell Modal */}",
  editModalJSX + "\n      {/* Sell Modal */}"
);


// Add Edit button to horse cards
code = code.replace(
  "              <div className=\"mt-6 pt-4 border-t border-[#d3cbb8] flex justify-end\">",
  "              <div className=\"mt-6 pt-4 border-t border-[#d3cbb8] flex justify-end space-x-2\">\n                <button\n                  onClick={() => openEditModal(horse)}\n                  className=\"flex items-center space-x-2 bg-[#d3cbb8] text-[#2c3e50] px-4 py-2 rounded hover:bg-[#c2baab] transition-colors\"\n                >\n                  <span>Edit</span>\n                </button>"
);


fs.writeFileSync('src/components/HorseManager.tsx', code);
