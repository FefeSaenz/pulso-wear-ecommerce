import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Contexts
import { AppProvider } from '@/src/context/AppContext';
import { CartProvider } from '@/src/context/CartContext';

// Layout Principal
import Layout from '@/src/components/layout/Layout';

// Pages
import Home from '@/src/pages/Home';
import Products from '@/src/pages/Products';
import ProductDetail from '@/src/pages/ProductDetail';

const AppContent: React.FC = () => {
  // Escuchamos en qué ruta estamos
  const { pathname } = useLocation();

  // Cada vez que cambie el 'pathname', scrolleamos arriba de todo suavemente
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        
        <Route path="/productos" element={<Products />} />
        
        {/* Rutas dinámicas para categorías y subcategorías */}
        <Route 
          path="/category/:category" 
          element={<Products />} 
        />

        <Route 
          path="/category/:category/:subcategory"
          element={<Products />} 
        />

        <Route 
          path="/offers" 
          element={<Products />}
        />
          
        {/* Ruta para el detalle del producto */}
        <Route path="/product/:slug" element={<ProductDetail />} />

        {/* Página 404 (Opcional pero recomendado) */}
        <Route 
          path="*" 
          element={
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-20 text-center">
              <h1 className="text-6xl font-black italic-pulso mb-4">404</h1>
              <p className="text-gray-500 font-bold uppercase tracking-widest">Página no encontrada</p>
            </div>
        } 
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