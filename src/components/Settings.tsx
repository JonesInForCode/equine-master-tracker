import { useState, useRef } from 'react';
import { db } from '../db';
import { Download, Upload, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      const breeds = await db.breeds.toArray();
      const horses = await db.horses.toArray();
      const sales = await db.sales.toArray();
      const items = await db.items.toArray();

      const data = {
        version: 1,
        timestamp: new Date().toISOString(),
        breeds,
        horses,
        sales,
        items
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `redm-stable-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
      alert('Failed to export data.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    if (window.confirm('Warning: Importing will OVERWRITE all current data. Are you sure you want to proceed?')) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const result = event.target?.result;
          if (typeof result !== 'string') throw new Error('Invalid file content');

          const data = JSON.parse(result);

          // Validate basic structure
          if (!data.breeds || !data.horses || !data.sales || !data.items) {
             throw new Error('Invalid backup file format');
          }

          // Clear and import within a transaction
          await db.transaction('rw', db.breeds, db.horses, db.sales, db.items, async () => {
            await db.breeds.clear();
            await db.horses.clear();
            await db.sales.clear();
            await db.items.clear();

            if (data.breeds.length > 0) await db.breeds.bulkAdd(data.breeds);
            if (data.horses.length > 0) await db.horses.bulkAdd(data.horses);
            if (data.sales.length > 0) {
              const salesWithDates = data.sales.map((s: any) => ({
                ...s,
                date: new Date(s.date)
              }));
              await db.sales.bulkAdd(salesWithDates);
            }
            if (data.items.length > 0) await db.items.bulkAdd(data.items);
          });

          alert('Data imported successfully!');
          window.location.reload(); // Reload to refresh all live queries
        } catch (err) {
          console.error('Import parse/db error', err);
          alert('Failed to parse or import data. Ensure the file is a valid backup.');
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Import file error', error);
      alert('Failed to read file.');
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearData = async () => {
    if (window.confirm('CRITICAL WARNING: This will permanently delete ALL data. Type "DELETE" to confirm.')) {
      const confirmStr = window.prompt('Type "DELETE" to confirm wiping all data.');
      if (confirmStr === 'DELETE') {
        try {
          await db.transaction('rw', db.breeds, db.horses, db.sales, db.items, async () => {
            await db.breeds.clear();
            await db.horses.clear();
            await db.sales.clear();
            await db.items.clear();
          });
          alert('All data has been wiped.');
          window.location.reload();
        } catch (error) {
          console.error("Failed to clear data", error);
        }
      }
    }
  };


  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold ink-text">Ledger Settings</h2>

      <div className="aged-paper p-6 rounded-lg space-y-6">
        <div>
          <h3 className="text-xl font-bold mb-2 ink-text border-b border-[#d3cbb8] pb-2">Data Portability</h3>
          <p className="text-sm mb-4">
            Your data is stored entirely in your browser's local storage (IndexedDB).
            It is highly recommended to export your data regularly to prevent loss if your browser cache is cleared.
          </p>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex-1 flex items-center justify-center space-x-2 bg-[#2c3e50] text-[#fdfbf7] px-4 py-3 rounded hover:bg-[#1a252f] transition-colors font-bold disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>{isExporting ? 'Exporting...' : 'Export Backup (JSON)'}</span>
            </button>

            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={handleImportClick}
              disabled={isImporting}
              className="flex-1 flex items-center justify-center space-x-2 bg-[#d3cbb8] text-[#3e3832] border border-[#8b7355] px-4 py-3 rounded hover:bg-[#c2baab] transition-colors font-bold disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              <span>{isImporting ? 'Importing...' : 'Import Backup (JSON)'}</span>
            </button>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-red-200">
          <h3 className="text-xl font-bold text-red-700 mb-2 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Danger Zone</span>
          </h3>
          <p className="text-sm mb-4 text-red-600">
            Once you delete your data, there is no going back. Please be certain.
          </p>
          <button
            onClick={handleClearData}
            className="w-full border-2 border-red-500 text-red-600 px-4 py-2 rounded hover:bg-red-50 transition-colors font-bold"
          >
            Wipe All Local Data
          </button>
        </div>
      </div>
    </div>
  );
}
