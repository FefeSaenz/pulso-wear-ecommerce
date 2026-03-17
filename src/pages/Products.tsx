import React, { useMemo, useEffect } from 'react';
import { useSearchParams, useOutletContext, useParams } from 'react-router-dom';

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
    searchTerm: string;
    setSearchTerm: (val: string) => void;
}

const Products: React.FC = () => {
    const { allProducts, frontConfig, loading } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();
    const { setSelectedQuickView } = useOutletContext<ProductsContext>();
    
    const { category: paramCategory } = useParams<{ category: string }>();
    const isOffersRoute = window.location.pathname === '/offers';

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
    
    // 5. MANEJADOR DE CAMBIOS EN URL
    const handleFilterChange = (key: string, value: string | null) => {
        const newParams = new URLSearchParams(searchParams);

        if (key === 'categoria') {
            if (value && value !== 'Todos') newParams.set(key, value);
            else newParams.delete(key);
        } else {
            if (value) newParams.set(key, value);
            else newParams.delete(key);
        }

        // Si cambiamos categoría, talle o color, reseteamos el scroll arriba
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setSearchParams(newParams);
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
            {/* BARRA SUPERIOR DE CATEGORÍAS Y ORDENAMIENTO */}
            <FilterBar 
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={(cat) => handleFilterChange('categoria', cat)}
                sortBy={sortBy}
                onSortChange={(val) => setSortBy(val as any)}
            />
            <div className="flex flex-col md:flex-row gap-12 mt-7">
                {/* SIDEBAR DE FILTROS (IZQUIERDA) */}
                <aside className="w-full md:w-64 shrink-0">
                    <FilterSidebar 
                        activeFilters={{ categorieFilter: activeCategory, sizeFilter, colorFilter }}
                        onFilterChange={handleFilterChange}
                    />
                </aside>
                
                {/* GRILLA DE PRODUCTOS (DERECHA) */}
                <main className="flex-1">
                    {/*<div className="mb-8">*/}
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic italic-pulso">
                            {pageTitle}
                        </h1>
                    {/*</div>*/}

                    <ProductGrid 
                        products={filteredProducts} 
                        searchTerm={searchTerm}
                        onQuickView={setSelectedQuickView}
                        onClearSearch={() => handleFilterChange('search', null)}
                        onResetFilters={() => setSearchParams({})}
                    />
                    
                </main>
            </div>
        </div>
    );
};

export default Products;