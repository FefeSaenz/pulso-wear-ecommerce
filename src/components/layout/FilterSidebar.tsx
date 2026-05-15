import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '@/src/context/AppContext';

interface FilterSidebarProps {
  activeFilters: { 
    sizeFilter: string | null; 
    colorFilter: string | null; 
    priceFilter: string | null;
    searchTerm?: string | null;
    brandFilter?: string | null; // NUEVO
  };
  categories?: string[];               
  activeCategory?: string;             
  brands?: string[];             // NUEVO
  activeBrand?: string | null;   // NUEVO
  onCategoryChange?: (c: string) => void; 
  onFilterChange: (key: string, value: string | null) => void;
  onClearFilters: () => void;
  onCloseMobile?: () => void;
}

// Mapa Maestro de Normalización y Color EXTENDIDO
const COLOR_SYSTEM: Record<string, { hex: string, group: string }> = {
  // Básicos
  'Negro': { hex: '#000000', group: 'Negro' },
  'NEGRO': { hex: '#000000', group: 'Negro' },
  'Blanco': { hex: '#FFFFFF', group: 'Blanco' },
  'BLANCO': { hex: '#FFFFFF', group: 'Blanco' },
  
  // Grises
  'Gris Oxford': { hex: '#4B4B4B', group: 'Gris' },
  'Gris Melange': { hex: '#B2B2B2', group: 'Gris' },
  'Gris': { hex: '#808080', group: 'Gris' },
  'GRIS': { hex: '#808080', group: 'Gris' },
  
  // Azules y Celestes
  'Azul Navy': { hex: '#1B2A4A', group: 'Azul' },
  'Dark Blue': { hex: '#1C3557', group: 'Azul' },
  'Azul': { hex: '#292d8e', group: 'Azul' },
  'AZUL': { hex: '#292d8e', group: 'Azul' },
  'Celeste claro': { hex: '#ADD8E6', group: 'Celeste Claro' },
  'CELESTE CLARO': { hex: '#ADD8E6', group: 'Celeste Claro' },
  
  // Otros
  'Bordó': { hex: '#6B1A1A', group: 'Rojo' },
  'Beige': { hex: '#d3b47b', group: 'Beige' },
  'Verde Militar': { hex: '#4A5240', group: 'Verde' },
};

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL'];

// Función para formatear el input con puntitos de miles
const formatPriceInput = (value: string) => {
  const raw = value.replace(/\D/g, ''); 
  if (!raw) return '';
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, "."); 
};

