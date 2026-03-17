import React from 'react';
import ProductCard from '../ui/ProductCard';
import { Product } from '../../types/product.types';

interface ProductGridProps {
  products: Product[];
  searchTerm: string;
  onClearSearch: () => void;
  onQuickView: (product: Product) => void;
  onResetFilters: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  searchTerm, 
  onClearSearch, 
  onQuickView, 
  onResetFilters 
}) => {
  return (
    <section className="px-6 py-5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {products.length} Productos Encontrados {searchTerm && `para "${searchTerm}"`}
          </span>
          {searchTerm && (
            <button 
              onClick={onClearSearch}
              className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>

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
            <button 
              onClick={onResetFilters}
              className="mt-6 text-[10px] font-black uppercase tracking-[2px] underline"
            >
              Ver todo el catálogo
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;