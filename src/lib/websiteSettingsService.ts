import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import {
  heroIsolatedJewelryImg,
  heroIsolatedChokerImg,
  heroIsolatedJhumkasImg,
  heroIsolatedMathapattiImg,
  heroIsolatedVankiImg,
  heroIsolatedCollarImg,
  statementChokerImg,
  heroHaaramImg,
  craftsmanshipImg,
  brandLogoImg,
  bridalMathapattiImg,
  signatureJhumkasImg,
  royalBajubandImg,
  solitaireRingImg,
  statementPendantNecklaceImg,
  SIGNATURE_COLLECTIONS,
  BRAND_INFO,
} from '../data/jewelryData';
import { CollectionCard } from '../types/jewelry';

export interface HeroSlideItem {
  id: string;
  image: string;
  videoUrl?: string;
  alt: string;
}

export interface PromoPopupSettings {
  enabled: boolean;
  title: string;
  discountBadge: string;
  description: string;
  couponCode: string;
  buttonText: string;
  whatsappMessage: string;
  bannerImage?: string;
}

export interface ProfileSettings {
  brandName: string;
  descriptor: string;
  tagline: string;
  atelierAddress: string;
  phone: string;
  whatsappPhone: string;
  instagramHandle: string;
  instagramUrl: string;
}

export interface WebsiteImagesSettings {
  brandLogo: string;
  aboutSectionImage: string;
  statementHaaramImage: string;
  craftsmanshipBanner: string;
}

export interface SectionTypographyStyle {
  fontFamily: string;
  headingSizePx: number;
  subheadingSizePx: number;
  bodySizePx: number;
  fontWeight: string;
  textTransform: 'Default' | 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  fontStyle: 'Default' | 'normal' | 'italic';
  textDecoration: 'Default' | 'none' | 'underline' | 'line-through';
  lineHeightPx: number;
  letterSpacingPx: number;
  wordSpacingPx: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  headingColor: string;
  subheadingColor: string;
  bodyColor: string;
}

export interface SectionImageStyle {
  widthPercent: number;
  maxWidthPercent: number;
  heightPx: number;
  objectFit: 'Default' | 'contain' | 'cover' | 'fill' | 'scale-down';
  opacity: number;
  borderRadiusPx: number;
  alignment: 'left' | 'center' | 'right';
  caption: string;
  linkUrl: string;
  resolution: 'Full' | 'Large' | 'Medium' | 'Thumbnail';
}

export interface SectionButtonConfig {
  id: string;
  type: 'Default' | 'Primary Emerald' | 'Outline Luxury' | 'WhatsApp Green' | 'Gold Accent';
  text: string;
  link: string;
  icon: 'none' | 'arrow' | 'whatsapp' | 'sparkles' | 'eye';
  buttonId: string;
  borderType: 'Default' | 'Solid' | 'Double' | 'Dotted' | 'Dashed' | 'None';
  borderRadiusTop: number;
  borderRadiusRight: number;
  borderRadiusBottom: number;
  borderRadiusLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  visible: boolean;
}

export interface SectionContainerAdvanced {
  containerLayout: 'Flexbox' | 'Grid' | 'Block';
  contentWidth: 'Full Width' | 'Boxed';
  widthPercent: number;
  minHeightVh: number;
  direction: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  gapColumnPx: number;
  gapRowPx: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  backgroundType: 'Classic' | 'Gradient' | 'Video' | 'Image';
  backgroundColor: string;
  backgroundImage: string;
  backgroundOverlayOpacity: number;
  borderType: 'Default' | 'None' | 'Solid' | 'Double' | 'Dashed';
  borderRadiusPx: number;
  entranceAnimation:
    | 'Default'
    | 'None'
    | 'Fade In'
    | 'Fade In Down'
    | 'Fade In Left'
    | 'Fade In Right'
    | 'Fade In Up'
    | 'Zoom In';
  scrollingEffects: boolean;
  mouseEffects: boolean;
  sticky: 'None' | 'Top' | 'Bottom';
}

