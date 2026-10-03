import React, { useState, useEffect } from 'react';
import { MessageCircle, Menu, X, ArrowUpRight } from 'lucide-react';
import { BRAND_INFO, brandLogoImg } from '../data/jewelryData';

interface NavbarProps {
  onOpenCustomization?: () => void;
  onReplayIntro?: () => void;
  logoImage?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCustomization, logoImage }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'HOME', href: '#hero' },
    { label: 'ABOUT', href: '#about' },
    { label: 'CATALOGUE', href: '#catalogue' },
    { label: 'CUSTOMIZE', href: '#customization' },
    { label: 'CONTACT', href: '#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-[#080808]/95 backdrop-blur-xl border-b border-[#FFFFFF]/10 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]'
            : 'bg-gradient-to-b from-[#080808]/90 via-[#080808]/50 to-transparent py-5 sm:py-7'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-12 flex items-center justify-between">
          {/* Brand Logo & Editorial Monogram */}
          <a
            href="#hero"
            className="flex items-center gap-3.5 group focus:outline-none"
            aria-label="Jewel Botanica Home"
          >
            <div className="relative">
              <img
                src={logoImage || brandLogoImg}
                alt="Jewel Botanica Monogram"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-[#FFFFFF]/20 shadow-md group-hover:border-[#0E5A4F] transition-all duration-300"
              />
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(14,90,79,0.3)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="flex flex-col">
              <span className="font-bodoni text-base sm:text-lg md:text-xl text-[#FFFFFF] tracking-[0.24em] uppercase block leading-tight font-normal whitespace-nowrap">
                JEWEL BOTANICA
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.35em] text-[#A2DEC8] uppercase font-sans mt-0.5">
                Silver Jewellery
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-[11px] font-sans tracking-[0.22em] text-[#D8D8D5] hover:text-[#FFFFFF] uppercase transition-colors relative py-1 group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gradient-to-r from-[#D8D8D5] to-[#0E5A4F] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Right Action: WhatsApp Enquiry */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
                'Hello Jewel Botanica, I would like to enquire about your 92.5 silver jewellery collection.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-2 text-[11px] font-sans tracking-[0.18em] uppercase text-[#F5F2EA] bg-[#111111]/80 hover:bg-[#161616] border border-[#FFFFFF]/15 hover:border-[#0E5A4F]/60 rounded-sm transition-all duration-300 group shadow-sm"
              aria-label="Enquire on WhatsApp"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#127567] group-hover:bg-[#1FD286] transition-colors shadow-[0_0_8px_#127567]" />
              <MessageCircle className="w-3.5 h-3.5 text-[#D8D8D5] group-hover:text-[#F5F2EA]" />
              <span>Enquire</span>
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
                'Hello Jewel Botanica, I would like to enquire about your jewellery.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-[#F5F2EA] hover:text-[#0E5A4F] transition-colors"
              aria-label="WhatsApp Enquire"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#F5F2EA] hover:text-white focus:outline-none"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#080808]/98 backdrop-blur-2xl flex flex-col justify-between p-8 overflow-y-auto animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-[#FFFFFF]/10 pb-6">
            <div className="flex items-center gap-3">
              <img
                src={brandLogoImg}
                alt="Jewel Botanica"
                className="w-12 h-12 rounded-full object-cover border border-[#FFFFFF]/20 shadow-md"
              />
              <div>
                <span className="font-bodoni text-lg text-[#FFFFFF] tracking-[0.2em] uppercase block leading-tight font-normal">
                  JEWEL BOTANICA
                </span>
                <p className="text-[9px] tracking-[0.3em] text-[#A2DEC8] uppercase font-sans">
                  Silver Jewellery
                </p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-[#D8D8D5] hover:text-white"
              aria-label="Close Navigation"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="py-10 flex flex-col gap-6">
            {navLinks.map((link, idx) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="font-serif text-2xl tracking-[0.16em] text-[#F5F2EA] hover:text-[#0E5A4F] transition-colors flex items-center justify-between group"
              >
                <span>{link.label}</span>
                <span className="text-xs text-[#B8B8B5]/50 group-hover:text-[#0E5A4F] font-sans">
                  0{idx + 1}
                </span>
              </a>
            ))}
          </div>

          <div className="pt-6 border-t border-[#FFFFFF]/10 flex flex-col gap-4">
            <a
              href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
                'Hello Jewel Botanica, I am enquiring from your website.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0E5A4F] hover:bg-[#127567] text-[#F5F2EA] text-xs font-sans tracking-[0.2em] uppercase rounded-sm transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Enquiry (+91 99592 76259)</span>
            </a>

            <div className="flex items-center justify-between text-[11px] text-[#B8B8B5]">
              <span>Hyderabad, India</span>
              <a
                href={BRAND_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-[#F5F2EA]"
              >
                <span>{BRAND_INFO.instagram}</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
