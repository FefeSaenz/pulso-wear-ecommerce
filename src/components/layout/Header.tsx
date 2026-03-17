import React from 'react';
import { Link } from 'react-router-dom';
// Importamos el átomo NavLink desde la carpeta ui
import NavLink from '@/src/components/ui/NavLink';
import { useApp } from '@/src/context/AppContext';
import logoPulso from '@/public/assets/Logotipo principal PULSO.png';


/**
 * PROPS INTERFACE
 * Define las acciones de apertura de modales y el contador del carrito.
 */
interface HeaderProps {
  onOpenCart: () => void;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  cartCount: number;
}

const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenProfile, onOpenSearch, cartCount }) => {
  // Consumimos la data real de la API desde nuestro Contexto
  const { menuItems, logoText } = useApp();
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
  };
  
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 h-20 flex items-center justify-between">
      
      {/* LOGO Y NAVEGACIÓN IZQUIERDA */}
      <div className="flex items-center space-x-8">
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity py-1">
          {/* Si tenemos la imagen local, la mostramos; si no, volvemos al texto de la API */}
          {
            logoPulso ? (
              <img src={logoPulso} alt="Pulso Wear" className="h-14 md:h-16 w-auto object-contain object-left transition-all" />
            ) : (
              <span className="text-3xl font-black tracking-tighter">{logoText}</span>
            )
          }
          
        </Link>
        
        {/* Renderizado dinámico usando el componente atómico NavLink */}
        <nav className="hidden md:flex items-center space-x-6 h-full">
          {menuItems && menuItems.length > 0 ? (
            menuItems.map((item) => (
              <NavLink 
                key={item.id} 
                item={item} 
                onClick={handleNavClick} 
                className="h-full"
              />
            ))
          ) : (
            <span className="text-[10px] text-gray-300 animate-pulse">Cargando menú...</span>
          )}
        </nav>
      </div>

      {/* ACCIONES DERECHA (Iconos de Interacción) */}
      <div className="flex items-center space-x-6">
        
        {/* BOTÓN BUSCADOR */}
        <button 
          onClick={onOpenSearch} 
          className="text-gray-800 hover:text-black transition-transform active:scale-95 cursor-pointer"
          aria-label="Buscar"
        >
          <i className="fa-solid fa-magnifying-glass text-lg"></i>
        </button>

        {/* BOTÓN MI PERFIL */}
        <button 
          onClick={onOpenProfile} 
          className="text-gray-800 hover:text-black transition-transform active:scale-95 cursor-pointer"
          aria-label="Perfil de usuario"
        >
          <i className="fa-regular fa-user text-lg"></i>
        </button>

        {/* BOTÓN CARRITO CON INDICADOR DINÁMICO (Badge) */}
        <button 
          onClick={onOpenCart} 
          className="relative group transition-transform active:scale-95 cursor-pointer"
          aria-label="Abrir carrito"
        >
          <i className="fa-solid fa-cart-shopping text-lg text-gray-800 group-hover:text-black"></i>
          {/* Solo se muestra si hay items en el carrito */}
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-in fade-in zoom-in">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;