export interface PageSectionItem {
  id: string;
  label: string;
  isBuiltIn: boolean;
  visible: boolean;
  htmlTag: 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6' | 'div' | 'section';
  badgeText: string;
  heading: string;
  subheading: string;
  matterText: string;
  secondaryMatterText?: string;
  image: string;
  videoUrl?: string;
  linkUrl?: string;
  typography: SectionTypographyStyle;
  imageStyle: SectionImageStyle;
  buttons: SectionButtonConfig[];
  advanced: SectionContainerAdvanced;
}

export type SocialPlatformType =
  | 'Instagram'
  | 'WhatsApp'
  | 'YouTube'
  | 'LinkedIn'
  | 'Facebook'
  | 'Pinterest'
  | 'X / Twitter'
  | 'Telegram'
  | 'Envelope'
  | 'Phone'
  | 'MapPin'
  | 'Globe';

export interface SocialIconItem {
  id: string;
  platform: SocialPlatformType;
  label: string;
  link: string;
  colorType: 'Official Color' | 'Custom Color' | 'Emerald Luxury' | 'Silver Monochrome';
  customColor?: string;
  visible: boolean;
}

export type WidgetType =
  | 'Heading'
  | 'Text Editor'
  | 'Image'
  | 'Video'
  | 'Button'
  | 'Social Icons'
  | 'Divider'
  | 'Container';

export interface CustomWidgetItem {
  id: string;
  type: WidgetType;
  targetSectionId: string;
  title: string;
  subtitle: string;
  content: string;
  imageUrl: string;
  videoUrl: string;
  buttonText: string;
  buttonLink: string;
  alignment: 'left' | 'center' | 'right';
  fontSizePx: number;
  textColor: string;
  backgroundColor: string;
  paddingVerticalPx: number;
  visible: boolean;
}

export interface WebsiteCustomizationSettings {
  heroSlides: HeroSlideItem[];
  promoPopup: PromoPopupSettings;
  collections: CollectionCard[];
  profile: ProfileSettings;
  instagramFollowersCount: number;
  websiteImages: WebsiteImagesSettings;
  pageSections?: PageSectionItem[];
  socialIcons?: SocialIconItem[];
  customWidgets?: CustomWidgetItem[];
}

const SETTINGS_DOC_REF = doc(db, 'settings', 'website_config');
const CACHE_CONFIG_KEY = 'jb_website_config_cache';

export const DEFAULT_TYPOGRAPHY_STYLE: SectionTypographyStyle = {
  fontFamily: 'Cormorant Garamond',
  headingSizePx: 0, // 0 means responsive default
  subheadingSizePx: 0,
  bodySizePx: 0,
  fontWeight: '300',
  textTransform: 'Default',
  fontStyle: 'Default',
  textDecoration: 'Default',
  lineHeightPx: 0,
  letterSpacingPx: 0,
  wordSpacingPx: 0,
  textAlign: 'center',
  headingColor: '#F5F2EA',
  subheadingColor: '#A2DEC8',
  bodyColor: '#B8B8B5',
};

export const DEFAULT_IMAGE_STYLE: SectionImageStyle = {
  widthPercent: 100,
  maxWidthPercent: 100,
  heightPx: 0,
  objectFit: 'contain',
  opacity: 100,
  borderRadiusPx: 2,
  alignment: 'center',
  caption: '',
  linkUrl: '',
  resolution: 'Full',
};

export const DEFAULT_CONTAINER_ADVANCED: SectionContainerAdvanced = {
  containerLayout: 'Flexbox',
  contentWidth: 'Full Width',
  widthPercent: 100,
  minHeightVh: 0,
  direction: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  gapColumnPx: 24,
  gapRowPx: 24,
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  backgroundType: 'Classic',
  backgroundColor: '',
  backgroundImage: '',
  backgroundOverlayOpacity: 0,
  borderType: 'Default',
  borderRadiusPx: 0,
  entranceAnimation: 'Fade In Up',
  scrollingEffects: true,
  mouseEffects: false,
  sticky: 'None',
};

