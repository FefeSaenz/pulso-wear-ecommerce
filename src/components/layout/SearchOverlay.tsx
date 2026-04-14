import React, { useEffect, useRef } from 'react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, searchTerm, onSearchChange, onSearchSubmit }) => {
  const inputRef = useRef<HTMLInputElement>(null);

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

  //if (!isOpen) return null;

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
            <div className="mt-8 flex justify-center space-x-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-[2px]">Sugerencias:</span>
              <button onClick={() => onSearchSubmit('Remera')} className="text-[10px] font-black uppercase tracking-widest underline underline-offset-4 hover:text-gray-600 transition-colors cursor-pointer">Remeras</button>
              <button onClick={() => onSearchSubmit('Pantalón')} className="text-[10px] font-black uppercase tracking-widest underline underline-offset-4 hover:text-gray-600 transition-colors cursor-pointer">Pantalones</button>
              <button onClick={() => onSearchSubmit('Boxy')} className="text-[10px] font-black uppercase tracking-widest underline underline-offset-4 hover:text-gray-600 transition-colors cursor-pointer">Boxy Fit</button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default SearchOverlay;