const FilterSidebar: React.FC<FilterSidebarProps> = ({ 
  activeFilters, 
  categories,
  activeCategory,
  brands,
  activeBrand,
  onCategoryChange,
  onFilterChange, 
  onClearFilters, 
  onCloseMobile 
}) => {
  const { allProducts } = useApp();
  
  // --- ESTADOS LOCALES PARA LOS INPUTS DE PRECIO ---
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    if (activeFilters.priceFilter) {
      const [min, max] = activeFilters.priceFilter.split('-');
      setMinPrice(min ? formatPriceInput(min) : '');
      setMaxPrice(max ? formatPriceInput(max) : '');
    } else {
      setMinPrice('');
      setMaxPrice('');
    }
  }, [activeFilters.priceFilter]);

  const handleApplyPrice = () => {
    const cleanMin = minPrice.replace(/\./g, '');
    const cleanMax = maxPrice.replace(/\./g, '');

    if (!cleanMin && !cleanMax) {
      onFilterChange('precio', null);
    } else {
      onFilterChange('precio', `${cleanMin}-${cleanMax}`);
    }

    if (onCloseMobile) {
      onCloseMobile();
    }
  };

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

  // Modificamos la extracción para que respete la capitalización original si no hay grupo
  const colors = useMemo(() => {
    const rawColors = allProducts.flatMap(p => p.variants?.map(v => v.color.name) || []);
    // Si no está en el mapa, usamos el nombre original en Title Case para que no quede todo en minúscula feo
    const groups = rawColors.map(name => {
      const mapped = COLOR_SYSTEM[name]?.group || COLOR_SYSTEM[name.toUpperCase()]?.group;
      if (mapped) return mapped;
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    });
    return Array.from(new Set(groups));
  }, [allProducts]);

  const getHexForGroup = (groupName: string) => {
    // Buscamos ignorando mayúsculas/minúsculas
    const found = Object.values(COLOR_SYSTEM).find(c => c.group.toLowerCase() === groupName.toLowerCase());
    return found ? found.hex : '#ccc';
  };

  const getPriceLabel = (filterStr: string) => {
    const [min, max] = filterStr.split('-');
    if (min && max) return `$${min} - $${max}`;
    if (min) return `Más de $${min}`;
    if (max) return `Hasta $${max}`;
    return '';
  };

  // Evaluamos si hay ALGÚN filtro activo (incluyendo la categoría si no es "Todos")
  const hasActiveFilters = 
    activeFilters.sizeFilter || 
    activeFilters.colorFilter || 
    activeFilters.priceFilter || 
    activeFilters.searchTerm ||
    activeFilters.brandFilter ||
    (activeCategory && activeCategory !== 'Todos');

  // Función combinada para limpiar todo
  const handleClearAll = () => {
    onClearFilters();
    if (activeCategory && activeCategory !== 'Todos' && onCategoryChange) {
      onCategoryChange('Todos');
    }
  };

  return (
    // Reordenamos el flujo visual (UX Standard)
    <div className="space-y-10">
      
      {/* SECCIÓN FILTROS ACTIVOS (CHIPS) */}
      {hasActiveFilters && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-100 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[2px] text-black">Filtros Activos</h3>
            <button 
              onClick={handleClearAll}
              className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:underline cursor-pointer"
            >
              ✕ Limpiar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            
            {activeCategory && activeCategory !== 'Todos' && (
              <button 
                onClick={() => onCategoryChange && onCategoryChange('Todos')}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-[10px] font-bold uppercase transition-colors rounded-full group cursor-pointer shadow-sm"
              >
                Categoría: {activeCategory}
                <span className="text-gray-400 group-hover:text-red-500">✕</span>
              </button>
            )}

            {/* Chip de Búsqueda */}
            {activeFilters.searchTerm && (
              <button 
                onClick={() => onFilterChange('search', null)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-[10px] font-bold uppercase transition-colors rounded-full group cursor-pointer shadow-sm"
              >
                Búsqueda: {activeFilters.searchTerm}
                <span className="text-gray-400 group-hover:text-red-500">✕</span>
              </button>
            )}

            {/* NUEVO: Chip de Marca */}
            {activeFilters.brandFilter && (
              <button 
                onClick={() => onFilterChange('marca', null)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-[10px] font-bold uppercase transition-colors rounded-full group cursor-pointer shadow-sm"
              >
                Marca: {activeFilters.brandFilter}
                <span className="text-gray-400 group-hover:text-red-500">✕</span>
              </button>
            )}
            
            {/* Chip de Talle */}
            {activeFilters.sizeFilter && (
              <button 
                onClick={() => onFilterChange('talle', null)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-[10px] font-bold uppercase transition-colors rounded-full group cursor-pointer shadow-sm"
              >
                Talle: {activeFilters.sizeFilter}
                <span className="text-gray-400 group-hover:text-red-500">✕</span>
              </button>
            )}
            
            {/* Chip de Color */}
            {activeFilters.colorFilter && (
              <button 
                onClick={() => onFilterChange('color', null)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-[10px] font-bold uppercase transition-colors rounded-full group cursor-pointer shadow-sm"
              >
                Color: {activeFilters.colorFilter}
                <span className="text-gray-400 group-hover:text-red-500">✕</span>
              </button>
            )}
            
            {/* Chip de Precio */}
            {activeFilters.priceFilter && (
              <button 
                onClick={() => onFilterChange('precio', null)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 text-[10px] font-bold uppercase transition-colors rounded-full group cursor-pointer shadow-sm"
              >
                Precio: {getPriceLabel(activeFilters.priceFilter)}
                <span className="text-gray-400 group-hover:text-red-500">✕</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 1. SECCIÓN CATEGORÍAS */}
      {categories && categories.length > 0 && (
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[4px] mb-6 text-gray-400">Categorías</h3>
          <div className="flex flex-col items-start gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange && onCategoryChange(cat)}
                className={`text-[10px] uppercase tracking-tighter transition-colors cursor-pointer text-left ${
                  activeCategory === cat ? 'text-black font-black' : 'text-gray-500 font-bold hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. SECCIÓN MARCAS */}
      {brands && brands.length > 0 && (
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[4px] mb-6 text-gray-400">Marcas</h3>
          <div className="flex flex-col items-start gap-2.5">
            {brands.map((brand) => (
              <button
                key={brand}
                onClick={() => onFilterChange('marca', activeFilters.brandFilter === brand ? null : brand)}
                className={`text-[10px] uppercase tracking-tighter transition-colors cursor-pointer text-left flex items-center gap-2 ${
                  activeFilters.brandFilter === brand ? 'text-black font-black' : 'text-gray-500 font-bold hover:text-black'
                }`}
              >
                {activeFilters.brandFilter === brand && <span className="w-1.5 h-1.5 bg-black rounded-full block shrink-0"></span>}
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. SECCIÓN TALLE */}
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

      {/* 4. SECCIÓN COLOR */}
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
              <span className={`text-[10px] uppercase tracking-tighter ${activeFilters.colorFilter === col ? 'text-black font-black' : 'text-gray-500 font-bold hover:text-black'}`}>
                {col}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. SECCIÓN PRECIO (ÚLTIMA) */}
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[4px] mb-6 text-gray-400">Precio</h3>
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">$</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Mínimo"
              value={minPrice}
              onChange={(e) => setMinPrice(formatPriceInput(e.target.value))}
              className="w-full border border-gray-200 pl-6 pr-3 py-2.5 text-[16px] md:text-xs text-right focus:outline-none focus:border-black transition-colors rounded-sm placeholder:text-gray-300"
            />
          </div>
          <span className="text-gray-400 text-[10px] font-bold uppercase">a</span>
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">$</span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Máximo"
              value={maxPrice}
              onChange={(e) => setMaxPrice(formatPriceInput(e.target.value))}
              className="w-full border border-gray-200  pl-6 pr-3 py-2.5  text-[16px] md:text-xs text-right focus:outline-none focus:border-black transition-colors rounded-sm placeholder:text-gray-300"
            />
          </div>
        </div>
        <button
          onClick={handleApplyPrice}
          className="w-full bg-black text-white py-3 px-4 text-[11px] font-black uppercase tracking-[4px] hover:bg-gray-900 active:scale-[0.98] transition-all cursor-pointer"
        >
          Aplicar
        </button>
      </div>

    </div>
  );
};

export default FilterSidebar;