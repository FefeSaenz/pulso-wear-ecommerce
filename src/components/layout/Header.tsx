import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavLink from '@/src/components/ui/NavLink';
import { useApp } from '@/src/context/AppContext';
import logoPulso from '@/public/assets/Logotipo principal PULSO.png';
import MobileMenu from '@/src/components/layout/MobileMenu';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  cartCount: number;
}

const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenProfile, onOpenSearch, cartCount }) => {
  // Consumimos la data real de la API desde nuestro Contexto
  const { menuItems, logoText } = useApp();

  // ESTADO PARA CONTROLAR EL MENÚ MOBILE (DRAWER)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * MANEJADOR DE NAVEGACIÓN
   * Lógica centralizada para manejar el scroll suave o la navegación estándar.
   */
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isScroll?: boolean) => {
    if (isScroll) {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };
  
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-5 md:px-5 h-20 flex items-center justify-between">
        
        {/* --- 1. BLOQUE IZQUIERDO --- */}
        <div className="flex items-center space-x-5 ">
          
          {/* Mobile: Hamburguesa */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-gray-800 hover:text-black transition-transform active:scale-95 cursor-pointer"
            aria-label="Abrir menú"
          >
            <div className="flex flex-col space-y-1.5 items-start">
              <span className="block w-5 h-0.5 bg-gray-800 hover:text-black"></span>
              <span className="block w-5 h-0.5 bg-gray-800 hover:text-black"></span>
              <span className="block w-5 h-0.5 bg-gray-800 hover:text-black"></span>
            </div>
          </button>

          {/* Mobile: Lupa (En desktop se esconde porque va a la derecha) */}
          <button 
            onClick={onOpenSearch} 
            className="md:hidden text-gray-800 hover:text-black transition-transform active:scale-95 cursor-pointer"
            aria-label="Buscar"
          >
            <i className="fa-solid fa-magnifying-glass text-lg"></i>
          </button>

          {/* Desktop: Logo (Alineado a la izquierda) */}
          <Link to="/" className="hidden md:flex items-center hover:opacity-80 transition-opacity py-1">
            {logoPulso ? (
              <img src={logoPulso} alt="Pulso Wear" className="h-14 md:h-16 w-auto object-contain object-left transition-all" />
            ) : (
              <span className="text-3xl font-black tracking-tighter">{logoText}</span>
            )}
          </Link>
          
          {/* Desktop: Navegación (Se oculta en mobile) */}
          <nav className="hidden md:flex items-center space-x-6 h-full">
            {menuItems && menuItems.length > 0 ? (
              menuItems.map((item) => (
                <NavLink key={item.id} item={item} onClick={handleNavClick} className="h-full text-[11px] tracking-[3px]" />
              ))
            ) : (
              <span className="text-[10px] text-gray-300 animate-pulse">Cargando menú...</span>
            )}
          </nav>
        </div>

        {/* --- 2. BLOQUE CENTRAL (Solo Mobile) --- */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:hidden">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            {logoPulso ? (
              <img src={logoPulso} alt="Pulso Wear" className="h-10 w-auto object-contain" />
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
            className="hidden md:block text-gray-800 hover:text-black transition-transform active:scale-95 cursor-pointer"
            aria-label="Buscar"
          >
            <i className="fa-solid fa-magnifying-glass text-lg"></i>
          </button>

          {/* Desktop: Perfil (En mobile el acceso está dentro del MobileMenu) */}
          <button 
            onClick={onOpenProfile} 
            className="hidden md:block text-gray-800 hover:text-black transition-transform active:scale-95 cursor-pointer"
            aria-label="Perfil de usuario"
          >
            <i className="fa-regular fa-user text-lg"></i>
          </button>

          {/* Mobile & Desktop: Carrito */}
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