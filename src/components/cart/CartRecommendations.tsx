import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { mapApiProductToLocal } from '../../utils/mappers';
import { Product } from '../../types/product.types';
import Price from '../ui/Price';

// --- COMPONENTE DE PRESENTACIÓN (PURO) ---
interface RecommendationListProps {
  products: Product[];
  onAddFromRec: (product: Product) => void;
}

const RecommendationList: React.FC<RecommendationListProps> = ({ products, onAddFromRec }) => {
  if (products.length === 0) return null;
  return(
    <div className="hidden md:flex flex-col w-[300px] border-r border-gray-100 bg-gray-50/30 overflow-y-auto custom-scrollbar">
      <div className="p-8 border-b border-gray-100">
        <h2 className="text-[11px] font-bold uppercase tracking-[3px] text-gray-400">Te puede gustar</h2>
      </div>
      <div className="p-4 space-y-8">
        {products.map((product) => (
          <div key={product.id} className="text-center group cursor-pointer" onClick={() => onAddFromRec(product)}>
            <div className="aspect-[3/4] mb-3 overflow-hidden bg-gray-100">
              <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={product.name} />
            </div>
            <h4 className="text-[10px] font-medium uppercase truncate px-2 text-gray-800">
              {product.name}
            </h4>
            <Price amount={product.price} className="text-[10px] font-bold mt-1 text-gray-500" />
          </div>
        ))}
      </div>
    </div>
  );
};

// --- COMPONENTE CONTENEDOR (ORQUESTADOR) ---
// Este componente maneja la data y se la pasa al de arriba.
const CartRecommendations: React.FC<{ onAddFromRec: (product: Product) => void }> = ({ onAddFromRec }) => {
  const { frontConfig } = useApp();
  
  const recommendations = useMemo(() => {
    const raw = frontConfig?.featured_products?.products || [];

    return raw.map(mapApiProductToLocal).slice(0,4);
  }, [frontConfig]);

  return <RecommendationList products={recommendations} onAddFromRec={onAddFromRec} />;
};

export default CartRecommendations;