import React from 'react';
import NavLink from '@/src/components/ui/NavLink';
import { useApp } from '@/src/context/AppContext';
import WhiteLogoPulso from '@/src/assets/logo-pulso-white.svg'
import SloganPulso from '@/src/assets/Slogan.png'

/**
 * FOOTER DATA
 * Centralizar los links permite que el componente sea más limpio y fácil de editar.
 */
const INFO_LINKS = [
  { label: 'Talles', href: '#' },
  { label: 'Envíos', href: '#' },
  { label: 'Locales', href: '#locals-section', isScroll: true },
  { label: 'Contacto', href: '#' },
];

const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER; 
  const defaultMessage = "¡Hola! Vengo de la tienda online de PULSO y necesito ayuda.";
  const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

interface FooterProps {
  onOpenTerms: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenTerms }) => {
  const { menuItems } = useApp(); 
  
  /**
   * MANEJADOR DE NAVEGACIÓN
   * Mantiene la misma lógica de scroll suave que usamos en el Header.
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
    // Quitamos py-18 y usamos solo pt-20 para controlar el inicio. El final lo cierra el div de copyright.
    <footer className="bg-black text-white pt-20">
      <div className="max-w-360 mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        
        {/* COLUMNA 1: BRANDING (Logo + Slogan + Etiqueta) */}
        {/* Agregamos un poco de padding top solo en desktop para equilibrar visualmente con los títulos de las otras columnas */}
        <div className="md:col-span-6 flex flex-col gap-4 justify-start items-start md:pt-2">
          {/* Logo Principal */}
          <img 
            src={WhiteLogoPulso} 
            alt="PULSO" 
            className="w-48 md:w-56 object-contain"
          />

          {/* Slogan PNG */}
          <img 
            src={SloganPulso} 
            alt="Urban Wear / Street Style" 
            className="w-48 md:w-56 object-contain -mt-2"
          />
        </div>

        {/* COLUMNA 2: INFO LINKS (Usando NavLink) */}
        <div className="md:col-span-3">
          <h4 className="text-[11px] font-black uppercase tracking-[3px] mb-6 text-white">/ Info</h4>
          <ul className="flex flex-col space-y-3">
            {menuItems && menuItems.length > 0 ? (
              menuItems.map((item) => (
                <li key={item.id}>
                  <NavLink 
                    item={item}
                    //key={item.id}
                    onClick={handleNavClick}
                    showSubmenu={false}
                    // Agregamos text-[11px] y tracking-[3px] acá para forzar la igualdad
                    className="text-[11px] tracking-[3px] text-gray-400! hover:text-white! py-1!"
                  />
                </li>
              ))
            ) : (
              <span className="text-[11px] text-gray-300 animate-pulse uppercase tracking-widest">Cargando menú...</span>
            )}
            
            {/* BOTÓN: TÉRMINOS Y CONDICIONES (Preparado para Modal) */}
            <li>
              <button 
                onClick={onOpenTerms} // TODO: Conectar con estado de Modal
                className="text-[11px] font-black uppercase tracking-[3px] text-gray-400 hover:text-white transition-colors cursor-pointer text-left w-full py-1"
              >
                TÉRMINOS Y CONDICIONES
              </button>
            </li>
          </ul>
        </div>

        {/* COLUMNA 3: REDES SOCIALES (Reemplaza temporalmente al Newsletter) */}
        <div className="md:col-span-3">
          <h4 className="text-[11px] font-black uppercase tracking-[3px] mb-6 text-white">/ Seguinos</h4>
          <ul className="flex flex-col space-y-4">
            <li>
              <a href="https://www.instagram.com/pulsowear_/" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors group">
                <i className="fa-brands fa-instagram text-lg group-hover:scale-110 transition-transform"></i> Instagram
              </a>
            </li>
            <li>
              <a href="https://www.threads.com/@pulsowear_/" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors group">
                <i className="fa-brands fa-threads text-lg group-hover:scale-110 transition-transform"></i> Threads
              </a>
            </li>
            <li>
              <a href="https://www.tiktok.com/@pulso.pna/" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors group">
                <i className="fa-brands fa-tiktok text-lg group-hover:scale-110 transition-transform"></i> TikTok
              </a>
            </li>
            <li>
              <a href={waLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors group">
                <i className="fa-brands fa-whatsapp text-lg group-hover:scale-110 transition-transform"></i> WhatsApp
              </a>
            </li>
          </ul>
        </div>

        {/* COLUMNA OCULTA: NEWSLETTER (Comentado para futura implementación) */}
        {/* <div>
          <h4 className="text-[11px] font-black uppercase tracking-[3px] mb-6 text-white">/ Newsletter</h4>
          <div className="flex border-b border-gray-700 pb-2 group focus-within:border-white transition-colors">
            <input 
              type="email" 
              placeholder="TU@EMAIL.COM" 
              className="bg-transparent text-[10px] outline-none flex-1 placeholder:text-gray-600 font-black tracking-widest text-white"
            />
            <button className="text-[10px] font-black uppercase tracking-[2px] hover:text-gray-400 transition-colors">
              Unirse
            </button>
          </div>
        </div> 
        */}

      </div>

      {/* COPYRIGHT DINÁMICO */}
      {/* Bajamos el mt-24 a mt-16 en mobile (md:mt-24) para evitar el hueco excesivo */}
      <div className="mt-16 md:mt-24 border-t border-gray-900">
          {/* pt-8 para separar de la línea, pb-8 para dar un cierre elegante contra el final de la pantalla */}
          <div className='max-w-360 mx-auto px-6 pt-8 pb-8 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left'>
            {/* Izquierda: Identidad de la Marca */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase tracking-[4px] text-white transition-colors">
                CALIDAD PREMIUM · ESTILO URBANO
              </p>
              <p className="text-[10px] font-black hover:text-white uppercase tracking-[4px] text-gray-700">
                © {new Date().getFullYear()} PULSO. PARANÁ, ENTRE RÍOS. TODOS LOS DERECHOS RESERVADOS.
              </p>
            </div>

            {/* Derecha: Firma de la Agencia / Developer 
            <a 
              href="https://innovaciondigital.ar/" 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] font-black uppercase tracking-[3px] text-gray-700 hover:text-white transition-colors"
            >
              Developed by Innovación Digital
            </a>
            */}
          </div>
      </div>
    </footer>
  );
};

export default Footer;