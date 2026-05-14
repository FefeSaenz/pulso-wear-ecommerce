import React, { useEffect, useRef, useMemo } from 'react';
import { Product } from '@/src/types/product.types'; // Importamos el tipo

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
  products?: Product[]; // Nueva prop para recibir el catálogo
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ 
  isOpen, 
  onClose, 
  searchTerm, 
  onSearchChange, 
  onSearchSubmit,
  products = [] // Default vacío para que no rompa si te olvidás de pasarlo
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // --- LÓGICA DE SUGERENCIAS INTELIGENTES ---
  const topCategories = useMemo(() => {
    // Si todavía no cargaron los productos, mostramos un fallback genérico
    if (!products.length) return ['Remeras', 'Pantalones', 'Buzos']; 

    // 1. Contamos cuántos productos hay por cada categoría
    const categoryCounts = products.reduce((acc, product) => {
      if (product.category) {
        acc[product.category] = (acc[product.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    // 2. Convertimos el objeto en array, lo ordenamos de mayor a menor y sacamos el Top 3
    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]) 
      .slice(0, 3) 
      .map(entry => entry[0]); 
  }, [products]);

  // 1. Lógica para cerrar con ESCAPE y buscar con ENTER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') {
        if (searchTerm.trim()) {
          onSearchSubmit(searchTerm);
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, searchTerm, onSearchSubmit]);

  // 2. Auto-focus al abrir (espera 50ms a que empiece la animación)
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-100 bg-white flex flex-col ui-fade-overlay ${isOpen ? 'is-open' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex flex-col w-full">
        
        {/* Header del Buscador */}
        <div className="flex items-center justify-between h-20 border-b border-gray-100 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-[4px] text-gray-400">BUSCAR</span>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors cursor-pointer p-2">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        {/* Cuerpo del Buscador */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-4xl">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="¿QUÉ ESTÁS BUSCANDO?"
              className="w-full text-2xl sm:text-4xl lg:text-7xl font-black uppercase tracking-tighter text-center outline-none border-none placeholder:text-gray-100"
            />
            
            {/* SUGERENCIAS INTELIGENTES RENDERIZADAS DINÁMICAMENTE */}
            <div className="mt-8 flex justify-center items-center space-x-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                Sugerencias:
              </span>
              {topCategories.map((category) => (
                <button 
                  key={category}
                  onClick={() => onSearchSubmit(category)} 
                  className="text-[10px] font-black uppercase tracking-widest underline underline-offset-4 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {category}
                </button>
              ))}
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default SearchOverlay;