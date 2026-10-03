import React, { useState, useEffect } from 'react';
import { Instagram } from 'lucide-react';
import { BRAND_INFO, brandLogoImg } from '../data/jewelryData';
import { subscribeFollowerCount, formatFollowerCount } from '../lib/communityService';

interface InstagramGridProps {
  customLogoImage?: string;
}

export const InstagramGrid: React.FC<InstagramGridProps> = ({ customLogoImage }) => {
  const [followerCount, setFollowerCount] = useState<number>(104280);

  // Subscribe to live follower count updates from Firestore with instant cache fallback
  useEffect(() => {
    const unsubscribe = subscribeFollowerCount((count) => {
      setFollowerCount(count);
    });
    return () => unsubscribe();
  }, []);

  return (
    <section className="relative py-24 sm:py-32 px-6 sm:px-12 bg-[#080808] overflow-hidden border-t border-[#FFFFFF]/10">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        
        {/* Top small label: SOCIAL PRESENCE */}
        <div className="inline-flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-[#D8D8D5] mb-4">
          <span className="w-5 h-[1px] bg-[#0E5A4F]" />
          <span className="text-[#A2DEC8]">Social Presence</span>
          <span className="w-5 h-[1px] bg-[#0E5A4F]" />
        </div>

        {/* Big Heading: FOLLOW THE BOTANICAL WORLD */}
        <h2 className="font-serif text-2xl sm:text-3xl md:text-[2.2rem] font-light tracking-[0.06em] text-[#F5F2EA] uppercase mb-4">
          Follow The Botanical World
        </h2>

        {/* Description */}
        <p className="font-sans text-xs sm:text-sm text-[#B8B8B5] font-light max-w-lg mx-auto leading-relaxed mb-10">
          Discover new designs, jewellery styling and latest pieces on Instagram. Join our patrons celebrating fine silver.
        </p>

        {/* Circular Logo Image with metallic ring & green status dot */}
        <div className="relative group mb-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-[#FFFFFF]/25 group-hover:border-[#0E5A4F] transition-all duration-500 shadow-[0_0_35px_rgba(255,255,255,0.08)] group-hover:shadow-[0_0_40px_rgba(14,90,79,0.3)] p-0.5 bg-[#141414] flex items-center justify-center">
            <img
              src={customLogoImage || brandLogoImg}
              alt="Jewel Botanica Official"
              className="w-full h-full object-cover rounded-full transform group-hover:scale-105 transition-transform duration-500"
            />
          </div>
          {/* Green dot on lower right */}
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#127567] border-2 border-[#080808] rounded-full shadow-[0_0_10px_#127567]" />
        </div>

        {/* Followers Box card: Live count formatted with commas (104,000+) */}
        <div className="mb-6 w-auto min-w-[220px] max-w-[280px] px-6 py-3.5 bg-[#121212]/95 border border-[#FFFFFF]/12 rounded-sm backdrop-blur-sm flex flex-col items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1FD286] animate-pulse" />
            <span className="font-serif text-2xl text-[#F5F2EA] font-normal tracking-wide">
              {formatFollowerCount(followerCount)}
            </span>
          </div>
          <span className="text-[8px] sm:text-[9px] font-mono tracking-[0.25em] text-[#B8B8B5]/60 uppercase mt-1">
            Live Global Community
          </span>
        </div>

        {/* Follow On Instagram Button */}
        <a
          href={BRAND_INFO.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 bg-[#141414] hover:bg-[#1A1A1A] border border-[#FFFFFF]/25 hover:border-[#0E5A4F] text-xs font-sans tracking-[0.22em] text-[#F5F2EA] uppercase transition-all duration-300 rounded-none shadow-[0_4px_20px_rgba(0,0,0,0.8)] hover:shadow-[0_4px_25px_rgba(14,90,79,0.3)] group"
        >
          <Instagram className="w-4 h-4 text-[#E1306C] group-hover:scale-110 transition-transform" />
          <span>Follow On Instagram</span>
        </a>
      </div>
    </section>
  );
};
