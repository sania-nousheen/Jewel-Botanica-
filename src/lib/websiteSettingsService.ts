import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { idbGet, idbSet } from './idbStorage';
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
  solitairePendantImg,
  bridalEmeraldJhumkaImg,
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
  updatedAtMs?: number;
}

const SETTINGS_DOC_REF = doc(db, 'settings', 'website_config');
const CACHE_CONFIG_KEY = 'jb_website_config_cache_v2';
const LEGACY_CACHE_CONFIG_KEY = 'jb_website_config_cache';

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

const BUILTIN_ASSET_MAP: Array<[string, string]> = [
  ['hero_statement_haaram_1790612442396', heroHaaramImg],
  ['statement_choker_emerald_1790612454817', statementChokerImg],
  ['signature_jhumkas_earrings_1790612470730', signatureJhumkasImg],
  ['bridal_mathapatti_hairpiece_1790612481414', bridalMathapattiImg],
  ['royal_bajuband_vanki_1790612500060', royalBajubandImg],
  ['solitaire_emerald_ring_1790612512321', solitaireRingImg],
  ['statement_pendant_necklace_1790612524901', statementPendantNecklaceImg],
  ['solitaire_pendant_chain_1790663321416', solitairePendantImg],
  ['original_chandbali_crop_1790757530715', bridalEmeraldJhumkaImg],
  ['atelier_craftsmanship_silver_1790612414133', craftsmanshipImg],
  ['hero_isolated_jewelry_1790614237142', heroIsolatedJewelryImg],
  ['hero_isolated_choker_1790844827818', heroIsolatedChokerImg],
  ['hero_isolated_jhumkas_1790844845271', heroIsolatedJhumkasImg],
  ['hero_isolated_mathapatti_1790844862481', heroIsolatedMathapattiImg],
  ['hero_isolated_vanki_1790844880835', heroIsolatedVankiImg],
  ['hero_isolated_collar_1790844899842', heroIsolatedCollarImg],
  ['jewel_botanica_logo_1790614222826', brandLogoImg],
];

export function normalizeImageUrl(src?: string): string {
  if (!src || typeof src !== 'string') return '';
  const trimmed = src.trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null' || trimmed === 'data:,') return '';
  if (trimmed.startsWith('blob:')) return '';
  if (trimmed.startsWith('data:')) {
    return trimmed.startsWith('data:image/') && trimmed.length > 100 ? trimmed : '';
  }

  // Map any saved built-in asset filename (whether from dev /src/assets or prod /assets) to the active bundle URL
  for (const [key, liveUrl] of BUILTIN_ASSET_MAP) {
    if (trimmed.includes(key)) {
      return liveUrl;
    }
  }

  // Reject stale /src/assets or /assets paths that don't match known built-in assets
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('/') &&
    !trimmed.startsWith('data:image/')
  ) {
    return '';
  }

  // Convert Google Drive sharing links to direct image links
  const driveMatch =
    trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }

  // Convert Dropbox links to direct raw links
  if (trimmed.includes('dropbox.com') && trimmed.includes('?dl=0')) {
    return trimmed.replace('?dl=0', '?raw=1');
  }

  return trimmed;
}

export function isValidImageSrc(src?: string): boolean {
  return normalizeImageUrl(src).length > 0;
}

function sanitizeCollections(saved?: CollectionCard[]): CollectionCard[] {
  if (!saved || !Array.isArray(saved) || saved.length === 0) {
    return SIGNATURE_COLLECTIONS;
  }
  const defaultMap = new Map<string, CollectionCard>();
  SIGNATURE_COLLECTIONS.forEach((c) => {
    defaultMap.set(c.id, c);
    defaultMap.set(c.name.toUpperCase(), c);
    defaultMap.set(c.category.toUpperCase(), c);
  });

  return saved.map((col, idx) => {
    const fallback =
      defaultMap.get(col.id) ||
      defaultMap.get((col.name || '').toUpperCase()) ||
      defaultMap.get((col.category || '').toUpperCase()) ||
      SIGNATURE_COLLECTIONS[idx % SIGNATURE_COLLECTIONS.length];

    const cleanImg = normalizeImageUrl(col.image);
    return {
      ...col,
      id: col.id || fallback.id || `col-${idx}`,
      name: col.name && col.name.trim() ? col.name.trim() : fallback.name,
      category: col.category && col.category.trim() ? col.category : fallback.category,
      tagline: col.tagline && col.tagline.trim() ? col.tagline : fallback.tagline,
      image: cleanImg || fallback.image,
      itemCount: col.itemCount || fallback.itemCount || 'Curated Collection',
    };
  });
}

function sanitizeHeroSlides(saved?: HeroSlideItem[]): HeroSlideItem[] {
  if (!saved || !Array.isArray(saved) || saved.length === 0) {
    return DEFAULT_HERO_SLIDES;
  }
  return saved.map((slide, idx) => {
    const fallback = DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length];
    const cleanImg = normalizeImageUrl(slide.image);
    return {
      ...slide,
      id: slide.id || fallback.id || `hero-${idx}`,
      alt: slide.alt && slide.alt.trim() ? slide.alt : fallback.alt,
      image: cleanImg || fallback.image,
    };
  });
}

