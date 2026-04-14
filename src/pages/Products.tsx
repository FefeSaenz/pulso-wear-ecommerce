import React, { useMemo, useEffect, useState } from 'react';
import { useSearchParams, useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';

// Context & Hooks
import { useApp } from '@/src/context/AppContext';
import { useProductFilters } from '@/src/hooks/useProductFilters';
import { Product } from '@/src/types/product.types';
import { useQuickView } from '@/src/hooks/useQuickView';
import { useUnifiedProducts } from '@/src/hooks/useUnifiedProducts'; // NUEVO hook para productos unificados

// UI Components
import ProductGrid from '@/src/components/layout/ProductGrid';
import FilterSidebar from '@/src/components/layout/FilterSidebar';
import FilterBar from '@/src/components/ui/FilterBar';
import Breadcrumbs from '@/src/components/ui/Breadcrumbs';

interface ProductsContext {
    setSelectedQuickView: (product: Product | null) => void;
}

const Products: React.FC = () => {
    const { loading } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const { setSelectedQuickView } = useOutletContext<ProductsContext>();

    const { handleQuickView } = useQuickView(setSelectedQuickView);
    
    const { unifiedProducts } = useUnifiedProducts(); // Obtenemos los productos unificados desde el nuevo hook

    const { category: paramCategory } = useParams<{ category: string }>();

    const location = useLocation();
    const isOffersRoute = location.pathname === '/offers';
    const navigate = useNavigate();

    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // 1. COMBINACIÓN Y NORMALIZACIÓN DE DATA
    // El hook useUnifiedProducts ya se encarga de juntar el catálogo con los destacados.
    // Acá solo filtramos si estamos en la ruta de ofertas.
    const combinedProducts = useMemo(() => {
        if (isOffersRoute) {
            return unifiedProducts.filter(p => p.discount_percentage && p.discount_percentage > 0);
        }
        return unifiedProducts;
    }, [unifiedProducts, isOffersRoute]);
    
    // 2. PARÁMETROS DE LA URL (Single Source of Truth)
    // NUEVO: Ahora la categoría principal viene del Router (ej: /category/pantalones)
    // Si no hay categoría en la ruta, miramos si hay en los searchParams (?categoria=...), y si no, "Todos".
    const initialCategory = paramCategory 
        ? paramCategory.charAt(0).toUpperCase() + paramCategory.slice(1) // Capitalizamos (pantalones -> Pantalones)
        : searchParams.get('categoria') || 'Todos';

    const sizeFilter = searchParams.get('talle');
    const colorFilter = searchParams.get('color');
    const priceFilter = searchParams.get('precio');
    const searchTerm = searchParams.get('search') || '';

    // 3. USO DEL HOOK DE FILTRADO
    const { 
        filteredProducts, 
        sortBy, 
        setSortBy,
        categories,
        setActiveCategory,
        activeCategory,
        setActiveSize,
        setActiveColor,
        setActivePrice
    } = useProductFilters({ 
        products: combinedProducts, 
        searchTerm 
    });

    // 4. SINCRONIZACIÓN: URL -> HOOK
    // Esto asegura que si el usuario navega (o vuelve atrás), el hook se entere
    useEffect(() => {
        // NUEVO: Le pasamos la categoría que leímos de la ruta dinámica
        setActiveCategory(isOffersRoute ? 'Todos' : initialCategory);
        setActiveSize(sizeFilter);
        setActiveColor(colorFilter);
        setActivePrice(priceFilter);
    }, [initialCategory, sizeFilter, colorFilter, priceFilter, setActiveCategory, setActiveSize, setActiveColor, setActivePrice, isOffersRoute]);
    
    // 5. MANEJADOR DE FILTROS
    // Este manejador controla la barra superior y cambia de PÁGINA
    
    const handleFilterChange = (key: string, value: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setSearchParams(newParams);
    };

    // Función maestra para limpiar la URL de talle y color
    const handleClearFilters = () => {
        setSearchParams(new URLSearchParams());
    };

    // Título dinámico para el H1
    const pageTitle = searchTerm
        ? 'BÚSQUEDA'
        : isOffersRoute 
            ? (
                <span className="flex items-center gap-3">
                    OFERTAS <i className="fa-solid fa-fire text-orange-500 animate-pulse text-[0.8em]"></i>
                </span>
              )
            : (activeCategory === 'Todos' ? 'CATÁLOGO' : activeCategory);


    // Lógica Breadcrumbs
    const breadcrumbItems = useMemo(() => {
        if (searchTerm) return [{ label: 'Catálogo', href: '/productos' }, { label: 'Búsqueda' }];
        if (isOffersRoute) return [{ label: 'Ofertas' }];
        if (activeCategory === 'Todos') return [{ label: 'Catálogo' }];
        
        return [
            { label: 'Catálogo', href: '/productos' }, // Con link para volver
            { label: activeCategory }                  // Texto plano (donde estoy)
        ];
    }, [isOffersRoute, activeCategory, searchTerm]);

    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
        );
    }
    return (
        <div className="flex flex-col animate-in fade-in duration-500 pb-16">

            {/* 1. BREADCRUMBS SUTILES (Arriba de la barra) */}
            <div className="max-w-360 mx-auto px-6 w-full pt-6 pb-4">
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            {/* FILTER BAR (Sticky, contiene el H1 */}
            <FilterBar 
                title={pageTitle}
                sortBy={sortBy}
                onSortChange={(val) => setSortBy(val as any)}
                onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
            />

            {/* CONTENEDOR PRINCIPAL: Sidebar + Grid */}
            <div className="max-w-360 mx-auto px-6 w-full flex flex-col md:flex-row gap-12 mt-8">
                {/* SIDEBAR DE FILTROS (IZQUIERDA - Solo PC) */}
                <aside className="hidden md:block w-64 shrink-0 sticky top-44 self-start max-h-[calc(100vh-14rem)] overflow-y-auto no-scrollbar pb-8 pr-4">
                    <FilterSidebar 
                        activeFilters={{ sizeFilter, colorFilter, priceFilter, searchTerm }}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                    />
                </aside>
                
                {/* GRILLA DE PRODUCTOS (DERECHA) */}
                <main className="flex-1">
                    <ProductGrid 
                        products={filteredProducts} 
                        onQuickView={handleQuickView}
                    />
                </main>
            </div>

            {/* --- DRAWER DE FILTROS EXCLUSIVO MOBILE --- */}
            <div className={`fixed inset-0 z-50 flex md:hidden ${isMobileFiltersOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                
                {/* 1. Backdrop / Fondo oscuro (Aparece con Fade In) */}
                <div 
                    className={`absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer ui-backdrop ${isMobileFiltersOpen ? 'is-open' : ''}`} 
                    onClick={() => setIsMobileFiltersOpen(false)}
                />
                
                {/* 2. Panel lateral estilo brutalista (Entra con Slide Left) */}
                <div className={`absolute top-0 left-0 h-full w-4/5 max-w-75 bg-white shadow-2xl flex flex-col ui-slide-panel ui-slide-left ${isMobileFiltersOpen ? 'is-open' : ''}`}>
                    
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-xl font-black uppercase tracking-tighter">Filtros</h2>
                        <button 
                            onClick={() => setIsMobileFiltersOpen(false)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    
                    {/* El mismo FilterSidebar que usamos en PC, pero adentro del Drawer */}
                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                        <FilterSidebar 
                            activeFilters={{ sizeFilter, colorFilter, priceFilter, searchTerm }}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            onCloseMobile={() => setIsMobileFiltersOpen(false)}
                        />
                    </div>

                    {/* Botón para aplicar y cerrar */}
                    <div className="p-6 border-t border-gray-100">
                        <button 
                            onClick={() => setIsMobileFiltersOpen(false)}
                            className="w-full bg-black text-white py-4 text-[11px] font-black uppercase tracking-[4px] active:scale-[0.98] transition-all cursor-pointer"
                        >
                            Ver Resultados
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;