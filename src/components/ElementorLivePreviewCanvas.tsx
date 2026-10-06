import React from 'react';
import { Monitor, Tablet, Smartphone, Edit3, Trash2, Layers, Sparkles } from 'lucide-react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { BrandIntro } from './BrandIntro';
import { SignatureCollections } from './SignatureCollections';
import { StatementJewellery } from './StatementJewellery';
import { Catalogue } from './Catalogue';
import { ArtOfSilver } from './ArtOfSilver';
import { Customization } from './Customization';
import { WhyJewelBotanica } from './WhyJewelBotanica';
import { InstagramGrid } from './InstagramGrid';
import { ContactSection } from './ContactSection';
import { Footer } from './Footer';
import {
  HeroSlideItem,
  PageSectionItem,
  WebsiteImagesSettings,
  SocialIconItem,
  CustomWidgetItem,
  ProfileSettings,
  WidgetType,
} from '../lib/websiteSettingsService';
import { CollectionCard, JewelryCategory, JewelryItem } from '../types/jewelry';

interface ElementorLivePreviewCanvasProps {
  responsivePreviewMode: 'DESKTOP' | 'TABLET' | 'MOBILE';
  setResponsivePreviewMode: (mode: 'DESKTOP' | 'TABLET' | 'MOBILE') => void;
  hasUnsavedChanges: boolean;
  isPublishing: boolean;
  onPublishAll: () => void;
  onDiscardDraft: () => void;
  heroSlides: HeroSlideItem[];
  pageSections: PageSectionItem[];
  websiteImages: WebsiteImagesSettings;
  socialIcons: SocialIconItem[];
  customWidgets: CustomWidgetItem[];
  collections: CollectionCard[];
  profile: ProfileSettings;
  productsList: JewelryItem[];
  selectedSectionId: string;
  onSelectSectionToEdit: (sectionId: string) => void;
  draggedWidgetType: WidgetType | null;
  dragOverWidgetTargetId: string | null;
  setDragOverWidgetTargetId: (id: string | null) => void;
  onDropWidgetOnSection: (widgetType: WidgetType, sectionId: string) => void;
  onDeleteWidget: (widgetId: string) => void;
}