function mergeWebsiteImages(saved?: Partial<WebsiteImagesSettings>): WebsiteImagesSettings {
  const logo = normalizeImageUrl(saved?.brandLogo);
  const about = normalizeImageUrl(saved?.aboutSectionImage);
  const haaram = normalizeImageUrl(saved?.statementHaaramImage);
  const craft = normalizeImageUrl(saved?.craftsmanshipBanner);

  return {
    brandLogo: logo || DEFAULT_WEBSITE_IMAGES.brandLogo,
    aboutSectionImage: about || DEFAULT_WEBSITE_IMAGES.aboutSectionImage,
    statementHaaramImage: haaram || DEFAULT_WEBSITE_IMAGES.statementHaaramImage,
    craftsmanshipBanner: craft || DEFAULT_WEBSITE_IMAGES.craftsmanshipBanner,
  };
}

let inMemorySettingsCache: WebsiteCustomizationSettings | null = null;

function normalizeSettings(raw?: Partial<WebsiteCustomizationSettings> | null): WebsiteCustomizationSettings {
  if (!raw) return DEFAULT_WEBSITE_SETTINGS;
  return {
    ...DEFAULT_WEBSITE_SETTINGS,
    ...raw,
    heroSlides: sanitizeHeroSlides(raw.heroSlides),
    promoPopup: { ...DEFAULT_PROMO_POPUP, ...(raw.promoPopup || {}) },
    profile: { ...DEFAULT_PROFILE, ...(raw.profile || {}) },
    collections: sanitizeCollections(raw.collections),
    websiteImages: mergeWebsiteImages(raw.websiteImages),
    pageSections: DEFAULT_PAGE_SECTIONS,
    socialIcons: raw.socialIcons && raw.socialIcons.length > 0 ? raw.socialIcons : DEFAULT_SOCIAL_ICONS,
    customWidgets: [],
    updatedAtMs: typeof raw.updatedAtMs === 'number' ? raw.updatedAtMs : 0,
  };
}

// Clean up legacy bloated localStorage key once on module load so 5MB quota is freed
try {
  if (typeof window !== 'undefined' && localStorage.getItem(LEGACY_CACHE_CONFIG_KEY)) {
    const legacyRaw = localStorage.getItem(LEGACY_CACHE_CONFIG_KEY);
    localStorage.removeItem(LEGACY_CACHE_CONFIG_KEY);
    if (legacyRaw && !localStorage.getItem(CACHE_CONFIG_KEY)) {
      const parsed = JSON.parse(legacyRaw);
      const migrated = normalizeSettings(parsed);
      idbSet(CACHE_CONFIG_KEY, migrated);
      try {
        localStorage.setItem(CACHE_CONFIG_KEY, JSON.stringify(migrated));
      } catch {
        // IndexedDB holds full migrated copy
      }
    }
  }
} catch {
  // ignore migration errors
}

function getLocalCachedSettingsSync(): WebsiteCustomizationSettings {
  if (inMemorySettingsCache) {
    return inMemorySettingsCache;
  }
  try {
    const cached = localStorage.getItem(CACHE_CONFIG_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      const normalized = normalizeSettings(parsed);
      inMemorySettingsCache = normalized;
      return normalized;
    }
  } catch {
    // ignore corrupt localStorage
  }
  return DEFAULT_WEBSITE_SETTINGS;
}

/**
 * Real-time subscription to website customization settings
 */
