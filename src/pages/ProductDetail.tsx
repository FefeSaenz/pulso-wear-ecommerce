import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Contexts y Utils de PULSO
import { useApp } from '@/src/context/AppContext';
import { useCart } from '@/src/context/CartContext';
import { Product } from '@/src/types/product.types';

// UI Components
import Price from '@/src/components/ui/Price';
import ProductCarousel from '@/src/components/ui/ProductCarousel';
import Breadcrumbs from '@/src/components/ui/Breadcrumbs';

interface ProductDetailContext {
  setSelectedQuickView: (product: Product) => void;
}

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { setSelectedQuickView } = useOutletContext<ProductDetailContext>();
  
  const { allProducts, loading } = useApp();
  const { addToCart, setIsCartOpen } = useCart();

  // 1. BÚSQUEDA DIRECTA
  const product = useMemo(() => {
    // Buscamos el producto directamente en la lista limpia y unificada
    return allProducts.find(p => p.slug === slug || p.id === slug);
  }, [allProducts, slug]);

  // 2. ESTADOS LOCALES
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [error, setError] = useState<string>('');

  // NUEVO: Estado y Ref para controlar el Slider Mobile
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

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
      setCurrentSlide(0); // Reiniciamos el slider al cambiar de producto
    }
  }, [product]);

  // Lógica de flechas para el Slider Mobile
  const handlePrevSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -sliderRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const handleNextSlide = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: sliderRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  // 4. LÓGICA DE VARIANTES
  const availableColors = useMemo(() => {
    if (!product?.variants) return [];
    return Array.from(new Set(product.variants.map(v => v.color.name)));
  }, [product]);

  const availableSizes = useMemo(() => {
    if (!product?.variants || !selectedColor) return [];
    const variant = product.variants.find(v => v.color.name === selectedColor);
    // Devolvemos los objetos enteros para saber si hay stock
    return variant ? variant.sizes : []; 
  }, [product, selectedColor]);

  // 5. MANEJADOR DEL CARRITO (Respetando tu interfaz CartItem)
  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setError('Por favor, selecciona Talle y Color antes de agregar.');
      return;
    }
    
    if (product) {
      const cartItem = {
        id: product.id,
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
        quantity: 1,
        selectedSize: selectedSize,
        selectedColor: selectedColor,
        selectedImage: mainImage || (product.images.length > 0 ? product.images[0] : '')
      };

      addToCart(cartItem); 
      setIsCartOpen(true);
      setError('');
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
    // Envolvemos todo en un Fragment para poder poner el Carousel AFUERA del contenedor
    <div className='flex flex-col gap-16 pb-16 animate-in fade-in duration-500'>

      {/* --- 2. ACÁ INYECTAMOS EL SEO DINÁMICO --- */}
      <Helmet>
        {/* Título en la pestaña del navegador */}
        <title>{`PULSO | ${product.name}`}</title>
        <meta name="description" content={product.description || `Comprá ${product.name} online en Pulso Wear.`} />
        
        {/* Open Graph (WhatsApp, Facebook, Instagram, LinkedIn) */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={`PULSO | ${product.name}`} />
        <meta property="og:description" content={product.description || `Descubrí nuestra nueva colección. ${product.name} disponible ahora.`} />
        <meta property="og:image" content={mainImage || (product.images && product.images[0]) || ''} />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter Cards (También lo usan Discord y Telegram) */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`PULSO | ${product.name}`} />
        <meta name="twitter:image" content={mainImage || (product.images && product.images[0]) || ''} />
      </Helmet>
      
      {/* AJUSTE ESPACIADO BREADCRUMBS: Redujimos pt-10 a pt-6 para achicar el margen superior general */}
      <div className="max-w-360 mx-auto px-6 pt-6 w-full">
        
        {/* BREADCRUMBS */}
        {/* AJUSTE ESPACIADO BREADCRUMBS: Sacamos el md:mb-10 y lo dejamos en mb-6 para achicar el margen inferior */}
        <Breadcrumbs 
          className='mb-6'
          items={[
            { label: product.category, href: `/category/${product.category.toLowerCase().replace(/\s+/g, '-')}` },
            { label: product.name }
          ]} 
        />

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-20">
          
          {/* 1. VISTA MOBILE / TABLET (Slider con Dots y Flechas) */}
          <div className="lg:hidden w-full md:max-w-[500px] md:mx-auto flex flex-col relative">
            
            {/* Etiqueta de Oferta Superpuesta */}
            {(product.discount_percentage || (product.original_price && product.original_price > product.price)) ? (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[3px] z-20 rounded-sm pointer-events-none shadow-md">
                {product.discount_percentage ? `-${product.discount_percentage}%` : 'Oferta'}
              </div>
            ) : null}

            {/* Contenedor del Carrusel Native Scroll Snap */}
            <div 
              ref={sliderRef}
              className="flex w-full overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-sm bg-gray-50"
              onScroll={(e) => {
                const scrollLeft = e.currentTarget.scrollLeft;
                const width = e.currentTarget.clientWidth;
                // Calculamos en qué foto estamos parados
                setCurrentSlide(Math.round(scrollLeft / width));
              }}
            >
              {product.images && product.images.length > 0 ? (
                product.images.map((img: string, idx: number) => (
                  <div key={idx} className="w-full shrink-0 snap-center relative aspect-4/5">
                    <img 
                      src={img} 
                      alt={`${product.name} ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="w-full shrink-0 snap-center aspect-4/5 flex items-center justify-center text-gray-300 text-xs font-bold uppercase tracking-widest">
                  Sin Imagen
                </div>
              )}
            </div>

            {/* CONTROLES: Flechas y Puntos (Siempre visibles) */}
            <div className="flex items-center justify-between w-full mt-4">
              
              {/* Flecha Izquierda */}
              <button 
                onClick={handlePrevSlide}
                disabled={currentSlide === 0}
                className="text-black hover:opacity-70 transition-opacity py-2 pr-4 cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                <i className="fa-solid fa-arrow-left text-lg"></i>
              </button>

              {/* Puntos Indicadores (Dots) circulares */}
              <div className="flex justify-center items-center gap-2.5">
                {/* Forzamos a que renderice 1 dot aunque no haya imágenes, o mapee las reales */}
                {(product.images && product.images.length > 0 ? product.images : ['placeholder']).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`rounded-full transition-all duration-300 ${
                      currentSlide === idx 
                        ? 'w-2 h-2 bg-black scale-110' 
                        : 'w-2 h-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* Flecha Derecha */}
              <button 
                onClick={handleNextSlide}
                disabled={!product.images || currentSlide === product.images.length - 1 || product.images.length === 0}
                className="text-black hover:opacity-70 transition-opacity py-2 pl-4 cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                <i className="fa-solid fa-arrow-right text-lg"></i>
              </button>

            </div>
          </div>

          {/* ========================================== */}
          {/* 2. VISTA DESKTOP (Miniaturas + Foto Gigante) */}
          {/* ========================================== */}
          {/* AJUSTE NOTEBOOK: Limitamos el ancho max a 480px en lg para que la foto no explote en pantallas 720p, 
              pero vuelve a estar libre (xl:max-w-none) para tu monitor 4K. */}
          <div className="hidden lg:flex w-full lg:w-1/2 lg:max-w-[480px] xl:max-w-none flex-row gap-6">
            
            {/* Miniaturas (Verticales) */}
            {product.images && product.images.length > 0 && (
              <div className="flex flex-col gap-3 overflow-y-auto no-scrollbar w-24 shrink-0 pb-2 pr-1">
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setMainImage(img)}
                    className={`w-full aspect-4/5 shrink-0 transition-all cursor-pointer rounded-sm flex group overflow-hidden ${
                      mainImage === img 
                        ? 'z-10 p-0 border-0 outline-none appearance-none ring-1 ring-black/10' 
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
            <div className="flex-1 aspect-4/5 bg-gray-50 rounded-sm overflow-hidden relative group flex">
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

          {/* ========================================== */}
          {/* INFO Y COMPRA (Columna Derecha / Abajo)    */}
          {/* ========================================== */}
          <div className="w-full lg:w-1/2 flex flex-col">
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
                  {availableSizes.map(sizeObj => (
                    <button
                      key={sizeObj.size}
                      disabled={!sizeObj.available}
                      onClick={() => {
                        setSelectedSize(sizeObj.size.toString());
                        setError('');
                      }}
                      className={`w-12 h-12 border flex items-center justify-center text-[11px] font-bold transition-all  ${
                        !sizeObj.available 
                          ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed opacity-60 line-through' 
                          : selectedSize === sizeObj.size.toString() 
                            ? 'bg-black text-white border-black cursor-pointer' 
                            : 'bg-white border-gray-200 hover:border-black text-gray-800 cursor-pointer'
                      }`}
                    >
                      {sizeObj.size}
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
                <h3 className="text-[12px] font-black uppercase tracking-[2px] text-black mb-4">Descripción</h3>
                <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                  {product.description || 'Prenda premium diseñada para el uso urbano diario. Ofrece la combinación ideal entre confort duradero y cortes contemporáneos.'}
                </p>
              </div>
              
              {(product.brand || product.material || product.category || product.subcategory || product.gender) && (
                <div>
                  <h3 className="text-[12px] font-black uppercase tracking-[2px] text-black mb-4">Detalles</h3>
                  
                  <ul className="space-y-3">
                    {product.brand && (
                      <li className="flex items-center">
                        <span className="text-[11px] font-black uppercase tracking-[2px] text-black min-w-28">Marca:</span> 
                        <span className="text-[11px] font-black uppercase tracking-[2px] text-black">{product.brand}</span>
                      </li>
                    )}
                    {product.material && (
                      <li className="flex items-center">
                        <span className="text-[11px] font-black uppercase tracking-[2px] text-black min-w-28">Material:</span> 
                        <span className="text-[11px] font-black uppercase tracking-[2px] text-black">{product.material}</span>
                      </li>
                    )}
                    {product.category && (
                      <li className="flex items-center">
                        <span className="text-[11px] font-black uppercase tracking-[2px] text-black min-w-28">Categoría:</span> 
                        <span className="text-[11px] font-black uppercase tracking-[2px] text-black">{product.category}</span>
                      </li>
                    )}
                    {product.subcategory && (
                      <li className="flex items-center">
                        <span className="text-[11px] font-black uppercase tracking-[2px] text-black min-w-28">Estilo:</span> 
                        <span className="text-[11px] font-black uppercase tracking-[2px] text-black">{product.subcategory}</span>
                      </li>
                    )}
                    {product.gender && (
                      <li className="flex items-center">
                        <span className="text-[11px] font-black uppercase tracking-[2px] text-black min-w-28">Género:</span> 
                        <span className="text-[11px] font-black uppercase tracking-[2px] text-black">{product.gender}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* AHORA EL CARRUSEL ESTÁ LIBRE. No está afectado por el max-w-360 ni los px-6 del div de arriba */}
      <ProductCarousel 
        title="Trends"
        variant='slim'
        products={allProducts.filter(p => p.id !== product.id).slice(0, 8)} 
        onAdd={setSelectedQuickView}
      />
    </div>
  );
};

export default ProductDetail;