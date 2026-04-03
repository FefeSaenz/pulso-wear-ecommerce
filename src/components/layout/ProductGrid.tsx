import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ui/ProductCard';
import { Product } from '../../types/product.types';

interface ProductGridProps {
  products: Product[];
  searchTerm?: string;
  onClearSearch?: () => void;
  onQuickView: (product: Product) => void;
  quantityLabel?: boolean; // Etiqueta dinámica para la cantidad de productos encontrados
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  searchTerm = '', 
  onClearSearch, 
  onQuickView,
  quantityLabel = true
}) => {
  return (
    <section className=" py-5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
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
      </div>
    </section>
  );
};

export default ProductGrid;