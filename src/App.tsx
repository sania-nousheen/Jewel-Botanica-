/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { OpeningIntro } from './components/OpeningIntro';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BrandIntro } from './components/BrandIntro';
import { SignatureCollections } from './components/SignatureCollections';
import { StatementJewellery } from './components/StatementJewellery';
import { Catalogue } from './components/Catalogue';
import { ArtOfSilver } from './components/ArtOfSilver';
import { Customization } from './components/Customization';
import { WhyJewelBotanica } from './components/WhyJewelBotanica';
import { InstagramGrid } from './components/InstagramGrid';
import { ContactSection } from './components/ContactSection';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { AdminCMSModal } from './components/AdminCMSModal';
import { PromoDiscountPopup } from './components/PromoDiscountPopup';
import { AuthProvider } from './context/AuthContext';
import { JewelryCategory, JewelryItem } from './types/jewelry';
import {
  subscribeWebsiteSettings,
  WebsiteCustomizationSettings,
  DEFAULT_WEBSITE_SETTINGS,
} from './lib/websiteSettingsService';
import { getPublishedProducts, getDeletedProductIds } from './lib/productService';
import { CATALOGUE_ITEMS } from './data/jewelryData';

export default function App() {
  const [introActive, setIntroActive] = useState(true);
  const [activeCategory, setActiveCategory] = useState<JewelryCategory>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<JewelryItem | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [catalogueRefreshKey, setCatalogueRefreshKey] = useState(0);

  // Live website customization settings (Hero slides, promo discount popup, collections, profile)
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteCustomizationSettings>(DEFAULT_WEBSITE_SETTINGS);

  // Unified products available across all website sections
  const [allProducts, setAllProducts] = useState<JewelryItem[]>(() => {
    const deletedIds = getDeletedProductIds();
    return CATALOGUE_ITEMS.filter((it) => !deletedIds.includes(it.id));
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchProducts() {
      try {
        const customItems = await getPublishedProducts();
        if (isMounted) {
          const deletedIds = getDeletedProductIds();
          const map = new Map<string, JewelryItem>();
          CATALOGUE_ITEMS.forEach((it) => {
            if (!deletedIds.includes(it.id)) map.set(it.id, it);
          });
          customItems.forEach((it) => {
            if (!deletedIds.includes(it.id)) map.set(it.id, it);
          });
          setAllProducts(Array.from(map.values()));
        }
      } catch (err) {
        console.warn('App products fetch notice:', err);
      }
    }
    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [catalogueRefreshKey]);

  useEffect(() => {
    const unsubscribe = subscribeWebsiteSettings((settings) => {
      setWebsiteSettings(settings);
    });
    return () => unsubscribe();
  }, []);

  // Slow smooth scroll reveal observer for editorial motion
  useEffect(() => {
    if (introActive) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [introActive]);

  const handleExploreCollections = () => {
    const el = document.querySelector('#collections');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (category: JewelryCategory) => {
    setActiveCategory(category);
    const el = document.querySelector('#catalogue');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewSignature = () => {
    setActiveCategory('HAARAMS');
    const el = document.querySelector('#catalogue');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-[#080808] text-[#F5F2EA] selection:bg-[#0E5A4F] selection:text-[#F5F2EA]">
        {/* Cinematic Opening Experience */}
        {introActive && (
          <OpeningIntro onComplete={() => setIntroActive(false)} />
        )}

        {/* Luxury Navigation Bar */}
        <Navbar logoImage={websiteSettings.websiteImages?.brandLogo} />

        {/* Main Page Sections with dynamic ordering, custom pages, and custom widgets */}
        <main>
          {(websiteSettings.pageSections && websiteSettings.pageSections.length > 0
            ? websiteSettings.pageSections
            : DEFAULT_WEBSITE_SETTINGS.pageSections || []
          )
            .filter((sec) => sec.visible)
            .map((sec) => {
              const sectionWidgets = (websiteSettings.customWidgets || []).filter(
                (w) => w.visible && w.targetSectionId === sec.id
              );

              const renderBuiltInOrCustomSection = () => {
                switch (sec.id) {
                  case 'hero':
                    return (
                      <Hero
                        onExploreClick={handleExploreCollections}
                        introActive={introActive}
                        customSlides={websiteSettings.heroSlides}
                        sectionData={sec}
                      />
                    );
                  case 'brandIntro':
                    return (
                      <div className="reveal-on-scroll">
                        <BrandIntro
                          customImage={sec.image || websiteSettings.websiteImages?.aboutSectionImage}
                          sectionData={sec}
                        />
                      </div>
                    );
                  case 'collections':
                    return (
                      <div className="reveal-on-scroll">
                        <SignatureCollections
                          onSelectCategory={handleSelectCategory}
                          onViewProduct={(item) => setSelectedProduct(item)}
                          customCollections={websiteSettings.collections}
                          allProducts={allProducts}
                          sectionData={sec}
                        />
                      </div>
                    );
                  case 'statementJewellery':
                    return (
                      <div className="reveal-on-scroll">
                        <StatementJewellery
                          onViewSignature={handleViewSignature}
                          customImage={sec.image || websiteSettings.websiteImages?.statementHaaramImage}
                          sectionData={sec}
                        />
                      </div>
                    );
                  case 'catalogue':
                    return (
                      <div className="reveal-on-scroll">
                        <Catalogue
                          activeCategory={activeCategory}
                          onSelectCategory={(cat) => setActiveCategory(cat)}
                          onViewProduct={(item) => setSelectedProduct(item)}
                          refreshTrigger={catalogueRefreshKey}
                          sectionData={sec}
                        />
                      </div>
                    );
                  case 'artOfSilver':
                    return (
                      <div className="reveal-on-scroll">
                        <ArtOfSilver
                          customBannerImage={sec.image || websiteSettings.websiteImages?.craftsmanshipBanner}
                          sectionData={sec}
                        />
                      </div>
                    );
                  case 'customization':
                    return (
                      <div className="reveal-on-scroll">
                        <Customization sectionData={sec} />
                      </div>
                    );
                  case 'whyJewelBotanica':
                    return (
                      <div className="reveal-on-scroll">
                        <WhyJewelBotanica sectionData={sec} />
                      </div>
                    );
                  case 'instagram':
                    return (
                      <div className="reveal-on-scroll">
                        <InstagramGrid
                          customLogoImage={websiteSettings.websiteImages?.brandLogo}
                          sectionData={sec}
                          followerCountOverride={websiteSettings.instagramFollowersCount}
                        />
                      </div>
                    );
                  case 'contact':
                    return (
                      <div className="reveal-on-scroll">
                        <ContactSection sectionData={sec} />
                      </div>
                    );
                  default:
                    // Custom user-added page section from Customize Website
                    return (
                      <section
                        id={sec.id}
                        style={{
                          backgroundColor: sec.advanced?.backgroundColor || '#0B0B0B',
                          paddingTop: sec.advanced?.paddingTop ? `${sec.advanced.paddingTop}px` : '80px',
                          paddingBottom: sec.advanced?.paddingBottom ? `${sec.advanced.paddingBottom}px` : '80px',
                          minHeight: sec.advanced?.minHeightVh ? `${sec.advanced.minHeightVh}vh` : undefined,
                        }}
                        className="relative px-6 sm:px-12 border-t border-[#FFFFFF]/10 overflow-hidden"
                      >
                        <div
                          className={`mx-auto ${
                            sec.advanced?.contentWidth === 'Boxed' ? 'max-w-5xl' : 'max-w-7xl'
                          } grid grid-cols-1 lg:grid-cols-12 gap-10 items-center`}
                        >
                          {sec.image && (
                            <div className="lg:col-span-5">
                              <div className="bg-black border border-white/10 rounded-sm overflow-hidden flex items-center justify-center p-2">
                                <img
                                  src={sec.image}
                                  alt={sec.heading}
                                  style={{
                                    width: `${sec.imageStyle?.widthPercent || 100}%`,
                                    maxHeight: sec.imageStyle?.heightPx ? `${sec.imageStyle.heightPx}px` : '480px',
                                    objectFit:
                                      sec.imageStyle?.objectFit && sec.imageStyle.objectFit !== 'Default'
                                        ? (sec.imageStyle.objectFit as any)
                                        : 'contain',
                                    opacity: (sec.imageStyle?.opacity ?? 100) / 100,
                                    borderRadius: `${sec.imageStyle?.borderRadiusPx || 0}px`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          <div
                            className={`${sec.image ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}
                            style={{ textAlign: sec.typography?.textAlign || 'left' }}
                          >
                            {sec.badgeText && (
                              <span
                                style={{
                                  color: sec.typography?.subheadingColor || '#A2DEC8',
                                  fontSize: sec.typography?.subheadingSizePx
                                    ? `${sec.typography.subheadingSizePx}px`
                                    : '11px',
                                }}
                                className="uppercase tracking-[0.25em] font-sans block"
                              >
                                {sec.badgeText}
                              </span>
                            )}
                            {sec.heading && (
                              <h2
                                style={{
                                  fontFamily: sec.typography?.fontFamily || 'Cormorant Garamond',
                                  color: sec.typography?.headingColor || '#F5F2EA',
                                  fontSize: sec.typography?.headingSizePx
                                    ? `${sec.typography.headingSizePx}px`
                                    : undefined,
                                  fontWeight: sec.typography?.fontWeight || '300',
                                }}
                                className="font-serif text-2xl sm:text-4xl tracking-wider"
                              >
                                {sec.heading}
                              </h2>
                            )}
                            {sec.subheading && (
                              <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#D8D8D5]">
                                {sec.subheading}
                              </p>
                            )}
                            {sec.matterText && (
                              <p
                                style={{
                                  color: sec.typography?.bodyColor || '#B8B8B5',
                                  fontSize: sec.typography?.bodySizePx
                                    ? `${sec.typography.bodySizePx}px`
                                    : undefined,
                                }}
                                className="text-sm sm:text-base font-light leading-relaxed whitespace-pre-line"
                              >
                                {sec.matterText}
                              </p>
                            )}
                            {sec.buttons && sec.buttons.filter((b) => b.visible).length > 0 && (
                              <div className="pt-4 flex flex-wrap gap-3">
                                {sec.buttons
                                  .filter((b) => b.visible)
                                  .map((btn) => (
                                    <a
                                      key={btn.id}
                                      href={btn.link || '#catalogue'}
                                      style={{
                                        borderRadius: `${btn.borderRadiusTop || 0}px`,
                                        padding: `${btn.paddingTop || 12}px ${btn.paddingRight || 24}px ${
                                          btn.paddingBottom || 12
                                        }px ${btn.paddingLeft || 24}px`,
                                      }}
                                      className={`inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition ${
                                        btn.type === 'Primary Emerald'
                                          ? 'bg-[#0E5A4F] hover:bg-[#147A6A] text-white'
                                          : btn.type === 'WhatsApp Green'
                                          ? 'bg-[#25D366] text-black font-medium'
                                          : 'border border-white/25 hover:border-white text-[#F5F2EA]'
                                      }`}
                                    >
                                      <span>{btn.text}</span>
                                    </a>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </section>
                    );
                }
              };

              return (
                <React.Fragment key={sec.id}>
                  {renderBuiltInOrCustomSection()}
                  {/* Custom Widgets Attached to this Section */}
                  {sectionWidgets.map((w) => (
                    <div
                      key={w.id}
                      style={{
                        backgroundColor: w.backgroundColor || '#0A0A0A',
                        paddingTop: `${w.paddingVerticalPx || 32}px`,
                        paddingBottom: `${w.paddingVerticalPx || 32}px`,
                        textAlign: w.alignment || 'center',
                      }}
                      className="px-6 sm:px-12 border-t border-white/5"
                    >
                      <div className="max-w-5xl mx-auto space-y-4">
                        {w.type === 'Divider' ? (
                          <hr className="border-t border-[#0E5A4F]/40 my-4" />
                        ) : (
                          <>
                            {w.title && (
                              <h3
                                style={{
                                  color: w.textColor || '#F5F2EA',
                                  fontSize: w.fontSizePx ? `${w.fontSizePx}px` : undefined,
                                }}
                                className="font-serif text-xl sm:text-2xl tracking-wider uppercase"
                              >
                                {w.title}
                              </h3>
                            )}
                            {w.subtitle && (
                              <p className="text-xs uppercase tracking-[0.2em] text-[#A2DEC8]">{w.subtitle}</p>
                            )}
                            {w.content && (
                              <p className="text-sm text-[#B8B8B5] font-light leading-relaxed max-w-3xl mx-auto whitespace-pre-line">
                                {w.content}
                              </p>
                            )}
                            {w.imageUrl && (
                              <div className="max-w-xl mx-auto bg-black p-2 border border-white/10 rounded-sm">
                                <img src={w.imageUrl} alt={w.title} className="w-full max-h-96 object-contain mx-auto" />
                              </div>
                            )}
                            {w.videoUrl && (
                              <div className="max-w-xl mx-auto bg-black p-2 border border-white/10 rounded-sm">
                                <video src={w.videoUrl} controls className="w-full max-h-96 object-contain mx-auto" />
                              </div>
                            )}
                            {w.buttonText && (
                              <div className="pt-2">
                                <a
                                  href={w.buttonLink || '#'}
                                  className="inline-block px-6 py-3 bg-[#0E5A4F] hover:bg-[#147A6A] text-white text-xs uppercase tracking-[0.2em] transition"
                                >
                                  {w.buttonText}
                                </a>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              );
            })}
        </main>

        {/* Floating WhatsApp Quick Concierge */}
        <FloatingWhatsApp />

        {/* Footer with private admin portal link & dynamic social icons */}
        <Footer
          onOpenAdmin={() => setAdminOpen(true)}
          socialIcons={websiteSettings.socialIcons}
          profile={websiteSettings.profile}
        />

        {/* Product Detail Modal */}
        <ProductDetailModal
          item={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />

        {/* Festive Discounts / Coupon Code Promotional Popup */}
        <PromoDiscountPopup settings={websiteSettings.promoPopup} />

        {/* Master Admin Portal with Left Panel and Right Workspace Area */}
        <AdminCMSModal
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
          onProductUpdated={() => setCatalogueRefreshKey((prev) => prev + 1)}
          websiteSettings={websiteSettings}
        />
      </div>
    </AuthProvider>
  );
}
