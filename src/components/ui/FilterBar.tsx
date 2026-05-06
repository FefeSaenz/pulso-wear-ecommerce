import React from 'react';

interface FilterBarProps {
  title: React.ReactNode;
  sortBy: string;
  onSortChange: (value: string) => void;
  onOpenMobileFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  title,
  sortBy, 
  onSortChange,
  onOpenMobileFilters
}) => {
  return (
    // Contenedor principal: Sticky abajo del Header (top-20)
    <div id="shop-section" className="sticky top-20 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 w-full">
      
      <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between lg:max-w-360 lg:mx-auto lg:px-6">
      
        {/* 1. TÍTULO (Alineado a la izquierda siempre) */}
        {/* Agregamos px-6 en mobile para que respete el margen de la grilla de productos */}
        <div className="flex items-center justify-start w-full lg:w-auto py-3 lg:py-4 px-6 lg:px-0 border-b border-gray-100 lg:border-none">
          <h1 className="text-xl lg:text-3xl font-syne font-black uppercase tracking-tighter leading-none text-black">
              {title}
          </h1>
        </div>

        {/* CONTENEDOR DE BOTONES (Fila en mobile: 50% Filtrar / 50% Ordenar) */}
        <div className="flex flex-row w-full lg:w-auto">
            {/* 2. BOTÓN FILTRAR (Solo Mobile/Tablet) */}
            <button 
              onClick={onOpenMobileFilters}
              className="flex lg:hidden flex-1 py-3.5 border-r border-gray-100 items-center justify-center space-x-2 text-[10px] font-black uppercase tracking-[2px] active:bg-gray-50 transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-sliders text-gray-400 text-sm"></i>
              <span>Filtrar</span>
            </button>
            
            {/* 3. ORDENAR */}
            <div className="flex-1 lg:flex-none flex items-center justify-center lg:justify-end py-3.5 lg:py-0 space-x-2 lg:space-x-4">
              {/* Texto oculto en mobile para ahorrar espacio */}
              <span className="hidden lg:inline text-[9px] font-black uppercase text-gray-400 tracking-widest ">
                Ordenar por:
              </span>
              
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-arrow-down-short-wide lg:hidden text-gray-400 text-sm"></i>
                <select 
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="text-[10px] font-black uppercase tracking-[2px] outline-none bg-transparent cursor-pointer text-center lg:text-left text-black"
                >
                  <option value="default">Recomendados</option>
                  <option value="price-low">Menor Precio</option>
                  <option value="price-high">Mayor Precio</option>
                </select>
              </div>
            </div>
        </div>
        
      </div>
    </div>
  );
};

export default FilterBar;