export const DEFAULT_SOCIAL_ICONS: SocialIconItem[] = [
  {
    id: 'soc-instagram',
    platform: 'Instagram',
    label: 'Instagram',
    link: BRAND_INFO.instagramUrl,
    colorType: 'Official Color',
    visible: true,
  },
  {
    id: 'soc-whatsapp',
    platform: 'WhatsApp',
    label: 'Whatsapp',
    link: BRAND_INFO.whatsappUrl,
    colorType: 'Official Color',
    visible: true,
  },
  {
    id: 'soc-youtube',
    platform: 'YouTube',
    label: 'Youtube',
    link: 'https://www.youtube.com/',
    colorType: 'Official Color',
    visible: false,
  },
  {
    id: 'soc-linkedin',
    platform: 'LinkedIn',
    label: 'Linkedin',
    link: 'https://www.linkedin.com/',
    colorType: 'Official Color',
    visible: false,
  },
  {
    id: 'soc-envelope',
    platform: 'Envelope',
    label: 'Envelope',
    link: 'mailto:saniaeventplanner@gmail.com',
    colorType: 'Official Color',
    visible: true,
  },
];

export const DEFAULT_PAGE_SECTIONS: PageSectionItem[] = [
  {
    id: 'hero',
    label: 'Hero Section (Home Banner)',
    isBuiltIn: true,
    visible: true,
    htmlTag: 'H1',
    badgeText: '92.5 STERLING SILVER ATELIER',
    heading: BRAND_INFO.tagline,
    subheading: `${BRAND_INFO.name} • ${BRAND_INFO.descriptor}`,
    matterText: BRAND_INFO.subtext,
    image: heroIsolatedJewelryImg,
    typography: { ...DEFAULT_TYPOGRAPHY_STYLE, textAlign: 'left' },
    imageStyle: { ...DEFAULT_IMAGE_STYLE },
    buttons: [
      {
        id: 'btn-hero-1',
        type: 'Primary Emerald',
        text: 'Explore Collections',
        link: '#collections',
        icon: 'arrow',
        buttonId: 'hero_explore_btn',
        borderType: 'Default',
        borderRadiusTop: 0,
        borderRadiusRight: 0,
        borderRadiusBottom: 0,
        borderRadiusLeft: 0,
        paddingTop: 14,
        paddingRight: 28,
        paddingBottom: 14,
        paddingLeft: 28,
        visible: true,
      },
      {
        id: 'btn-hero-2',
        type: 'Outline Luxury',
        text: 'Inquire on WhatsApp',
        link: BRAND_INFO.whatsappUrl,
        icon: 'whatsapp',
        buttonId: 'hero_whatsapp_btn',
        borderType: 'Solid',
        borderRadiusTop: 0,
        borderRadiusRight: 0,
        borderRadiusBottom: 0,
        borderRadiusLeft: 0,
        paddingTop: 14,
        paddingRight: 28,
        paddingBottom: 14,
        paddingLeft: 28,
        visible: true,
      },
    ],
    advanced: { ...DEFAULT_CONTAINER_ADVANCED },
  },
  {
    id: 'brandIntro',
    label: 'Brand Introduction (About Page)',
    isBuiltIn: true,
    visible: true,
    htmlTag: 'H2',
    badgeText: 'THE ATELIER PHILOSOPHY',
    heading: 'Crafted in 92.5 Silver. Designed for Grandeur.',
    subheading: 'HERITAGE SILVER ARTISTRY',
    matterText:
      'Born in the heart of Hyderabad, Jewel Botanica reimagines traditional Indian heirloom jewellery in certified 92.5 sterling silver. Every piece is sculpted by master karigars, uniting classical temple and Nizami motifs with contemporary editorial elegance.',
    secondaryMatterText:
      'From intricate bridal haarams and statement emerald chokers to delicate mathapattis, our creations carry the poise of fine gold and diamond jewellery in luminous, hallmarked silver.',
    image: statementChokerImg,
    typography: { ...DEFAULT_TYPOGRAPHY_STYLE, textAlign: 'left' },
    imageStyle: { ...DEFAULT_IMAGE_STYLE },
    buttons: [
      {
        id: 'btn-about-1',
        type: 'Outline Luxury',
        text: 'Discover Our Craft',
        link: '#craftsmanship',
        icon: 'arrow',
        buttonId: 'about_craft_btn',
        borderType: 'Solid',
        borderRadiusTop: 0,
        borderRadiusRight: 0,
        borderRadiusBottom: 0,
        borderRadiusLeft: 0,
        paddingTop: 12,
        paddingRight: 24,
        paddingBottom: 12,
        paddingLeft: 24,
        visible: true,
      },
    ],
    advanced: { ...DEFAULT_CONTAINER_ADVANCED },
  },
  {
    id: 'collections',
    label: 'Signature Collections Page',
    isBuiltIn: true,
    visible: true,
    htmlTag: 'H2',
    badgeText: 'SIGNATURE CURATIONS',
    heading: 'The Collections',
    subheading: 'Click any collection to open its folder and explore curated jewellery designs',
    matterText: 'Nine signature categories handcrafted in guaranteed 92.5 sterling silver with emerald and fine CZ accents.',
    image: bridalMathapattiImg,
    typography: { ...DEFAULT_TYPOGRAPHY_STYLE, textAlign: 'center' },
    imageStyle: { ...DEFAULT_IMAGE_STYLE },
    buttons: [],
    advanced: { ...DEFAULT_CONTAINER_ADVANCED },
  },
  {
    id: 'statementJewellery',
    label: 'Statement Jewellery Spotlight',
    isBuiltIn: true,
    visible: true,
    htmlTag: 'H2',
    badgeText: 'MASTERPIECE SPOTLIGHT',
    heading: 'The Royal Emerald Tiered Haaram',
    subheading: 'BRIDAL & CEREMONIAL REGALIA',
    matterText:
      'Sculpted for unforgettable entrances, our signature multi-tiered haaram unites hand-set laboratory emeralds, brilliant micro-pavé zirconia, and liquid platinum-finish 92.5 silver.',
    image: heroHaaramImg,
    typography: { ...DEFAULT_TYPOGRAPHY_STYLE, textAlign: 'left' },
    imageStyle: { ...DEFAULT_IMAGE_STYLE },
    buttons: [
      {
        id: 'btn-statement-1',
        type: 'Primary Emerald',
        text: 'Explore Signature Haarams',
        link: '#catalogue',
        icon: 'arrow',
        buttonId: 'statement_explore_btn',
        borderType: 'Default',
        borderRadiusTop: 0,
        borderRadiusRight: 0,
        borderRadiusBottom: 0,
        borderRadiusLeft: 0,
        paddingTop: 14,
        paddingRight: 28,
        paddingBottom: 14,
        paddingLeft: 28,
        visible: true,
      },
    ],
    advanced: { ...DEFAULT_CONTAINER_ADVANCED },
  },
  {
    id: 'catalogue',
    label: 'The Jewellery Catalogue Page',
    isBuiltIn: true,
    visible: true,
    htmlTag: 'H2',
    badgeText: 'CURATED ARCHIVE',
    heading: 'THE JEWEL BOTANICA CATALOGUE',
    subheading: '92.5 STERLING SILVER ARCHIVE',
    matterText: 'Browse our curated archive of handcrafted 92.5 silver jewellery pieces.',
    image: signatureJhumkasImg,
    typography: { ...DEFAULT_TYPOGRAPHY_STYLE, textAlign: 'center' },
    imageStyle: { ...DEFAULT_IMAGE_STYLE },
    buttons: [],
    advanced: { ...DEFAULT_CONTAINER_ADVANCED },
  },
  {
    id: 'artOfSilver',
    label: 'The Art of Silver (Craftsmanship Page)',
    isBuiltIn: true,
    visible: true,
    htmlTag: 'H2',
    badgeText: 'ATELIER CRAFTSMANSHIP',
    heading: 'The Art of 92.5 Silver',
    subheading: 'HANDCRAFTED BY MASTER KARIGARS',
    matterText:
      'Every Jewel Botanica creation undergoes over 120 hours of meticulous hand-carving, stone setting, and rhodium-platinum finishing in our Hyderabad studio.',
    image: craftsmanshipImg,
    typography: { ...DEFAULT_TYPOGRAPHY_STYLE, textAlign: 'center' },
    imageStyle: { ...DEFAULT_IMAGE_STYLE },
    buttons: [],
    advanced: { ...DEFAULT_CONTAINER_ADVANCED },
  },
  {
    id: 'customization',
    label: 'Bespoke Customization Page',
    isBuiltIn: true,
    visible: true,
    htmlTag: 'H2',
    badgeText: 'PRIVATE COMMISSIONS',
    heading: 'Bespoke Bridal & Custom Creations',
    subheading: 'YOUR VISION, SCULPTED IN SILVER',
    matterText:
      'Collaborate directly with our Hyderabad design specialists to customize gemstone hues, necklace lengths, finishes, or commission a one-of-a-kind bridal ensemble.',
    image: royalBajubandImg,
    typography: { ...DEFAULT_TYPOGRAPHY_STYLE, textAlign: 'center' },
    imageStyle: { ...DEFAULT_IMAGE_STYLE },
    buttons: [],
    advanced: { ...DEFAULT_CONTAINER_ADVANCED },
  },
  {
    id: 'whyJewelBotanica',
    label: 'Why Jewel Botanica Page',
    isBuiltIn: true,
    visible: true,
    htmlTag: 'H2',
    badgeText: 'THE BOTANICA PROMISE',
    heading: 'Why Choose Jewel Botanica',
    subheading: 'UNCOMPROMISING PURITY & ARTISTRY',
    matterText:
      'Guaranteed 92.5 hallmarked sterling silver, fine jewellery stone setting, bespoke bridal consultations, and insured worldwide delivery.',
    image: solitaireRingImg,
    typography: { ...DEFAULT_TYPOGRAPHY_STYLE, textAlign: 'center' },
    imageStyle: { ...DEFAULT_IMAGE_STYLE },
    buttons: [],
    advanced: { ...DEFAULT_CONTAINER_ADVANCED },
  },
  {
    id: 'instagram',
    label: 'Instagram Community Page',
    isBuiltIn: true,
    visible: true,
    htmlTag: 'H2',
    badgeText: '@JEWEL_BOTANICA_SILVER_JEWELERY',
    heading: 'Follow Our Silver World on Instagram',
    subheading: '104K+ CONNOISSEURS WORLDWIDE',
    matterText:
      'Explore daily bridal stories, behind-the-scenes karigar reels, and new collection launches.',
    image: brandLogoImg,
    typography: { ...DEFAULT_TYPOGRAPHY_STYLE, textAlign: 'center' },
    imageStyle: { ...DEFAULT_IMAGE_STYLE },
    buttons: [],
    advanced: { ...DEFAULT_CONTAINER_ADVANCED },
  },
  {
    id: 'contact',
    label: 'Contact & Private Atelier Page',
    isBuiltIn: true,
    visible: true,
    htmlTag: 'H2',
    badgeText: 'PRIVATE CONCIERGE',
    heading: 'Connect With Our Atelier',
    subheading: 'HYDERABAD • WORLDWIDE SHIPPING',
    matterText:
      'Reach out for pricing inquiries, virtual video consultations, or bespoke bridal appointments.',
    image: statementPendantNecklaceImg,
    typography: { ...DEFAULT_TYPOGRAPHY_STYLE, textAlign: 'left' },
    imageStyle: { ...DEFAULT_IMAGE_STYLE },
    buttons: [],
    advanced: { ...DEFAULT_CONTAINER_ADVANCED },
  },
];

