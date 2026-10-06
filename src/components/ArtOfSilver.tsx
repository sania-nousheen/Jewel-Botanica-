import React from 'react';
import { craftsmanshipImg, ART_OF_SILVER_POINTS } from '../data/jewelryData';
import { Award, Hammer, Heart } from 'lucide-react';
import { PageSectionItem } from '../lib/websiteSettingsService';

interface ArtOfSilverProps {
  customBannerImage?: string;
  sectionData?: PageSectionItem;
}

export const ArtOfSilver: React.FC<ArtOfSilverProps> = ({ customBannerImage, sectionData }) => {
  const icons = [Award, Hammer, Heart];
  const headingText = sectionData?.heading || 'The Art of Silver';
  const subheadingText = sectionData?.subheading || 'Why 92.5 Silver?';
  const matterText =
    sectionData?.matterText ||
    'Pure silver in its native state is extraordinarily soft and delicate. Sterling silver refers to the timeless golden alloy containing 92.5% pure elemental silver, with the remainder selected for tensile resilience—enabling intricate filigree, secure gemstone settings, and generational durability.';
  const displayImage = sectionData?.image || customBannerImage || craftsmanshipImg;

  return (
    <section
      id="art-of-silver"
      style={{
        backgroundColor: sectionData?.advanced?.backgroundColor || '#0C0C0C',
        paddingTop: sectionData?.advanced?.paddingTop ? `${sectionData.advanced.paddingTop}px` : undefined,
        paddingBottom: sectionData?.advanced?.paddingBottom ? `${sectionData.advanced.paddingBottom}px` : undefined,
        minHeight: sectionData?.advanced?.minHeightVh ? `${sectionData.advanced.minHeightVh}vh` : undefined,
      }}
      className="relative py-24 sm:py-32 px-6 sm:px-12 bg-[#0C0C0C] border-t border-b border-[#FFFFFF]/10 overflow-hidden"
    >
      {/* Background Soft Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(circle,rgba(14,90,79,0.07)_0%,transparent_70%)] pointer-events-none" />

      <div
        className={`mx-auto ${
          sectionData?.advanced?.contentWidth === 'Boxed' ? 'max-w-5xl' : 'max-w-7xl'
        }`}
      >
        {/* Section Top Header */}
        <div
          className="max-w-3xl mx-auto mb-16 sm:mb-20"
          style={{ textAlign: sectionData?.typography?.textAlign || 'center' }}
        >
          <h2
            style={{
              fontFamily: sectionData?.typography?.fontFamily || undefined,
              color: sectionData?.typography?.headingColor || '#F5F2EA',
              fontSize: sectionData?.typography?.headingSizePx
                ? `${sectionData.typography.headingSizePx}px`
                : undefined,
              fontWeight: sectionData?.typography?.fontWeight || undefined,
            }}
            className="font-serif text-2xl sm:text-3xl md:text-[2.2rem] font-light tracking-[0.06em] text-[#F5F2EA] uppercase mb-4"
          >
            {headingText}
          </h2>

          <p
            style={{
              color: sectionData?.typography?.subheadingColor || '#F5F2EA',
              fontSize: sectionData?.typography?.subheadingSizePx
                ? `${sectionData.typography.subheadingSizePx}px`
                : undefined,
            }}
            className="font-serif text-lg sm:text-xl text-[#F5F2EA] italic mb-3"
          >
            {subheadingText}
          </p>

          <p
            style={{
              color: sectionData?.typography?.bodyColor || '#B8B8B5',
              fontSize: sectionData?.typography?.bodySizePx ? `${sectionData.typography.bodySizePx}px` : undefined,
            }}
            className="font-sans text-xs sm:text-sm text-[#B8B8B5] leading-relaxed font-light max-w-xl mx-auto whitespace-pre-line"
          >
            {matterText}
          </p>
        </div>

        {/* Master Artisan Macro Feature Banner */}
        <div className="relative w-full rounded-sm overflow-hidden mb-16 border border-[#FFFFFF]/15 shadow-[0_20px_50px_rgba(0,0,0,0.9)] group bg-[#080808] flex items-center justify-center min-h-[220px] max-h-[580px]">
          <img
            src={displayImage}
            alt={headingText}
            referrerPolicy="no-referrer"
            style={{
              width: sectionData?.imageStyle?.widthPercent ? `${sectionData.imageStyle.widthPercent}%` : undefined,
              maxHeight: sectionData?.imageStyle?.heightPx ? `${sectionData.imageStyle.heightPx}px` : '580px',
              objectFit:
                sectionData?.imageStyle?.objectFit && sectionData.imageStyle.objectFit !== 'Default'
                  ? (sectionData.imageStyle.objectFit as any)
                  : 'contain',
              opacity: sectionData?.imageStyle?.opacity ? sectionData.imageStyle.opacity / 100 : 1,
              borderRadius: sectionData?.imageStyle?.borderRadiusPx ? `${sectionData.imageStyle.borderRadiusPx}px` : undefined,
            }}
            className="w-full h-auto max-h-[580px] object-contain transition-transform duration-1000 group-hover:scale-105"
          />
        </div>

        {/* 3 Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ART_OF_SILVER_POINTS.map((card, idx) => {
            const Icon = icons[idx];
            return (
              <div
                key={card.id}
                className="relative p-8 bg-[#111111] border border-[#FFFFFF]/10 hover:border-[#0E5A4F]/60 transition-all duration-500 rounded-sm flex flex-col justify-between group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-xs tracking-widest text-[#A2DEC8]">
                      {card.number}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-[#161616] border border-[#FFFFFF]/10 flex items-center justify-center group-hover:border-[#0E5A4F] transition-colors">
                      <Icon className="w-4 h-4 text-[#D8D8D5] group-hover:text-[#A2DEC8] transition-colors" />
                    </div>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl tracking-[0.08em] text-[#F5F2EA] uppercase mb-3">
                    {card.title}
                  </h3>

                  <p className="font-sans text-xs sm:text-sm text-[#B8B8B5]/80 leading-relaxed font-light">
                    {card.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#FFFFFF]/5 text-[10px] font-sans tracking-[0.2em] text-[#B8B8B5]/50 uppercase">
                  Excellence in Silver
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