export const ElementorLivePreviewCanvas: React.FC<ElementorLivePreviewCanvasProps> = ({
  responsivePreviewMode,
  setResponsivePreviewMode,
  hasUnsavedChanges,
  isPublishing,
  onPublishAll,
  onDiscardDraft,
  heroSlides,
  pageSections,
  websiteImages,
  socialIcons,
  customWidgets,
  collections,
  profile,
  productsList,
  selectedSectionId,
  onSelectSectionToEdit,
  draggedWidgetType,
  dragOverWidgetTargetId,
  setDragOverWidgetTargetId,
  onDropWidgetOnSection,
  onDeleteWidget,
}) => {
  const [previewCategory, setPreviewCategory] = React.useState<JewelryCategory>('ALL');

  const viewportWidthClass =
    responsivePreviewMode === 'MOBILE'
      ? 'w-[375px] max-w-full'
      : responsivePreviewMode === 'TABLET'
      ? 'w-[768px] max-w-full'
      : 'w-full';

  return (
    <div className="flex flex-col h-full bg-[#070707] border border-[#242424] rounded-sm overflow-hidden shadow-2xl">
      {/* Elementor Top Toolbar: Responsive Modes (Desktop / Tablet / Mobile) + Live Preview Status + Publish Button */}
      <div className="bg-[#121212] border-b border-[#262626] px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-[#182825] text-[#A2DEC8] border border-[#0E5A4F]/50">
            <Sparkles className="w-3 h-3 text-[#1FD286]" />
            <span>Live Website Preview</span>
          </span>
          {hasUnsavedChanges ? (
            <span className="text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-700/60">
              Unsaved Draft Changes (Click Publish to Save)
            </span>
          ) : (
            <span className="text-[10px] font-sans uppercase tracking-wider px-2 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800">
              Synced &amp; Published
            </span>
          )}
        </div>

        {/* Elementor Top 3 Responsive Modes (Desktop / Tablet / Mobile) */}
        <div className="flex items-center gap-1 bg-[#0A0A0A] p-1 border border-[#282828] rounded">
          <button
            type="button"
            onClick={() => setResponsivePreviewMode('DESKTOP')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase flex items-center gap-1.5 cursor-pointer transition ${
              responsivePreviewMode === 'DESKTOP'
                ? 'bg-[#0E5A4F] text-white font-semibold shadow'
                : 'text-stone-400 hover:text-white'
            }`}
            title="Desktop Preview (100%)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setResponsivePreviewMode('TABLET')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase flex items-center gap-1.5 cursor-pointer transition ${
              responsivePreviewMode === 'TABLET'
                ? 'bg-[#0E5A4F] text-white font-semibold shadow'
                : 'text-stone-400 hover:text-white'
            }`}
            title="Tablet Preview (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>Tab</span>
          </button>
          <button
            type="button"
            onClick={() => setResponsivePreviewMode('MOBILE')}
            className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase flex items-center gap-1.5 cursor-pointer transition ${
              responsivePreviewMode === 'MOBILE'
                ? 'bg-[#0E5A4F] text-white font-semibold shadow'
                : 'text-stone-400 hover:text-white'
            }`}
            title="Mobile Preview (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Discard & Publish Action Buttons */}
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <button
              type="button"
              onClick={onDiscardDraft}
              className="px-2.5 py-1.5 bg-[#1B1B1B] hover:bg-stone-800 text-stone-300 text-[10px] font-sans uppercase tracking-wider rounded border border-[#333333] cursor-pointer transition"
            >
              Discard Draft
            </button>
          )}
          <button
            type="button"
            onClick={onPublishAll}
            disabled={isPublishing}
            className={`px-4 py-1.5 text-[11px] font-sans uppercase tracking-widest font-semibold rounded transition cursor-pointer shadow-lg ${
              hasUnsavedChanges
                ? 'bg-[#1FD286] hover:bg-[#19b372] text-black animate-pulse'
                : 'bg-[#0E5A4F] hover:bg-[#147A6A] text-white'
            }`}
          >
            {isPublishing ? 'Publishing...' : 'Publish / Save Changes'}
          </button>
        </div>
      </div>

      {/* Interactive Website Viewport Frame */}
      <div className="flex-1 overflow-y-auto bg-[#040404] p-2 sm:p-4 flex justify-center">
        <div
          className={`${viewportWidthClass} transition-all duration-300 bg-[#080808] text-[#F5F2EA] border border-[#262626] shadow-[0_25px_70px_rgba(0,0,0,0.95)] rounded-sm overflow-x-hidden relative`}
        >
          {/* Top Viewport Dimension Indicator Bar */}
          <div className="bg-[#101010] border-b border-[#222222] px-3 py-1.5 flex items-center justify-between text-[10px] font-mono text-stone-400">
            <span>
              VIEWPORT: {responsivePreviewMode} (
              {responsivePreviewMode === 'MOBILE'
                ? '375px Mobile Screen'
                : responsivePreviewMode === 'TABLET'
                ? '768px Tablet Screen'
                : 'Full Desktop Screen'}
              )
            </span>
            <span className="text-[#A2DEC8]">Click any section to edit or drag widgets here</span>
          </div>

          {/* Live Website Navbar */}
          <div className="relative pointer-events-none opacity-95">
            <Navbar logoImage={websiteImages?.brandLogo} />
          </div>

          {/* Live Website Sections */}
          <main>
            {pageSections
              .filter((sec) => sec.visible)
              .map((sec, idx) => {
                const isSelected = selectedSectionId === sec.id;
                const isDragTarget = dragOverWidgetTargetId === sec.id;
                const sectionWidgets = (customWidgets || []).filter(
                  (w) => w.visible && w.targetSectionId === sec.id
                );

                const renderSection = () => {
                  switch (sec.id) {
                    case 'hero':
                      return (
                        <Hero
                          onExploreClick={() => {}}
                          introActive={false}
                          customSlides={heroSlides}
                          sectionData={sec}
                        />
                      );
                    case 'brandIntro':
                      return (
                        <BrandIntro
                          customImage={sec.image || websiteImages?.aboutSectionImage}
                          sectionData={sec}
                        />
                      );
                    case 'collections':
                      return (
                        <SignatureCollections
                          onSelectCategory={(cat) => setPreviewCategory(cat)}
                          customCollections={collections}
                          allProducts={productsList}
                          sectionData={sec}
                        />
                      );
                    case 'statementJewellery':
                      return (
                        <StatementJewellery
                          onViewSignature={() => {}}
                          customImage={sec.image || websiteImages?.statementHaaramImage}
                          sectionData={sec}
                        />
                      );
                    case 'catalogue':
                      return (
                        <Catalogue
                          activeCategory={previewCategory}
                          onSelectCategory={(cat) => setPreviewCategory(cat)}
                          onViewProduct={() => {}}
                          sectionData={sec}
                        />
                      );
                    case 'artOfSilver':
                      return (
                        <ArtOfSilver
                          customBannerImage={sec.image || websiteImages?.craftsmanshipBanner}
                          sectionData={sec}
                        />
                      );
                    case 'customization':
                      return <Customization sectionData={sec} />;
                    case 'whyJewelBotanica':
                      return <WhyJewelBotanica sectionData={sec} />;
                    case 'instagram':
                      return (
                        <InstagramGrid
                          customLogoImage={websiteImages?.brandLogo}
                          sectionData={sec}
                        />
                      );
                    case 'contact':
                      return <ContactSection sectionData={sec} />;
                    default:
                      return (
                        <section
                          style={{
                            backgroundColor: sec.advanced?.backgroundColor || '#0B0B0B',
                            paddingTop: sec.advanced?.paddingTop ? `${sec.advanced.paddingTop}px` : '80px',
                            paddingBottom: sec.advanced?.paddingBottom
                              ? `${sec.advanced.paddingBottom}px`
                              : '80px',
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
                                      maxHeight: sec.imageStyle?.heightPx
                                        ? `${sec.imageStyle.heightPx}px`
                                        : '480px',
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
                            </div>
                          </div>
                        </section>
                      );
                  }
                };

                return (
                  <div
                    key={sec.id}
                    onClick={() => onSelectSectionToEdit(sec.id)}
                    onDragOver={(e) => {
                      if (draggedWidgetType) {
                        e.preventDefault();
                        setDragOverWidgetTargetId(sec.id);
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverWidgetTargetId === sec.id) {
                        setDragOverWidgetTargetId(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOverWidgetTargetId(null);
                      if (draggedWidgetType) {
                        onDropWidgetOnSection(draggedWidgetType, sec.id);
                      }
                    }}
                    className={`relative group/sec transition-all ${
                      isSelected
                        ? 'ring-2 ring-[#0E5A4F] ring-inset'
                        : 'hover:ring-1 hover:ring-[#A2DEC8]/50 hover:ring-inset'
                    } ${isDragTarget ? 'ring-4 ring-[#1FD286] bg-[#0E5A4F]/10' : ''}`}
                  >
                    {/* Elementor Floating Section Handle Bar */}
                    <div className="sticky top-0 z-30 flex items-center justify-between px-3 py-1 bg-[#0E5A4F]/95 text-white text-[10px] font-mono uppercase tracking-wider opacity-0 group-hover/sec:opacity-100 transition-opacity cursor-pointer shadow">
                      <div className="flex items-center gap-2">
                        <Layers className="w-3 h-3 text-[#A2DEC8]" />
                        <span>
                          Section #{idx + 1}: {sec.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Edit3 className="w-3 h-3" />
                        <span>Click to Edit Section</span>
                      </div>
                    </div>

                    {isDragTarget && (
                      <div className="bg-[#1FD286]/20 border-2 border-dashed border-[#1FD286] text-[#A2DEC8] text-xs font-mono uppercase tracking-widest py-3 text-center">
                        Drop &ldquo;{draggedWidgetType}&rdquo; Widget Into {sec.label}
                      </div>
                    )}

                    {renderSection()}

                    {/* Render Widgets Placed in this Page or Section */}
                    {sectionWidgets.map((w) => (
                      <div
                        key={w.id}
                        style={{
                          backgroundColor: w.backgroundColor || '#0A0A0A',
                          paddingTop: `${w.paddingVerticalPx || 32}px`,
                          paddingBottom: `${w.paddingVerticalPx || 32}px`,
                          textAlign: w.alignment || 'center',
                        }}
                        className="relative px-6 sm:px-12 border-t border-[#0E5A4F]/30 group/widget"
                      >
                        <div className="absolute top-2 right-2 opacity-0 group-hover/widget:opacity-100 transition flex items-center gap-2 bg-black/90 border border-white/15 px-2 py-1 rounded z-20">
                          <span className="text-[9px] font-mono text-[#A2DEC8] uppercase">
                            Widget: {w.type}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteWidget(w.id);
                            }}
                            className="text-rose-400 hover:text-rose-300 cursor-pointer"
                            title="Remove Widget"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

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
                                <p className="text-xs uppercase tracking-[0.2em] text-[#A2DEC8]">
                                  {w.subtitle}
                                </p>
                              )}
                              {w.content && (
                                <p className="text-sm text-[#B8B8B5] font-light leading-relaxed max-w-3xl mx-auto whitespace-pre-line">
                                  {w.content}
                                </p>
                              )}
                              {w.imageUrl && (
                                <div className="max-w-xl mx-auto bg-black p-2 border border-white/10 rounded-sm">
                                  <img
                                    src={w.imageUrl}
                                    alt={w.title}
                                    className="w-full max-h-96 object-contain mx-auto"
                                  />
                                </div>
                              )}
                              {w.buttonText && (
                                <div className="pt-2">
                                  <a
                                    href={w.buttonLink || '#'}
                                    onClick={(e) => e.preventDefault()}
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
                  </div>
                );
              })}
          </main>

          {/* Live Website Footer with Dynamic Social Icons & Profile */}
          <Footer
            onOpenAdmin={() => {}}
            socialIcons={socialIcons}
            profile={profile}
          />
        </div>
      </div>
    </div>
  );
};
