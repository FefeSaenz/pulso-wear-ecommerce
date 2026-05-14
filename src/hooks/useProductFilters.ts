import { useState, useMemo } from 'react';
import { Product } from '@/src/types/product.types';

interface UseProductFiltersProps {
  products: Product[];
  searchTerm: string;
}

// --- HELPER FUNCTIONS PARA BÚSQUEDA INTELIGENTE ---
// 1. Normalización: Saca tildes y pasa a minúsculas ("Pantalón" -> "pantalon")
const normalizeText = (text?: string) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize("NFD") 
    .replace(/[\u0300-\u036f]/g, "") 
    .trim();
};

// 2. Lematización Básica: Saca plurales ("remeras" -> "remera", "pantalones" -> "pantalon")
const lemmatize = (word: string) => {
  let w = word;
  if (w.length > 3 && w.endsWith('es')) w = w.slice(0, -2);
  else if (w.length > 2 && w.endsWith('s')) w = w.slice(0, -1);
  return w;
};

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
  const [activePrice, setActivePrice] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high'>('default');

  const categories = useMemo(() => 
    ['Todos', ...Array.from(new Set(products.map(p => p.category)))]
  , [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];  

    // 1. Filtro por Categoría
    if (activeCategory !== 'Todos') {
      result = result.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
    }

    // 2. Filtro por Búsqueda Inteligente (Search)
    if (searchTerm) {
      // Limpiamos la búsqueda ingresada por el usuario
      const cleanSearchTerm = normalizeText(searchTerm);
      
      // La dividimos en palabras sueltas y le sacamos los plurales
      const searchTokens = cleanSearchTerm.split(/\s+/).filter(Boolean).map(lemmatize);

      result = result.filter(p => {
        // Armamos un "súper string" con toda la info útil del producto (incluyendo colores)
        const productColors = p.variants?.map(v => v.color.name).join(' ') || '';
        const searchableText = normalizeText(`${p.name} ${p.category} ${p.description || ''} ${productColors}`);
        
        // El producto pasa el filtro solo si TODAS las palabras buscadas están en su info
        return searchTokens.every(token => searchableText.includes(token));
      });
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

    // 5. Filtro por Precio (Rango) - NUEVO
    if (activePrice) {
      const [minStr, maxStr] = activePrice.split('-');
      const min = minStr ? parseInt(minStr, 10) : 0;
      const max = maxStr ? parseInt(maxStr, 10) : Infinity;

      result = result.filter(p => {
        // Si el producto está en oferta, filtramos por el precio real que paga el usuario
        const finalPrice = p.price; 
        return finalPrice >= min && finalPrice <= max;
      });
    }

    // 6. Ordenamiento (Sort)
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);

    return result;
  }, [products, activeCategory, activeSize, activeColor, activePrice, sortBy, searchTerm]);

  return {
    filteredProducts,
    activeCategory, setActiveCategory,
    activeSize, setActiveSize,
    activeColor, setActiveColor,
    activePrice, setActivePrice,
    sortBy, setSortBy,
    categories
  };
};