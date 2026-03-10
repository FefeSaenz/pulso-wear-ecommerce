import React, { useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

// Contexts & Hooks
import { useApp } from '@/src/context/AppContext'; // Consumo de la API
import { useProductFilters } from '@/src/hooks/useProductFilters';
import { Product } from '@/src/types/product.types';

// UI Components
import HeroBanner from '@/src/components/ui/HeroBanner';
import FilterBar from '@/src/components/ui/FilterBar';
import ProductGrid from '@/src/components/layout/ProductGrid';
import LocationsSection from '@/src/components/layout/LocationsSection';

//Assets
import banner1 from '@/public/assets/PORTADA PAG WEB PULSO 1.png';
import banner2 from '@/public/assets/PORTADA PAG WEB PULSO 2.png';

// Definimos la interfaz del contexto que viene del Layout vía Outlet
interface HomeContext {
  setSelectedQuickView: (product: Product) => void;
  searchTerm: string;
  setSearchTerm: (val: string) => void;
}

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { frontConfig } = useApp(); // Data de la API disponible aquí
    
    // Obtenemos las funciones y estados globales del Layout
    const { setSelectedQuickView, searchTerm, setSearchTerm } = useOutletContext<HomeContext>();
    
    // Lógica de Negocio extraída del Hook (Custom Hook)
    const rawProducts = frontConfig?.featured_products?.products || [];

    // LÓGICA DE BANNERS DINÁMICOS CON OVERRIDE LOCAL ---
    const visualBanners = useMemo(() => {
        const apiBanners = frontConfig?.banners || [];

        // Si hay banners en la API, mapeamos y reemplazamos las imágenes por las locales
        if (apiBanners.length > 0) {
            return apiBanners.map((banner, index) => ({
                ...banner,
                // Al primer banner le ponemos banner1, al segundo banner2, el resto queda igual
                image: index === 0 ? banner1 : index === 1 ? banner2 : banner.image
            }));
        }

        // Si la API no devuelve banners (fallback), creamos la estructura mínima
        return [
            { 
                id: 'local-1', 
                title: 'STREET ESSENTIALS', 
                subtitle: 'NEW COLLECTION 2026', 
                image: banner1, 
                cta: { url: '#', text: 'EXPLORAR TIENDA' } 
            },
            { 
                id: 'local-2', 
                title: 'PULSE MODE', 
                subtitle: 'DROP EXCLUSIVO', 
                image: banner2, 
                cta: { url: '#', text: 'VER MÁS' } 
            }
        ];
    }, [frontConfig?.banners]);
    
    const {
        filteredProducts,
        activeCategory,
        setActiveCategory,
        sortBy,
        setSortBy,
        categories
    } = useProductFilters({ rawProducts, searchTerm });

    return (
        <div className="animate-in fade-in duration-700">
            <HeroBanner 
                /*banners={frontConfig?.banners || []} */
                banners={visualBanners}
                onCtaClick={(url) => {
                if (url.startsWith('#')) {
                    const targetId = url.replace('#', '');
                    document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
                } else if (url.startsWith('http')) {
                    // Salida externa (Redes sociales, etc.)
                    window.location.href = url;
                } else {
                    // Navegación interna SPA (React Router)
                    navigate(url);
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
                onResetFilters={() => { setActiveCategory('Todos'); setSearchTerm(''); }} 
            />

            <LocationsSection />
        </div>
    );
};

export default Home;