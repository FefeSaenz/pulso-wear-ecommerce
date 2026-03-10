import React, { useEffect, useRef } from 'react';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose, searchTerm, onSearchChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Lógica para cerrar con ESCAPE y buscar con ENTER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter') {
        if (searchTerm.trim()) {
          onSearchChange(searchTerm); // Esto disparará el navigate en el Layout
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, searchTerm, onSearchChange]);

  // 2. Auto-focus al abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto px-6 h-full flex flex-col">
        <div className="flex items-center justify-between h-20 border-b border-gray-100">
          <span className="text-[10px] font-black uppercase tracking-[4px]">Buscador PULSO</span>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-full max-w-4xl">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="¿QUÉ ESTÁS BUSCANDO?"
              className="w-full text-4xl md:text-7xl font-black uppercase tracking-tighter text-center outline-none border-none placeholder:text-gray-100"
            />
            <div className="mt-8 flex justify-center space-x-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sugerencias:</span>
              <button onClick={() => onSearchChange('Remera')} className="text-[10px] font-black uppercase tracking-widest underline underline-offset-4">Remeras</button>
              <button onClick={() => onSearchChange('Pantalón')} className="text-[10px] font-black uppercase tracking-widest underline underline-offset-4">Pantalones</button>
              <button onClick={() => onSearchChange('Boxy')} className="text-[10px] font-black uppercase tracking-widest underline underline-offset-4">Boxy Fit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;