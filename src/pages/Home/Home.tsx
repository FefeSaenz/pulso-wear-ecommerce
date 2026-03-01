import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext'; // Consumo de la API
import { useCart } from '../../context/CartContext'; // Consumo del Carrito Global

// Layout Components
import Footer from '../../components/layout/Footer';
import AnnouncementBar from '../../components/layout/AnnouncementBar';
import CartDrawer from '../../components/cart/CartDrawer';

// UI Components
import HeroBanner from '../../components/ui/HeroBanner';
import QuickViewModal from '../../components/ui/QuickViewModal';
import CheckoutModal from '../../components/ui/CheckoutModal';
import UserProfile from '../../components/ui/UserProfile';

// Business Components
import FilterBar from '../../components/ui/FilterBar';
import ProductGrid from '../../components/layout/ProductGrid';
import LocationsSection from '../../components/layout/LocationsSection';

// Utils & Data
import { Product } from '../../../types';
import { MOCK_PRODUCTS } from '../../../constants';

interface HomeProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

const Home: React.FC<HomeProps> = ({ searchTerm, setSearchTerm }) => {
    const { frontConfig, data, loading } = useApp(); // Data de la API disponible aquí
    const mainBanner = frontConfig?.banners?.[0]; //Primer banner de la lista

    const { 
        cart, orders, isCartOpen, setIsCartOpen, isProfileOpen, setIsProfileOpen,
        isCheckoutOpen, setIsCheckoutOpen, addToCart, updateQuantity, 
        removeFromCart, handleCheckoutComplete, cartCount 
    } = useCart();

    const heroData = {
        title: mainBanner?.title || "STREET ESSENTIALS",
        subtitle: mainBanner?.subtitle || "New Era Collection",
        image: mainBanner?.image || "./assets/herobanner.png",
        ctaText: mainBanner?.cta?.text || "Explorar tienda"
    };

    // --- ESTADOS DE NEGOCIO LOCALES (Específicos de la página) ---
    const [selectedQuickView, setSelectedQuickView] = useState<Product | null>(null);

    // Filtering & Search state
    // --- ESTADOS DE FILTRADO Y BÚSQUEDA ---
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high'>('default');

    const categories = ['Todos', 'Remeras', 'Pantalones'];

    /*
        LÓGICA DE FILTRADO DE PRODUCTOS
        Memorizamos el resultado para evitar cálculos innecesarios en cada render.
    */
    const filteredProducts = useMemo(() => {
        let result = activeCategory === 'Todos' 
        ? [...MOCK_PRODUCTS] 
        : MOCK_PRODUCTS.filter(p => p.category === activeCategory);

        // Apply Search
        if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.category.toLowerCase().includes(term) ||
            (p.description && p.description.toLowerCase().includes(term))
        );
        }

        // Apply Sort
        if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);

        return result;
    }, [activeCategory, sortBy, searchTerm]);

    if (loading) return <div className="h-screen flex items-center justify-center font-bold text-xl">Cargando Pulso Wear...</div>;
        console.log("Data real de la API:", data);
    return (
        <>
            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-grow">
                
                <AnnouncementBar 
                    messages={["3X2 EN TODA LA WEB", "ENVÍO GRATIS + $120.000", "6 CUOTAS SIN INTERÉS"]} 
                />

                <HeroBanner 
                    banners={frontConfig?.banners || []}
                    onCtaClick={(url) => {
                        if (url.startsWith('#')) {
                        const targetId = url.replace('#', '');
                        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                        } else {
                        // Si es una URL externa o de otra página
                        window.location.href = url;
                        }
                    }}
                />

                <FilterBar 
                    categories={categories} 
                    activeCategory={activeCategory} 
                    onCategoryChange={setActiveCategory} 
                    sortBy={sortBy} 
                    onSortChange={(v) => setSortBy(v as any)} 
                />

                <ProductGrid 
                    products={filteredProducts} 
                    searchTerm={searchTerm} 
                    onClearSearch={() => setSearchTerm('')} 
                    onQuickView={setSelectedQuickView} 
                    onResetFilters={() => {setActiveCategory('Todos'); setSearchTerm('');}} 
                />

                <LocationsSection />

                <Footer />
            </main>

            {/* COMPONENTES DE INTERACCIÓN (Consumiendo del Context) */}
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
                    // 1. Ejecuta la lógica global del carrito (guardar + abrir drawer)
                    addToCart(product, size); 
                    // 2. Limpia el estado local de la Home para cerrar este modal
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
        </>
    );
};

export default Home;