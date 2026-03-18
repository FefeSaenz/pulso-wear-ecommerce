import React, { useMemo } from 'react';
import { useApp } from '@/src/context/AppContext';

interface FilterSidebarProps {
  activeFilters: { sizeFilter: string | null; colorFilter: string | null; };
  onFilterChange: (key: string, value: string | null) => void;
  onClearFilters: () => void; // Nueva prop para limpiar todo
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

const FilterSidebar: React.FC<FilterSidebarProps> = ({ activeFilters, onFilterChange, onClearFilters }) => {
  const { allProducts } = useApp();
  
  // Talles únicos ordenados
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

  // Colores Únicos Normalizados
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

  const hasActiveFilters = activeFilters.sizeFilter || activeFilters.colorFilter;

  return (
    <div className="space-y-10">
      {/* BOTÓN LIMPIAR FILTROS (Solo si hay filtros activos) */}
      {/* SECCIÓN FILTROS ACTIVOS (CHIPS) */}
      {hasActiveFilters && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-black">Filtros Activos</h3>
            <button 
              onClick={onClearFilters}
              className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:underline cursor-pointer"
            >
              ✕ Limpiar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.sizeFilter && (
              <button 
                onClick={() => onFilterChange('talle', null)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-[10px] font-bold uppercase transition-colors rounded-full group cursor-pointer shadow-sm"
              >
                Talle: {activeFilters.sizeFilter}
                <span className="text-gray-400 group-hover:text-red-500">✕</span>
              </button>
            )}
            {activeFilters.colorFilter && (
              <button 
                onClick={() => onFilterChange('color', null)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-[10px] font-bold uppercase transition-colors rounded-full group cursor-pointer shadow-sm"
              >
                Color: {activeFilters.colorFilter}
                <span className="text-gray-400 group-hover:text-red-500">✕</span>
              </button>
            )}
          </div>
        </div>
      )}

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