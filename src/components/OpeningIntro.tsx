import React, { useState, useEffect } from 'react';

interface OpeningIntroProps {
  onComplete: () => void;
}

export const OpeningIntro: React.FC<OpeningIntroProps> = ({ onComplete }) => {
  // Extended 5.5 to 6.0 second sequence:
  // Phase 0: 0.0 - 1.2s: Deep quiet cinematic black (#050505)
  // Phase 1: 1.2 - 2.6s: Soft silver light slowly sweeps across the dark field
  // Phase 2: 2.2 - 4.2s: JEWEL BOTANICA emerges with high-contrast Didot/Bodoni letterforms, traveling sheen, and letter spacing expansion
  // Phase 3: 3.8 - 5.0s: Full luminous brilliance and subtle "SILVER JEWELLERY" subtitle
  // Phase 4: 5.0 - 6.0s: Entire luxury screen gracefully slides UPWARDS (-translate-y-full) like a velvet curtain, revealing the hero section
  const [phase, setPhase] = useState<number>(0);
  const [slidingUp, setSlidingUp] = useState<boolean>(false);

  useEffect(() => {
    // 1.2s: Soft silver light begins its graceful, slow travel
    const t1 = setTimeout(() => setPhase(1), 1200);

    // 2.2s: JEWEL BOTANICA emerges from the traveling light
    const t2 = setTimeout(() => setPhase(2), 2200);

    // 3.8s: Full luminous clarity & "SILVER JEWELLERY" whisper
    const t3 = setTimeout(() => setPhase(3), 3800);

    // 5.0s: Curtain slide-up initiates (takes 2.2s with luxury cubic bezier)
    const t4 = setTimeout(() => {
      setSlidingUp(true);
      // Wait for 2.2-second upward slide animation to complete before unmounting
      setTimeout(onComplete, 2250);
    }, 5000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setSlidingUp(true);
    setTimeout(onComplete, 400);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#050505] select-none overflow-hidden cursor-pointer transform will-change-transform ${
        slidingUp
          ? '-translate-y-full pointer-events-none transition-transform duration-[2200ms] ease-[cubic-bezier(0.65,0,0.35,1)] shadow-[0_30px_90px_rgba(0,0,0,0.95)]'
          : 'translate-y-0'
      }`}
      aria-label="Jewel Botanica Atelier Reveal"
      role="banner"
    >
      {/* 
        Ultra-subtle ambient background
        Deep, quiet, cinematic darkness reminiscent of a private luxury vault
      */}
      <div className="absolute inset-0 bg-[#050505] pointer-events-none" />

      {/* 
        Subtle Traveling Light Reflection / Soft Focused Beam:
        A soft, diffused, narrow silver/white light passing slowly across the darkness.
        Slowed down to match the extended 5-6 second pacing.
      */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-1500 ease-out ${
          phase >= 1 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Soft horizontal diffused silver light sweep */}
        <div
          className={`absolute h-[110px] sm:h-[150px] md:h-[190px] w-[300px] sm:w-[480px] md:w-[650px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.19)_0%,rgba(230,228,222,0.13)_35%,rgba(255,255,255,0.03)_65%,transparent_80%)] blur-2xl transform transition-transform duration-[3200ms] ease-out pointer-events-none ${
            phase === 1
              ? '-translate-x-44 sm:-translate-x-72 scale-90 opacity-60'
              : phase >= 2
              ? 'translate-x-16 sm:translate-x-28 scale-105 opacity-85'
              : '-translate-x-60 opacity-0'
          }`}
        />

        {/* Extremely fine specular silver hairline glimmer */}
        <div
          className={`absolute w-full max-w-[360px] sm:max-w-[540px] md:max-w-[720px] h-[1px] bg-gradient-to-r from-transparent via-[#E6E4DE]/35 to-transparent blur-[0.5px] transition-all duration-1400 ${
            phase >= 2 ? 'opacity-75 scale-x-100' : 'opacity-0 scale-x-40'
          }`}
        />
      </div>

      {/* 
        BRAND NAME CONTAINER:
        Typographic Reveal using Didot / Bodoni style luxury serif.
        - High contrast between thick and thin strokes
        - Extremely elegant hairlines & tall refined letterforms
        - Generous luxury letter spacing
        - Soft metallic silver / ivory white: #E6E4DE
        - Light traveling across the letters with deliberate, slow luxury pacing
      */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto">
        <div className="overflow-visible relative py-6 flex items-center justify-center">
          
          <h1
            className={`font-serif uppercase font-light text-[#E6E4DE] text-2xl sm:text-4xl md:text-5xl lg:text-[3.5rem] leading-none transition-all duration-[2000ms] ease-out select-none ${
              phase >= 2
                ? 'opacity-100 translate-y-0 tracking-[0.28em] sm:tracking-[0.38em] md:tracking-[0.44em] filter-none'
                : 'opacity-0 translate-y-4 tracking-[0.14em] sm:tracking-[0.20em] blur-[3px]'
            }`}
            style={{
              fontFamily: "'Bodoni Moda', Didot, 'Bodoni MT', 'Playfair Display', Georgia, serif",
              fontOpticalSizing: 'auto',
              fontStyle: 'normal',
              textShadow:
                phase >= 2
                  ? '0 0 35px rgba(230, 228, 222, 0.32), 0 0 65px rgba(255, 255, 255, 0.1)'
                  : 'none',
            }}
          >
            JEWEL BOTANICA
          </h1>

          {/* 
            Subtle Traveling Sheen across the Typography:
            Acts as the light discovering each letter as it passes through the center.
          */}
          <div
            className={`absolute inset-0 pointer-events-none mix-blend-screen transition-opacity duration-1400 ${
              phase >= 2 && !slidingUp ? 'opacity-90' : 'opacity-0'
            }`}
          >
            <div
              className={`w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-20 transition-transform duration-[2600ms] ease-out ${
                phase >= 2 ? 'translate-x-full' : '-translate-x-full'
              }`}
            />
          </div>
        </div>

        {/* 
          Delicate Atelier Subtitle / Purity Marker:
          Whispered underneath in refined letter-spaced ivory
        */}
        <div
          className={`transition-all duration-1200 mt-2 ${
            phase >= 3
              ? 'opacity-60 translate-y-0'
              : 'opacity-0 translate-y-2'
          }`}
        >
          <span className="text-[9px] sm:text-[10px] md:text-[11px] font-sans tracking-[0.45em] sm:tracking-[0.55em] text-[#E6E4DE] uppercase font-light">
            Silver Jewellery
          </span>
        </div>
      </div>

      {/* Subtle Skip Hint in bottom corner for instantaneous accessibility */}
      <div
        className={`absolute bottom-6 sm:bottom-8 right-6 sm:right-10 transition-opacity duration-700 pointer-events-none text-[9px] font-sans tracking-[0.3em] uppercase text-[#E6E4DE]/30 ${
          phase >= 2 && !slidingUp ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span>Click to skip</span>
      </div>

      {/* Bottom subtle border line separating curtain as it glides upwards */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />
    </div>
  );
};
