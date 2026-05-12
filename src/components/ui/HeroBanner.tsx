import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Banner } from '@/src/types/api';

interface HeroBannerProps {
  banners: Banner[];
  onCtaClick: (url:string) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ banners, onCtaClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const sliderRef = useRef<HTMLDivElement>(null);

  // --- 1. LÓGICA DE NAVEGACIÓN (Matemática Pura - cross-fade seamless) ---
  const goToSlide = useCallback((index: number) => {
    if (sliderRef.current) {
      // Forzamos el scroll a la posición exacta. Let CSS Snap handle the rest.
      sliderRef.current.scrollTo({ 
        left: index * sliderRef.current.clientWidth, 
        behavior: 'smooth' 
      });
      // Sincronizamos estado inmediatamente para evitar lags visuales en dots/textos
      setCurrentIndex(index);
    }
  }, []);

  const nextSlide = useCallback(() => {
    const nextIndex = (currentIndex + 1) % banners.length; // Modulo math for loop
    goToSlide(nextIndex);
  }, [currentIndex, banners.length, goToSlide]);

  const prevSlide = useCallback(() => {
    const prevIndex = (currentIndex - 1 + banners.length) % banners.length;
    goToSlide(prevIndex);
  }, [currentIndex, banners.length, goToSlide]);

  // --- 2. SINCRONIZACIÓN DE SCROLL NATIVO (Solo para el dedo en mobile) ---
  const handleScroll = () => {
    if (sliderRef.current) {
      const index = Math.round(sliderRef.current.scrollLeft / sliderRef.current.clientWidth);
      if (index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  };

  // --- 3. EVENTOS DE TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // --- !!! ELIMINADO: RIP setInterval logic !!! ---
  // Ya no dependemos de un timer JS desfasado.

  if (!banners || banners.length === 0) return null;
  const currentBanner = banners[currentIndex];

  return (
    <section 
      className="relative h-[85vh] w-full overflow-hidden bg-black group"
      // Estos eventos solo controlan el estado CSS de pausa, no la lógica JS
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        ref={sliderRef}
        onScroll={handleScroll}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        // md:overflow-x-hidden para el fix de la ruedita del mouse
        className="flex w-full h-full overflow-y-hidden overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {banners.map((banner, index) => (
          <div key={banner.id} className="w-full h-full shrink-0 snap-start relative">
            <img 
              src={banner.image} 
              alt={banner.title}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className={`w-full h-full object-cover opacity-60 ${
                index === currentIndex ? 'animate-ken-burns' : ''
              }`}
            />
          </div>
        ))}
      </div>

      <div key={currentIndex} className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 z-10 pointer-events-none">
        <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[6px] mb-4 animate-in fade-in slide-in-from-bottom duration-500">
          {currentBanner.subtitle}
        </p>
        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          {currentBanner.title}
        </h1>
        
        <button 
          onClick={() => onCtaClick(currentBanner.cta?.url || '/productos')}
          className="pointer-events-auto bg-white text-black px-12 py-5 text-[11px] font-black uppercase tracking-[4px] hover:bg-black hover:text-white transition-all transform active:scale-95 cursor-pointer"
        >
          {currentBanner.cta.text || 'Explorar'}
        </button>
      </div>
      
      {/* INDICADORES (DOTS CON LÓGICA DE TIEMPO UNIFICADA - SINGLE TRUTH) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
        {banners.map((_, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="group py-4 px-1 cursor-pointer" 
              aria-label={`Ir al banner ${index + 1}`}
            >
              <div className={`h-0.5 relative overflow-hidden transition-all duration-500 ${
                isActive ? 'w-12 bg-white/30' : 'w-4 bg-white/30 group-hover:bg-white/60'
              }`}>
                {isActive && (
                  <div 
                    key={`progress-${currentIndex}`} 
                    className="absolute top-0 left-0 w-full h-full bg-white origin-left"
                    style={{ 
                      // 1. Usamos la animación de scaleX optimizada por GPU
                      animation: 'fill-progress-transform 5s linear forwards',
                      // 2. Controlamos la pausa con CSS
                      animationPlayState: isPaused ? 'paused' : 'running'
                    }} 
                    // !!! 3. LA MAGIA SENIOR !!!
                    // React escucha cuando la animación CSS de la GPU termina naturalmente,
                    // y solo entonces dispara la lógica JS de cambiar el slide.
                    // ¡Garantiza sincronización matemática perfecta!
                    onAnimationEnd={() => {
                      if (!isPaused) nextSlide(); // Seguridad: solo si no está pausado
                    }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button 
        onClick={prevSlide}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      <button 
        onClick={nextSlide}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 items-center justify-center border border-white/20 rounded-full text-white hover:bg-white hover:text-black transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>
    </section>
  );
};

export default HeroBanner;