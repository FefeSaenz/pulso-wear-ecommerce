import React, { useMemo } from 'react';
import { useApp } from '@/src/context/AppContext';

interface FilterSidebarProps {
  activeFilters: { categoryFilter: string; sizeFilter: string | null; colorFilter: string | null; };
  onFilterChange: (key: string, value: string | null) => void;
}

const COLOR_MAP: Record<string, string> = {
  'Negro': '#000000', 'Blanco': '#FFFFFF', 'Gris': '#808080', 'Beige': '#F5F5DC', 'Azul': '#0000FF', 'Rojo': '#FF0000',
};

// Mapa Maestro de Normalización y Color
const COLOR_SYSTEM: Record<string, { hex: string, group: string }> = {
  'Negro': { hex: '#000000', group: 'Negro' },
  'Blanco': { hex: '#FFFFFF', group: 'Blanco' },
  'Gris Oxford': { hex: '#4B4B4B', group: 'Gris' },
  'Gris Melange': { hex: '#B2B2B2', group: 'Gris' },
  'Azul Navy': { hex: '#1B2A4A', group: 'Azul' },
  'Dark Blue': { hex: '#1C3557', group: 'Azul' },
  'Bordó': { hex: '#6B1A1A', group: 'Rojo' },
  'Beige': { hex: '#D4C5A9', group: 'Beige' },
  'Verde Militar': { hex: '#4A5240', group: 'Verde' },
};

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL'];

const FilterSidebar: React.FC<FilterSidebarProps> = ({ activeFilters, onFilterChange }) => {
  const { allProducts } = useApp();
  const { frontConfig } = useApp();

  // 1. Categorías únicas
  const categories = useMemo(() => ['Todos', ...Array.from(new Set(allProducts.map(p => p.category)))], [allProducts]);
  
  // 2. Talles únicos ordenados
  const sizes = useMemo(() => {
    const allSizes = allProducts.flatMap(p => 
      p.variants?.flatMap(v => v.sizes.map(s => s.size.toString())) || []
    );
    
    const unique = Array.from(new Set(allSizes));

    return unique.sort((a: string, b: string) => {
      const indexA = SIZE_ORDER.indexOf(a.toUpperCase());
      const indexB = SIZE_ORDER.indexOf(b.toUpperCase());
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB);
    });
  }, [allProducts]);

  // 3. Colores Únicos Normalizados
  const colors = useMemo(() => {
    const rawColors = allProducts.flatMap(p => p.variants?.map(v => v.color.name) || []);
    const groups = rawColors.map(name => COLOR_SYSTEM[name]?.group || name);
    return Array.from(new Set(groups));
  }, [allProducts]);

  // Función para obtener el HEX de un grupo (o el nombre si no hay grupo)
  const getHexForGroup = (groupName: string) => {
    const found = Object.values(COLOR_SYSTEM).find(c => c.group === groupName);
    return found ? found.hex : '#ccc';
  };

  return (
    <div className="space-y-10">
      {/* BOTÓN LIMPIAR FILTROS (Solo si hay filtros activos) */}
      {(activeFilters.categoryFilter !== 'Todos' || activeFilters.sizeFilter || activeFilters.colorFilter) && (
        <button 
          onClick={() => {
            onFilterChange('categoria', 'Todos');
            onFilterChange('talle', null);
            onFilterChange('color', null);
          }}
          className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline mb-4"
        >
          ✕ Limpiar Filtros
        </button>
      )}

      {/* SECCIÓN COLECCIONES */}
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[4px] mb-6 text-gray-400">Colecciones</h3>
        <ul className="space-y-3">
          {categories.map((cat) => (
            <li key={cat}>
              <button 
                onClick={() => onFilterChange('categoria', cat)} 
                className={`text-xs uppercase transition-all cursor-pointer ${activeFilters.categoryFilter === cat ? 'font-black border-b-2 border-black' : 'text-gray-500 hover:text-black font-bold'}`}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* SECCIÓN TALLE */}
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[4px] mb-6 text-gray-400">Talle</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button 
              key={size} 
              onClick={() => onFilterChange('talle', activeFilters.sizeFilter === size ? null : size)} 
              className={`w-10 h-10 border flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${activeFilters.sizeFilter === size ? 'bg-black text-white border-black' : 'bg-white border-gray-200 hover:border-black'}`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN COLOR */}
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[4px] mb-6 text-gray-400">Color</h3>
        <div className="space-y-2">
          {colors.map((col) => (
            <button 
              key={col} 
              onClick={() => onFilterChange('color', activeFilters.colorFilter === col ? null : col)} 
              className="flex items-center group cursor-pointer"
            >
              <span 
                className={`w-4 h-4 rounded-full border border-gray-200 mr-3 transition-transform ${activeFilters.colorFilter === col ? 'ring-2 ring-black ring-offset-2 scale-110' : 'group-hover:scale-110'}`} 
                style={{ backgroundColor: getHexForGroup(col) }} 
              />
              <span className={`text-[10px] uppercase tracking-tighter ${activeFilters.colorFilter === col ? 'font-black' : 'text-gray-500 font-bold'}`}>
                {col}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;