import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import { HeroSlideItem, DEFAULT_HERO_SLIDES, PageSectionItem } from '../lib/websiteSettingsService';

interface HeroProps {
  onExploreClick: () => void;
  introActive?: boolean; // Wait until opening screen completely finishes & slides up
  customSlides?: HeroSlideItem[];
  sectionData?: PageSectionItem;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  introActive = false,
  customSlides,
  sectionData,
}) => {
  const slides = customSlides && customSlides.length > 0 ? customSlides : DEFAULT_HERO_SLIDES;

  // Always start at 0 (1st image)
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Preload images immediately
  useEffect(() => {
    slides.forEach((slide) => {
      if (slide.image) {
        const img = new Image();
        img.src = slide.image;
      }
    });
  }, [slides]);

  // Keep index within bounds if slides change
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  // Ensure index stays locked at 0 whenever intro screen is active
  useEffect(() => {
    if (introActive) {
      setCurrentIndex(0);
    }
  }, [introActive]);

  // Subtle interactive parallax floating for desktop
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 12;
      const y = (e.clientY / innerHeight - 0.5) * 12;
      setMouseOffset({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Automatic slideshow transition ONLY starts AFTER opening screen has completely finished
  useEffect(() => {
    if (introActive || isPaused || isDragging || slides.length <= 1) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [introActive, isPaused, isDragging, slides.length]);

  const slideNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const slidePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchStartX(e.touches[0].clientX);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.touches[0].clientX;
    setTouchDeltaX(currentX - touchStartX);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null) {
      const threshold = 40;
      if (touchDeltaX < -threshold) {
        slideNext();
      } else if (touchDeltaX > threshold) {
        slidePrev();
      }
    }
    setTouchStartX(null);
    setTouchDeltaX(0);
    setIsPaused(false);
  };

  // Mouse Drag / Slide Handlers for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsPaused(true);
    setDragStartX(e.clientX);
    setTouchDeltaX(0);
  };

  const handleMouseMoveDrag = (e: React.MouseEvent) => {
    if (!isDragging || dragStartX === null) return;
    setTouchDeltaX(e.clientX - dragStartX);
  };

  const handleMouseUpDrag = () => {
    if (isDragging && dragStartX !== null) {
      const threshold = 45;
      if (touchDeltaX < -threshold) {
        slideNext();
      } else if (touchDeltaX > threshold) {
        slidePrev();
      }
    }
    setIsDragging(false);
    setDragStartX(null);
    setTouchDeltaX(0);
    setIsPaused(false);
  };

  return (
    <section
      id="hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        setIsDragging(false);
        setTouchDeltaX(0);
      }}
      style={{
        backgroundColor: sectionData?.advanced?.backgroundColor || '#000000',
        minHeight: sectionData?.advanced?.minHeightVh ? `${sectionData.advanced.minHeightVh}vh` : undefined,
        paddingTop: sectionData?.advanced?.paddingTop ? `${sectionData.advanced.paddingTop}px` : undefined,
        paddingBottom: sectionData?.advanced?.paddingBottom ? `${sectionData.advanced.paddingBottom}px` : undefined,
      }}
      className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-between pt-20 pb-8 px-4 sm:px-8 bg-black overflow-hidden select-none"
    >
      {/* Centerpiece: Pure shining jewellery slideshow in middle */}
      <div
        className="relative z-10 w-full flex-grow flex items-center justify-center my-auto py-4 cursor-grab active:cursor-grabbing"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveDrag}
        onMouseUp={handleMouseUpDrag}
      >
        <div
          className="relative w-full max-w-[440px] sm:max-w-[580px] md:max-w-[700px] lg:max-w-[800px] aspect-[4/3] sm:aspect-[16/11] flex items-center justify-center mx-auto transition-transform duration-700 ease-out"
          style={{
            transform: `translate3d(${mouseOffset.x + touchDeltaX * 0.25}px, ${mouseOffset.y}px, 0)`,
          }}
        >
          {/* Seamless Floating Jewellery Container with Pure Black Backdrop */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={slide.id || idx}
                  className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out ${
                    isActive
                      ? 'opacity-100 z-10 pointer-events-auto'
                      : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {slide.videoUrl ? (
                    <video
                      src={slide.videoUrl}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-contain object-center rounded-sm pointer-events-none"
                    />
                  ) : (
                    <img
                      src={slide.image}
                      alt={slide.alt || 'Jewel Botanica Piece'}
                      draggable={false}
                      loading={idx === 0 ? 'eager' : 'lazy'}
                      fetchPriority={idx === 0 ? 'high' : 'auto'}
                      decoding={idx === 0 ? 'sync' : 'async'}
                      referrerPolicy="no-referrer"
                      style={{
                        width: sectionData?.imageStyle?.widthPercent ? `${sectionData.imageStyle.widthPercent}%` : undefined,
                        maxHeight: sectionData?.imageStyle?.heightPx ? `${sectionData.imageStyle.heightPx}px` : undefined,
                        opacity: sectionData?.imageStyle?.opacity ? sectionData.imageStyle.opacity / 100 : undefined,
                        borderRadius: sectionData?.imageStyle?.borderRadiusPx ? `${sectionData.imageStyle.borderRadiusPx}px` : undefined,
                      }}
                      className="w-full h-full object-contain object-center transform transition-transform duration-700 scale-[1.02] filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)] pointer-events-none"
                    />
                  )}

                  {/* Shimmering Liquid Silver Light Sweep Across The Gems */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen">
                    <div className="w-[140%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-25 animate-silver-sweep" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Minimal Dots, Optional Custom Hero Heading/Matter, and Scroll Indicator */}
      <div
        className="relative z-20 w-full flex flex-col items-center justify-center space-y-3 pb-2"
        style={{ textAlign: sectionData?.typography?.textAlign || 'center' }}
      >
        {/* Slide Indicator Dots */}
        {slides.length > 1 && (
          <div className="flex items-center space-x-2">
            {slides.map((slide, idx) => (
              <button
                key={slide.id || idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`transition-all duration-500 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 h-1 bg-[#A2DEC8]'
                    : 'w-1.5 h-1.5 bg-stone-700 hover:bg-stone-500'
                }`}
              />
            ))}
          </div>
        )}

        {/* Bottom Scroll Indicator */}
        <button
          onClick={onExploreClick}
          className="flex flex-col items-center gap-1 text-[#D8D8D5]/60 hover:text-[#F5F2EA] transition-colors group focus:outline-none cursor-pointer pt-1"
          aria-label="Discover the Collection"
        >
          <span
            style={{
              color: sectionData?.typography?.subheadingColor || undefined,
              fontSize: sectionData?.typography?.subheadingSizePx
                ? `${sectionData.typography.subheadingSizePx}px`
                : undefined,
            }}
            className="text-[9px] font-sans tracking-[0.4em] uppercase"
          >
            {sectionData?.buttons?.[0]?.text || 'Discover The Collection'}
          </span>
          <ArrowDown className="w-3.5 h-3.5 text-[#0E5A4F] group-hover:text-[#A2DEC8] group-hover:translate-y-1 transition-all" />
        </button>
      </div>
    </section>
  );
};
