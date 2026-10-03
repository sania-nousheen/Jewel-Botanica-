import React from 'react';
import { statementChokerImg } from '../data/jewelryData';
import { ShieldCheck, Sliders, MapPin, Globe2, ArrowRight } from 'lucide-react';

interface BrandIntroProps {
  onLearnMore?: () => void;
  customImage?: string;
}

export const BrandIntro: React.FC<BrandIntroProps> = ({ customImage }) => {
  const highlights = [
    {
      title: '92.5 SILVER',
      desc: 'Hallmarked pure sterling silver core with enduring platinum luster.',
      icon: ShieldCheck,
    },
    {
      title: 'CUSTOMIZATION',
      desc: 'Made to your vision for weddings, ceremonies, and celebratory moments.',
      icon: Sliders,
    },
    {
      title: 'HYDERABAD',
      desc: 'Rooted in the historic heritage of royal Deccan silversmithing.',
      icon: MapPin,
    },
    {
      title: 'WORLDWIDE SHIPPING',
      desc: 'Secure white-glove packaging reaching patrons across the globe.',
      icon: Globe2,
    },
  ];

  return (
    <section
      id="about"
      className="relative py-24 sm:py-32 px-6 sm:px-12 bg-[#0C0C0C] border-t border-b border-[#FFFFFF]/5 overflow-hidden"
    >
      {/* Subtle charcoal gradient aura */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(14,90,79,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Side: Large Jewellery Photograph on dark black backdrop */}
        <div className="lg:col-span-6 relative">
          <div className="relative rounded-sm overflow-hidden border border-[#FFFFFF]/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] group bg-[#080808] flex items-center justify-center min-h-[320px] max-h-[580px]">
            <img
              src={customImage || statementChokerImg}
              alt="Jewel Botanica Handcrafted Choker with Emerald Centerpiece"
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[580px] object-contain transition-transform duration-1000 group-hover:scale-105"
            />
          </div>

          {/* Luxury Frame Accent */}
          <div className="absolute -bottom-4 -right-4 w-32 h-32 border-b border-r border-[#0E5A4F]/40 pointer-events-none -z-0" />
        </div>

        {/* Right Side: Editorial Narrative */}
        <div className="lg:col-span-6 flex flex-col items-start justify-center">
          <div className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-[#D8D8D5] mb-6">
            <span className="w-5 h-[1px] bg-[#0E5A4F]" />
            <span className="text-[#A2DEC8]">The Atelier Philosophy</span>
          </div>

          <p className="font-sans text-sm sm:text-base text-[#B8B8B5] leading-relaxed mb-6 font-light">
            <span className="font-bodoni font-normal tracking-[0.2em] text-[#FFFFFF] uppercase mr-1.5 inline-block text-base sm:text-lg">JEWEL BOTANICA</span> brings together the brilliance of silver, intricate craftsmanship and timeless Indian elegance. From statement bridal creations to refined pieces for special occasions, every design is chosen to make an impression.
          </p>

          <p className="font-sans text-sm sm:text-base text-[#B8B8B5]/90 leading-relaxed mb-10 font-light">
            Rooted in Hyderabad, we believe fine silver is not merely an ornament—it is a regal expression of personal poise, carrying the majesty of heritage jewellery into the contemporary world.
          </p>

          {/* 4 Small Pillars Grid */}
          <div className="grid grid-cols-2 gap-6 w-full pt-6 border-t border-[#FFFFFF]/10">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col gap-1.5 group">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#0E5A4F] group-hover:text-[#A2DEC8] transition-colors" />
                    <span className="font-sans text-xs tracking-[0.2em] font-medium text-[#F5F2EA] uppercase">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[12px] text-[#B8B8B5]/70 leading-normal font-light">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <a
              href="#catalogue"
              className="inline-flex items-center gap-2 text-xs font-sans tracking-[0.22em] text-[#D8D8D5] hover:text-[#F5F2EA] group uppercase"
            >
              <span>Explore The Atelier Works</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0E5A4F] group-hover:translate-x-1.5 transition-transform" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
