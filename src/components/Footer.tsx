import React from 'react';
import {
  ArrowUp,
  Instagram,
  MessageCircle,
  MapPin,
  Lock,
  Youtube,
  Linkedin,
  Facebook,
  Mail,
  Phone,
  Globe,
  Send,
  Share2,
} from 'lucide-react';
import { BRAND_INFO } from '../data/jewelryData';
import { useAuth } from '../context/AuthContext';
import { SocialIconItem, ProfileSettings, DEFAULT_SOCIAL_ICONS } from '../lib/websiteSettingsService';

interface FooterProps {
  onOpenAdmin?: () => void;
  socialIcons?: SocialIconItem[];
  profile?: ProfileSettings;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, socialIcons, profile }) => {
  const { isAdmin } = useAuth();
  const activeSocials = (socialIcons && socialIcons.length > 0 ? socialIcons : DEFAULT_SOCIAL_ICONS).filter(
    (s) => s.visible
  );

  const renderSocialPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram':
        return <Instagram className="w-4 h-4" />;
      case 'WhatsApp':
        return <MessageCircle className="w-4 h-4" />;
      case 'YouTube':
        return <Youtube className="w-4 h-4" />;
      case 'LinkedIn':
        return <Linkedin className="w-4 h-4" />;
      case 'Facebook':
        return <Facebook className="w-4 h-4" />;
      case 'Telegram':
        return <Send className="w-4 h-4" />;
      case 'Envelope':
        return <Mail className="w-4 h-4" />;
      case 'Phone':
        return <Phone className="w-4 h-4" />;
      case 'MapPin':
        return <MapPin className="w-4 h-4" />;
      case 'Globe':
        return <Globe className="w-4 h-4" />;
      default:
        return <Share2 className="w-4 h-4" />;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Collections', href: '#collections' },
    { label: 'Catalogue', href: '#catalogue' },
    { label: 'The Art of Silver', href: '#art-of-silver' },
    { label: 'Customization', href: '#customization' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="relative bg-[#040404] text-[#B8B8B5] pt-20 pb-12 px-6 sm:px-12 border-t border-[#FFFFFF]/10">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-16 border-b border-[#FFFFFF]/10">
          
          {/* Brand Column */}
          <div className="md:col-span-5 flex flex-col items-start">
            <span className="font-bodoni font-normal text-base sm:text-lg md:text-xl text-[#FFFFFF] tracking-[0.24em] uppercase block leading-tight whitespace-nowrap">
              {profile?.brandName || 'JEWEL BOTANICA'}
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-[0.35em] text-[#A2DEC8] uppercase font-sans mt-2.5 mb-5 block">
              {profile?.descriptor || 'Silver Jewellery'}
            </span>

            <p className="font-serif italic text-base text-[#F5F2EA] mb-6">
              &ldquo;{profile?.tagline || BRAND_INFO.motto}&rdquo;
            </p>

            <p className="font-sans text-xs text-[#B8B8B5]/70 leading-relaxed max-w-sm font-light mb-6">
              Hyderabad&apos;s destination for statement 92.5 sterling silver bridal creations, sculpted chokers, and bespoke Nizam-inspired heirlooms.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#B8B8B5]">
              <MapPin className="w-3.5 h-3.5 text-[#0E5A4F]" />
              <span>{profile?.atelierAddress || 'Hyderabad, Telangana, India • Worldwide Shipping'}</span>
            </div>

            {/* Dynamic Social Icons Bar */}
            {activeSocials.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {activeSocials.map((soc) => (
                  <a
                    key={soc.id}
                    href={soc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={soc.label || soc.platform}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border ${
                      soc.colorType === 'Emerald Luxury'
                        ? 'bg-[#0E5A4F]/20 border-[#0E5A4F] text-[#A2DEC8] hover:bg-[#0E5A4F] hover:text-white'
                        : soc.colorType === 'Silver Monochrome'
                        ? 'bg-[#141414] border-white/15 text-[#F5F2EA] hover:border-white'
                        : 'bg-[#111111] border-white/15 text-[#A2DEC8] hover:border-[#0E5A4F] hover:bg-[#0E5A4F] hover:text-white'
                    }`}
                  >
                    {renderSocialPlatformIcon(soc.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-4 flex flex-col">
            <span className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#D8D8D5] mb-5">
              Explore Atelier
            </span>
            <ul className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-sans tracking-wider">
              {navLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-[#B8B8B5]/80 hover:text-[#F5F2EA] transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={BRAND_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A2DEC8] hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                {/* Admin Portal placed in Footer */}
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 text-[#A2DEC8]/80 hover:text-[#A2DEC8] transition-colors cursor-pointer text-xs font-sans tracking-wider"
                >
                  <Lock className="w-3 h-3 text-[#0E5A4F]" />
                  <span>Admin Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Concierge Column */}
          <div className="md:col-span-3 flex flex-col items-start md:items-end justify-between">
            <div className="text-left md:text-right">
              <span className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#D8D8D5] block mb-3">
                WhatsApp Orders
              </span>
              <a
                href={BRAND_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm tracking-wider text-[#F5F2EA] hover:text-[#A2DEC8] transition-colors"
              >
                {BRAND_INFO.phone}
              </a>
              <span className="block text-[11px] text-[#B8B8B5]/60 mt-1">
                Mon – Sat • 10:00 AM – 8:00 PM IST
              </span>
            </div>

            <button
              onClick={scrollToTop}
              className="mt-8 inline-flex items-center gap-2 px-4 py-2 border border-[#FFFFFF]/15 hover:border-[#FFFFFF]/40 text-xs font-sans tracking-widest text-[#D8D8D5] hover:text-white transition-colors"
              aria-label="Back to Top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Bottom Sub-Row with subtle Admin button */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] font-sans text-[#B8B8B5]/50 gap-4">
          <p>© {new Date().getFullYear()} Jewel Botanica — Silver Jewellery. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="hover:text-stone-300 transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3 opacity-60" />
              <span>Admin Login</span>
              {isAdmin && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