export const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  { id: 'haaram', image: heroIsolatedJewelryImg, alt: 'Artisan Emerald Haaram' },
  { id: 'choker', image: heroIsolatedChokerImg, alt: 'Royal Heritage Choker' },
  { id: 'jhumkas', image: heroIsolatedJhumkasImg, alt: 'Symphony Bridal Jhumkas' },
  { id: 'mathapatti', image: heroIsolatedMathapattiImg, alt: 'Kundan Silver Mathapatti' },
  { id: 'vanki', image: heroIsolatedVankiImg, alt: 'Imperial Bajuband Vanki' },
  { id: 'collar', image: heroIsolatedCollarImg, alt: 'Grand Pear-Cut Collar' },
];

export const DEFAULT_PROMO_POPUP: PromoPopupSettings = {
  enabled: false,
  title: '',
  discountBadge: '',
  description: '',
  couponCode: '',
  buttonText: '',
  whatsappMessage: '',
};

export const DEFAULT_PROFILE: ProfileSettings = {
  brandName: BRAND_INFO.name,
  descriptor: BRAND_INFO.descriptor,
  tagline: BRAND_INFO.tagline,
  atelierAddress: 'Hyderabad, Telangana, India • Worldwide Insured Shipping',
  phone: BRAND_INFO.phone,
  whatsappPhone: BRAND_INFO.phoneClean,
  instagramHandle: BRAND_INFO.instagram,
  instagramUrl: BRAND_INFO.instagramUrl,
};

