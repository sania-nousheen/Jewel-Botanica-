import React, { useState, useEffect } from 'react';
import { X, Tag, Sparkles, MessageCircle, ArrowRight, Copy, Check } from 'lucide-react';
import { PromoPopupSettings } from '../lib/websiteSettingsService';
import { BRAND_INFO } from '../data/jewelryData';

interface PromoDiscountPopupProps {
  settings: PromoPopupSettings;
}

export const PromoDiscountPopup: React.FC<PromoDiscountPopupProps> = ({ settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!settings.enabled) {
      setIsOpen(false);
      return;
    }

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem('jb_promo_dismissed');
    if (dismissed === 'true') {
      return;
    }

    // Delay slightly for smooth editorial presentation
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2800);

    return () => clearTimeout(timer);
  }, [settings.enabled]);

  if (!isOpen || !settings.enabled) return null;

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('jb_promo_dismissed', 'true');
  };

  const handleCopyCode = () => {
    if (settings.couponCode) {
      navigator.clipboard.writeText(settings.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaimOffer = () => {
    const defaultMsg = `Hello Jewel Botanica, I would like to redeem promo coupon ${settings.couponCode} for my bespoke 92.5 silver jewellery order.`;
    const message = settings.whatsappMessage || defaultMsg;
    const whatsappUrl = `${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#0F0F0F] border border-[#2B2B2B] rounded-sm p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden"
      >
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#0E5A4F]/25 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#1FD286]/10 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Close promotion dialog"
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#162723] border border-[#0E5A4F] text-[#A2DEC8] text-[10px] tracking-[0.25em] uppercase rounded-full mb-4">
          <Sparkles className="w-3 h-3 text-[#1FD286]" />
          <span>{settings.discountBadge || 'ATELIER PRIVILEGE'}</span>
        </div>

        {/* Main Heading */}
        <h3 className="font-serif text-2xl sm:text-3xl text-[#F5F2EA] tracking-[0.06em] uppercase mb-3">
          {settings.title || 'Festive Celebration Offer'}
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed mb-6">
          {settings.description ||
            'Explore our handcrafted 92.5 sterling silver collections. Claim your bespoke consultation privilege today.'}
        </p>

        {/* Coupon Code Pill */}
        {settings.couponCode && (
          <div className="mb-6 p-4 bg-[#161616] border border-dashed border-[#0E5A4F] rounded-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-stone-400 block font-mono">
                Privilege Coupon Code
              </span>
              <span className="text-base sm:text-lg font-mono font-bold tracking-widest text-[#1FD286]">
                {settings.couponCode}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#202020] hover:bg-[#2A2A2A] text-xs text-[#E5E0D5] rounded transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Primary CTA */}
        <div className="space-y-3">
          <button
            onClick={handleClaimOffer}
            className="w-full py-3.5 sm:py-4 bg-[#0E5A4F] hover:bg-[#127567] text-[#F5F2EA] text-xs font-sans tracking-[0.22em] uppercase rounded-sm transition-all shadow-[0_4px_20px_rgba(14,90,79,0.4)] flex items-center justify-center gap-2 cursor-pointer group"
          >
            <MessageCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            <span>{settings.buttonText || 'CLAIM PRIVILEGE VIA WHATSAPP'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={handleClose}
            className="w-full text-center text-[11px] text-stone-400 hover:text-stone-200 transition cursor-pointer tracking-wider"
          >
            Continue browsing collections
          </button>
        </div>
      </div>
    </div>
  );
};
