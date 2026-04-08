import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, BreedTemplate } from '../db';
import { Plus } from 'lucide-react';

export default function BreedRegistry() {
  const breeds = useLiveQuery(() => db.breeds.toArray());

  const [name, setName] = useState('');
  const [rarity, setRarity] = useState<BreedTemplate['rarity']>('Common');
  const [temperament, setTemperament] = useState('');
  const [wildLocation, setWildLocation] = useState('');

  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.breeds.add({
        name,
        rarity,
        temperament,
        wildLocation,
        baseValue: 0,
      });

      // Reset form
      setName('');
      setRarity('Common');
      setTemperament('');
      setWildLocation('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add breed', error);
      alert('Failed to add breed. Check console for details.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold ink-text">Breed Registry</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-[#d3cbb8] px-4 py-2 rounded hover:bg-[#c2baab] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Add Breed'}</span>
        </button>
      </div>

      {isAdding && (
        <div className="aged-paper p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 ink-text">New Breed Template</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  placeholder="e.g., Mustang"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Rarity</label>
                <select
                  value={rarity}
                  onChange={(e) => setRarity(e.target.value as BreedTemplate['rarity'])}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                >
                  <option value="Common">Common</option>
                  <option value="Uncommon">Uncommon</option>
                  <option value="Rare">Rare</option>
                  <option value="Legendary">Legendary</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Temperament</label>
                <input
                  type="text"
                  value={temperament}
                  onChange={(e) => setTemperament(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  placeholder="e.g., Wild, Skittish"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Wild Location</label>
                <input
                  type="text"
                  value={wildLocation}
                  onChange={(e) => setWildLocation(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  placeholder="e.g., Heartlands"
                />
              </div>

            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#2c3e50] text-[#fdfbf7] px-6 py-2 rounded hover:bg-[#1a252f] transition-colors font-bold tracking-wider"
              >
                Save Blueprint
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {breeds?.map((breed: BreedTemplate) => (
          <div key={breed.id} className="aged-paper p-5 rounded-lg flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold ink-text">{breed.name}</h3>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                breed.rarity === 'Legendary' ? 'bg-yellow-200 text-yellow-800' :
                breed.rarity === 'Rare' ? 'bg-blue-200 text-blue-800' :
                breed.rarity === 'Uncommon' ? 'bg-green-200 text-green-800' :
                'bg-gray-200 text-gray-800'
              }`}>
                {breed.rarity}
              </span>
            </div>

            <div className="space-y-2 flex-1 text-sm">
              <p><span className="font-bold">Temperament:</span> {breed.temperament || 'Unknown'}</p>
              <p><span className="font-bold">Location:</span> {breed.wildLocation || 'Unknown'}</p>


            </div>
          </div>
        ))}
        {breeds?.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 italic">
            No breeds registered yet. The library awaits its first entry.
          </div>
        )}
      </div>
    </div>
  );
}
