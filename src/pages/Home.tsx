import React, { useMemo, useEffect } from 'react';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';

// Contexts & Hooks
import { useApp } from '@/src/context/AppContext'; // Consumo de la API
import { Product } from '@/src/types/product.types';
import { useQuickView } from '@/src/hooks/useQuickView';
import { useUnifiedProducts } from '@/src/hooks/useUnifiedProducts';

// UI Components
import HeroBanner from '@/src/components/ui/HeroBanner';
import ProductGrid from '@/src/components/layout/ProductGrid';
import ProductCarousel from '@/src/components/ui/ProductCarousel';
import LocationsSection from '@/src/components/layout/LocationsSection';

//Assets
import banner1 from '@/src/assets/PORTADA PAG WEB PULSO 1.png';
import banner2 from '@/src/assets/PORTADA PAG WEB PULSO 2.png';

// Definimos la interfaz del contexto que viene del Layout vía Outlet
interface HomeContext {
  setSelectedQuickView: (product: Product | null) => void;
}

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { hash } = useLocation(); // Para detectar anclas en la URL
    const { allProducts, loading, frontConfig } = useApp(); // Data de la API disponible
    
    const { setSelectedQuickView } = useOutletContext<HomeContext>();

    const { handleQuickView } = useQuickView(setSelectedQuickView);
    
    const { featuredProducts } = useUnifiedProducts(); // Obtenemos los productos unificados desde el nuevo hook
    
    // AUTO-SCROLL: Si entramos a la Home y hay un ancla, bajamos hasta ahí
    useEffect(() => {
        if (hash) {
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                // Pequeño delay para asegurar que el DOM ya pintó el mapa
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 200); 
            }
        }
    }, [hash]);

    // LÓGICA DE OFERTAS PARA EL CARRUSEL ---
    const offersMapped = useMemo(() => {
        return allProducts
          .filter(p => p.discount_percentage && p.discount_percentage > 0)
          .slice(0, 10); // Máximo 10 ofertas en el carrusel
    }, [allProducts]);
    
    // LÓGICA DE BANNERS DINÁMICOS CON OVERRIDE LOCAL ---
    const visualBanners = useMemo(() => {
        // Asumimos que los guardás temporalmente acá hasta que definamos el estado global final
        const apiBanners = frontConfig?.banners || [];

        if (apiBanners.length > 0) {
            return apiBanners.map((banner: any, index: number) => ({
                id: banner.link_item_id.toString(),
                type: 'hero' as const,
                // Fallbacks: Si no hay título, ponemos uno genérico según el índice
                title: banner.link_item_title && banner.link_item_title !== `banner_${index + 1}` 
                        ? banner.link_item_title 
                        : (index === 0 ? 'NUEVA COLECCIÓN' : 'STREET ESSENTIALS'),
                subtitle: banner.link_item_description || 'PULSO WEAR',
                description: '',
                image: banner.link_item_picture, // ¡Usamos la imagen real de la API!
                cta: { 
                    url: banner.link_item_href || '/productos', // Fallback: Si no hay link, a la tienda
                    text: 'VER PRODUCTOS' 
                }
            }));
        }

        // Si la API no devuelve NADA, mostramos los locales por seguridad
        return [
            { 
                id: 'local-1',
                type: 'hero' as const, 
                title: 'STREET ESSENTIALS', 
                subtitle: 'NEW COLLECTION 2026',
                description: '',
                image: banner1, 
                cta: { url: '/productos', text: 'EXPLORAR TIENDA' } 
            }
        ];
    }, [frontConfig?.banners]);

    // Manejador de navegación para Banners
    const handleBannerClick = (url: string) => {
        if (url.startsWith('#')) {
        const targetId = url.replace('#', '');
        document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        } else {
        navigate(url);
        }
    };

    return (
        <div className="animate-in fade-in duration-700 flex flex-col gap-10 pb-16">
            <HeroBanner
                banners={visualBanners}
                onCtaClick={handleBannerClick}
            />

            <ProductGrid 
                title='Drops'
                products={featuredProducts.slice(0, 8)} // Solo mostramos los primeros 8 productos destacados
                onQuickView={handleQuickView}
                quantityLabel={false}
                viewAllLink="/productos"
                viewAllText="Ver Toda La Colección"
                layoutMode="home"
            />
            
            {/* SECCIÓN OFERTAS: Carrusel (Solo se muestra si hay ofertas activas) */}
            {offersMapped.length > 0 && (
                <ProductCarousel 
                    title="Sale!" 
                    products={offersMapped} 
                    onAdd={handleQuickView}
                    viewAllLink="/offers"
                    viewAllText="Ver Todas Las Ofertas"
                />
            )}
            <LocationsSection />
        </div>
    );
};

export default Home;