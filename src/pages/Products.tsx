import React, { useMemo, useEffect, useState } from 'react';
import { useSearchParams, useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // NUEVO: Importamos Helmet para SEO dinámico

// Context & Hooks
import { useApp } from '@/src/context/AppContext';
import { useProductFilters } from '@/src/hooks/useProductFilters';
import { Product } from '@/src/types/product.types';
import { useQuickView } from '@/src/hooks/useQuickView';
import { useUnifiedProducts } from '@/src/hooks/useUnifiedProducts'; 

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
    
    const { unifiedProducts } = useUnifiedProducts(); 

    const { category: paramCategory } = useParams<{ category: string }>();

    const location = useLocation();
    const isOffersRoute = location.pathname === '/offers';
    const navigate = useNavigate();

    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // 1. COMBINACIÓN Y NORMALIZACIÓN DE DATA
    const combinedProducts = useMemo(() => {
        if (isOffersRoute) {
            return unifiedProducts.filter(p => p.discount_percentage && p.discount_percentage > 0);
        }
        return unifiedProducts;
    }, [unifiedProducts, isOffersRoute]);
    
    // 2. PARÁMETROS DE LA URL Y CORRECCIÓN DE GUIONES
    const formatCategoryUrl = (cat: string) => {
        return cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const initialCategory = paramCategory 
        ? formatCategoryUrl(paramCategory)
        : searchParams.get('categoria') || 'Todos';

    const brandFilter = searchParams.get('marca'); // NUEVO
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
        brands, // NUEVO
        setActiveCategory,
        activeCategory,
        setActiveBrand, // NUEVO
        activeBrand, // NUEVO
        setActiveSize,
        setActiveColor,
        setActivePrice
    } = useProductFilters({ 
        products: combinedProducts, 
        searchTerm 
    });

    // 4. SINCRONIZACIÓN: URL -> HOOK
    useEffect(() => {
        setActiveCategory(isOffersRoute ? 'Todos' : initialCategory);
        setActiveBrand(brandFilter); // NUEVO
        setActiveSize(sizeFilter);
        setActiveColor(colorFilter);
        setActivePrice(priceFilter);
    }, [initialCategory, brandFilter, sizeFilter, colorFilter, priceFilter, setActiveCategory, setActiveBrand, setActiveSize, setActiveColor, setActivePrice, isOffersRoute]);
    
    // 5. MANEJADORES DE FILTROS Y NAVEGACIÓN
    const handleFilterChange = (key: string, value: string | null) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set(key, value);
        else newParams.delete(key);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setSearchParams(newParams);
    };

    const handleClearFilters = () => {
        setSearchParams(new URLSearchParams());
    };

    // Manejador Inteligente de Categorías
    const handleCategoryChange = (newCategory: string) => {
        const currentParams = new URLSearchParams(searchParams).toString();
        const queryString = currentParams ? `?${currentParams}` : '';

        if (newCategory === 'Todos') {
            navigate(`/productos${queryString}`);
        } else {
            navigate(`/category/${newCategory.toLowerCase().replace(/\s+/g, '-')}${queryString}`);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // ELIMINADO: setIsMobileFiltersOpen(false); para que el drawer quede abierto a decisión del usuario
    };

    // Título Visual (con HTML y Fueguitos)
    const pageTitle = searchTerm
        ? 'BÚSQUEDA'
        : isOffersRoute 
            ? (
                <span className="flex items-center gap-3">
                    OFERTAS <i className="fa-solid fa-fire text-orange-500 animate-pulse text-[0.8em]"></i>
                </span>
              )
            : (activeCategory === 'Todos' ? 'CATÁLOGO' : activeCategory);

    // Título Plano estricto para Google (SEO)
    const metaTitle = searchTerm 
        ? `Búsqueda: ${searchTerm}` 
        : isOffersRoute 
            ? 'Ofertas Exclusivas' 
            : activeCategory === 'Todos' ? 'Catálogo Completo' : activeCategory;

    // BREADCRUMBS UNIFICADOS
    const breadcrumbItems = useMemo(() => {
        if (searchTerm) return [{ label: 'Catálogo', href: '/productos' }, { label: 'Búsqueda' }];
        if (isOffersRoute) return [{ label: 'Catálogo', href: '/productos' }, { label: 'Ofertas' }];
        if (activeCategory === 'Todos') return [{ label: 'Catálogo' }];
        
        return [
            { label: 'Catálogo', href: '/productos' }, 
            { label: activeCategory }                  
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
            
            {/* --- INYECCIÓN SEO DINÁMICO --- */}
            <Helmet>
                <title>{`PULSO | ${metaTitle}`}</title>
                <meta name="description" content={`Explorá nuestra colección de ${metaTitle.toLowerCase()} en Pulso. Indumentaria urbana y streetwear con envíos a todo el país.`} />
                <meta property="og:title" content={`PULSO | ${metaTitle}`} />
                <meta property="og:description" content={`Descubrí lo mejor en ${metaTitle.toLowerCase()}. Calidad premium y estilo urbano.`} />
                <meta property="og:url" content={window.location.href} />
            </Helmet>

            <div className="max-w-360 mx-auto px-4 md:px-6 w-full pt-6 pb-4">
                <Breadcrumbs items={breadcrumbItems} />
            </div>

            <FilterBar 
                title={pageTitle}
                sortBy={sortBy}
                onSortChange={(val) => setSortBy(val as any)}
                onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
            />

            <div className="max-w-360 mx-auto px-4 md:px-6 w-full flex flex-col lg:flex-row gap-12 mt-8">
                
                {/* SIDEBAR DESKTOP */}
                <aside className="hidden lg:block w-64 shrink-0 sticky top-44 self-start max-h-[calc(100vh-14rem)] overflow-y-auto no-scrollbar pb-8 pr-4">
                    <FilterSidebar 
                        activeFilters={{ sizeFilter, colorFilter, priceFilter, searchTerm, brandFilter }}
                        categories={categories}
                        activeCategory={activeCategory}
                        brands={brands} // NUEVO
                        activeBrand={activeBrand} // NUEVO
                        onCategoryChange={handleCategoryChange}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                    />
                </aside>
                
                <main className="flex-1">
                    <ProductGrid 
                        products={filteredProducts} 
                        onQuickView={handleQuickView}
                        layoutMode="catalog"
                    />
                </main>
            </div>

            {/* DRAWER MOBILE */}
            <div className={`fixed inset-0 z-50 flex lg:hidden ${isMobileFiltersOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                <div 
                    className={`absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer ui-backdrop ${isMobileFiltersOpen ? 'is-open' : ''}`} 
                    onClick={() => setIsMobileFiltersOpen(false)}
                />
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
                    <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                        <FilterSidebar 
                            activeFilters={{ sizeFilter, colorFilter, priceFilter, searchTerm, brandFilter }}
                            categories={categories}
                            activeCategory={activeCategory}
                            brands={brands} // NUEVO
                            activeBrand={activeBrand} // NUEVO
                            onCategoryChange={handleCategoryChange}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                            // ELIMINADO: onCloseMobile={() => setIsMobileFiltersOpen(false)} para que los chips no cierren el panel
                        />
                    </div>
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