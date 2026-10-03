import React, { useState } from 'react';
import { X, MessageCircle, ShieldCheck, Check, ZoomIn, Film } from 'lucide-react';
import { JewelryItem } from '../types/jewelry';
import { BRAND_INFO } from '../data/jewelryData';

interface ProductDetailModalProps {
  item: JewelryItem | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ item, onClose }) => {
  const [zoomed, setZoomed] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!item) return null;

  const itemImages = item.images && item.images.length > 0 ? item.images : [item.image];
  const currentImage = itemImages[activeImageIndex] || item.image;

  const whatsappMessage = encodeURIComponent(
    `Hello Jewel Botanica, I am interested in inquiring about the "${item.name}" (${item.displayCategory}). Could you please share the pricing, availability, and customization details?`
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#0D0D0D] border border-[#FFFFFF]/15 rounded-sm overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)] max-h-[90vh] flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-[#D8D8D5] hover:text-white bg-[#080808]/70 rounded-full border border-white/10 transition-colors"
          aria-label="Close Preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Macro Image with Gallery & Zoom */}
        <div className="md:w-1/2 relative bg-[#080808] flex flex-col justify-between overflow-hidden min-h-[300px] md:min-h-[460px]">
          <div className="relative flex-1 flex items-center justify-center overflow-hidden">
            <img
              src={currentImage}
              alt={item.name}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover object-center transition-transform duration-700 cursor-zoom-in ${
                zoomed ? 'scale-150 cursor-zoom-out' : 'scale-100'
              }`}
              onClick={() => setZoomed(!zoomed)}
            />
            <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/70 backdrop-blur-sm rounded text-[10px] text-[#D8D8D5] flex items-center gap-1.5 pointer-events-none">
              <ZoomIn className="w-3 h-3" />
              <span>{zoomed ? 'Click to minimize' : 'Click to zoom'}</span>
            </div>
          </div>

          {/* Multiple Images Carousel Thumbnails */}
          {itemImages.length > 1 && (
            <div className="flex items-center gap-2 p-2 bg-[#080808] border-t border-[#1C1C1C] overflow-x-auto">
              {itemImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-12 h-12 rounded shrink-0 overflow-hidden border transition ${
                    activeImageIndex === idx
                      ? 'border-[#0E5A4F] ring-1 ring-[#0E5A4F]'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Details, Video link & Direct WhatsApp CTA */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-sans tracking-[0.25em] text-[#A2DEC8] uppercase mb-2">
              <span>{item.displayCategory}</span>
              <span className="text-white/20">•</span>
              <span>{item.category}</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-normal tracking-[0.06em] text-[#F5F2EA] mb-4">
              {item.name}
            </h3>

            <p className="font-sans text-xs sm:text-sm text-[#B8B8B5] leading-relaxed mb-6 font-light">
              {item.description}
            </p>

            {/* Video preview / player if available */}
            {item.videoUrl && (
              <div className="mb-6 p-3 bg-[#141414] border border-[#0E5A4F]/40 rounded-sm">
                <div className="flex items-center gap-2 text-xs text-[#A2DEC8] mb-2 font-sans tracking-wider uppercase">
                  <Film className="w-3.5 h-3.5 text-[#0E5A4F]" />
                  <span>Cinematic Product Video</span>
                </div>
                {item.videoUrl.startsWith('data:video') ? (
                  <video
                    src={item.videoUrl}
                    controls
                    className="w-full rounded border border-black/40 max-h-48"
                  />
                ) : (
                  <a
                    href={item.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#0E5A4F] hover:underline flex items-center gap-1.5"
                  >
                    <span>Watch High-Resolution Atelier Video Preview →</span>
                  </a>
                )}
              </div>
            )}

            {/* Specifications list */}
            <div className="space-y-2.5 pt-4 border-t border-[#FFFFFF]/10 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#FFFFFF]/5">
                <span className="text-[#B8B8B5]/70">Purity & Metal</span>
                <span className="text-[#F5F2EA] font-medium">{item.details?.metal || '92.5 Sterling Silver'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#FFFFFF]/5">
                <span className="text-[#B8B8B5]/70">Gemstone Details</span>
                <span className="text-[#F5F2EA] text-right font-medium">{item.details?.gemstones || 'Emeralds & Fine CZ'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#FFFFFF]/5">
                <span className="text-[#B8B8B5]/70">Artisan Finish</span>
                <span className="text-[#F5F2EA] font-medium">{item.details?.finish || 'Liquid Platinum Polish'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#FFFFFF]/5">
                <span className="text-[#B8B8B5]/70">Origin</span>
                <span className="text-[#F5F2EA] font-medium">{item.details?.origin || 'Hyderabad Atelier'}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#B8B8B5]/70">Custom Sizing / Stones</span>
                <span className="text-[#A2DEC8] flex items-center gap-1 font-medium">
                  <Check className="w-3.5 h-3.5" /> Available on Request
                </span>
              </div>
            </div>

            {/* Price Note */}
            <div className="mt-6 p-3 bg-[#141414] border border-[#FFFFFF]/10 rounded-sm">
              <p className="text-xs font-serif italic text-[#F5F2EA]">
                Prices and availability on enquiry.
              </p>
              <p className="text-[11px] text-[#B8B8B5]/70 mt-0.5">
                Each piece is handcrafted with certified 92.5 silver weight and customized to your requirements.
              </p>
            </div>
          </div>

          {/* Action on WhatsApp */}
          <div className="mt-8 pt-4">
            <a
              href={`${BRAND_INFO.whatsappUrl}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#0E5A4F] hover:bg-[#127567] text-[#F5F2EA] text-xs font-sans tracking-[0.2em] uppercase rounded-sm transition-all duration-300 shadow-[0_4px_18px_rgba(14,90,79,0.35)]"
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>Enquire on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
