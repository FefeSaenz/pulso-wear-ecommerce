import React from 'react';
import { Link } from 'react-router-dom';

interface SectionTitleProps {
  title: string;
  viewAllLink?: string;
  viewAllText?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ 
  title, 
  viewAllLink, 
  viewAllText 
}) => {
  return (
    // El contenedor principal (w-full) maneja la línea de lado a lado
    <div className="w-full border-b-4 md:border-b-5 mb-8">
      {/* El contenedor interno (max-w-360) mantiene el texto alineado con los productos */}
      <div className="max-w-360 mx-auto px-6 flex justify-between items-end pb-1 md:pb-1">
        {/*text-3xl md:text-4xl font-black tracking-tighter uppercase italic italic-pulso*/}
        <h2 className="text-3xl md:text-4xl font-syne font-bold uppercase tracking-normal leading-none mt-1">
          {title}
        </h2>
        
        {/* Link visible solo en Desktop */}
        {viewAllLink && viewAllText && (
          <Link
            to={viewAllLink}
            className="text-[10px] pb-1 font-black uppercase tracking-[2px] text-gray-400 hover:text-black transition-colors hidden md:block cursor-pointer"
          >
            {viewAllText}
          </Link>
        )}
      </div>
    </div>
  );
};

export default SectionTitle;