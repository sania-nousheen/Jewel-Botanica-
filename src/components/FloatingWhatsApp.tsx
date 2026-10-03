import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { BRAND_INFO } from '../data/jewelryData';

export const FloatingWhatsApp: React.FC = () => {
  const [hovered, setHovered] = useState(false);

  return (
    <aside
      aria-label="Contact Concierge"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-3 select-none"
    >
      {/* Tooltip on Hover */}
      <div
        className={`px-3.5 py-1.5 bg-[#0D0D0D]/95 text-[#F5F2EA] text-[11px] font-sans tracking-wider uppercase border border-[#FFFFFF]/15 rounded shadow-xl backdrop-blur-md transition-all duration-300 pointer-events-none hidden sm:block ${
          hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <span>Chat with</span>
          <span className="font-bodoni text-xs text-[#FFFFFF] tracking-[0.16em] uppercase font-normal">JEWEL BOTANICA</span>
        </span>
      </div>

      {/* Floating Button */}
      <a
        href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
          'Hello Jewel Botanica, I am reaching out from your website to enquire about your jewellery.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#0C0C0C] border border-[#FFFFFF]/25 hover:border-[#0E5A4F] flex items-center justify-center transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.8)] hover:scale-105 group animate-pulse-subtle"
        aria-label="Chat with Jewel Botanica on WhatsApp"
      >
        {/* Subtle Emerald Glow Ring */}
        <div className="absolute inset-0 rounded-full bg-[#0E5A4F]/20 filter blur-sm group-hover:bg-[#0E5A4F]/40 transition-colors pointer-events-none" />

        {/* WhatsApp Icon */}
        <MessageCircle className="relative z-10 w-5 h-5 text-[#A2DEC8] group-hover:text-white transition-colors" />

        {/* Active Availability Dot */}
        <span className="absolute top-0 right-0 w-3 h-3 bg-[#127567] border-2 border-[#0C0C0C] rounded-full shadow-[0_0_8px_#127567]" />
      </a>
    </aside>
  );
};
