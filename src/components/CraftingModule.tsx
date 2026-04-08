import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Plus, Hammer, Trash2 } from 'lucide-react';

export default function CraftingModule() {
  const items = useLiveQuery(() => db.items.toArray());

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [baseCost, setBaseCost] = useState<number | ''>('');
  const [yieldQty, setYieldQty] = useState<number | ''>(1);
  const [requirements, setRequirements] = useState<{ itemId: number; qty: number }[]>([]);

  const [reqItemId, setReqItemId] = useState<number | ''>('');
  const [reqQty, setReqQty] = useState<number | ''>(1);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.items.add({
        name,
        isCrafted: false, // Defaulting to false, meaning we don't have it yet or it's a template
        baseCost: Number(baseCost) || 0,
        yieldQty: Number(yieldQty) || 1,
        requirements: requirements.length > 0 ? requirements : undefined,
      });

      setName('');
      setBaseCost('');
      setYieldQty(1);
      setRequirements([]);
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add item', error);
      alert('Failed to add crafting item.');
    }
  };

  const handleAddRequirement = () => {
    if (reqItemId !== '' && reqQty !== '') {
      setRequirements([...requirements, { itemId: Number(reqItemId), qty: Number(reqQty) }]);
      setReqItemId('');
      setReqQty(1);
    }
  };

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index));
  };

  const handleDeleteItem = async (id: number) => {
    if(window.confirm('Are you sure you want to delete this item? It might be required by other recipes.')) {
        await db.items.delete(id);
    }
  };

  // Recursive component to display requirements
  const RequirementTree = ({ reqs, indent = 0 }: { reqs?: { itemId: number; qty: number }[], indent?: number }) => {
    if (!reqs || reqs.length === 0) return null;

    return (
      <ul className={`space-y-1 ${indent > 0 ? 'ml-4 mt-1 border-l-2 border-[#d3cbb8]/30 pl-2' : 'mt-2'}`}>
        {reqs.map((req, idx) => {
          const item = items?.find((i: any) => i.id === req.itemId);
          if (!item) return <li key={idx} className="text-red-500 text-sm">Unknown Item x{req.qty}</li>;

          return (
            <li key={idx} className="text-sm">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[#8b7355]">{req.qty}x</span>
                <span>{item.name}</span>
              </div>
              {/* Recursive call */}
              {item.requirements && (
                <RequirementTree reqs={item.requirements.map((r: any) => ({...r, qty: r.qty * req.qty}))} indent={indent + 1} />
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold ink-text">Crafting & Supplies</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-[#d3cbb8] px-4 py-2 rounded hover:bg-[#c2baab] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'New Recipe'}</span>
        </button>
      </div>

      {isAdding && (
        <div className="aged-paper p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 ink-text">Recipe Builder</h3>
          <form onSubmit={handleAddItem} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  placeholder="e.g., Quality Hay"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Base Cost ($)</label>
                <input
                  type="number"
                  min="0"
                  value={baseCost}
                  onChange={(e) => setBaseCost(Number(e.target.value))}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Yield Qty</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={yieldQty}
                  onChange={(e) => setYieldQty(Number(e.target.value))}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                />
              </div>
            </div>

            <div className="border-t border-[#d3cbb8] pt-4">
              <h4 className="font-bold mb-2 text-sm uppercase tracking-wider">Required Materials (Optional)</h4>

              <div className="flex space-x-2 mb-4">
                <select
                  value={reqItemId}
                  onChange={(e) => setReqItemId(Number(e.target.value))}
                  className="flex-1 p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                >
                  <option value="" disabled>Select an item...</option>
                  {items?.map((item: any) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={reqQty}
                  onChange={(e) => setReqQty(Number(e.target.value))}
                  className="w-24 p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  placeholder="Qty"
                />
                <button
                  type="button"
                  onClick={handleAddRequirement}
                  disabled={reqItemId === ''}
                  className="bg-[#d3cbb8] px-4 py-2 rounded hover:bg-[#c2baab] transition-colors disabled:opacity-50"
                >
                  Add
                </button>
              </div>

              {requirements.length > 0 && (
                <ul className="space-y-2 bg-[#f4f1ea] p-3 rounded border border-[#d3cbb8]/50">
                  {requirements.map((req, idx) => {
                    const itemName = items?.find((i: any) => i.id === req.itemId)?.name;
                    return (
                      <li key={idx} className="flex justify-between items-center text-sm">
                        <span>{req.qty}x <span className="font-bold">{itemName}</span></span>
                        <button
                          type="button"
                          onClick={() => removeRequirement(idx)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center space-x-2 bg-[#2c3e50] text-[#fdfbf7] px-6 py-2 rounded hover:bg-[#1a252f] transition-colors font-bold tracking-wider"
              >
                <Hammer className="w-4 h-4" />
                <span>Save Recipe</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items?.map((item: any) => (
          <div key={item.id} className="aged-paper p-5 rounded-lg flex flex-col relative group">
             <button
                onClick={() => handleDeleteItem(item.id!)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>

            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold ink-text">{item.name}</h3>
              <span className="bg-[#d3cbb8]/50 px-2 py-1 rounded text-xs font-bold">
                Yields: {item.yieldQty}
              </span>
            </div>

            <p className="text-sm mb-4">
              <span className="font-bold">Base Cost:</span> ${item.baseCost}
            </p>

            <div className="flex-1">
              {item.requirements && item.requirements.length > 0 ? (
                <>
                  <span className="text-xs font-bold uppercase tracking-wider border-b border-[#d3cbb8]/50 block pb-1 mb-2">Recipe</span>
                  <RequirementTree reqs={item.requirements} />
                </>
              ) : (
                <span className="text-xs italic text-gray-500">Base Material (No requirements)</span>
              )}
            </div>
          </div>
        ))}
        {items?.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 italic">
            No crafting recipes or supplies have been cataloged yet.
          </div>
        )}
      </div>
    </div>
  );
}
