import React, { useMemo, useEffect, useState } from 'react'; // <-- Agregamos useState
import { useSearchParams, useOutletContext, useParams, useNavigate, useLocation } from 'react-router-dom';

// Context & Hooks
import { useApp } from '@/src/context/AppContext';
import { useProductFilters } from '@/src/hooks/useProductFilters';
import { Product } from '@/src/types/product.types';
import { mapApiProductToLocal } from '@/src/utils/mappers';

// UI Components
import ProductGrid from '@/src/components/layout/ProductGrid';
import FilterSidebar from '@/src/components/layout/FilterSidebar';
import FilterBar from '@/src/components/ui/FilterBar';

interface ProductsContext {
    setSelectedQuickView: (product: Product) => void;
}

const Products: React.FC = () => {
    const { allProducts, frontConfig, loading } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const { setSelectedQuickView } = useOutletContext<ProductsContext>();
    
    const { category: paramCategory } = useParams<{ category: string }>();

    const location = useLocation();
    const isOffersRoute = location.pathname === '/offers';
    const navigate = useNavigate();

    // NUEVO: Estado para controlar el Drawer de filtros en Mobile
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // 1. COMBINACIÓN Y NORMALIZACIÓN DE DATA
    // Juntamos los productos del catálogo con los destacados de la Home
    const combinedProducts = useMemo(() => {
        // Creamos una copia del catálogo
        const catalog = allProducts.map(p => ({ ...p }));

        // Mapeamos los destacados de la API
        const featuredRaw = frontConfig?.featured_products?.products || [];
        const featuredMapped = featuredRaw.map(mapApiProductToLocal);

       featuredMapped.forEach(fProd => {
            const existingIndex = catalog.findIndex(p => p.id === fProd.id);
            
            if (existingIndex === -1) {
                // Si el producto NO está en el catálogo (Ej: el Jogger prod-012), lo agregamos
                catalog.push(fProd);
            } else {
                // Si YA EXISTE (Ej: prod-001), le inyectamos el cartelito (tag/badge) de destacado
                // Así tu grilla va a mostrar visualmente que es un producto especial
                if (fProd.tags) {
                    catalog[existingIndex].tags = fProd.tags;
                }
            }
        });

        if (isOffersRoute) {
            return catalog.filter(p => p.discount_percentage && p.discount_percentage > 0);
        }

        return catalog;
    }, [allProducts, frontConfig, isOffersRoute]);
    
    // 2. PARÁMETROS DE LA URL (Single Source of Truth)
    // NUEVO: Ahora la categoría principal viene del Router (ej: /category/pantalones)
    // Si no hay categoría en la ruta, miramos si hay en los searchParams (?categoria=...), y si no, "Todos".
    const initialCategory = paramCategory 
        ? paramCategory.charAt(0).toUpperCase() + paramCategory.slice(1) // Capitalizamos (pantalones -> Pantalones)
        : searchParams.get('categoria') || 'Todos';

    const sizeFilter = searchParams.get('talle');
    const colorFilter = searchParams.get('color');
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
        setActiveColor
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
    }, [initialCategory, sizeFilter, colorFilter, setActiveCategory, setActiveSize, setActiveColor, isOffersRoute]);
    
    // 5. MANEJADOR DE NAVEGACIÓN Y FILTROS
    // Este manejador controla la barra superior y cambia de PÁGINA
    const handleCategoryNavigation = (cat: string) => {
        if (cat === 'Todos') {
            navigate('/productos');
        } else {
            navigate(`/category/${cat.toLowerCase()}`);
        }
    };

    // Este manejador controla solo Talle y Color en la URL
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
    const pageTitle = isOffersRoute 
        ? '🔥 Ofertas Exclusivas' 
        : (activeCategory === 'Todos' ? 'Catálogo Completo' : activeCategory);
    
    if (loading) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
        </div>
        );
    }
    return (
        <div className="max-w-360 mx-auto px-6 pb-5 animate-in fade-in duration-500">
            {/* BARRA SUPERIOR (Usa la navegación real) */}
            <FilterBar 
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={handleCategoryNavigation}
                sortBy={sortBy}
                onSortChange={(val) => setSortBy(val as any)}
                onOpenMobileFilters={() => setIsMobileFiltersOpen(true)} // <-- Conectamos el botón
            />

            <div className="flex flex-col md:flex-row gap-12 mt-7">
                {/* SIDEBAR DE FILTROS (IZQUIERDA - Solo PC) */}
                {/* NUEVO: Le pusimos hidden md:block para que no moleste en el celu */}
                <aside className="hidden md:block w-64 shrink-0">
                    <FilterSidebar 
                        activeFilters={{ sizeFilter, colorFilter }}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                    />
                </aside>
                
                {/* GRILLA DE PRODUCTOS (DERECHA) */}
                <main className="flex-1">
                    <div className="mb-8">
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic italic-pulso">
                            {pageTitle}
                        </h1>
                    </div>

                    <ProductGrid 
                        products={filteredProducts} 
                        searchTerm={searchTerm}
                        onQuickView={setSelectedQuickView}
                        onClearSearch={() => handleFilterChange('search', null)}
                    />
                </main>
            </div>

            {/* --- DRAWER DE FILTROS EXCLUSIVO MOBILE --- */}
            {isMobileFiltersOpen && (
                <div className="fixed inset-0 z-50 flex md:hidden">
                    {/* Backdrop / Fondo oscuro */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
                        onClick={() => setIsMobileFiltersOpen(false)}
                    />
                    
                    {/* Panel lateral estilo brutalista */}
                    <div className="absolute top-0 left-0 h-full w-4/5 max-w-[300px] bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-black uppercase tracking-tighter">Filtros</h2>
                            <button 
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        {/* El mismo FilterSidebar que usamos en PC, pero adentro del Drawer */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <FilterSidebar 
                                activeFilters={{ sizeFilter, colorFilter }}
                                onFilterChange={handleFilterChange}
                                onClearFilters={handleClearFilters}
                            />
                        </div>

                        {/* Botón para aplicar y cerrar */}
                        <div className="p-6 border-t border-gray-100">
                            <button 
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className="w-full bg-black text-white py-4 text-[11px] font-black uppercase tracking-[4px] active:scale-[0.98] transition-all"
                            >
                                Ver Resultados
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;