export const DEFAULT_WEBSITE_IMAGES: WebsiteImagesSettings = {
  brandLogo: brandLogoImg,
  aboutSectionImage: statementChokerImg,
  statementHaaramImage: heroHaaramImg,
  craftsmanshipBanner: craftsmanshipImg,
};

export const DEFAULT_WEBSITE_SETTINGS: WebsiteCustomizationSettings = {
  heroSlides: DEFAULT_HERO_SLIDES,
  promoPopup: DEFAULT_PROMO_POPUP,
  collections: SIGNATURE_COLLECTIONS,
  profile: DEFAULT_PROFILE,
  instagramFollowersCount: 104280,
  websiteImages: DEFAULT_WEBSITE_IMAGES,
  pageSections: DEFAULT_PAGE_SECTIONS,
  socialIcons: DEFAULT_SOCIAL_ICONS,
  customWidgets: [],
};

// Dispatch a custom event to immediately notify listeners in the same window
const SETTINGS_CHANGE_EVENT = 'jb_settings_changed';

function mergePageSections(saved?: PageSectionItem[]): PageSectionItem[] {
  if (!saved || !Array.isArray(saved) || saved.length === 0) {
    return DEFAULT_PAGE_SECTIONS;
  }
  const map = new Map<string, PageSectionItem>();
  DEFAULT_PAGE_SECTIONS.forEach((def) => map.set(def.id, def));
  const result: PageSectionItem[] = [];
  const seen = new Set<string>();

  for (const item of saved) {
    const def = map.get(item.id);
    if (def) {
      result.push({
        ...def,
        ...item,
        typography: { ...def.typography, ...(item.typography || {}) },
        imageStyle: { ...def.imageStyle, ...(item.imageStyle || {}) },
        advanced: { ...def.advanced, ...(item.advanced || {}) },
        buttons: item.buttons || def.buttons,
      });
    } else {
      result.push(item);
    }
    seen.add(item.id);
  }

  for (const def of DEFAULT_PAGE_SECTIONS) {
    if (!seen.has(def.id)) {
      result.push(def);
    }
  }
  return result;
}

