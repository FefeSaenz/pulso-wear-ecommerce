import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavLink from '@/src/components/ui/NavLink';
import { useApp } from '@/src/context/AppContext';
import logoPulso from '@/src/assets/logo-pulso-black.svg';
import MobileMenu from './MobileMenu';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  cartCount: number;
}

const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenProfile, onOpenSearch, cartCount }) => {
  const { menuItems, logoText } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isAnchor = href.includes('#');
    const isExternalPage = window.location.pathname !== '/';

    if (isAnchor && !isExternalPage) {
      e.preventDefault();
      const targetId = href.split('#')[1];
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    } 
    setIsMobileMenuOpen(false);
  };
  
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 lg:px-5 h-20 flex items-center justify-between">
        
        {/* --- 1. BLOQUE IZQUIERDO --- */}
        <div className="flex items-center space-x-5 ">
          
          {/* Mobile/Tablet: Hamburguesa */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden text-gray-800 hover:text-black transition-transform active:scale-95 cursor-pointer"
            aria-label="Abrir menú"
          >
            <div className="flex flex-col space-y-1.5 items-start">
              <span className="block w-5 h-0.5 bg-gray-800 hover:text-black"></span>
              <span className="block w-5 h-0.5 bg-gray-800 hover:text-black"></span>
              <span className="block w-5 h-0.5 bg-gray-800 hover:text-black"></span>
            </div>
          </button>

          {/* Mobile/Tablet: Lupa */}
          <button 
            onClick={onOpenSearch} 
            className="lg:hidden text-gray-800 hover:text-black transition-transform active:scale-95 cursor-pointer"
            aria-label="Buscar"
          >
            <i className="fa-solid fa-magnifying-glass text-lg"></i>
          </button>

          {/* Desktop: Logo (Alineado a la izquierda) */}
          <Link to="/" className="hidden lg:flex items-center hover:opacity-80 transition-opacity py-1 mr-10">
            {logoPulso ? (
              <img 
                src={logoPulso} 
                alt="Pulso Wear" 
                width={150}
                height={64}
                fetchPriority="high"
                className="h-14 lg:h-6 w-auto object-contain object-left transition-all" />
            ) : (
              <span className="text-3xl font-black tracking-tighter">{logoText}</span>
            )}
          </Link>
          
          {/* Desktop: Navegación (Se oculta en mobile/tablet) */}
          <nav className="hidden lg:flex items-center space-x-6 h-full">
            {menuItems && menuItems.length > 0 ? (
              menuItems.map((item) => (
                <NavLink key={item.id} item={item} onClick={handleNavClick} className="h-full text-[11px] tracking-[3px]" />
              ))
            ) : (
              <span className="text-[10px] text-gray-300 animate-pulse">Cargando menú...</span>
            )}
          </nav>
        </div>

        {/* --- 2. BLOQUE CENTRAL (Solo Mobile/Tablet) --- */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:hidden">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            {logoPulso ? (
              <img 
                src={logoPulso} 
                alt="Pulso Wear" 
                width={150}
                height={48}
                fetchPriority="high"
                className="h-6 md:h-12 w-auto max-w-30 md:max-w-40 object-contain" />
            ) : (
              <span className="text-2xl font-black tracking-tighter">{logoText}</span>
            )}
          </Link>
        </div>

        {/* --- 3. BLOQUE DERECHO (Acciones) --- */}
        <div className="flex items-center space-x-6">
          
          {/* Desktop: Lupa */}
          <button 
            onClick={onOpenSearch} 
            className="hidden lg:block text-gray-800 hover:text-black transition-transform active:scale-95 cursor-pointer"
            aria-label="Buscar"
          >
            <i className="fa-solid fa-magnifying-glass text-lg"></i>
          </button>

          {/* Desktop: Perfil */}
          <button 
            onClick={onOpenProfile} 
            className="hidden lg:block text-gray-800 hover:text-black transition-transform active:scale-95 cursor-pointer"
            aria-label="Perfil de usuario"
          >
            <i className="fa-regular fa-user text-lg"></i>
          </button>

          {/* Mobile, Tablet & Desktop: Carrito */}
          <button 
            onClick={onOpenCart} 
            className="relative group transition-transform active:scale-95 cursor-pointer"
            aria-label="Abrir carrito"
          >
            <i className="fa-solid fa-cart-shopping text-lg text-gray-800 group-hover:text-black"></i>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-in fade-in zoom-in">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* COMPONENTE DE MENÚ MOBILE (Drawer) */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
        onOpenProfile={onOpenProfile}
      />
    </>
  );
};

export default Header;