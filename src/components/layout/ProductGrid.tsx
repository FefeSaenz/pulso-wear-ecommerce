import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '@/src/components/ui/ProductCard';
import SectionTitle from '@/src/components/ui/SectionTitle';
import { Product } from '@/src/types/product.types';

interface ProductGridProps {
  products: Product[];
  onQuickView: (product: Product) => void;
  quantityLabel?: boolean;
  title?: string;      
  viewAllLink?: string;
  viewAllText?: string;
  layoutMode?: 'home' | 'catalog'; // <-- NUEVO SWITCH DE DISEÑO
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products,
  onQuickView,
  quantityLabel = true,
  title, 
  viewAllLink,
  viewAllText,
  layoutMode = 'home' // Por defecto actúa como lookbook
}) => {
  
  // DICCIONARIO DE GRILLAS RESPONSIVAS
  const gridLayouts = {
    // HOME: 1 col (Mobile) -> 2 cols (Tablet) -> 4 cols (Desktop)
    home: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-x-8 lg:gap-x-12 lg:gap-y-16",
    
    // CATALOGO: 2 cols (Mobile y Tablet) -> 3 cols (Desktop con Sidebar)
    // Reducimos el gap horizontal (gap-x-3) en mobile para tarjetas más anchas
    catalog: "grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-8 md:gap-8 lg:gap-x-12 lg:gap-y-16"
  };

  return (
    <section className="w-full flex flex-col gap-6">
      {/* TITULO FULL BLEED: Queda afuera del max-w-7xl para llegar de borde a borde */}
      {title && (
        <SectionTitle 
          title={title} 
          viewAllLink={viewAllLink} 
          viewAllText={viewAllText} 
        />
      )}
      
      {/* CONTENIDO DEL GRID: Acá aplicamos la magia "Dumb Component" */}
      {/* Si es Home, se auto-contiene. Si es Catálogo, usa el 100% y confía en el padre */}
      <div className={layoutMode === 'home' ? "max-w-360 mx-auto px-4 md:px-6" : "w-full"}>
        
        {quantityLabel && products.length > 0 && (
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {products.length} {products.length === 1 ? 'Producto Encontrado' : 'Productos Encontrados'}
            </span>
          </div>
        )}

        {products.length > 0 ? (
          // Usamos el diccionario para inyectar la grilla correcta
          <div className={gridLayouts[layoutMode]}>
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAdd={() => onQuickView(product)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-40">
            <p className="text-xs font-black uppercase tracking-[4px] text-gray-300">No se encontraron productos</p>
            <Link 
              to="/productos"
              className="mt-3 inline-block text-[10px] font-black uppercase tracking-[2px] underline"
            >
              Ver todo el catálogo
            </Link>
          </div>
        )}
        {/* BOTÓN CTA: Solo visible en Mobile al final del scroll */}
        {viewAllLink && viewAllText && products.length > 0 && (
          <div className="flex justify-center mt-8 lg:hidden">
            <Link 
              to={viewAllLink}
              className="w-full bg-black text-white text-center py-5 text-[11px] font-black uppercase tracking-[4px] active:bg-gray-800 transition-colors"
            >
              {viewAllText}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;