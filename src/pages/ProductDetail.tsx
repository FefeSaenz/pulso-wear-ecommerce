import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';

// Contexts y Utils de PULSO
import { useApp } from '@/src/context/AppContext';
import { useCart } from '@/src/context/CartContext';
import { mapApiProductToLocal } from '@/src/utils/mappers';
import { Product } from '@/src/types/product.types'; // Importamos tu tipo real

// UI Components
import Price from '@/src/components/ui/Price';
import ProductCarousel from '@/src/components/ui/ProductCarousel';

interface ProductDetailContext {
  setSelectedQuickView: (product: Product) => void;
}

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { setSelectedQuickView } = useOutletContext<ProductDetailContext>();
  
  const { allProducts, frontConfig, loading } = useApp();
  const { addToCart } = useCart();

  // 1. BÚSQUEDA Y UNIFICACIÓN DE DATA (Respetando tu mapeo)
  const product: Product | undefined = useMemo(() => {
    // Recreamos el catálogo unificado
    const catalog: Product[] = allProducts.map(p => ({ ...p }));
    
    // Traemos los destacados y los mapeamos usando tu función de utils/mappers.ts
    const featuredRaw = frontConfig?.featured_products?.products || [];
    const featuredMapped = featuredRaw.map(mapApiProductToLocal);

    featuredMapped.forEach(fProd => {
      if (!catalog.find(p => p.id === fProd.id)) {
        catalog.push(fProd);
      }
    });

    // Buscamos el producto por slug o id
    return catalog.find(p => p.slug === slug || p.id === slug);
  }, [allProducts, frontConfig, slug]);

  // 2. ESTADOS LOCALES
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 3. INICIALIZAR DATA (Basado en tu interfaz Product)
  useEffect(() => {
    if (product) {
      // Usamos el array de images que definiste en product.types.ts
      if (product.images && product.images.length > 0) {
        setMainImage(product.images[0]);
      } else {
        setMainImage('');
      }
      
      // Seleccionamos el primer color si hay variantes
      if (product.variants && product.variants.length > 0) {
        setSelectedColor(product.variants[0].color.name);
      }
      
      setSelectedSize(null);
      setError('');
    }
  }, [product]);

  // 4. LÓGICA DE VARIANTES
  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map(v => v.color.name)));
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product?.variants || !selectedColor) return [];
    const variant = product.variants.find(v => v.color.name === selectedColor);
    // Extraemos los talles usando tu estructura ProductSize
    return variant ? variant.sizes.map(s => s.size.toString()) : [];
  }, [product, selectedColor]);

  // 5. MANEJADOR DEL CARRITO (Respetando tu interfaz CartItem)
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setError('Por favor, selecciona Talle y Color antes de agregar.');
      return;
    }
    
    if (product) {
      // Construimos el objeto respetando tu Omit<Product, 'variants'> + CartItem extras
      // Usamos as any momentáneamente solo para que el dispatch pase limpio hacia tu CartContext
      const cartItem = {
        id: product.id, // Omitimos variantes, mandamos el ID base
        slug: product.slug,
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.original_price,
        discount_percentage: product.discount_percentage,
        images: product.images,
        category: product.category,
        subcategory: product.subcategory,
        gender: product.gender,
        tags: product.tags,
        active: product.active,
        rating: product.rating,
        reviews_count: product.reviews_count,
        // Propiedades específicas de CartItem:
        quantity: 1,
        selectedSize: selectedSize,
        selectedColor: selectedColor,
        selectedImage: mainImage || (product.images.length > 0 ? product.images[0] : '')
      };

      addToCart(cartItem as any); 
      setError('');
      // OPCIONAL: Acá podrías disparar la apertura del CartDrawer
      // onOpenCart(); si lo tuvieras disponible mediante contexto o prop.
    }
  };

  // 6. ESTADOS DE CARGA Y ERROR
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-black italic-pulso uppercase tracking-tighter mb-4">Producto no encontrado</h1>
        <p className="text-gray-500 mb-8 font-bold uppercase tracking-widest text-sm">El artículo que buscás ya no está disponible.</p>
        <Link to="/productos" className="bg-black text-white px-8 py-4 text-[10px] font-black uppercase tracking-[3px] hover:bg-gray-900 transition-colors">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  // 7. RENDERIZADO PRINCIPAL
  return (
    <div className="max-w-360 mx-auto px-6 py-6 md:py-10 animate-in fade-in duration-500">
      
      {/* BREADCRUMBS */}
      <nav className="flex flex-wrap items-center text-[10px] font-black uppercase tracking-[2px] text-gray-400 mb-6 md:mb-10 gap-y-2">
        <Link to="/" className="hover:text-black transition-colors shrink-0">Inicio</Link>
        <span className="mx-2 md:mx-3 shrink-0">/</span>
        <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-black transition-colors shrink-0">{product.category}</Link>
        <span className="mx-2 md:mx-3 shrink-0">/</span>
        <span className="text-black truncate">{product.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row gap-12 lg:gap-20 ">
        
        {/* GALERÍA DE IMÁGENES (Responsiva) */}
        <div className="w-full md:w-1/2 flex flex-col md:flex-row gap-4 md:gap-6">
          
          {/* Miniaturas (Desktop: Izquierda Vertical / Mobile: Abajo Horizontal) */}
          {product.images && product.images.length > 1 && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar order-2 md:order-1 w-full md:w-20 lg:w-24 shrink-0 pb-2 md:pb-0">
              {product.images.map((img: string, idx: number) => (
                <button 
                  key={idx} 
                  onClick={() => setMainImage(img)}
                  className={`w-20 md:w-full aspect-4/5 shrink-0 transition-all cursor-pointer rounded-sm flex group overflow-hidden ${
                    mainImage === img 
                      ? 'z-10 p-0 border-0 outline-none appearance-none' 
                      : 'hover:opacity-80 p-0 border-0 outline-none appearance-none bg-transparent'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} thumbnail ${idx + 1}`} 
                    className="block w-full h-full object-cover rounded-sm transition-transform duration-300 scale-[1.01] group-hover:scale-105" 
                  />
                </button>
              ))}
            </div> 
          )}

          {/* Imagen Principal */}
          <div className="flex-1 order-1 md:order-2 aspect-4/5 bg-gray-50 rounded-sm overflow-hidden relative group flex">
            {/* NUEVO: ETIQUETA DE OFERTA SUPERPUESTA (Z-20 para estar sobre la imagen) */}
            {(product.discount_percentage || (product.original_price && product.original_price > product.price)) ? (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[3px] z-20 rounded-sm pointer-events-none shadow-md">
                {product.discount_percentage ? `-${product.discount_percentage}%` : 'Oferta'}
              </div>
            ) : null}
            {mainImage ? (
              <img 
                src={mainImage} 
                alt={product.name} 
                className="w-full h-full object-cover object-center scale-[1.01] group-hover:scale-[1.03] transition-transform duration-700 block"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-bold uppercase tracking-widest">
                Sin Imagen
              </div>
            )}
          </div>
          
        </div>

        {/* INFO Y COMPRA */}
        <div className="w-full md:w-1/2 flex flex-col">
          {/* Etiqueta / Tag */}
          {product.tags && (
            <span className="inline-block bg-black text-white text-[9px] font-black uppercase tracking-[3px] px-3 py-1.5 w-max mb-6 rounded-sm">
              {Array.isArray(product.tags) ? product.tags[0] : product.tags}
            </span>
          )}

          {/* Título */}
          <h1 className="text-3xl md:text-5xl font-black italic-pulso uppercase tracking-tighter mb-2 leading-none">
            {product.name}
          </h1>

          {/* SKU y Rating */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            {product.base_sku && <span>SKU: {product.base_sku}</span>}
            
            {/* RATING:
            {product.rating && (
              <span className="flex items-center gap-1 text-black">
                ★ {product.rating} <span className="text-gray-400">({product.reviews_count || 0})</span>
              </span>
            )}*/}
          </div>

          {/* Precio */}
          <div className="mb-8 flex items-center gap-4">
             <Price amount={product.price} className="text-2xl font-bold" />
             {product.original_price && (
               <span className="text-lg text-gray-400 line-through">${product.original_price.toLocaleString('es-AR')}</span>
             )}
          </div>

          {/* Selector de Color */}
          {availableColors.length > 0 && (
            <div className="mb-8 border-b border-gray-100 pb-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-500">Color</span>
                <span className="text-[10px] font-black uppercase tracking-[2px] text-black bg-gray-50 px-3 py-1 rounded-full">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {availableColors.map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedSize(null);
                      setError('');
                      
                      const variant = product.variants.find(v => v.color.name === color);
                      if (variant?.color.image) {
                        setMainImage(variant.color.image);
                      }
                    }}
                    className={`px-4 py-2 border rounded-sm text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                      selectedColor === color ? 'border-black bg-black text-white' : 'border-gray-200 bg-white hover:border-black text-gray-600'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selector de Talles */}
          {availableSizes.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-[2px] text-gray-500">Talle</span>
                <button className="text-[9px] font-black uppercase tracking-[2px] text-gray-400 underline hover:text-black cursor-pointer">Guía de talles</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setError('');
                    }}
                    className={`w-12 h-12 border flex items-center justify-center text-[11px] font-bold transition-all cursor-pointer rounded-sm ${
                      selectedSize === size ? 'bg-black text-white border-black ring-1 ring-black ring-offset-1' : 'bg-white border-gray-200 hover:border-black text-gray-800'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              
              {/* Error Message */}
              {error && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest mt-4 animate-pulse">
                  {error}
                </p>
              )}
            </div>
          )}

          {/* Add to Cart Button */}
          <button 
            onClick={handleAddToCart}
            className="w-full bg-black text-white py-5 text-xs font-black uppercase tracking-[4px] hover:bg-gray-900 transition-colors active:scale-[0.99] mb-8 cursor-pointer rounded-sm"
          >
            Agregar al Carrito
          </button>

          {/* Description y Detalles (Type-Safe) */}
          <div className="border-t border-gray-100 pt-8 mt-4 space-y-8">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[2px] text-black mb-4">Descripción</h3>
              <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                {product.description || 'Prenda premium diseñada para el uso urbano diario. Ofrece la combinación ideal entre confort duradero y cortes contemporáneos.'}
              </p>
            </div>
            
            {/* Solo renderiza si hay subcategoría, categoría o género */}
            {(product.brand || product.material || product.category || product.subcategory || product.gender) && (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[2px] text-black mb-4">Detalles</h3>
                <ul className="text-sm text-gray-500 space-y-2">
                  {product.brand && (
                    <li className="flex items-start">
                      <span className="font-bold text-gray-800 min-w-20">Marca:</span> 
                      <span>{product.brand}</span>
                    </li>
                  )}
                  {product.material && (
                    <li className="flex items-start">
                      <span className="font-bold text-gray-800 min-w-20">Material:</span> 
                      <span>{product.material}</span>
                    </li>
                  )}
                  {product.category && (
                    <li className="flex items-start">
                      <span className="font-bold text-gray-800 min-w-20">Categoría:</span> 
                      <span className="capitalize">{product.category}</span>
                    </li>
                  )}
                  {product.subcategory && (
                    <li className="flex items-start">
                      <span className="font-bold text-gray-800 min-w-20">Estilo:</span> 
                      <span className="capitalize">{product.subcategory}</span>
                    </li>
                  )}
                  {product.gender && (
                    <li className="flex items-start">
                      <span className="font-bold text-gray-800 min-w-20">Género:</span> 
                      <span className="capitalize">{product.gender}</span>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
      {/* NUEVO: CARRUSEL DE PRODUCTOS RELACIONADOS */}
      {/* Filtramos para no mostrar el producto que el usuario ya está viendo */}
      <ProductCarousel 
        title="Lo más buscado" 
        products={allProducts.filter(p => p.id !== product.id).slice(0, 8)} 
        onAdd={setSelectedQuickView}
      />
    </div>
  );
};

export default ProductDetail;