/**
 * Real-time subscription to website customization settings
 */
export function subscribeWebsiteSettings(
  callback: (settings: WebsiteCustomizationSettings) => void
): () => void {
  const getCachedSettings = (): WebsiteCustomizationSettings => {
    const cached = localStorage.getItem(CACHE_CONFIG_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          ...DEFAULT_WEBSITE_SETTINGS,
          ...parsed,
          heroSlides: parsed.heroSlides && parsed.heroSlides.length > 0 ? parsed.heroSlides : DEFAULT_HERO_SLIDES,
          promoPopup: { ...DEFAULT_PROMO_POPUP, ...(parsed.promoPopup || {}) },
          profile: { ...DEFAULT_PROFILE, ...(parsed.profile || {}) },
          collections: parsed.collections && parsed.collections.length > 0 ? parsed.collections : SIGNATURE_COLLECTIONS,
          websiteImages: { ...DEFAULT_WEBSITE_IMAGES, ...(parsed.websiteImages || {}) },
          pageSections: mergePageSections(parsed.pageSections),
          socialIcons: parsed.socialIcons && parsed.socialIcons.length > 0 ? parsed.socialIcons : DEFAULT_SOCIAL_ICONS,
          customWidgets: Array.isArray(parsed.customWidgets) ? parsed.customWidgets : [],
        };
      } catch {
        return DEFAULT_WEBSITE_SETTINGS;
      }
    }
    return DEFAULT_WEBSITE_SETTINGS;
  };

  // 1. Emit cached settings immediately
  callback(getCachedSettings());

  // 2. Listen for local immediate updates
  const handleLocalChange = () => {
    callback(getCachedSettings());
  };
  window.addEventListener(SETTINGS_CHANGE_EVENT, handleLocalChange);
  window.addEventListener('storage', handleLocalChange);

  // 3. Subscribe to live Firestore document
  let unsubFirestore: (() => void) | null = null;
  try {
    unsubFirestore = onSnapshot(
      SETTINGS_DOC_REF,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<WebsiteCustomizationSettings>;
          const currentCached = getCachedSettings();
          const merged: WebsiteCustomizationSettings = {
            heroSlides: data.heroSlides && data.heroSlides.length > 0 ? data.heroSlides : currentCached.heroSlides,
            promoPopup: { ...DEFAULT_PROMO_POPUP, ...(data.promoPopup || currentCached.promoPopup) },
            collections: data.collections && data.collections.length > 0 ? data.collections : currentCached.collections,
            profile: { ...DEFAULT_PROFILE, ...(data.profile || currentCached.profile) },
            instagramFollowersCount:
              typeof data.instagramFollowersCount === 'number'
                ? data.instagramFollowersCount
                : currentCached.instagramFollowersCount,
            websiteImages: { ...DEFAULT_WEBSITE_IMAGES, ...(data.websiteImages || currentCached.websiteImages) },
            pageSections: mergePageSections(data.pageSections || currentCached.pageSections),
            socialIcons: data.socialIcons && data.socialIcons.length > 0 ? data.socialIcons : currentCached.socialIcons,
            customWidgets: Array.isArray(data.customWidgets) ? data.customWidgets : currentCached.customWidgets,
          };
          localStorage.setItem(CACHE_CONFIG_KEY, JSON.stringify(merged));
          callback(merged);
        }
      },
      (err) => {
        console.warn('Settings subscription warning (using local configuration):', err);
      }
    );
  } catch (err) {
    console.warn('Failed to listen to website settings:', err);
  }

  return () => {
    window.removeEventListener(SETTINGS_CHANGE_EVENT, handleLocalChange);
    window.removeEventListener('storage', handleLocalChange);
    if (unsubFirestore) unsubFirestore();
  };
}

