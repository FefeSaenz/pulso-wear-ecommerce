import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { Product } from '@/src/types/product.types';

interface ProductCarouselProps {
  title: string;
  products: Product[];
  onAdd: (product: Product) => void;
  viewAllLink?: string; // Ruta dinámica
  viewAllText?: string; // Texto dinámico
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ 
  title, 
  products, 
  onAdd,
  viewAllLink = '/productos', 
  viewAllText = 'Ver Todo'
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = carouselRef.current;
      const scrollAmount = clientWidth * 0.8; 
      
      const isAtEnd = Math.ceil(scrollLeft + clientWidth) >= scrollWidth - 5;
      const isAtStart = scrollLeft <= 5;

      if (direction === 'left') {
        if (isAtStart) {
          carouselRef.current.scrollTo({ left: scrollWidth, behavior: 'smooth' }); 
        } else {
          carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
      } else {
        if (isAtEnd) {
          carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' }); 
        } else {
          carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }
  };

  if (!products || products.length === 0) return null;

  return (
    // Agregamos un contenedor principal que puede ocupar todo el ancho
    <div className="w-full py-8 border-t border-gray-100 mt-5 md:mt-10">
      <style>{`
        .no-scroll-view::-webkit-scrollbar { display: none; }
        .no-scroll-view { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Contenedor del título (Respeta los márgenes estándar) */}
      <div className="max-w-360 mx-auto px-6  flex justify-between items-end border-b-5 pb-1">
        <h2 className="text-4xl font-black tracking-tighter uppercase italic italic-pulso">
          {title}
        </h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-[10px] font-black uppercase tracking-[2px] text-gray-400 hover:text-black transition-colors hidden md:block cursor-pointer">
            {viewAllText}
          </Link>
        )}
      </div>

      {/* Contenedor de las tarjetas (Full Bleed en Mobile) */}
      <div className="max-w-360 py-5 mt-4  mx-auto relative group/carousel">
        
        {/* FLECHAS LATERALES (Exclusivas de Desktop, escuchan solo al group/carousel) */}
        <button 
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-4 top-1/2 mt-4 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center border border-gray-200 bg-white rounded-full text-black hover:bg-black hover:text-white hover:border-black transition-all opacity-0 group-hover/carousel:opacity-100 shadow-sm cursor-pointer"
        >
          <i className="fa-solid fa-chevron-left text-sm"></i>
        </button>
        <button 
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-4 top-1/2 mt-4 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center border border-gray-200 bg-white rounded-full text-black hover:bg-black hover:text-white hover:border-black transition-all opacity-0 group-hover/carousel:opacity-100 shadow-sm cursor-pointer"
        >
          <i className="fa-solid fa-chevron-right text-sm"></i>
        </button>

        {/* CONTENEDOR DEL CARRUSEL */}
        {/* El padding-left en mobile (pl-6) alinea el primer elemento con el título. */}
        {/* El padding-right (pr-6) asegura que el último elemento no pegue contra el borde si scrolleas a tope. */}
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto gap-4 md:gap-6 snap-x snap-mandatory scroll-smooth pb-4 no-scroll-view pl-6 pr-6 md:px-6"
        >
          {products.map((product, idx) => (
            <div 
              key={`${product.id}-${idx}`} 
              // En mobile (w-[75%]), la tarjeta ocupa 3/4 de pantalla. Como el gap y los márgenes hacen lo suyo, 
              // el usuario verá claramente el borde de la siguiente tarjeta asomando a la derecha.
              className="snap-start shrink-0 w-[75%] md:w-[45%] lg:w-[23%]"
            >
              <ProductCard product={product} onAdd={onAdd} />
            </div>
          ))}
          
          {/* Tarjeta final opcional ("Ver más") para darle un cierre elegante en mobile */}
          <div className="snap-start shrink-0 w-[50%] md:hidden flex items-center justify-center">
            <Link 
              to={viewAllLink}
              className="text-center p-6 border border-dashed border-gray-300 rounded-sm w-full h-[70%] flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-black hover:border-black transition-colors"
            >
              <i className="fa-solid fa-arrow-right text-2xl"></i>
              <span className="text-[10px] font-black uppercase tracking-widest">{viewAllText}</span>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;