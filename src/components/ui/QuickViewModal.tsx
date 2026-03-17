import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '../../types/product.types';
import Modal from './Modal';
import Price from './Price';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
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
        className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-md text-gray-500 hover:text-black transition-colors"
      >
        <i className="fa-solid fa-xmark"></i>
      </button>

      <div className="flex flex-col md:flex-row overflow-hidden max-h-[95vh]">
        {/* SECCIÓN DE GALERÍA */}
        <div className="w-full md:w-[60%] bg-gray-50 flex flex-col md:flex-row">
          {/* Miniaturas (Desktop) */}
          <div className="hidden md:flex flex-col p-4 space-y-2 w-20 overflow-y-auto custom-scrollbar">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onMouseEnter={() => {
                  setActiveImageIndex(idx);
                  setImageError(true);
                }}
                className={`aspect-[3/4] border-2 transition-all ${
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

        {/* SECCIÓN DE INFORMACIÓN */}
        <div className="w-full md:w-[40%] p-8 md:p-10 flex flex-col justify-center overflow-y-auto bg-white">
          <p className="text-[10px] font-bold uppercase tracking-[3px] text-gray-400 mb-2">{product.category}</p>
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 leading-tight text-black">{product.name}</h2>
          
          <Price amount={product.price} className="text-xl font-bold mb-8 text-black block" />
          
          {/* NUEVO: Selección de Color */}
          {product.variants.length > 1 && currentVariant.color.name !== 'Único' && (
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-black">
                Color: <span className="text-gray-500 font-normal">{currentVariant.color.name}</span>
              </p>
              <div className="flex gap-2">
                {product.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedVariant(variant);
                      // Al cambiar de color, autoseleccionamos el primer talle disponible de ese color
                      setSelectedSize(variant.sizes[0]?.size.toString() || '');
                      setImageError(false);
                    }}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      currentVariant.color.name === variant.color.name ? 'border-black scale-110' : 'border-transparent hover:scale-110'
                    }`}
                    style={{ backgroundColor: variant.color.hex }}
                    title={variant.color.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Selección de Talle (Basado en la variante activa) */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-4 text-black">Seleccionar Talle</p>
            <div className="flex flex-wrap gap-2">
              {currentVariant.sizes.map((sizeObj) => {
                const sizeStr = sizeObj.size.toString();
                const isAvailable = sizeObj.available && sizeObj.stock > 0;
                
                return (
                  <button
                    key={sizeStr}
                    onClick={() => isAvailable && setSelectedSize(sizeStr)}
                    disabled={!isAvailable}
                    className={`w-12 h-12 flex items-center justify-center text-xs font-bold border transition-all ${
                      !isAvailable 
                        ? 'border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed opacity-50' // Estilo sin stock
                        : selectedSize === sizeStr 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'
                    }`}
                  >
                    {sizeStr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descripción */}
          <div className="mb-10">
             <h4 className="text-[10px] font-black uppercase tracking-widest mb-2 text-black">Descripción</h4>
             <p className="text-sm text-gray-500 leading-relaxed">
               {product.description}
             </p>
          </div>

          <button
            onClick={() => onAddToCart(product, selectedSize)}
            disabled={!selectedSize}
            className={`w-full py-5 text-[12px] font-black uppercase tracking-[4px] transition-colors flex items-center justify-center space-x-3 ${
              selectedSize ? 'bg-black text-white hover:bg-gray-900' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <i className="fa-solid fa-cart-plus"></i>
            <span>{selectedSize ? 'Añadir al carrito' : 'Seleccioná un talle'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default QuickViewModal;