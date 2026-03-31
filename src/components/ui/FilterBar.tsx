import React from 'react';

interface FilterBarProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  onOpenMobileFilters: () => void; // NUEVO: Prop para abrir el Drawer en mobile
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange, 
  sortBy, 
  onSortChange,
  onOpenMobileFilters
}) => {
  return (
    // Contenedor principal: Sin padding en mobile para que los botones ocupen el 100% del alto, padding normal en Desktop
    <div id="shop-section" className="sticky top-20 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 flex flex-row items-center justify-between md:px-6 md:py-4">
      
      {/* 1. CATEGORÍAS (Solo Desktop: ocultas en mobile, visibles en md en adelante) */}
      <div className="hidden md:flex space-x-6 overflow-x-auto no-scrollbar w-auto">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`text-[10px] font-black uppercase tracking-[2px] transition-colors whitespace-nowrap cursor-pointer ${
              activeCategory === cat ? 'text-black border-b-2 border-black' : 'text-gray-300 hover:text-gray-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2. BOTÓN FILTRAR (Solo Mobile: visible en mobile, oculto en md en adelante) */}
      <button 
        onClick={onOpenMobileFilters}
        className="flex md:hidden flex-1 py-4 border-r border-gray-100 items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-[2px] active:bg-gray-50 transition-colors"
      >
        <i className="fa-solid fa-sliders"></i>
        <span>Filtrar</span>
      </button>
      
      {/* 3. ORDENAR (Mobile: ocupa el 50% restante | Desktop: Alineado a la derecha) */}
      <div className="flex-1 md:flex-none flex items-center justify-center md:justify-end py-4 md:py-0 space-x-2 md:space-x-4">
        {/* El texto "Ordenar por:" lo ocultamos en celu para ahorrar espacio */}
        <span className="hidden md:inline text-[9px] font-black uppercase text-gray-400 tracking-widest">
          Ordenar por:
        </span>
        
        <div className="flex items-center space-x-2">
          {/* Iconito para mobile, le da un toque más pro al select */}
          <i className="fa-solid fa-arrow-down-short-wide md:hidden text-gray-400"></i>
          <select 
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="text-[10px] font-black uppercase tracking-[2px] outline-none bg-transparent cursor-pointer text-center md:text-left text-black"
          >
            <option value="default">Recomendados</option>
            <option value="price-low">Menor Precio</option>
            <option value="price-high">Mayor Precio</option>
          </select>
        </div>
      </div>

    </div>
  );
};

export default FilterBar;