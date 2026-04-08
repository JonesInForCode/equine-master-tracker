import { Link, Outlet } from 'react-router-dom';
import { Book, Home, Landmark, Hammer, ClipboardList, Settings as SettingsIcon, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-64 border-r border-[#d3cbb8] flex flex-col p-4 space-y-4 bg-[#f4f1ea] z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="mb-6 pb-4 border-b border-[#d3cbb8] flex justify-between items-center">
          <h1 className="text-2xl font-bold ink-text">Equine Ledger</h1>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 space-y-2">
          <Link to="/" onClick={() => setIsSidebarOpen(false)} className="flex items-center space-x-3 p-2 rounded hover:bg-[#d3cbb8]/30 transition-colors">
            <Book className="w-5 h-5" />
            <span>Breed Registry</span>
          </Link>
          <Link to="/stable" onClick={() => setIsSidebarOpen(false)} className="flex items-center space-x-3 p-2 rounded hover:bg-[#d3cbb8]/30 transition-colors">
            <Home className="w-5 h-5" />
            <span>Active Stable</span>
          </Link>
          <Link to="/sales" onClick={() => setIsSidebarOpen(false)} className="flex items-center space-x-3 p-2 rounded hover:bg-[#d3cbb8]/30 transition-colors">
            <Landmark className="w-5 h-5" />
            <span>Sales Ledger</span>
          </Link>
          <Link to="/crafting" onClick={() => setIsSidebarOpen(false)} className="flex items-center space-x-3 p-2 rounded hover:bg-[#d3cbb8]/30 transition-colors">
            <Hammer className="w-5 h-5" />
            <span>Crafting</span>
          </Link>
          <Link to="/orders" onClick={() => setIsSidebarOpen(false)} className="flex items-center space-x-3 p-2 rounded hover:bg-[#d3cbb8]/30 transition-colors">
            <ClipboardList className="w-5 h-5" />
            <span>Orders</span>
          </Link>
        </nav>
        <div className="border-t border-[#d3cbb8] pt-4">
           <Link to="/settings" onClick={() => setIsSidebarOpen(false)} className="flex items-center space-x-3 p-2 rounded hover:bg-[#d3cbb8]/30 transition-colors">
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center p-4 border-b border-[#d3cbb8] bg-[#f4f1ea]">
          <button onClick={() => setIsSidebarOpen(true)} className="mr-4" aria-label="Open menu">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold ink-text">Equine Ledger</h1>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
