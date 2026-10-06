import React from 'react';
import { ShieldCheck, Gem, Sliders, Globe } from 'lucide-react';
import { WHY_US_PILLARS } from '../data/jewelryData';
import { PageSectionItem } from '../lib/websiteSettingsService';

interface WhyJewelBotanicaProps {
  sectionData?: PageSectionItem;
}

export const WhyJewelBotanica: React.FC<WhyJewelBotanicaProps> = ({ sectionData }) => {
  // 01: 92.5 SILVER (ShieldCheck), 02: CURATED DESIGNS (Gem), 03: CUSTOMIZATION (Sliders), 04: WORLDWIDE SHIPPING (Globe)
  const iconList = [ShieldCheck, Gem, Sliders, Globe];
  const badgeText = sectionData?.badgeText || 'The Atelier Standards';
  const headingText = sectionData?.heading || 'WHY JEWEL BOTANICA';
  const matterText =
    sectionData?.matterText ||
    'Founded on the belief that silver is the new gold, every design bridges royal Nizami craftsmanship with refined contemporary presence.';

  return (
    <section
      style={{
        backgroundColor: sectionData?.advanced?.backgroundColor || '#060606',
        paddingTop: sectionData?.advanced?.paddingTop ? `${sectionData.advanced.paddingTop}px` : undefined,
        paddingBottom: sectionData?.advanced?.paddingBottom ? `${sectionData.advanced.paddingBottom}px` : undefined,
        minHeight: sectionData?.advanced?.minHeightVh ? `${sectionData.advanced.minHeightVh}vh` : undefined,
      }}
      className="relative py-24 sm:py-32 px-6 sm:px-12 bg-[#060606] border-t border-[#FFFFFF]/10 overflow-hidden"
    >
      {/* Subtle ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(circle,rgba(14,90,79,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div
        className={`mx-auto relative z-10 ${
          sectionData?.advanced?.contentWidth === 'Boxed' ? 'max-w-5xl' : 'max-w-7xl'
        }`}
      >
        <div
          className="max-w-2xl mx-auto mb-16 sm:mb-20"
          style={{ textAlign: sectionData?.typography?.textAlign || 'center' }}
        >
          <div className="inline-flex items-center gap-3 text-xs tracking-[0.35em] uppercase text-[#D8D8D5] mb-3">
            <span className="w-5 h-[1px] bg-[#0E5A4F]" />
            <span
              style={{
                color: sectionData?.typography?.subheadingColor || '#A2DEC8',
                fontSize: sectionData?.typography?.subheadingSizePx
                  ? `${sectionData.typography.subheadingSizePx}px`
                  : undefined,
              }}
              className="text-[#A2DEC8]"
            >
              {badgeText}
            </span>
            <span className="w-5 h-[1px] bg-[#0E5A4F]" />
          </div>

          <h2
            style={{
              fontFamily: sectionData?.typography?.fontFamily || undefined,
              color: sectionData?.typography?.headingColor || '#F5F2EA',
              fontSize: sectionData?.typography?.headingSizePx
                ? `${sectionData.typography.headingSizePx}px`
                : undefined,
              fontWeight: sectionData?.typography?.fontWeight || undefined,
            }}
            className="font-bodoni text-xl sm:text-2xl md:text-3xl font-light tracking-[0.2em] sm:tracking-[0.26em] text-[#F5F2EA] uppercase flex items-center justify-center gap-2.5 flex-wrap"
          >
            {headingText === 'WHY JEWEL BOTANICA' ? (
              <>
                <span className="opacity-70">WHY</span>
                <span className="font-normal text-[#FFFFFF] tracking-[0.24em] sm:tracking-[0.3em]">
                  JEWEL BOTANICA
                </span>
              </>
            ) : (
              <span>{headingText}</span>
            )}
          </h2>

          <p
            style={{
              color: sectionData?.typography?.bodyColor || '#B8B8B5',
              fontSize: sectionData?.typography?.bodySizePx ? `${sectionData.typography.bodySizePx}px` : undefined,
            }}
            className="mt-4 font-sans text-xs sm:text-sm text-[#B8B8B5] leading-relaxed font-light whitespace-pre-line"
          >
            {matterText}
          </p>
        </div>

        {/* 4 Pillars Premium Redesigned Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_US_PILLARS.map((pillar, idx) => {
            const IconComponent = iconList[idx] || Sliders;
            return (
              <div
                key={pillar.title}
                className="relative p-8 bg-gradient-to-b from-[#121212] to-[#0A0A0A] border border-[#FFFFFF]/12 hover:border-[#0E5A4F] transition-all duration-500 rounded-sm flex flex-col justify-between group shadow-xl hover:-translate-y-1"
              >
                {/* Top Corner Subtle Accent Glow */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#0E5A4F]/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div>
                  {/* Header Row: Icon & Clean Index */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#FFFFFF]/15 flex items-center justify-center group-hover:border-[#0E5A4F] group-hover:bg-[#0E5A4F]/20 transition-all">
                      <IconComponent className="w-4 h-4 text-[#A2DEC8] group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-[11px] font-mono tracking-widest text-[#B8B8B5]/40 group-hover:text-[#A2DEC8] transition-colors">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl tracking-[0.06em] text-[#F5F2EA] uppercase mb-2 group-hover:text-white transition-colors">
                    {pillar.title}
                  </h3>

                  <div className="w-6 h-[1px] bg-[#0E5A4F] mb-3 group-hover:w-10 transition-all duration-500" />

                  <p className="text-xs font-sans tracking-[0.12em] text-[#A2DEC8] uppercase mb-3 font-medium">
                    {pillar.subtitle}
                  </p>

                  <p className="text-xs text-[#B8B8B5]/80 leading-relaxed font-light">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-[#FFFFFF]/5 flex items-center justify-between text-[9px] font-sans tracking-[0.25em] text-[#B8B8B5]/40 uppercase">
                  <span>Standard 0{idx + 1}</span>
                  <span className="text-[#A2DEC8]/80">Hyderabad Atelier</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
