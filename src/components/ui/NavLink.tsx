import React from 'react';
import { MenuItem } from '@/src/types/api';

interface NavLinkProps {
  item: MenuItem;
  //Pasamos el href para que el manejador de scroll funcione
  onClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  //onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
  showSubmenu?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ item, onClick, className = "", showSubmenu = true }) => {
  if (!item) return null;

  //const hasSubmenu = item?.submenu && item.submenu.length > 0;
  const hasSubmenu = showSubmenu && item.submenu && item.submenu.length > 0;
  
  return (
    <div className="relative group flex items-center">
      <a
        href={item.url}
        onClick={(e) => onClick(e, item.url)}
        className={`text-[11px] font-black uppercase tracking-[3px] flex items-center gap-2 transition-colors py-4 ${
          item.active ? 'text-black' : 'text-gray-400 hover:text-black'
        } ${className}`}
      >
        {item.label}
        
        {/* Lógica del icono de fuego inyectada en el átomo */}
        {item.icon === 'fire' && (
          <i className="fa-solid fa-fire text-orange-500 animate-pulse"></i>
        )}
      </a>

      {/* Renderizado condicional del Submenú */}
      {hasSubmenu && (
        <div className="bg-white/30 absolute top-full left-0 hidden group-hover:block animate-in fade-in slide-in-from-top-1 duration-200 z-50">
          {/* mt-[-10px] para que no haya "hueco" y no se cierre al mover el mouse */}
          <div className="bg-white/90 backdrop-blur-md shadow-xl border border-gray-100 border-0 p-6 min-w-[220px]">
            {item.submenu?.map((sub, idx) => (
              <a
                key={`${sub.url}-${idx}`}
                href={sub.url}
                onClick={(e) => onClick(e, sub.url)}
                className="block py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
              >
                {sub.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavLink;