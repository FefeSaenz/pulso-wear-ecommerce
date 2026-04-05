import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '@/src/components/ui/ProductCard';
import SectionTitle from '@/src/components/ui/SectionTitle';
import { Product } from '@/src/types/product.types';

interface ProductGridProps {
  products: Product[];
  searchTerm?: string;
  onClearSearch?: () => void;
  onQuickView: (product: Product) => void;
  quantityLabel?: boolean;
  title?: string;      
  viewAllLink?: string;
  viewAllText?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  searchTerm = '', 
  onClearSearch, 
  onQuickView,
  quantityLabel = true,
  title, 
  viewAllLink,
  viewAllText
}) => {
  return (
    <section className="w-full">
      {/* TITULO FULL BLEED: Queda afuera del max-w-7xl para llegar de borde a borde */}
      {title && (
        <SectionTitle 
          title={title} 
          viewAllLink={viewAllLink} 
          viewAllText={viewAllText} 
        />
      )}
      {/* CONTENIDO DEL GRID: Queda restringido en su caja */}
      <div className="max-w-360 mx-auto px-6">
        {quantityLabel && (
          <div className="flex items-center justify-between mb-8">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {products.length} Productos Encontrados {searchTerm && `para "${searchTerm}"`}
            </span>
            {searchTerm && onClearSearch && (
              <button 
                onClick={onClearSearch}
                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 cursor-pointer"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        )}

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-x-12 md:gap-y-16">
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
          <div className="flex justify-center mt-8 md:hidden">
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