import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBanners } from '@/hooks/useBanners';

// Fallback slides when no banners in DB
const fallbackSlides = [
  {
    id: '1',
    title: "OS MELHORES LOOKS COM OS MENORES PREÇOS",
    subtitle: null,
    button_text: "CONFIRA",
    button_link: "/categoria/ofertas",
    image_url: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&h=450&fit=crop",
  },
  {
    id: '2',
    title: "NOVA COLEÇÃO VERÃO 2024",
    subtitle: "Tendências que você vai amar",
    button_text: "COMPRAR",
    button_link: "/categoria/feminino",
    image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&h=450&fit=crop",
  },
  {
    id: '3',
    title: "MODA FITNESS COM ATÉ 40% OFF",
    subtitle: null,
    button_text: "APROVEITAR",
    button_link: "/categoria/masculino",
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&h=450&fit=crop",
  }
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: banners, isLoading } = useBanners();

  const slides = banners && banners.length > 0 ? banners : fallbackSlides;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  if (isLoading) {
    return (
      <section className="relative bg-navy h-[200px] md:h-[350px] lg:h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section className="relative bg-navy overflow-hidden">
      <div className="relative h-[200px] md:h-[350px] lg:h-[400px]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image_url || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&h=450&fit=crop'})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/70 to-transparent" />
            </div>
            <div className="container relative h-full flex items-center">
              <div className="max-w-lg text-white">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="text-lg md:text-xl text-white/80 mb-6">{slide.subtitle}</p>
                )}
                {slide.button_text && (
                  <Link 
                    to={slide.button_link || '/'}
                    className="btn-primary text-sm tracking-wide inline-block"
                  >
                    {slide.button_text}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <button
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors text-white"
        aria-label="Anterior"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors text-white"
        aria-label="Próximo"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              index === currentSlide ? 'bg-primary' : 'bg-white/40'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
