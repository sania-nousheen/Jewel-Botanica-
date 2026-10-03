import React from 'react';
import { Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import { heroHaaramImg, BRAND_INFO } from '../data/jewelryData';

interface StatementJewelleryProps {
  onViewSignature: () => void;
  customImage?: string;
}

export const StatementJewellery: React.FC<StatementJewelleryProps> = ({ onViewSignature, customImage }) => {
  return (
    <section
      className="relative min-h-[90vh] py-24 sm:py-32 px-6 sm:px-12 bg-[#050505] flex items-center justify-center overflow-hidden border-t border-b border-[#FFFFFF]/10"
      aria-label="The Art of the Statement"
    >
      {/* Deep Obsidian Background with Dramatic Directional Spotlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-2/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(14,90,79,0.18)_0%,transparent_65%)] blur-3xl" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[radial-gradient(ellipse,rgba(255,255,255,0.06)_0%,transparent_60%)] blur-2xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Editorial Text (Positioned slightly off-center left) */}
        <div className="lg:col-span-5 flex flex-col items-start order-2 lg:order-1">
          <div className="flex items-center gap-3 text-xs tracking-[0.35em] uppercase text-[#D8D8D5] mb-5">
            <span className="w-6 h-[1px] bg-[#0E5A4F]" />
            <span className="text-[#A2DEC8]">Bespoke Masterwork</span>
          </div>

          <div className="border-l border-[#0E5A4F] pl-5 my-4">
            <p className="font-serif text-lg sm:text-xl text-[#F5F2EA] italic leading-snug">
              &ldquo;Some pieces complete an outfit. <br />
              Some pieces become the moment.&rdquo;
            </p>
          </div>

          <p className="mt-4 font-sans text-sm text-[#B8B8B5] leading-relaxed max-w-md font-light mb-8">
            Engineered with articulated silver links, each stone is hand-chased to rest flush against the neckline. Designed for grand royal receptions, weddings, and heirloom occasions where presence is unspoken.
          </p>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <button
              onClick={onViewSignature}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#F5F2EA] hover:bg-white text-[#080808] text-xs font-sans font-medium tracking-[0.24em] uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.12)] group"
            >
              <span>View Signature Pieces</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Dramatic Large Jewellery Piece (Off-center right) */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end order-1 lg:order-2">
          <div className="relative w-full max-w-lg lg:max-w-xl rounded-sm overflow-hidden border border-[#FFFFFF]/20 shadow-[0_30px_70px_rgba(0,0,0,0.95)] group bg-[#080808] flex items-center justify-center min-h-[320px] max-h-[580px]">
            
            <img
              src={customImage || heroHaaramImg}
              alt="Grand Royal Statement Haaram in 92.5 Silver with Emerald Cut Stones"
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[580px] object-contain transition-transform duration-1000 ease-out group-hover:scale-105"
            />

            {/* Ambient Lighting Layers */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_60%,rgba(5,5,5,0.8)_100%)] pointer-events-none" />

            {/* Discreet atelier badge */}
            <div className="absolute bottom-4 left-4 z-10 px-4 py-2 bg-[#080808]/85 backdrop-blur-md border border-[#FFFFFF]/10 text-[10px] font-sans tracking-[0.25em] text-[#F5F2EA] uppercase flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0E5A4F]" />
              <span>Nizami Heritage • Pure 92.5 Silver</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