export function subscribeWebsiteSettings(
  callback: (settings: WebsiteCustomizationSettings) => void
): () => void {
  // 1. Emit synchronous cached settings immediately
  const initialSync = getLocalCachedSettingsSync();
  callback(initialSync);

  // 2. Load from IndexedDB (supports large base64 images even when localStorage quota is full)
  idbGet<WebsiteCustomizationSettings>(CACHE_CONFIG_KEY).then((idbSettings) => {
    if (idbSettings) {
      const normalized = normalizeSettings(idbSettings);
      const currentTs = inMemorySettingsCache?.updatedAtMs || 0;
      if ((normalized.updatedAtMs || 0) >= currentTs) {
        inMemorySettingsCache = normalized;
        callback(normalized);
      }
    }
  });

  // 3. Listen for local immediate updates
  const handleLocalChange = (e?: Event) => {
    const customEvt = e as CustomEvent<WebsiteCustomizationSettings>;
    if (customEvt && customEvt.detail) {
      const normalized = normalizeSettings(customEvt.detail);
      inMemorySettingsCache = normalized;
      callback(normalized);
    } else {
      callback(getLocalCachedSettingsSync());
    }
  };
  window.addEventListener(SETTINGS_CHANGE_EVENT, handleLocalChange);
  window.addEventListener('storage', handleLocalChange);

  // 4. Subscribe to live Firestore document (without overwriting newer local edits)
  let unsubFirestore: (() => void) | null = null;
  try {
    unsubFirestore = onSnapshot(
      SETTINGS_DOC_REF,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<WebsiteCustomizationSettings>;
          const currentCached = getLocalCachedSettingsSync();
          const remoteTs = typeof data.updatedAtMs === 'number' ? data.updatedAtMs : 0;
          const localTs = currentCached.updatedAtMs || 0;

          // If local cache has newer changes than Firestore (e.g. just uploaded an image), keep local cache
          if (localTs > remoteTs && localTs > 0) {
            return;
          }

          const merged = normalizeSettings({
            heroSlides: data.heroSlides && data.heroSlides.length > 0 ? data.heroSlides : currentCached.heroSlides,
            promoPopup: { ...DEFAULT_PROMO_POPUP, ...(data.promoPopup || currentCached.promoPopup) },
            collections: data.collections && data.collections.length > 0 ? data.collections : currentCached.collections,
            profile: { ...DEFAULT_PROFILE, ...(data.profile || currentCached.profile) },
            instagramFollowersCount:
              typeof data.instagramFollowersCount === 'number'
                ? data.instagramFollowersCount
                : currentCached.instagramFollowersCount,
            websiteImages: mergeWebsiteImages({
              ...currentCached.websiteImages,
              ...(data.websiteImages || {}),
            }),
            pageSections: DEFAULT_PAGE_SECTIONS,
            socialIcons: data.socialIcons && data.socialIcons.length > 0 ? data.socialIcons : currentCached.socialIcons,
            customWidgets: [],
            updatedAtMs: Math.max(remoteTs, localTs),
          });
          inMemorySettingsCache = merged;
          idbSet(CACHE_CONFIG_KEY, merged);
          try {
            localStorage.setItem(CACHE_CONFIG_KEY, JSON.stringify(merged));
          } catch {
            // IndexedDB already holds full copy
          }
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
 * Save updated website customization settings to IndexedDB, localStorage, and Firestore
 */
export async function saveWebsiteSettings(
  settings: Partial<WebsiteCustomizationSettings>
): Promise<void> {
  const nowMs = Date.now();
  const baseCurrent = inMemorySettingsCache || (await idbGet<WebsiteCustomizationSettings>(CACHE_CONFIG_KEY)) || getLocalCachedSettingsSync();
  const current = normalizeSettings(baseCurrent);

  const updated = normalizeSettings({
    ...current,
    ...settings,
    heroSlides: settings.heroSlides ? sanitizeHeroSlides(settings.heroSlides) : current.heroSlides,
    collections: settings.collections ? sanitizeCollections(settings.collections) : current.collections,
    promoPopup: settings.promoPopup ? { ...current.promoPopup, ...settings.promoPopup } : current.promoPopup,
    profile: settings.profile ? { ...current.profile, ...settings.profile } : current.profile,
    websiteImages: settings.websiteImages
      ? mergeWebsiteImages({ ...current.websiteImages, ...settings.websiteImages })
      : mergeWebsiteImages(current.websiteImages),
    pageSections: DEFAULT_PAGE_SECTIONS,
    socialIcons: settings.socialIcons ? settings.socialIcons : current.socialIcons,
    customWidgets: [],
    updatedAtMs: nowMs,
  });

  // 1. Immediately update in-memory cache and dispatch event so UI updates with zero delay
  inMemorySettingsCache = updated;
  window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: updated }));

  // 2. Persist full data (including high-res base64 images) to IndexedDB
  await idbSet(CACHE_CONFIG_KEY, updated);

  // 3. Also try localStorage (wrapped in try/catch so QuotaExceededError never breaks saving)
  try {
    localStorage.setItem(CACHE_CONFIG_KEY, JSON.stringify(updated));
  } catch {
    // IndexedDB has stored the full images safely
  }

  if (typeof settings.instagramFollowersCount === 'number') {
    try {
      localStorage.setItem('jb_instagram_community_count', settings.instagramFollowersCount.toString());
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event('jb_follower_count_changed'));
  }

  // 4. Persist to Firestore without ever blocking the UI for more than 800ms
  const firestorePayload: Record<string, unknown> = {
    updatedAtMs: nowMs,
    updatedAt: serverTimestamp(),
  };
  if (settings.heroSlides) firestorePayload.heroSlides = updated.heroSlides;
  if (settings.collections) firestorePayload.collections = updated.collections;
  if (settings.websiteImages) firestorePayload.websiteImages = updated.websiteImages;
  if (settings.promoPopup) firestorePayload.promoPopup = updated.promoPopup;
  if (settings.profile) firestorePayload.profile = updated.profile;
  if (settings.socialIcons) firestorePayload.socialIcons = updated.socialIcons;
  if (typeof settings.instagramFollowersCount === 'number') {
    firestorePayload.instagramFollowersCount = settings.instagramFollowersCount;
  }

  try {
    await Promise.race([
      setDoc(SETTINGS_DOC_REF, firestorePayload, { merge: true }),
      new Promise<void>((resolve) => setTimeout(resolve, 800)),
    ]);
  } catch (err) {
    console.warn('Firestore setDoc notice for website settings (saved in IndexedDB):', err);
  }
}
