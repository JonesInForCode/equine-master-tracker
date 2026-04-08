import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Landmark } from 'lucide-react';

export default function SalesLedger() {
  const sales = useLiveQuery(() => db.sales.toArray());
  const horses = useLiveQuery(() => db.horses.toArray());
  const breeds = useLiveQuery(() => db.breeds.toArray());

  // Calculate total profit
  const totalProfit = sales?.reduce((sum: number, sale: any) => sum + sale.salePrice, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold ink-text">Sales Ledger</h2>
        <div className="bg-[#2c3e50] text-[#fdfbf7] px-6 py-3 rounded-lg flex items-center space-x-3 shadow-md">
          <Landmark className="w-6 h-6" />
          <div>
            <span className="block text-xs uppercase tracking-wider opacity-80">Total Revenue</span>
            <span className="block text-2xl font-bold">${totalProfit.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="aged-paper rounded-lg overflow-hidden border border-[#d3cbb8]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#d3cbb8]/30 border-b border-[#d3cbb8]">
                <th className="p-4 font-bold text-sm text-[#3e3832]">Date</th>
                <th className="p-4 font-bold text-sm text-[#3e3832]">Horse Name</th>
                <th className="p-4 font-bold text-sm text-[#3e3832]">Breed</th>
                <th className="p-4 font-bold text-sm text-[#3e3832]">Buyer</th>
                <th className="p-4 font-bold text-sm text-[#3e3832] text-right">Sale Price</th>
              </tr>
            </thead>
            <tbody>
              {sales?.sort((a: any, b: any) => b.date.getTime() - a.date.getTime()).map((sale: any) => {
                const horse = horses?.find((h: any) => h.id === sale.horseId);
                const breed = breeds?.find((b: any) => b.id === horse?.breedId);

                return (
                  <tr key={sale.id} className="border-b border-[#d3cbb8]/50 hover:bg-[#d3cbb8]/10 transition-colors">
                    <td className="p-4 text-sm whitespace-nowrap">
                      {sale.date.toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-bold">
                      {horse?.name || 'Unknown Horse'}
                    </td>
                    <td className="p-4 text-sm italic">
                      {breed?.name || 'Unknown Breed'}
                    </td>
                    <td className="p-4 text-sm font-mono">
                      {sale.buyerName}
                    </td>
                    <td className="p-4 text-sm font-bold text-right text-green-700">
                      ${sale.salePrice.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
              {(!sales || sales.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                    No sales recorded yet. Your ledger pages are empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
