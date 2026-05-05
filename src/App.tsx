import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Contexts
import { AuthProvider } from '@/src/context/AuthContext';
import { AppProvider } from '@/src/context/AppContext';
import { CartProvider } from '@/src/context/CartContext';

// Layout Principal
import Layout from '@/src/components/layout/Layout';

// Pages (LAZY LOADING)
const Home = lazy(() => import('@/src/pages/Home'));
const Products = lazy(() => import('@/src/pages/Products'))
const ProductDetail = lazy(() => import('@/src/pages/ProductDetail'))
const OrderSuccess = lazy(() => import('@/src/pages/OrderSuccess'))

// Pantalla de carga genérica mientras se descargan los "chunks" de código
const PageLoader = () => (
  <div className="h-screen flex items-center justify-center font-bold text-2xl tracking-tighter animate-pulse">
    CARGANDO PULSO WEAR...
  </div>
);

const AppContent: React.FC = () => {
  // Escuchamos en qué ruta estamos
  const { pathname } = useLocation();

  // Cada vez que cambie el 'pathname', scrolleamos arriba de todo suavemente
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);


  return (
    <Suspense fallback={<PageLoader />}>
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
          <Route path="/orden/:id" element={<OrderSuccess />} />

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
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <CartProvider>
          <Router basename={import.meta.env.BASE_URL}>
            <AppContent />
          </Router>
        </CartProvider>
      </AppProvider>
    </AuthProvider>
  );
};

export default App;