import React from 'react';

interface FilterBarProps {
  title: React.ReactNode;
  sortBy: string;
  onSortChange: (value: string) => void;
  onOpenMobileFilters: () => void; // NUEVO: Prop para abrir el Drawer en mobile
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  title,
  sortBy, 
  onSortChange,
  onOpenMobileFilters
}) => {
  return (
    // Contenedor principal: Sin padding en mobile para que los botones ocupen el 100% del alto, padding normal en Desktop
    <div id="shop-section" className="sticky top-20 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 w-full">
      <div className="w-full flex flex-row items-center justify-between md:max-w-360 md:mx-auto md:px-6 md:py-4">
      
        {/* 1. TÍTULO (Solo Desktop: reemplaza a las categorías, oculto en mobile) */}
        <div className="hidden md:flex w-auto">
          <h1 className="text-2xl lg:text-3xl font-syne font-black uppercase tracking-tighter leading-none mt-1 text-black">
              {title}
          </h1>
        </div>

        {/* 2. BOTÓN FILTRAR (Solo Mobile: visible en mobile, oculto en md en adelante) */}
        <button 
          onClick={onOpenMobileFilters}
          className="flex md:hidden flex-1 py-4 border-r border-gray-100 items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-[2px] active:bg-gray-50 transition-colors"
        >
          <i className="fa-solid fa-sliders text-gray-400 text-sm"></i>
          <span>Filtrar</span>
        </button>
        
        {/* 3. ORDENAR (Mobile: ocupa el 50% restante | Desktop: Alineado a la derecha) */}
        <div className="flex-1 md:flex-none flex items-center justify-center md:justify-end py-4 md:py-0 space-x-2 md:space-x-4">
          {/* El texto "Ordenar por:" lo ocultamos en celu para ahorrar espacio */}
          <span className="hidden md:inline text-[9px] font-black uppercase text-gray-400 tracking-widest ">
            Ordenar por:
          </span>
          
          <div className="flex items-center space-x-2">
            {/* Iconito para mobile, le da un toque más pro al select */}
            <i className="fa-solid fa-arrow-down-short-wide md:hidden text-gray-400 text-sm"></i>
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
    </div>
  );
};

export default FilterBar;