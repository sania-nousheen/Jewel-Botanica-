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

        {/* Main Page Sections */}
        <main>
          <Hero
            onExploreClick={handleExploreCollections}
            introActive={introActive}
            customSlides={websiteSettings.heroSlides}
          />

          <div className="reveal-on-scroll">
            <BrandIntro customImage={websiteSettings.websiteImages?.aboutSectionImage} />
          </div>

          <div className="reveal-on-scroll">
            <SignatureCollections
              onSelectCategory={handleSelectCategory}
              onViewProduct={(item) => setSelectedProduct(item)}
              customCollections={websiteSettings.collections}
              allProducts={allProducts}
            />
          </div>

          <div className="reveal-on-scroll">
            <StatementJewellery
              onViewSignature={handleViewSignature}
              customImage={websiteSettings.websiteImages?.statementHaaramImage}
            />
          </div>

          <div className="reveal-on-scroll">
            <Catalogue
              activeCategory={activeCategory}
              onSelectCategory={(cat) => setActiveCategory(cat)}
              onViewProduct={(item) => setSelectedProduct(item)}
              refreshTrigger={catalogueRefreshKey}
            />
          </div>

          <div className="reveal-on-scroll">
            <ArtOfSilver customBannerImage={websiteSettings.websiteImages?.craftsmanshipBanner} />
          </div>

          <div className="reveal-on-scroll">
            <Customization />
          </div>

          <div className="reveal-on-scroll">
            <WhyJewelBotanica />
          </div>

          <div className="reveal-on-scroll">
            <InstagramGrid
              customLogoImage={websiteSettings.websiteImages?.brandLogo}
              followerCountOverride={websiteSettings.instagramFollowersCount}
            />
          </div>

          <div className="reveal-on-scroll">
            <ContactSection />
          </div>
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
