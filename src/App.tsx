import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Contexts
import { AppProvider } from '@/src/context/AppContext';
import { CartProvider } from '@/src/context/CartContext';

// Layout Principal
import Layout from '@/src/components/layout/Layout';

// Pages
import Home from '@/src/pages/Home';
import Products from './pages/Products';

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        
        <Route path="/productos" element={<Products />} />
        
        <Route 
          path="/category/:id" 
          element={<div className="p-20 text-center text-2xl font-black">CATEGORÍA DINÁMICA</div>} 
        />

        {/* Página 404 (Opcional pero recomendado) */}
        <Route 
          path="*" 
          element={<div className="p-20 text-center">404 - Página no encontrada</div>} 
        />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <CartProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <AppContent />
        </Router>
      </CartProvider>
    </AppProvider>
  );
};

export default App;