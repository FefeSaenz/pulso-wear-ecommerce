import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

// Contexts
import { useApp } from '@/src/context/AppContext';
import { useCart } from '@/src/context/CartContext';

// Components
import Header from './Header';
import Footer from './Footer';
import AnnouncementBar from './AnnouncementBar';
import CartDrawer from '../cart/CartDrawer';
import QuickViewModal from '../ui/QuickViewModal';
import CheckoutModal from '../ui/CheckoutModal';
import UserProfile from '../ui/UserProfile';

import { Product } from '@/src/types/product.types';
import SearchOverlay from './SearchOverlay';

const Layout: React.FC = () => {
    const navigate = useNavigate();
    const { loading } = useApp();
    const { 
        cart, orders, isCartOpen, setIsCartOpen, 
        isProfileOpen, setIsProfileOpen, 
        isCheckoutOpen, setIsCheckoutOpen, 
        addToCart, updateQuantity, removeFromCart, 
        handleCheckoutComplete 
    } = useCart();

    // --- ESTADOS GLOBALES DE UI ---
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);

    // Manejador de búsqueda: Redirige a la tienda con el parámetro
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        if (value.trim()) {
            setIsSearchOpen(false);
            navigate(`/productos?search=${encodeURIComponent(value)}`); // Dirige a la página de productos
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center font-bold text-2xl tracking-tighter animate-pulse">
            CARGANDO PULSO WEAR...
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col pt-20">
          
            <Header 
                onOpenCart={() => setIsCartOpen(true)}
                onOpenProfile={() => setIsProfileOpen(true)}
                onOpenSearch={() => setIsSearchOpen(true)}
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
            />
          
            <AnnouncementBar 
                messages={["3X2 EN TODA LA WEB", "ENVÍO GRATIS + $120.000", "6 CUOTAS SIN INTERÉS"]} 
            />

            <SearchOverlay 
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />
            
            <main className="grow">
                {/* Pasamos setSelectedQuickView para que las páginas hijas (Home, Category) puedan abrirlo */}
                <Outlet context={{ setSelectedQuickView, searchTerm, setSearchTerm }} />
            </main>

            <Footer />

            {/* --- COMPONENTES DE INTERACCIÓN GLOBAL --- */}
            <CartDrawer 
                isOpen={isCartOpen} 
                onClose={() => setIsCartOpen(false)} 
                onOpenCheckout={() => { setIsCartOpen(false); setIsCheckoutOpen(true); }}
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onAddFromRec={(p) => setSelectedQuickView(p)}
            />

            <QuickViewModal 
                product={selectedQuickView}
                onClose={() => setSelectedQuickView(null)}
                onAddToCart={(product, size) => {
                    addToCart(product, size); 
                    setSelectedQuickView(null); 
                }}
            />

            <CheckoutModal 
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                cart={cart}
                onComplete={handleCheckoutComplete}
            />

            <UserProfile 
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                orders={orders}
            />
        </div>
    );
};

export default Layout;