import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
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

export interface WebsiteCustomizationSettings {
  heroSlides: HeroSlideItem[];
  promoPopup: PromoPopupSettings;
  collections: CollectionCard[];
  profile: ProfileSettings;
  instagramFollowersCount: number;
  websiteImages: WebsiteImagesSettings;
}

const SETTINGS_DOC_REF = doc(db, 'settings', 'website_config');
const CACHE_CONFIG_KEY = 'jb_website_config_cache';

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
};

// Dispatch a custom event to immediately notify listeners in the same window
const SETTINGS_CHANGE_EVENT = 'jb_settings_changed';

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
            instagramFollowersCount: typeof data.instagramFollowersCount === 'number' ? data.instagramFollowersCount : currentCached.instagramFollowersCount,
            websiteImages: { ...DEFAULT_WEBSITE_IMAGES, ...(data.websiteImages || currentCached.websiteImages) },
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
  };

  // 1. Immediately write to localStorage so the UI updates with zero delay
  localStorage.setItem(CACHE_CONFIG_KEY, JSON.stringify(updated));

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