/**
 * Save updated website customization settings to both localStorage and Firestore
 */
export async function saveWebsiteSettings(
  settings: Partial<WebsiteCustomizationSettings>
): Promise<void> {
  // Read current cached settings
  let current: WebsiteCustomizationSettings = DEFAULT_WEBSITE_SETTINGS;
  const raw = localStorage.getItem(CACHE_CONFIG_KEY);
  if (raw) {
    try {
      current = { ...DEFAULT_WEBSITE_SETTINGS, ...JSON.parse(raw) };
    } catch {
      // Use default
    }
  }

  const updated: WebsiteCustomizationSettings = {
    ...current,
    ...settings,
    promoPopup: settings.promoPopup ? { ...current.promoPopup, ...settings.promoPopup } : current.promoPopup,
    profile: settings.profile ? { ...current.profile, ...settings.profile } : current.profile,
    websiteImages: settings.websiteImages ? { ...current.websiteImages, ...settings.websiteImages } : current.websiteImages,
    pageSections: settings.pageSections ? mergePageSections(settings.pageSections) : current.pageSections,
    socialIcons: settings.socialIcons ? settings.socialIcons : current.socialIcons,
    customWidgets: settings.customWidgets ? settings.customWidgets : current.customWidgets,
  };

  // 1. Immediately write to localStorage so the UI updates with zero delay
  localStorage.setItem(CACHE_CONFIG_KEY, JSON.stringify(updated));
  if (typeof settings.instagramFollowersCount === 'number') {
    localStorage.setItem('jb_instagram_community_count', settings.instagramFollowersCount.toString());
    window.dispatchEvent(new Event('jb_follower_count_changed'));
  }

  // 2. Dispatch custom event so all active listeners on the page re-render instantly
  window.dispatchEvent(new Event(SETTINGS_CHANGE_EVENT));

  // 3. Persist to Firestore
  try {
    await setDoc(
      SETTINGS_DOC_REF,
      {
        ...settings,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore setDoc notice for website settings (saved locally):', err);
  }
}
