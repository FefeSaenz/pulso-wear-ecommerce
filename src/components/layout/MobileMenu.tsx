import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import { useApp } from '@/src/context/AppContext';
import NavLink from '@/src/components/ui/NavLink';
import logoPulso from '@/src/assets/Logotipo principal PULSO.png';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProfile: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose, onOpenProfile }) => {
  const { menuItems, logoText } = useApp();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    onClose();
  };

  return (
    <div 
      className={`fixed inset-0 z-100 bg-white flex flex-col ui-slide-panel ui-slide-left ${isOpen ? 'is-open' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-6 h-full flex flex-col w-full">
        
        {/* HEADER DRAWER */}
        <div className="flex items-center justify-between h-20 border-b border-gray-100 shrink-0">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            {logoPulso ? (
              <img src={logoPulso} alt="Pulso Wear" className="h-9 w-auto object-contain" />
            ) : (
              <span className="text-[10px] font-black uppercase tracking-[4px]">{logoText}</span>
            )}
          </Link>
          
          <button onClick={onClose} className="text-gray-400 p-2 cursor-pointer">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>
        
        {/* LINKS GIGANTES */}
        <div className="flex-1 overflow-y-auto pt-8"> 
          <nav className="flex flex-col space-y-4"> 
            {menuItems && menuItems.map((item) => (
              <div key={item.id} className="block">
                <NavLink 
                  item={item} 
                  onClick={handleLinkClick} 
                  showSubmenu={false} 
                  className="text-4xl font-black tracking-tighter text-black leading-[0.8] transition-transform active:scale-95 origin-left" 
                />
              </div>
            ))}
          </nav>
        </div>

        {/* FOOTER DRAWER */}
        <div className="border-t border-gray-100 py-8 shrink-0 flex flex-col space-y-6">
          <button onClick={() => { onOpenProfile(); onClose(); }} className="flex items-center space-x-3 text-left w-fit cursor-pointer">
            <i className="fa-regular fa-user text-lg text-gray-400"></i>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[2px]">Mi Cuenta</span>
          </button>
          <div className="flex items-center space-x-6">
            <a href="https://www.instagram.com/pulso.pna/" className="text-[11px] font-bold text-gray-400 uppercase tracking-[2px]">Instagram</a>
            <a href="#" className="text-[11px] font-bold text-gray-400 uppercase tracking-[2px]">Contacto</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;