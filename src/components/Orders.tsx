import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, HorseOrder } from '../db';
import { Plus } from 'lucide-react';

export default function Orders() {
  const orders = useLiveQuery(() => db.orders.toArray());

  const [customerName, setCustomerName] = useState('');
  const [orderType, setOrderType] = useState<HorseOrder['orderType']>('Full Order');
  const [color, setColor] = useState('');
  const [gender, setGender] = useState('');
  const [personality, setPersonality] = useState('');
  const [notes, setNotes] = useState('');

  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.orders.add({
        customerName,
        orderType,
        color,
        gender,
        personality,
        notes,
        status: 'Pending',
        date: new Date(),
      });

      // Reset form
      setCustomerName('');
      setOrderType('Full Order');
      setColor('');
      setGender('');
      setPersonality('');
      setNotes('');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add order', error);
      alert('Failed to add order. Check console for details.');
    }
  };

  const handleUpdateStatus = async (id: number, status: HorseOrder['status']) => {
    try {
      await db.orders.update(id, { status });
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold ink-text">Order Book</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-2 bg-[#d3cbb8] px-4 py-2 rounded hover:bg-[#c2baab] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'New Order'}</span>
        </button>
      </div>

      {isAdding && (
        <div className="aged-paper p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4 ink-text">New Horse Order</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  placeholder="e.g., Arthur Morgan"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Order Type</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as HorseOrder['orderType'])}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                >
                  <option value="Full Order">Full Order (Catch/Buy & Train)</option>
                  <option value="Training Only">Training Only</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Desired Color</label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  placeholder="e.g., Dapple Grey"
                />
              </div>
               <div>
                <label className="block text-sm font-bold mb-1">Preferred Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                >
                  <option value="">Any</option>
                  <option value="Stallion">Stallion</option>
                  <option value="Mare">Mare</option>
                  <option value="Gelding">Gelding</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Desired Personality</label>
                <input
                  type="text"
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  placeholder="e.g., Brave"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-1">Additional Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 border border-[#d3cbb8] rounded bg-transparent focus:outline-none focus:ring-2 focus:ring-[#8b7355]/30"
                  rows={2}
                  placeholder="e.g., Needs to be fast, willing to pay extra for legendary..."
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#2c3e50] text-[#fdfbf7] px-6 py-2 rounded hover:bg-[#1a252f] transition-colors font-bold tracking-wider"
              >
                Log Order
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {orders?.map((order: HorseOrder) => (
          <div key={order.id} className="aged-paper p-5 rounded-lg flex flex-col">
            <div className="flex justify-between items-start mb-4 border-b border-[#d3cbb8] pb-2">
              <div>
                <h3 className="text-xl font-bold ink-text">{order.customerName}</h3>
                <p className="text-sm font-bold mt-1">{order.orderType}</p>
              </div>
              <div className="text-right">
                <select
                  value={order.status}
                  onChange={(e) => handleUpdateStatus(order.id!, e.target.value as HorseOrder['status'])}
                  className={`p-1 text-sm font-bold rounded focus:outline-none ${
                    order.status === 'Completed' ? 'bg-green-200 text-green-800' :
                    order.status === 'In Progress' ? 'bg-blue-200 text-blue-800' :
                    'bg-yellow-200 text-yellow-800'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">{new Date(order.date).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-2 flex-1 text-sm">
               <p><span className="font-bold">Color:</span> {order.color || 'Any'}</p>
               <p><span className="font-bold">Gender:</span> {order.gender || 'Any'}</p>
               <p><span className="font-bold">Personality:</span> {order.personality || 'Any'}</p>
               {order.notes && (
                  <div className="mt-2 bg-[#f4f1ea] p-2 rounded border border-[#d3cbb8]/50">
                    <span className="font-bold block mb-1">Notes:</span>
                    <p className="font-mono text-gray-700">{order.notes}</p>
                  </div>
                )}
            </div>
          </div>
        ))}
        {orders?.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 italic">
            No orders logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
