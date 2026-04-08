import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, DollarSign } from 'lucide-react';

export default function HorseManager() {
  const breeds = useLiveQuery(() => db.breeds.toArray());
  const activeHorses = useLiveQuery(() => db.horses.where('status').notEqual('Sold').toArray());

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [breedId, setBreedId] = useState<number | ''>('');
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

      await db.horses.add({
        breedId: Number(breedId),
        name,
        currentXP: 0,
        isTrained: false,
        customStats: { ...selectedBreed.baseStats }, // copy base stats initially
        notes,
        status: 'Stabled',
      });

      setName('');
      setBreedId('');
      setNotes('');
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

  const getSuggestedPrice = (horse: { breedId: number; currentXP: number }) => {
    const breed = breeds?.find((b: any) => b.id === horse.breedId);
    if (!breed) return 0;

    let price = breed.baseValue;

    // Rarity Premium
    if (breed.rarity === 'Legendary') price += 1000;
    else if (breed.rarity === 'Rare') price += 500;
    else if (breed.rarity === 'Uncommon') price += 200;

    // Training Bundle Fee
    if (horse.currentXP >= 2000) {
      price += 200;
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

                {horse.notes && (
                  <div className="bg-[#f4f1ea] p-3 rounded border border-[#d3cbb8]/50 text-sm">
                    <span className="font-bold block mb-1">Notes:</span>
                    <p className="font-mono text-gray-700">{horse.notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#d3cbb8] flex justify-end">
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
