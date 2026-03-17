import React, { useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';

// Contexts & Hooks
import { useApp } from '@/src/context/AppContext'; // Consumo de la API
import { useProductFilters } from '@/src/hooks/useProductFilters';
import { Product } from '@/src/types/product.types';
import { mapApiProductToLocal } from '@/src/utils/mappers';

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
    const { frontConfig, loading } = useApp(); // Data de la API disponible aquí
    // Obtenemos las funciones y estados globales del Layout
    const { setSelectedQuickView, searchTerm, setSearchTerm } = useOutletContext<HomeContext>();
    
    // NORMALIZACIÓN DE PRODUCTOS DESTACADOS
    // Transformamos los FeaturedProduct de la API al tipo Product de la UI
    const featuredMapped = useMemo(() => {
        const raw = frontConfig?.featured_products?.products || [];
        return raw.map(mapApiProductToLocal); // Ahora sí son consistentes
    }, [frontConfig]);

    
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
                cta: { url: '/productos', text: 'EXPLORAR TIENDA' } 
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
    
    // USO DEL HOOK DE FILTRADO (Corregido con 'products')
    const {
        filteredProducts,
        activeCategory,
        setActiveCategory,
        sortBy,
        setSortBy,
        categories
    } = useProductFilters({
        products: featuredMapped, // <--- Aquí estaba el error de nombre
        searchTerm
    });

    // Manejador de navegación para Banners
    const handleBannerClick = (url: string) => {
        if (url.startsWith('#')) {
        const targetId = url.replace('#', '');
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        } else {
        navigate(url);
        }
    };

    // Evitamos renderizar contenido inconsistente si la API está cargando
    if (loading && !frontConfig) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pulso Wear</p>
            </div>
        </div>
        );
    }

    return (
        <div className="animate-in fade-in duration-700">
            <HeroBanner
                banners={visualBanners}
                onCtaClick={handleBannerClick}
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