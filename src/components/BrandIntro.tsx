import React from 'react';
import { statementChokerImg } from '../data/jewelryData';
import { ShieldCheck, Sliders, MapPin, Globe2, ArrowRight } from 'lucide-react';
import { PageSectionItem } from '../lib/websiteSettingsService';

interface BrandIntroProps {
  onLearnMore?: () => void;
  customImage?: string;
  sectionData?: PageSectionItem;
}

export const BrandIntro: React.FC<BrandIntroProps> = ({ customImage, sectionData }) => {
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

  const badgeText = sectionData?.badgeText || 'The Atelier Philosophy';
  const headingText = sectionData?.heading || 'JEWEL BOTANICA';
  const matterParagraphs = sectionData?.matterText
    ? sectionData.matterText.split('\n\n')
    : [
        'JEWEL BOTANICA brings together the brilliance of silver, intricate craftsmanship and timeless Indian elegance. From statement bridal creations to refined pieces for special occasions, every design is chosen to make an impression.',
        'Rooted in Hyderabad, we believe fine silver is not merely an ornament—it is a regal expression of personal poise, carrying the majesty of heritage jewellery into the contemporary world.',
      ];

  const displayImage = sectionData?.image || customImage || statementChokerImg;

  return (
    <section
      id="about"
      style={{
        backgroundColor: sectionData?.advanced?.backgroundColor || '#0C0C0C',
        paddingTop: sectionData?.advanced?.paddingTop ? `${sectionData.advanced.paddingTop}px` : undefined,
        paddingBottom: sectionData?.advanced?.paddingBottom ? `${sectionData.advanced.paddingBottom}px` : undefined,
        minHeight: sectionData?.advanced?.minHeightVh ? `${sectionData.advanced.minHeightVh}vh` : undefined,
      }}
      className="relative py-24 sm:py-32 px-6 sm:px-12 bg-[#0C0C0C] border-t border-b border-[#FFFFFF]/5 overflow-hidden"
    >
      {/* Subtle charcoal gradient aura */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(14,90,79,0.08)_0%,transparent_70%)] pointer-events-none" />

      <div
        className={`mx-auto ${
          sectionData?.advanced?.contentWidth === 'Boxed' ? 'max-w-5xl' : 'max-w-7xl'
        } grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center`}
      >
        {/* Left Side: Large Jewellery Photograph on dark black backdrop */}
        <div className="lg:col-span-6 relative">
          <div className="relative rounded-sm overflow-hidden border border-[#FFFFFF]/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] group bg-[#080808] flex items-center justify-center min-h-[320px] max-h-[580px]">
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

          {/* Luxury Frame Accent */}
          <div className="absolute -bottom-4 -right-4 w-32 h-32 border-b border-r border-[#0E5A4F]/40 pointer-events-none -z-0" />
        </div>

        {/* Right Side: Editorial Narrative */}
        <div
          className="lg:col-span-6 flex flex-col justify-center"
          style={{ textAlign: sectionData?.typography?.textAlign || 'left' }}
        >
          <div className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-[#D8D8D5] mb-6">
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
          </div>

          {sectionData?.heading && sectionData.heading !== 'JEWEL BOTANICA' && (
            <h2
              style={{
                fontFamily: sectionData?.typography?.fontFamily || undefined,
                color: sectionData?.typography?.headingColor || '#F5F2EA',
                fontSize: sectionData?.typography?.headingSizePx
                  ? `${sectionData.typography.headingSizePx}px`
                  : undefined,
                fontWeight: sectionData?.typography?.fontWeight || undefined,
              }}
              className="font-serif text-2xl sm:text-3xl text-[#F5F2EA] uppercase tracking-wider mb-4"
            >
              {sectionData.heading}
            </h2>
          )}

          {matterParagraphs.map((para, i) => (
            <p
              key={i}
              style={{
                color: sectionData?.typography?.bodyColor || '#B8B8B5',
                fontSize: sectionData?.typography?.bodySizePx ? `${sectionData.typography.bodySizePx}px` : undefined,
              }}
              className="font-sans text-sm sm:text-base text-[#B8B8B5] leading-relaxed mb-6 font-light"
            >
              {i === 0 && (!sectionData?.heading || sectionData.heading === 'JEWEL BOTANICA') ? (
                <>
                  <span
                    style={{
                      color: sectionData?.typography?.headingColor || '#FFFFFF',
                      fontSize: sectionData?.typography?.headingSizePx
                        ? `${sectionData.typography.headingSizePx}px`
                        : undefined,
                    }}
                    className="font-bodoni font-normal tracking-[0.2em] text-[#FFFFFF] uppercase mr-1.5 inline-block text-base sm:text-lg"
                  >
                    {headingText}
                  </span>{' '}
                  {para.replace(/^JEWEL BOTANICA\s*/i, '')}
                </>
              ) : (
                para
              )}
            </p>
          ))}

          {/* 4 Small Pillars Grid */}
          <div className="grid grid-cols-2 gap-6 w-full pt-6 border-t border-[#FFFFFF]/10 text-left">
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
              href={sectionData?.buttons?.[0]?.link || '#catalogue'}
              className="inline-flex items-center gap-2 text-xs font-sans tracking-[0.22em] text-[#D8D8D5] hover:text-[#F5F2EA] group uppercase"
            >
              <span>{sectionData?.buttons?.[0]?.text || 'Explore The Atelier Works'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#0E5A4F] group-hover:translate-x-1.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
