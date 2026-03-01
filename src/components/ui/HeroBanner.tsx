import React, { useState, useEffect, useCallback } from 'react';
import { Banner } from '@/src/types/api';

interface HeroBannerProps {
  banners: Banner[];
  onCtaClick: (url:string) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ banners, onCtaClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Funciones de navegación memorizadas para evitar re-renders
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  // 1. TECLADO (Flechas Izquierda/Derecha)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // 2. AUTO-PLAY (Se pausa si el usuario interactúa
  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, banners.length]);

  // 3. GESTOS TÁCTILES (Swipe)
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();

    setTouchStart(null);
    setTouchEnd(null);
  };
  
  if (!banners || banners.length === 0) return null;
  const currentBanner = banners[currentIndex];

  return (
    <section 
      className="relative h-[85vh] w-full overflow-hidden bg-black group touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/*IMAGENES CON FADE*/}
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src={banner.image} 
            alt={banner.title}
            className={`w-full h-full object-cover transition-transform duration-[5s] ${
              index === currentIndex ? 'scale-110 opacity-60' : 'scale-100'
            }`}
            
          />
        </div>
      ))}

      {/* CONTENIDO CENTRAL, con Key dinámico para reiniciar animación al cambiar */}
      <div key={currentIndex} className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 z-10 pointer-events-none">
        <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[6px] mb-4 animate-in fade-in slide-in-from-bottom duration-500">
          {currentBanner.subtitle}
        </p>
        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentBanner.title}
        </h1>
        <button 
          onClick={() => onCtaClick(currentBanner.cta.url)}
          className="pointer-events-auto bg-white text-black px-12 py-5 text-[11px] font-black uppercase tracking-[4px] hover:bg-black hover:text-white transition-all transform active:scale-95"
        >
          {/*Explorar Tienda*/}
          {currentBanner.cta.text || 'Explorar'}
        </button>
      </div>

      {/* INDICADORES (DOTS INTERACTIVOS) - Centrados abajo */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className="group py-4 px-1" // Área de click más grande para mobile
            aria-label={`Ir al banner ${index + 1}`}
          >
            <div className={`h-[2px] transition-all duration-500 ${
              index === currentIndex ? 'w-12 bg-white' : 'w-4 bg-white/30 group-hover:bg-white/60'
            }`} />
          </button>
        ))}
      </div>

      {/* FLECHAS LATERALES (Solo visibles en Desktop hover) */}
      <button 
        onClick={prevSlide}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100"
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button 
        onClick={nextSlide}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100"
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </section>
  );
};

export default HeroBanner;