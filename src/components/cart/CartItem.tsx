import React from 'react';
import { CartItem as CartItemType } from '@/src/types/product.types';
import Price from '@/src/components/ui/Price';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, size: string, color: string, delta: number) => void;
  onRemove: (id: string, size: string, color: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex space-x-4">
      <div className="w-24 aspect-3/4 shrink-0 bg-gray-100 overflow-hidden">
        {/* Usamos selectedImage por si cambió la foto al elegir el color, sino el fallback */}
        <img src={item.selectedImage || item.images[0]} className="w-full h-full object-cover" alt={item.name} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-tight leading-tight">{item.name}</h4>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
              Talle: <span className="text-black font-bold mr-2">{item.selectedSize}</span>
              {/* MOSTRAMOS EL COLOR ACÁ */}
              Color: <span className="text-black font-bold">{item.selectedColor}</span>
            </p>
          </div>
          <Price amount={item.price} className="text-xs font-bold" />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center border border-gray-200">
            <button 
              onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.selectedColor, -1)} 
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 cursor-pointer"
            >
              <i className="fa-solid fa-minus text-[10px]"></i>
            </button>
            <span className="w-8 h-8 flex items-center justify-center text-xs font-bold">{item.quantity}</span>
            <button 
              onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.selectedColor, 1)} 
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 cursor-pointer"
            >
              <i className="fa-solid fa-plus text-[10px]"></i>
            </button>
          </div>
          <button 
            onClick={() => onRemove(item.id, item.selectedSize, item.selectedColor)} 
            className="text-[10px] text-gray-400 hover:text-black underline uppercase tracking-widest cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;