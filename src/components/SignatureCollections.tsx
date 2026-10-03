import React, { useState } from 'react';
import { ArrowUpRight, ArrowLeft, MessageCircle, Eye, Sparkles } from 'lucide-react';
import { SIGNATURE_COLLECTIONS, CATALOGUE_ITEMS, BRAND_INFO } from '../data/jewelryData';
import { JewelryCategory, CollectionCard, JewelryItem } from '../types/jewelry';

interface SignatureCollectionsProps {
  onSelectCategory: (category: JewelryCategory) => void;
  onViewProduct?: (item: JewelryItem) => void;
  customCollections?: CollectionCard[];
  allProducts?: JewelryItem[];
}

export const SignatureCollections: React.FC<SignatureCollectionsProps> = ({
  onSelectCategory,
  onViewProduct,
  customCollections,
  allProducts,
}) => {
  const [selectedFolderCollection, setSelectedFolderCollection] = useState<CollectionCard | null>(null);

  const collections = customCollections && customCollections.length > 0 ? customCollections : SIGNATURE_COLLECTIONS;
  const products = allProducts && allProducts.length > 0 ? allProducts : CATALOGUE_ITEMS;

  // Filter products for the currently opened collection folder
  const matchingProducts = selectedFolderCollection
    ? products.filter((p) => {
        const pCat = (p.category || '').toUpperCase().trim();
        const pDisp = (p.displayCategory || '').toUpperCase().trim();
        const colCat = (selectedFolderCollection.category || '').toUpperCase().trim();
        const colName = (selectedFolderCollection.name || '').toUpperCase().trim();
        return (
          pCat === colCat ||
          pCat === colName ||
          pDisp.includes(colName) ||
          colName.includes(pCat)
        );
      })
    : [];

  const handleOpenFolder = (col: CollectionCard) => {
    setSelectedFolderCollection(col);
    // Smooth scroll to collections top
    const el = document.querySelector('#collections');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="collections"
      className="relative py-20 sm:py-28 px-6 sm:px-12 bg-[#080808] overflow-hidden"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(14,90,79,0.1)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto">
        {/* If a Collection Folder is open, display the Collection Folder view */}
        {selectedFolderCollection ? (
          <div className="space-y-10 animate-fadeIn">
            {/* Top Navigation Bar for Collection Folder */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#FFFFFF]/10">
              <button
                type="button"
                onClick={() => setSelectedFolderCollection(null)}
                className="inline-flex items-center gap-2 text-xs font-sans tracking-[0.2em] text-[#A2DEC8] hover:text-white uppercase transition-colors group cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Back to All Collections</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-sans tracking-[0.25em] text-[#D8D8D5] uppercase bg-[#141414] px-3 py-1.5 border border-[#FFFFFF]/10 rounded-none">
                  Collection Folder: {matchingProducts.length} Designs
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory(selectedFolderCollection.category);
                    setSelectedFolderCollection(null);
                  }}
                  className="px-4 py-1.5 text-[10px] font-sans tracking-[0.2em] uppercase bg-[#0E5A4F] text-white hover:bg-[#147A6A] transition-colors cursor-pointer"
                >
                  View in Full Catalogue
                </button>
              </div>
            </div>

            {/* Collection Editorial Banner Card */}
            <div className="bg-[#111111] border border-[#FFFFFF]/15 p-6 sm:p-8 rounded-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
              {/* Cover Image in clean contained black box */}
              <div className="md:col-span-4 aspect-[4/3] bg-black border border-[#262626] rounded-sm overflow-hidden flex items-center justify-center p-3">
                <img
                  src={selectedFolderCollection.image}
                  alt={selectedFolderCollection.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Information */}
              <div className="md:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#162522] border border-[#0E5A4F]/40 text-[#A2DEC8] text-[10px] uppercase font-sans tracking-[0.25em]">
                  <Sparkles className="w-3 h-3" />
                  <span>{selectedFolderCollection.itemCount || 'Curated Collection'}</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#F5F2EA] uppercase tracking-wider">
                  {selectedFolderCollection.name}
                </h2>

                <p className="text-sm text-[#B8B8B5] font-light leading-relaxed max-w-2xl">
                  {selectedFolderCollection.tagline}
                </p>

                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <a
                    href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
                      `Hello Jewel Botanica, I am browsing your "${selectedFolderCollection.name}" Collection and would like to see custom designs and pricing.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-black text-xs font-sans tracking-[0.15em] uppercase font-medium rounded-none transition shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Inquire on WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setSelectedFolderCollection(null)}
                    className="px-5 py-2.5 border border-[#FFFFFF]/20 hover:border-white text-xs font-sans tracking-[0.15em] text-[#F5F2EA] uppercase transition"
                  >
                    Browse Other Collections
                  </button>
                </div>
              </div>
            </div>

            {/* Products inside this Collection Folder */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#FFFFFF]/10 pb-3">
                <h3 className="font-serif text-lg sm:text-xl text-[#F5F2EA] uppercase tracking-wider">
                  Pieces in {selectedFolderCollection.name} ({matchingProducts.length})
                </h3>
                <span className="text-xs text-[#B8B8B5] font-light">
                  Handcrafted in Guaranteed 92.5 Sterling Silver
                </span>
              </div>

              {matchingProducts.length === 0 ? (
                <div className="py-16 text-center bg-[#111111] border border-dashed border-[#262626] rounded-sm p-8 space-y-4">
                  <p className="text-sm text-stone-400 font-light">
                    No individual catalogue items currently linked under this collection.
                  </p>
                  <p className="text-xs text-[#B8B8B5] max-w-md mx-auto">
                    You can add products to this collection from the Admin Portal, or contact our Hyderabad atelier on WhatsApp for bespoke bridal commissions.
                  </p>
                  <a
                    href={`${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
                      `Hello Jewel Botanica, I would like to inquire about bespoke commissions for the "${selectedFolderCollection.name}" collection.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0E5A4F] text-white text-xs uppercase tracking-wider transition hover:bg-[#147A6A]"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Request Custom {selectedFolderCollection.name}</span>
                  </a>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {matchingProducts.map((item) => {
                    const whatsappUrl = `${BRAND_INFO.whatsappUrl}?text=${encodeURIComponent(
                      `Hello Jewel Botanica, I am interested in inquiring about "${item.name}" from your ${selectedFolderCollection.name} collection.`
                    )}`;

                    return (
                      <div
                        key={item.id}
                        className="group bg-[#111111] border border-[#FFFFFF]/10 hover:border-[#0E5A4F] transition-all duration-300 flex flex-col justify-between rounded-sm overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                      >
                        {/* Product Image Frame */}
                        <div className="relative aspect-[4/3] w-full bg-black flex items-center justify-center overflow-hidden border-b border-[#202020] p-2">
                          <img
                            src={item.image || (item.images && item.images[0])}
                            alt={item.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div>
                            <span className="text-[10px] font-sans tracking-[0.2em] text-[#A2DEC8] uppercase block font-medium">
                              {item.category}
                            </span>
                            <h4 className="font-serif text-base text-[#F5F2EA] uppercase tracking-wider mt-1 truncate">
                              {item.name}
                            </h4>
                            <p className="text-xs text-[#B8B8B5] font-light line-clamp-2 mt-1.5">
                              {item.description}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-[#202020] flex items-center justify-between gap-2">
                            <a
                              href={whatsappUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2 px-3 bg-[#1B1B1B] hover:bg-[#25D366] text-white hover:text-black text-[11px] font-sans tracking-wider uppercase transition-colors text-center flex items-center justify-center gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Inquire</span>
                            </a>
                            {onViewProduct && (
                              <button
                                type="button"
                                onClick={() => onViewProduct(item)}
                                className="py-2 px-3 border border-[#333333] hover:border-white text-stone-300 hover:text-white text-[11px] font-sans tracking-wider uppercase transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Details</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Default: All 9 Collections Grid - Perfectly uniform, equal-size, headings strictly under image */
          <>
            {/* Section Header */}
            <div className="text-center mb-14 pb-6 border-b border-[#FFFFFF]/10">
              <h2 className="font-serif text-2xl sm:text-3xl md:text-[2.2rem] font-light tracking-[0.08em] text-[#F5F2EA] uppercase">
                The Collections
              </h2>
              <p className="text-xs sm:text-sm text-[#B8B8B5] font-light tracking-wide mt-2">
                Click any collection to open its folder and explore curated jewellery designs
              </p>
            </div>

            {/* Editorial Collections Grid: 9 uniform equal-size cards in clean alignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
              {collections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => handleOpenFolder(col)}
                  className="group relative cursor-pointer overflow-hidden rounded-sm bg-[#111111] border border-[#FFFFFF]/10 hover:border-[#0E5A4F] transition-all duration-500 flex flex-col h-full justify-between shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_15px_40px_rgba(14,90,79,0.25)]"
                >
                  {/* Top: Contained Aspect Frame (4:3) with centered object-contain on solid black background */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black flex items-center justify-center border-b border-[#202020] shrink-0">
                    <img
                      src={col.image}
                      alt={`${col.name} - Jewel Botanica Silver Jewellery`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain object-center transform scale-100 group-hover:scale-105 transition-transform duration-700 ease-out p-2"
                    />
                  </div>

                  {/* Card Details: Names placed UNDER the image with strict uniform fixed heights so all cards align evenly */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-[#111111]">
                    <div>
                      {/* Line 1: Small Green Subheading / Badge - strictly uniform 20px height */}
                      <div className="h-5 flex items-center mb-1">
                        <span className="text-[10px] sm:text-[11px] font-sans tracking-[0.25em] text-[#A2DEC8] uppercase font-semibold block truncate">
                          {col.itemCount || 'Curated Collection'}
                        </span>
                      </div>

                      {/* Line 2: Main Collection Heading + Arrow Action - strictly uniform 28px height */}
                      <div className="h-7 flex items-center justify-between gap-3 mb-2">
                        <h3 className="font-serif text-lg sm:text-xl text-[#F5F2EA] tracking-wider uppercase group-hover:text-[#A2DEC8] transition-colors truncate">
                          {col.name}
                        </h3>
                        <div className="w-7 h-7 rounded-full bg-[#181818] border border-[#FFFFFF]/20 flex items-center justify-center text-white group-hover:border-[#0E5A4F] group-hover:text-[#A2DEC8] transition-colors shrink-0">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </div>
                      </div>

                      {/* Line 3: Narrative Description - strictly clamped to 2 lines with 40px fixed height */}
                      <div className="h-10">
                        <p className="text-xs text-[#B8B8B5] font-light leading-relaxed line-clamp-2">
                          {col.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Line 4: Bottom Explore Collection CTA - strictly uniform footer */}
                    <div className="pt-3.5 mt-3 border-t border-[#FFFFFF]/10 flex items-center justify-between text-[11px] font-sans tracking-widest text-[#D8D8D5] group-hover:text-[#A2DEC8] transition-colors">
                      <span>OPEN COLLECTION FOLDER</span>
                      <span className="text-[#0E5A4F] group-hover:translate-x-1.5 transition-transform font-bold">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};
