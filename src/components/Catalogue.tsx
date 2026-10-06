import React, { useState, useEffect } from 'react';
import { MessageCircle, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { CATALOGUE_ITEMS, BRAND_INFO, heroIsolatedJewelryImg } from '../data/jewelryData';
import { JewelryCategory, JewelryItem } from '../types/jewelry';
import { getPublishedProducts, getDeletedProductIds } from '../lib/productService';
import { PageSectionItem, normalizeImageUrl } from '../lib/websiteSettingsService';

interface CatalogueProps {
  activeCategory: JewelryCategory;
  onSelectCategory: (cat: JewelryCategory) => void;
  onViewProduct: (item: JewelryItem) => void;
  refreshTrigger?: number;
  sectionData?: PageSectionItem;
}

export const Catalogue: React.FC<CatalogueProps> = ({
  activeCategory,
  onSelectCategory,
  onViewProduct,
  refreshTrigger = 0,
  sectionData,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [liveProducts, setLiveProducts] = useState<JewelryItem[]>([]);

  // Load custom products published from Firestore Admin CMS
  useEffect(() => {
    let isMounted = true;
    async function loadCMSProducts() {
      try {
        const customItems = await getPublishedProducts();
        if (isMounted) {
          setLiveProducts(customItems);
        }
      } catch (err) {
        console.warn('Live products fetch notice:', err);
      }
    }
    loadCMSProducts();
    return () => {
      isMounted = false;
    };
  }, [refreshTrigger]);

  const categories: JewelryCategory[] = [
    'ALL',
    'HAARAMS',
    'NECKLACES',
    'JHUMKAS',
    'CHOKERS',
    'PENDANTS',
    'RINGS',
    'MATHAPATTI',
    'NOSE PINS',
  ];

  // Merge static base items with dynamic admin published items, deduplicating by ID and filtering deleted items
  const deletedIds = getDeletedProductIds();
  const productMap = new Map<string, JewelryItem>();
  CATALOGUE_ITEMS.forEach((it) => {
    if (!deletedIds.includes(it.id)) productMap.set(it.id, it);
  });
  liveProducts.forEach((it) => {
    if (!deletedIds.includes(it.id)) productMap.set(it.id, it);
  });
  const allCombinedItems = Array.from(productMap.values());

  const filteredItems =
    activeCategory === 'ALL'
      ? allCombinedItems
      : allCombinedItems.filter((item) => {
          const cat = (item.category || '').toUpperCase().trim();
          const disp = (item.displayCategory || '').toUpperCase().trim();
          const target = activeCategory.toUpperCase().trim();
          return cat === target || disp === target || cat.includes(target) || target.includes(cat);
        });

  // Show only 3 cards by default, or all when showAll is true
  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, 3);

  const headingText = sectionData?.heading || 'THE JEWEL BOTANICA CATALOGUE';

  return (
    <section
      id="catalogue"
      style={{
        backgroundColor: sectionData?.advanced?.backgroundColor || '#0A0A0A',
        paddingTop: sectionData?.advanced?.paddingTop ? `${sectionData.advanced.paddingTop}px` : undefined,
        paddingBottom: sectionData?.advanced?.paddingBottom ? `${sectionData.advanced.paddingBottom}px` : undefined,
        minHeight: sectionData?.advanced?.minHeightVh ? `${sectionData.advanced.minHeightVh}vh` : undefined,
      }}
      className="relative py-24 sm:py-32 px-6 sm:px-12 bg-[#0A0A0A] overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(circle,rgba(14,90,79,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div
        className={`mx-auto ${
          sectionData?.advanced?.contentWidth === 'Boxed' ? 'max-w-5xl' : 'max-w-7xl'
        }`}
      >
        {/* Header Block */}
        <div
          className="max-w-2xl mx-auto mb-10 sm:mb-14"
          style={{ textAlign: sectionData?.typography?.textAlign || 'center' }}
        >
          {sectionData?.badgeText && (
            <span
              style={{
                color: sectionData?.typography?.subheadingColor || '#A2DEC8',
                fontSize: sectionData?.typography?.subheadingSizePx
                  ? `${sectionData.typography.subheadingSizePx}px`
                  : undefined,
              }}
              className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#A2DEC8] block mb-2"
            >
              {sectionData.badgeText}
            </span>
          )}
          <h2
            style={{
              fontFamily: sectionData?.typography?.fontFamily || undefined,
              color: sectionData?.typography?.headingColor || '#F5F2EA',
              fontSize: sectionData?.typography?.headingSizePx
                ? `${sectionData.typography.headingSizePx}px`
                : undefined,
              fontWeight: sectionData?.typography?.fontWeight || undefined,
            }}
            className="font-bodoni text-xl sm:text-2xl md:text-3xl font-light tracking-[0.22em] sm:tracking-[0.28em] text-[#F5F2EA] uppercase flex items-center justify-center flex-wrap gap-2.5"
          >
            {headingText === 'THE JEWEL BOTANICA CATALOGUE' ? (
              <>
                <span className="opacity-70">THE</span>
                <span className="font-normal text-[#FFFFFF] tracking-[0.24em] sm:tracking-[0.3em]">
                  JEWEL BOTANICA
                </span>
                <span className="opacity-70">CATALOGUE</span>
              </>
            ) : (
              <span>{headingText}</span>
            )}
          </h2>
          {sectionData?.matterText && (
            <p
              style={{
                color: sectionData?.typography?.bodyColor || '#B8B8B5',
                fontSize: sectionData?.typography?.bodySizePx
                  ? `${sectionData.typography.bodySizePx}px`
                  : undefined,
              }}
              className="text-xs sm:text-sm text-[#B8B8B5] font-light tracking-wide mt-3 whitespace-pre-line"
            >
              {sectionData.matterText}
            </p>
          )}
        </div>

        {/* Category Filters (Horizontal Segmented Control) */}
        <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-4 mb-12 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  onSelectCategory(cat);
                }}
                className={`px-4 sm:px-5 py-2 text-[11px] font-sans tracking-[0.2em] uppercase rounded-none transition-all duration-300 whitespace-nowrap border shrink-0 ${
                  isActive
                    ? 'bg-[#151515] text-[#F5F2EA] border-[#0E5A4F] shadow-[0_0_15px_rgba(14,90,79,0.3)]'
                    : 'bg-transparent text-[#B8B8B5]/80 border-transparent hover:border-[#FFFFFF]/20 hover:text-[#F5F2EA]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Jewellery Cards Row (1 on mobile, 2 sm, 3 desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {visibleItems.map((item) => {
            const whatsappUrl = `${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
              `Hello Jewel Botanica, I am interested in inquiring about the "${item.name}" (${item.displayCategory}) from your catalogue. Could you share details regarding price and availability?`
            )}`;

            return (
              <div
                key={item.id}
                className="group relative flex flex-col justify-between bg-[#111111] border border-[#FFFFFF]/10 hover:border-[#FFFFFF]/35 transition-all duration-500 rounded-sm overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.6)]"
              >
                {/* Image Section */}
                <div
                  onClick={() => onViewProduct(item)}
                  className="relative aspect-square sm:aspect-[4/3] w-full overflow-hidden bg-black cursor-pointer flex items-center justify-center p-2 border-b border-[#202020]"
                >
                  <img
                    src={normalizeImageUrl(item.image || (item.images && item.images[0])) || item.image || (item.images && item.images[0]) || heroIsolatedJewelryImg}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src !== heroIsolatedJewelryImg) {
                        target.src = heroIsolatedJewelryImg;
                      }
                    }}
                    className="w-full h-full object-contain object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Subtle Dark Vignette & Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />

                  {/* Quick View Button on Desktop */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none sm:pointer-events-auto">
                    <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-[#080808]/90 text-[#F5F2EA] text-[11px] tracking-wider uppercase border border-white/20 backdrop-blur-sm">
                      <Eye className="w-3.5 h-3.5" /> Quick View
                    </span>
                  </div>

                  {/* Category Pill Tag */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 bg-black/75 backdrop-blur-sm text-[9px] sm:text-[10px] tracking-[0.2em] font-sans text-[#A2DEC8] uppercase border border-white/5">
                    {item.displayCategory}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-grow">
                  <div>
                    <h3
                      onClick={() => onViewProduct(item)}
                      className="font-serif text-base sm:text-lg tracking-[0.06em] text-[#F5F2EA] group-hover:text-white transition-colors cursor-pointer truncate"
                    >
                      {item.name}
                    </h3>

                    <p className="mt-1.5 text-xs text-[#B8B8B5]/70 line-clamp-2 font-light">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-[#FFFFFF]/5 flex flex-col gap-2.5">
                    <p className="text-[11px] font-serif italic text-[#D8D8D5]">
                      Prices and availability on enquiry.
                    </p>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-[#161616] hover:bg-[#0E5A4F] text-[#F5F2EA] border border-[#FFFFFF]/10 hover:border-transparent text-[11px] font-sans tracking-[0.18em] uppercase rounded-none transition-all duration-300 group/btn"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-[#A2DEC8] group-hover/btn:text-white transition-colors" />
                      <span className="truncate">Enquire on WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All / Collapse Button */}
        {filteredItems.length > 3 && (
          <div className="mt-14 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 border border-[#FFFFFF]/15 hover:border-[#0E5A4F] text-xs font-sans tracking-[0.22em] uppercase text-[#F5F2EA] bg-[#0E0E0E] hover:bg-[#121212] transition-all duration-300 group shadow-md"
            >
              <span>{showAll ? 'View Less' : `View All (${filteredItems.length} Designs)`}</span>
              {showAll ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#A2DEC8] group-hover:-translate-y-0.5 transition-transform" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[#A2DEC8] group-hover:translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
