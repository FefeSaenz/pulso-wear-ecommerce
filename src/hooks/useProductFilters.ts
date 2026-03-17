import { useState, useMemo } from 'react';
import { Product } from '../types/product.types';

interface UseProductFiltersProps {
  products: Product[];
  searchTerm: string;
}

/*
 * HOOK UNIVERSAL DE FILTRADO
 * Centraliza la lógica de búsqueda, categorías, talles, colores y ordenamiento.
 * Recibe una lista de productos ya normalizada (tipo Product[]).
*/

export const useProductFilters = ({ 
  products = [], // Default value para evitar errores de .map() o .filter()
  searchTerm 
}: UseProductFiltersProps) => {

  // ESTADOS DE FILTRADO
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high'>('default');
  //const categories = ['Todos', 'Remeras', 'Pantalones', 'Buzos'];

  const categories = useMemo(() => 
    ['Todos', ...Array.from(new Set(products.map(p => p.category)))]
  , [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];  

    // 1. Filtro por Categoría
    if (activeCategory !== 'Todos') {
      result = result.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // 2. Filtro por Búsqueda (Search)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        p.category.toLowerCase().includes(term) || (p.description?.toLowerCase().includes(term))
      );
    }

    // 3. Filtro por Talle (dentro de variants)
    if (activeSize) {
      result = result.filter(p => 
        p.variants?.some(v => v.sizes.some(s => s.size.toString().toUpperCase() === activeSize.toUpperCase()))
      );
    }

    // 4. Filtro por Color
    if (activeColor) {
      result = result.filter(p => 
        p.variants?.some(v => v.color.name.toLowerCase().includes(activeColor.toLowerCase()))
      );
    }

    // 5. Ordenamiento (Sort)
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);

    return result;
  }, [products, activeCategory, activeSize, activeColor, sortBy, searchTerm]);

  return {
    filteredProducts,
    activeCategory, setActiveCategory,
    activeSize, setActiveSize,
    activeColor, setActiveColor,
    sortBy, setSortBy,
    categories
  };
};