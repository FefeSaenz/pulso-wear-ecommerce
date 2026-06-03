import React, { useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '@/src/types/product.types';
import Modal from './Modal';
import Price from './Price';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, onAddToCart }) => {
  // Si no hay producto seleccionado, el Modal base ya maneja el !isOpen, 
  // pero lo mantenemos para evitar errores de hooks abajo.
  if (!product) return null;

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // ESTADOS PARA LA NUEVA ESTRUCTURA DE VARIANTES
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  // Efecto para inicializar los estados cuando se abre un producto nuevo
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const initialVariant = product.variants[0];
      setSelectedVariant(initialVariant);
      // Seleccionamos el primer talle por defecto asegurándonos de que sea string
      setSelectedSize(initialVariant.sizes[0]?.size.toString() || '');
      setActiveImageIndex(0);
      setImageError(false);
    }
  }, [product]);

  const currentVariant = selectedVariant || product.variants?.[0];
  if (!currentVariant) return null;

  const mainImageSrc = (currentVariant.color?.image && !imageError) 
    ? currentVariant.color.image 
    : product.images[activeImageIndex];

  return (
    <Modal isOpen={!!product} onClose={onClose} maxWidth="max-w-5xl">
      {/* Botón de cerrar específico del diseño QuickView */}
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 lg:top-4 lg:right-4 z-20 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md text-gray-500 hover:text-black transition-colors cursor-pointer"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>

      {/* Ajuste de altura máxima equilibrada para notebook (aprox 85vh) */}
      <div className="flex flex-col md:flex-row overflow-hidden h-full max-h-[92vh] md:max-h-[85vh] 2xl:max-h-[92vh]">
        {/* SECCIÓN DE GALERÍA */}
        <div className="w-full md:w-[55%] bg-gray-50 flex flex-col md:flex-row">
          {/* Miniaturas (Desktop) */}
          <div className="hidden md:flex flex-col p-3 lg:p-4 space-y-2 w-16 lg:w-20 overflow-y-auto no-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => {
                  setActiveImageIndex(idx);
                  setImageError(true);
                }}
                className={`aspect-3/4 border-2 transition-all ${
                  activeImageIndex === idx ? 'border-black' : 'border-transparent opacity-60'
                }`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
              </button>
            ))}
          </div>
          
          {/* Imagen Principal */}
          <div className="flex-1 relative overflow-hidden group">
            {/* Si la variante tiene imagen específica la usamos, sino la de la galería */}
            <img 
              src={mainImageSrc} 
              alt={product.name}
              onError={() => setImageError(true)} 
              className="w-full h-full object-cover transition-transform duration-700"
            />
            
            {/* Indicadores Mobile */}
            <div className="absolute bottom-4 left-0 right-0 md:hidden flex justify-center space-x-2">
               {product.images.map((_, idx) => (
                 <button 
                  key={idx}
                  onClick={() => {
                    setActiveImageIndex(idx);
                    setImageError(true);
                  }}
                  className={`w-2 h-2 rounded-full ${activeImageIndex === idx ? 'bg-black' : 'bg-white/50'}`} 
                 />
               ))}
            </div>
          </div>
        </div>

        {/* SECCIÓN DE INFORMACIÓN: Paddings y gaps ultra comprimidos para 1366x768 */}
        <div className="w-full md:w-[45%] p-5 lg:p-6 2xl:p-10 flex flex-col justify-between overflow-y-auto no-scrollbar bg-white">
          <div className="space-y-3 lg:space-y-4 2xl:space-y-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[3px] text-gray-400 mb-1">{product.category}</p>
              <h2 className="text-xl lg:text-2xl 2xl:text-3xl font-black uppercase tracking-tighter leading-tight text-black">{product.name}</h2>
            </div>
            
            {/* Precio y Descuento */}
            <div className="flex items-center gap-3">
              <Price amount={product.price} className="text-lg lg:text-xl 2xl:text-2xl font-bold text-black" />
              {product.original_price && (
                <span className="text-xs lg:text-sm 2xl:text-base text-gray-400 line-through">${product.original_price.toLocaleString('es-AR')}</span>
              )}
            </div>
            
            {/* Selección de Color */}
            {currentVariant.color.name !== 'ÚNICO' && (
              <div className="border-t border-gray-100 pt-3 2xl:pt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[2px] text-gray-500">Color</span>
                  <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[2px] text-black bg-gray-50 px-2 py-0.5 rounded-full">
                    {currentVariant.color.name}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedVariant(variant);
                        // Al cambiar de color, autoseleccionamos el primer talle disponible de ese color
                        setSelectedSize(variant.sizes[0]?.size.toString() || '');
                        setImageError(false);
                      }}
                      className={`px-3 py-1.5 2xl:px-4 2xl:py-2 border rounded-sm text-[9px] lg:text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                        currentVariant.color.name === variant.color.name 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-200 bg-white hover:border-black text-gray-600'
                      }`}
                    >
                      {variant.color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selección de Talle (Basado en la variante activa) */}
            <div className="border-t border-gray-100 pt-3 2xl:pt-5">
              <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-black">Seleccionar Talle</p>
              <div className="flex flex-wrap gap-1.5 2xl:gap-2">
                {currentVariant.sizes.map((sizeObj) => {
                  const sizeStr = sizeObj.size.toString();
                  const isAvailable = sizeObj.available && sizeObj.stock > 0;
                  
                  return (
                    <button
                      key={sizeStr}
                      onClick={() => isAvailable && setSelectedSize(sizeStr)}
                      disabled={!isAvailable}
                      className={`w-10 h-10 lg:w-11 lg:h-11 2xl:w-12 2xl:h-12 border flex items-center justify-center text-[10px] lg:text-[11px] font-bold transition-all ${
                        !isAvailable 
                          ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed opacity-60 line-through' 
                          : selectedSize === sizeStr 
                            ? 'bg-black text-white cursor-pointer' 
                            : 'bg-white border-gray-200 hover:border-black text-gray-800 cursor-pointer'
                      }`}
                    >
                      {sizeStr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Descripción y Detalles */}
            <div className="border-t border-gray-100 pt-3 2xl:pt-5">
              {/* Marca */}
              {product.brand && (
                <div className="flex items-center gap-2 mb-2 2xl:mb-4">
                  <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[2px] text-gray-400">Marca:</span>
                  <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[2px] text-black bg-gray-50 px-2 py-0.5">{product.brand}</span>
                </div>
              )}
              
              {/* Descripción con Fallback y saltos de línea */}
              <div>
                <h4 className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest mb-1 text-black">Descripción</h4>
                <p className="text-xs lg:text-sm text-gray-500 leading-relaxed whitespace-pre-line line-clamp-2 2xl:line-clamp-none">
                  {product.description || 'Combinación ideal entre confort duradero y cortes contemporáneos.'}
                </p>
              </div>
            </div>
          </div>

          {/* Botón de acción con pt ajustado */}
          <div className="pt-4 2xl:pt-6 mt-auto">
            <button
              onClick={() => {
                if (selectedSize) {
                  const newItem: CartItem = {
                    ...product,
                    quantity: 1,
                    selectedSize: selectedSize,
                    selectedColor: currentVariant.color.name,
                    selectedImage: mainImageSrc
                  };
                  onAddToCart(newItem);
                }
              }}
              disabled={!selectedSize}
              className={`w-full py-3.5 lg:py-4 2xl:py-5 text-[11px] lg:text-[12px] font-black uppercase tracking-[4px] transition-colors flex items-center justify-center space-x-3 cursor-pointer ${
                selectedSize ? 'bg-black text-white hover:bg-gray-900' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <i className="fa-solid fa-cart-plus"></i>
              <span>{selectedSize ? 'Añadir al carrito' : 'Seleccioná un talle'}</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuickViewModal;