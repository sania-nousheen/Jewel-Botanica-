import React, { useState } from 'react';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { BRAND_INFO } from '../data/jewelryData';
import { submitInquiry } from '../lib/inquiryService';
import { PageSectionItem } from '../lib/websiteSettingsService';

interface CustomizationProps {
  sectionData?: PageSectionItem;
}

export const Customization: React.FC<CustomizationProps> = ({ sectionData }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jewelleryType, setJewelleryType] = useState('');
  const [inquiry, setInquiry] = useState('');

  const headingText = sectionData?.heading || 'Bespoke Design Inquiry';
  const matterText =
    sectionData?.matterText || 'Select your preferences below to initiate a personal WhatsApp consultation.';

  // Track if user attempted submission to show validation warnings
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Validation: Name, Email, Phone Number, Jewellery Type are strictly mandatory
  const isNameValid = name.trim().length > 0;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPhoneValid = phoneNumber.trim().length >= 7;
  const isJewelleryTypeValid = jewelleryType.trim().length > 0;

  const isFormValid = isNameValid && isEmailValid && isPhoneValid && isJewelleryTypeValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);

    if (!isFormValid) {
      return;
    }

    // Persist to Firestore Inquiries collection so Admin can see it in portal
    submitInquiry({
      source: 'BESPOKE_CUSTOMIZATION',
      name: name.trim(),
      email: email.trim(),
      phone: phoneNumber.trim(),
      jewelleryType: jewelleryType.trim(),
      inquiry: inquiry.trim(),
    }).catch((err) => console.warn('Inquiry background sync:', err));

    // Compose formatted WhatsApp consultation message with all customer details
    const message = [
      `Hello Jewel Botanica, I would like to discuss a bespoke design:`,
      `• Name: ${name.trim()}`,
      `• Email: ${email.trim()}`,
      `• Phone Number: ${phoneNumber.trim()}`,
      `• Jewellery Type: ${jewelleryType.trim()}`,
      inquiry.trim() ? `• Inquiry Details: ${inquiry.trim()}` : null,
      `Looking forward to consulting with your Hyderabad atelier.`,
    ]
      .filter(Boolean)
      .join('\n');

    const whatsappUrl = `${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  };

  return (
    <section
      id="customization"
      style={{
        backgroundColor: sectionData?.advanced?.backgroundColor || '#080808',
        paddingTop: sectionData?.advanced?.paddingTop ? `${sectionData.advanced.paddingTop}px` : undefined,
        paddingBottom: sectionData?.advanced?.paddingBottom ? `${sectionData.advanced.paddingBottom}px` : undefined,
        minHeight: sectionData?.advanced?.minHeightVh ? `${sectionData.advanced.minHeightVh}vh` : undefined,
      }}
      className="relative py-24 sm:py-32 px-6 sm:px-12 bg-[#080808] overflow-hidden"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[radial-gradient(circle,rgba(14,90,79,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div
        className={`mx-auto ${
          sectionData?.advanced?.contentWidth === 'Boxed' ? 'max-w-3xl' : 'max-w-4xl'
        }`}
      >
        {/* Centered Bespoke Design Inquiry Box */}
        <div className="bg-[#111111] border border-[#FFFFFF]/15 p-6 sm:p-10 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative">
          {/* Header */}
          <div
            className="flex items-center justify-between pb-6 border-b border-[#FFFFFF]/10 mb-8"
            style={{ textAlign: sectionData?.typography?.textAlign || 'left' }}
          >
            <div className="w-full">
              {sectionData?.badgeText && (
                <span
                  style={{
                    color: sectionData?.typography?.subheadingColor || '#A2DEC8',
                    fontSize: sectionData?.typography?.subheadingSizePx
                      ? `${sectionData.typography.subheadingSizePx}px`
                      : undefined,
                  }}
                  className="text-[10px] font-sans tracking-[0.25em] uppercase text-[#A2DEC8] block mb-1.5"
                >
                  {sectionData.badgeText}
                </span>
              )}
              <h3
                style={{
                  fontFamily: sectionData?.typography?.fontFamily || undefined,
                  color: sectionData?.typography?.headingColor || '#F5F2EA',
                  fontSize: sectionData?.typography?.headingSizePx
                    ? `${sectionData.typography.headingSizePx}px`
                    : undefined,
                  fontWeight: sectionData?.typography?.fontWeight || undefined,
                }}
                className="font-serif text-2xl tracking-[0.08em] text-[#F5F2EA] uppercase"
              >
                {headingText}
              </h3>
              <p
                style={{
                  color: sectionData?.typography?.bodyColor || '#B8B8B5',
                  fontSize: sectionData?.typography?.bodySizePx
                    ? `${sectionData.typography.bodySizePx}px`
                    : undefined,
                }}
                className="text-xs text-[#B8B8B5]/80 mt-1 whitespace-pre-line"
              >
                {matterText}
              </p>
            </div>
          </div>

          {/* Form with Name, Email, Phone Number, Jewellery Type, Inquiry */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Field: Name (Mandatory) */}
              <div className="space-y-2">
                <label className="block text-[11px] font-sans tracking-[0.2em] text-[#D8D8D5] uppercase">
                  Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=""
                  className={`w-full bg-[#161616] border ${
                    attemptedSubmit && !isNameValid
                      ? 'border-rose-500'
                      : 'border-[#2B2B2B] focus:border-[#0E5A4F]'
                  } px-4 py-3 text-sm text-[#F5F2EA] focus:outline-none transition rounded-sm`}
                />
                {attemptedSubmit && !isNameValid && (
                  <p className="text-[10px] text-rose-400 font-sans">Name is mandatory.</p>
                )}
              </div>

              {/* Field: Email (Mandatory) */}
              <div className="space-y-2">
                <label className="block text-[11px] font-sans tracking-[0.2em] text-[#D8D8D5] uppercase">
                  Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  className={`w-full bg-[#161616] border ${
                    attemptedSubmit && !isEmailValid
                      ? 'border-rose-500'
                      : 'border-[#2B2B2B] focus:border-[#0E5A4F]'
                  } px-4 py-3 text-sm text-[#F5F2EA] focus:outline-none transition rounded-sm`}
                />
                {attemptedSubmit && !isEmailValid && (
                  <p className="text-[10px] text-rose-400 font-sans">
                    Please provide a valid email address.
                  </p>
                )}
              </div>

              {/* Field: Phone Number (Mandatory) */}
              <div className="space-y-2">
                <label className="block text-[11px] font-sans tracking-[0.2em] text-[#D8D8D5] uppercase">
                  Phone Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder=""
                  className={`w-full bg-[#161616] border ${
                    attemptedSubmit && !isPhoneValid
                      ? 'border-rose-500'
                      : 'border-[#2B2B2B] focus:border-[#0E5A4F]'
                  } px-4 py-3 text-sm text-[#F5F2EA] focus:outline-none transition rounded-sm`}
                />
                {attemptedSubmit && !isPhoneValid && (
                  <p className="text-[10px] text-rose-400 font-sans">Phone number is mandatory.</p>
                )}
              </div>

              {/* Field: Jewellery Type (Mandatory) */}
              <div className="space-y-2">
                <label className="block text-[11px] font-sans tracking-[0.2em] text-[#D8D8D5] uppercase">
                  Jewellery Type <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={jewelleryType}
                  onChange={(e) => setJewelleryType(e.target.value)}
                  placeholder=""
                  className={`w-full bg-[#161616] border ${
                    attemptedSubmit && !isJewelleryTypeValid
                      ? 'border-rose-500'
                      : 'border-[#2B2B2B] focus:border-[#0E5A4F]'
                  } px-4 py-3 text-sm text-[#F5F2EA] focus:outline-none transition rounded-sm`}
                />
                {attemptedSubmit && !isJewelleryTypeValid && (
                  <p className="text-[10px] text-rose-400 font-sans">
                    Jewellery type is mandatory.
                  </p>
                )}
              </div>
            </div>

            {/* Field: Inquiry (Big Blank Box) */}
            <div className="space-y-2 pt-1">
              <label className="block text-[11px] font-sans tracking-[0.2em] text-[#D8D8D5] uppercase">
                Inquiry
              </label>
              <textarea
                rows={4}
                value={inquiry}
                onChange={(e) => setInquiry(e.target.value)}
                placeholder=""
                className="w-full bg-[#161616] border border-[#2B2B2B] focus:border-[#0E5A4F] p-4 text-sm text-[#F5F2EA] focus:outline-none transition leading-relaxed rounded-sm"
              />
            </div>

            {/* Button: DISCUSS YOUR DESIGN */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-3 py-4 bg-[#0E5A4F] hover:bg-[#127567] active:bg-[#0B483F] text-[#F5F2EA] text-xs font-sans tracking-[0.24em] uppercase transition-all duration-300 shadow-[0_4px_20px_rgba(14,90,79,0.4)] group cursor-pointer rounded-sm"
              >
                <MessageCircle className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
                <span>Discuss Your Design</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
