import React, { useState } from 'react';
import { MessageCircle, Instagram, MapPin, ArrowRight, Clock, Send } from 'lucide-react';
import { BRAND_INFO } from '../data/jewelryData';
import { submitInquiry } from '../lib/inquiryService';

export const ContactSection: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userLocation, setUserLocation] = useState('');
  const [userQuery, setUserQuery] = useState('');

  const handleCustomSend = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim() || !userEmail.trim() || !userPhone.trim()) {
      return;
    }

    // Persist inquiry to Firestore
    submitInquiry({
      source: 'CONTACT_CONVERSATION',
      name: userName.trim(),
      email: userEmail.trim(),
      phone: userPhone.trim(),
      location: userLocation.trim(),
      inquiry: userQuery.trim() || 'I would like to explore your bridal silver jewellery collection.',
    }).catch((err) => console.warn('Inquiry background sync:', err));

    const text = `Hello Jewel Botanica,\nName: ${userName.trim()}\nEmail: ${userEmail.trim()}\nPhone: ${userPhone.trim()}\nCity: ${userLocation.trim() || 'India/Worldwide'}\nQuery: ${userQuery.trim() || 'I would like to explore your bridal silver jewellery collection.'}`;
    window.open(`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section
      id="contact"
      className="relative py-24 sm:py-36 px-6 sm:px-12 bg-[#060606] overflow-hidden"
    >
      {/* Background Soft Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(circle,rgba(14,90,79,0.15)_0%,transparent_75%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 2-Column Contact Suite */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch max-w-5xl mx-auto">
          
          {/* Left Column: Direct Atelier Coordinates */}
          <div className="lg:col-span-5 bg-[#0D0D0D] border border-[#FFFFFF]/15 p-8 rounded-sm flex flex-col justify-between shadow-2xl">
            <div>
              <span className="text-[10px] font-sans tracking-[0.3em] uppercase text-[#A2DEC8] block mb-2">
                Atelier Channels
              </span>

              <h3 className="font-bodoni font-normal text-sm sm:text-base md:text-lg text-[#FFFFFF] tracking-[0.2em] sm:tracking-[0.24em] uppercase mb-8 block leading-tight whitespace-nowrap">
                JEWEL BOTANICA
              </h3>

              <div className="space-y-6">
                {/* WhatsApp */}
                <a
                  href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
                    'Hello Jewel Botanica, I would like to connect with your jewellery team.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group p-3 -mx-3 rounded hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#FFFFFF]/15 flex items-center justify-center text-[#A2DEC8] group-hover:border-[#0E5A4F] transition-colors shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-sans tracking-[0.2em] text-[#B8B8B5]/70 uppercase block">
                      WhatsApp Concierge
                    </span>
                    <span className="text-sm font-sans font-medium text-[#F5F2EA] group-hover:text-[#A2DEC8] transition-colors">
                      {BRAND_INFO.phone}
                    </span>
                  </div>
                </a>

                {/* Instagram */}
                <a
                  href={BRAND_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-4 group p-3 -mx-3 rounded hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#FFFFFF]/15 flex items-center justify-center text-[#E1306C] group-hover:border-[#E1306C] transition-colors shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-sans tracking-[0.2em] text-[#B8B8B5]/70 uppercase block">
                      Instagram Showcase
                    </span>
                    <span className="text-sm font-sans font-medium text-[#F5F2EA] group-hover:text-[#A2DEC8] transition-colors">
                      {BRAND_INFO.instagram}
                    </span>
                  </div>
                </a>

                {/* Location */}
                <div className="flex items-start gap-4 p-3 -mx-3">
                  <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#FFFFFF]/15 flex items-center justify-center text-[#D8D8D5] shrink-0">
                    <MapPin className="w-4 h-4 text-[#0E5A4F]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-sans tracking-[0.2em] text-[#B8B8B5]/70 uppercase block">
                      Atelier Location
                    </span>
                    <span className="text-sm font-sans font-medium text-[#F5F2EA]">
                      Hyderabad, Telangana, India
                    </span>
                    <span className="text-[11px] text-[#B8B8B5]/60 block mt-0.5">
                      Worldwide Insured Shipping
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#FFFFFF]/10 text-[11px] text-[#B8B8B5]/60 leading-relaxed font-light">
              We respond promptly to all bridal enquiries, order requests, and customisation appointments.
            </div>
          </div>

          {/* Right Column: Direct Consultation Form -> WhatsApp */}
          <div className="lg:col-span-7 bg-[#111111] border border-[#FFFFFF]/15 p-8 rounded-sm flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-2xl tracking-[0.08em] text-[#F5F2EA] uppercase">
                    Start a Conversation
                  </h3>
                  <p className="text-xs text-[#B8B8B5]/70 mt-1">
                    Send an instant inquiry straight to our WhatsApp atelier team.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCustomSend} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-sans tracking-[0.25em] text-[#D8D8D5] uppercase mb-1.5">
                    Your Name <span className="text-[#1FD286] font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-3 bg-[#080808] border border-[#FFFFFF]/15 focus:border-[#0E5A4F] text-xs text-[#F5F2EA] rounded-none outline-none transition-colors font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-[0.25em] text-[#D8D8D5] uppercase mb-1.5">
                    Email Address <span className="text-[#1FD286] font-bold">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-3 bg-[#080808] border border-[#FFFFFF]/15 focus:border-[#0E5A4F] text-xs text-[#F5F2EA] rounded-none outline-none transition-colors font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-[0.25em] text-[#D8D8D5] uppercase mb-1.5">
                    Phone Number <span className="text-[#1FD286] font-bold">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-3 bg-[#080808] border border-[#FFFFFF]/15 focus:border-[#0E5A4F] text-xs text-[#F5F2EA] rounded-none outline-none transition-colors font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-[0.25em] text-[#D8D8D5] uppercase mb-1.5">
                    Your City / Country
                  </label>
                  <input
                    type="text"
                    value={userLocation}
                    onChange={(e) => setUserLocation(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-3 bg-[#080808] border border-[#FFFFFF]/15 focus:border-[#0E5A4F] text-xs text-[#F5F2EA] rounded-none outline-none transition-colors font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-sans tracking-[0.25em] text-[#D8D8D5] uppercase mb-1.5">
                    How can we assist you?
                  </label>
                  <textarea
                    rows={3}
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-3 bg-[#080808] border border-[#FFFFFF]/15 focus:border-[#0E5A4F] text-xs text-[#F5F2EA] rounded-none outline-none transition-colors font-sans resize-none"
                  />
                </div>

                {/* Primary CTA */}
                <button
                  type="submit"
                  className="w-full mt-4 flex items-center justify-center gap-3 py-4 bg-[#0E5A4F] hover:bg-[#127567] text-[#F5F2EA] text-xs font-sans tracking-[0.25em] uppercase rounded-none transition-all duration-300 shadow-[0_4px_24px_rgba(14,90,79,0.35)] group"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>Start A Conversation →</span>
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-[11px] text-[#B8B8B5]/50 tracking-wide font-sans">
              Instant connection to WhatsApp: +91 99592 76259
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
