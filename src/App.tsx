import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
// Placeholder components, we will replace these in the next steps
import BreedRegistry from './components/BreedRegistry';
import HorseManager from './components/HorseManager';
import SalesLedger from './components/SalesLedger';
import CraftingModule from './components/CraftingModule';
import Orders from './components/Orders';
import Settings from './components/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<BreedRegistry />} />
          <Route path="stable" element={<HorseManager />} />
          <Route path="sales" element={<SalesLedger />} />
          <Route path="crafting" element={<CraftingModule />} />
          <Route path="orders" element={<Orders />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
