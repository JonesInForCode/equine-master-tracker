import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, DollarSign } from 'lucide-react';

export default function HorseManager() {
  const breeds = useLiveQuery(() => db.breeds.toArray());
  const activeHorses = useLiveQuery(() => db.horses.where('status').notEqual('Sold').toArray());

  const [isAdding, setIsAdding] = useState(false);

  // Edit state
  const [editModalHorseId, setEditModalHorseId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editPersonality, setEditPersonality] = useState('');
  const [editGenes, setEditGenes] = useState('');
  const [editBaseStatsStr, setEditBaseStatsStr] = useState('');
  const [editFinalStatsStr, setEditFinalStatsStr] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editAcquisitionMethod, setEditAcquisitionMethod] = useState<'Wild Caught' | 'Bought' | 'Transferred' | ''>('Wild Caught');
  const [editPurchasePrice, setEditPurchasePrice] = useState<number>(200);
  const [editTrainingFee, setEditTrainingFee] = useState<number>(200);
  const [name, setName] = useState('');
  const [breedId, setBreedId] = useState<number | ''>('');
  const [gender, setGender] = useState<'Stallion' | 'Mare' | 'Gelding' | ''>('');
  const [personality, setPersonality] = useState('');
  const [genes, setGenes] = useState('');
  const [baseStatsStr, setBaseStatsStr] = useState('');
  const [acquisitionMethod, setAcquisitionMethod] = useState<'Wild Caught' | 'Bought' | 'Transferred' | ''>('Wild Caught');
  const [purchasePrice, setPurchasePrice] = useState<number>(200);
  const [trainingFee, setTrainingFee] = useState<number>(200);
  const [notes, setNotes] = useState('');

  const [sellModalHorseId, setSellModalHorseId] = useState<number | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [salePrice, setSalePrice] = useState<number | ''>('');

  const handleAddHorse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (breedId === '') return;

    try {
      const selectedBreed = breeds?.find((b: any) => b.id === Number(breedId));
      if (!selectedBreed) return;

      const baseStats: Record<string, number> = {};
      if (baseStatsStr.trim()) {
        const parts = baseStatsStr.split(',');
        for (const part of parts) {
          const [key, val] = part.split(':').map((s) => s.trim());
          if (key && val && !isNaN(Number(val))) {
            baseStats[key] = Number(val);
          }
        }
      }

      await db.horses.add({
        breedId: Number(breedId),
        name,
        gender: gender as 'Stallion' | 'Mare' | 'Gelding' | '',
        personality,
        genes,
        currentXP: 0,
        isTrained: false,
        baseStats,
        finalStats: {},
        customStats: {},
        notes,
        status: 'Stabled',
        acquisitionMethod,
        purchasePrice: Number(purchasePrice) || 0,
        trainingFee: Number(trainingFee) || 0
      });

      setBreedId('');
      setName('');
      setGender('');
      setPersonality('');
      setGenes('');
      setBaseStatsStr('');
      setNotes('');
      setAcquisitionMethod('Wild Caught');
      setPurchasePrice(200);
      setTrainingFee(200);
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add horse', error);
      alert('Failed to add horse.');
    }
  };

  const handleUpdateXP = async (id: number, newXP: number) => {
    try {
      const isTrained = newXP >= 2000;
      // Cap XP at 2000
      const finalXP = Math.min(newXP, 2000);
      await db.horses.update(id, { currentXP: finalXP, isTrained, status: finalXP > 0 && finalXP < 2000 ? 'Training' : 'Stabled' });
    } catch (error) {
      console.error('Failed to update XP', error);
    }
  };

  const handleUpdateFinalStats = async (id: number, statsStr: string) => {
    try {
      const finalStats: Record<string, number> = {};
      if (statsStr.trim()) {
        const parts = statsStr.split(',');
        for (const part of parts) {
          const [key, val] = part.split(':').map((s) => s.trim());
          if (key && val && !isNaN(Number(val))) {
            finalStats[key] = Number(val);
          }
        }
      }
      await db.horses.update(id, { finalStats });
    } catch (error) {
      console.error('Failed to update final stats', error);
    }
  };


  const openEditModal = (horse: any) => {
    setEditModalHorseId(horse.id!);
    setEditName(horse.name || '');
    setEditGender(horse.gender || '');
    setEditPersonality(horse.personality || '');
    setEditGenes(horse.genes || '');
    setEditBaseStatsStr(horse.baseStats ? Object.entries(horse.baseStats).map(([k, v]) => `${k}: ${v}`).join(', ') : '');
    setEditFinalStatsStr(horse.finalStats ? Object.entries(horse.finalStats).map(([k, v]) => `${k}: ${v}`).join(', ') : '');
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

  const handleSell = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellModalHorseId || salePrice === '') return;

    try {
      await db.transaction('rw', db.horses, db.sales, async () => {
        await db.horses.update(sellModalHorseId, { status: 'Sold' });
        await db.sales.add({
          horseId: sellModalHorseId,
          buyerName,
          salePrice: Number(salePrice),
          date: new Date(),
        });
      });

      setSellModalHorseId(null);
      setBuyerName('');
      setSalePrice('');
    } catch (error) {
      console.error('Failed to sell horse', error);
      alert('Failed to sell horse.');
    }
  };

  const getSuggestedPrice = (horse: { breedId: number; currentXP: number; purchasePrice?: number; trainingFee?: number }) => {
    const breed = breeds?.find((b: any) => b.id === horse.breedId);
    if (!breed) return 0;

    let price = horse.purchasePrice || 0;

    // Rarity Premium
    if (breed.rarity === 'Legendary') price += 1000;
    else if (breed.rarity === 'Rare') price += 500;
    else if (breed.rarity === 'Uncommon') price += 200;

    // Training Bundle Fee
    if (horse.currentXP >= 2000) {
      price += (horse.trainingFee || 0);
    }

    return price;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold ink-text">Active Stable</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          disabled={!breeds || breeds.length === 0}
          className="flex items-center space-x-2 bg-[#d3cbb8] px-4 py-2 rounded hover:bg-[#c2baab] transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Stall New Horse'}</span>
        </button>
      </div>

      {!breeds || breeds.length === 0 ? (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 text-yellow-700">
          <p>Please register at least one breed in the Breed Registry before adding a horse.</p>
        </div>
      ) : null}

      {isAdding && (
        <div className="aged-paper p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 ink-text">New Horse Record</h3>
          <form onSubmit={handleAddHorse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  placeholder="e.g., Spirit"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Breed Blueprint</label>
                <select
                  required
                  value={breedId}
                  onChange={(e) => setBreedId(Number(e.target.value))}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                >
                  <option value="" disabled>Select a breed...</option>
                  {breeds?.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.rarity})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                >
                  <option value="" disabled>Select Gender</option>
                  <option value="Stallion">Stallion</option>
                  <option value="Mare">Mare</option>
                  <option value="Gelding">Gelding</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Personality</label>
                <input
                  type="text"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  placeholder="e.g., Brave, Spooked"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Genes</label>
                <input
                  type="text"
                  value={genes}
                  onChange={(e) => setGenes(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  placeholder="e.g., Base Coat Genes: ee, E-, BLK"
                />
              </div>

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
              <div>
                <label className="block text-sm font-bold mb-1">Base Stats</label>
                <input
                  type="text"
                  value={baseStatsStr}
                  onChange={(e) => setBaseStatsStr(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  placeholder="e.g., speed: 5, agility: 4"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-1">Initial Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  rows={2}
                  placeholder="e.g., Slightly injured upon capture, highly spirited..."
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#2c3e50] text-[#fdfbf7] px-6 py-2 rounded hover:bg-[#1a252f] transition-colors font-bold tracking-wider"
              >
                Add to Stable
              </button>
            </div>
          </form>
        </div>
      )}


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

      {/* Sell Modal */}
      {sellModalHorseId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="aged-paper p-6 rounded-lg w-full max-w-md">
            <h3 className="text-2xl font-bold mb-4 ink-text">Finalize Sale</h3>
            <p className="mb-4 text-sm">
              Suggested Value: <span className="font-bold text-green-700">${getSuggestedPrice(activeHorses?.find((h: any) => h.id === sellModalHorseId) as any)}</span>
            </p>
            <form onSubmit={handleSell} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Buyer Name</label>
                <input
                  type="text"
                  required
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Final Sale Price ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setSellModalHorseId(null)}
                  className="px-4 py-2 border border-[#d3cbb8] rounded hover:bg-[#d3cbb8]/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 transition-colors font-bold"
                >
                  Confirm Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {activeHorses?.map((horse: any) => {
          const breed = breeds?.find((b: any) => b.id === horse.breedId);
          const suggestedPrice = getSuggestedPrice(horse);

          return (
            <div key={horse.id} className="aged-paper p-5 rounded-lg flex flex-col">
              <div className="flex justify-between items-start mb-4 border-b border-[#d3cbb8] pb-2">
                <div>
                  <h3 className="text-2xl font-bold ink-text">{horse.name}</h3>
                  <p className="text-sm italic">{breed?.name || 'Unknown Breed'}</p>
                  <p className="text-xs mt-1 text-gray-600">
                    {horse.gender && <span className="mr-2"><b>Gender:</b> {horse.gender}</span>}
                    {horse.personality && <span className="mr-2"><b>Personality:</b> {horse.personality}</span>}
                    {horse.genes && <span><b>Genes:</b> {horse.genes}</span>}
                  </p>
                </div>
                <div className="text-right">
                  <span className="block text-lg font-bold text-green-700">${suggestedPrice}</span>
                  <span className="text-xs text-gray-500">Est. Value</span>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold">Training Progress</span>
                    <span>{horse.currentXP} / 2000 XP</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={horse.currentXP}
                    onChange={(e) => handleUpdateXP(horse.id!, Number(e.target.value))}
                    className="w-full accent-[#8b7355]"
                  />
                  {horse.isTrained && <span className="text-xs font-bold text-green-600">Fully Trained (+Bundle Fee Applied)</span>}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                  <div>
                    <span className="font-bold block mb-1">Base Stats:</span>
                    {horse.baseStats && Object.keys(horse.baseStats).length > 0 ? (
                      <div className="space-y-1">
                        {Object.entries(horse.baseStats).map(([key, val]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key}</span>
                            <span className="font-mono">{val as number}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">None</span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold block mb-1">Final Stats:</span>
                    {horse.finalStats && Object.keys(horse.finalStats).length > 0 ? (
                      <div className="space-y-1 mb-2">
                        {Object.entries(horse.finalStats).map(([key, val]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key}</span>
                            <span className="font-mono">{val as number}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic mb-2 block">None</span>
                    )}

                    <div className="flex gap-2">
                       <input
                        type="text"
                        placeholder="attr: val, ..."
                        className="w-full p-1 text-xs border border-[#d3cbb8] rounded bg-transparent focus:outline-none"
                        onBlur={(e) => handleUpdateFinalStats(horse.id!, e.target.value)}
                        defaultValue={horse.finalStats ? Object.entries(horse.finalStats).map(([k, v]) => `${k}: ${v}`).join(', ') : ''}
                      />
                    </div>
                  </div>
                </div>

                {horse.notes && (
                  <div className="bg-[#f4f1ea] p-3 rounded border border-[#d3cbb8]/50 text-sm">
                    <span className="font-bold block mb-1">Notes:</span>
                    <p className="font-mono text-gray-700">{horse.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#d3cbb8] flex justify-end space-x-2">
                <button
                  onClick={() => openEditModal(horse)}
                  className="flex items-center space-x-2 bg-[#d3cbb8] text-[#2c3e50] px-4 py-2 rounded hover:bg-[#c2baab] transition-colors"
                >
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    setSellModalHorseId(horse.id!);
                    setSalePrice(suggestedPrice);
                  }}
                  className="flex items-center space-x-2 bg-[#8b7355] text-[#fdfbf7] px-4 py-2 rounded hover:bg-[#725e44] transition-colors"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Mark as Sold</span>
                </button>
              </div>
            </div>
          );
        })}

        {activeHorses?.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 italic">
            No horses currently in the active stable.
          </div>
        )}
      </div>
    </div>
  );
}
