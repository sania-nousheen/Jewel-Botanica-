import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth, BOOTSTRAPPED_ADMIN_EMAIL } from './firebase';
import { JewelryItem, JewelryCategory } from '../types/jewelry';
import { CATALOGUE_ITEMS, heroIsolatedJewelryImg } from '../data/jewelryData';
import { idbGet, idbSet } from './idbStorage';
import { normalizeImageUrl } from './websiteSettingsService';

const PRODUCTS_COLLECTION = 'products';
const DELETED_PRODUCTS_KEY = 'jb_deleted_product_ids_v1';
const LOCAL_PRODUCTS_CACHE_KEY = 'jb_local_products_cache_v2';
const LEGACY_PRODUCTS_CACHE_KEY = 'jb_local_products_cache_v1';
const UNIVERSAL_ADMIN_STORAGE_KEY = 'jb_universal_admin_verified_v1';
const PRODUCTS_CHANGED_EVENT = 'jb_products_changed_event';

let inMemoryProductsCache: JewelryItem[] | null = null;

function isValidImageString(src?: string): boolean {
  return normalizeImageUrl(src).length > 0;
}

function ensureProductHasValidImage(item: JewelryItem): JewelryItem {
  const validImages = (item.images || [])
    .map((img) => normalizeImageUrl(img))
    .filter((img) => img.length > 0);
  const normalizedPrimary = normalizeImageUrl(item.image);
  const fallbackDefault = CATALOGUE_ITEMS.find((c) => c.id === item.id)?.image || heroIsolatedJewelryImg;

  const primaryImage = normalizedPrimary
    ? normalizedPrimary
    : validImages.length > 0
    ? validImages[0]
    : fallbackDefault;

  return {
    ...item,
    image: primaryImage,
    images: validImages.length > 0 ? validImages : [primaryImage],
  };
}

// Migrate legacy v1 localStorage cache once and free up 5MB localStorage quota
try {
  if (typeof window !== 'undefined' && localStorage.getItem(LEGACY_PRODUCTS_CACHE_KEY)) {
    const legacyRaw = localStorage.getItem(LEGACY_PRODUCTS_CACHE_KEY);
    localStorage.removeItem(LEGACY_PRODUCTS_CACHE_KEY);
    if (legacyRaw && !localStorage.getItem(LOCAL_PRODUCTS_CACHE_KEY)) {
      const parsed: JewelryItem[] = JSON.parse(legacyRaw);
      const cleaned = parsed.map(ensureProductHasValidImage);
      idbSet(LOCAL_PRODUCTS_CACHE_KEY, cleaned);
      try {
        localStorage.setItem(LOCAL_PRODUCTS_CACHE_KEY, JSON.stringify(cleaned));
      } catch {
        // IndexedDB holds full migrated products
      }
    }
  }
} catch {
  // ignore migration errors
}

function getActiveAdminIdentity(): { email: string; uid: string } | null {
  if (auth.currentUser) {
    return {
      email: auth.currentUser.email || BOOTSTRAPPED_ADMIN_EMAIL,
      uid: auth.currentUser.uid,
    };
  }
  try {
    const saved = localStorage.getItem(UNIVERSAL_ADMIN_STORAGE_KEY);
    if (saved && saved.toLowerCase().trim() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
      return {
        email: BOOTSTRAPPED_ADMIN_EMAIL,
        uid: 'admin-universal-uid',
      };
    }
  } catch {
    // ignore
  }
  return {
    email: BOOTSTRAPPED_ADMIN_EMAIL,
    uid: 'admin-universal-uid',
  };
}

export function getLocalCachedProducts(): JewelryItem[] {
  if (inMemoryProductsCache) {
    return inMemoryProductsCache.map(ensureProductHasValidImage);
  }
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_CACHE_KEY);
    if (raw) {
      const parsed: JewelryItem[] = JSON.parse(raw);
      inMemoryProductsCache = parsed.map(ensureProductHasValidImage);
      return inMemoryProductsCache;
    }
  } catch {
    // ignore
  }
  return [];
}

async function getAllCachedProductsAsync(): Promise<JewelryItem[]> {
  const idbList = await idbGet<JewelryItem[]>(LOCAL_PRODUCTS_CACHE_KEY);
  if (idbList && Array.isArray(idbList) && idbList.length > 0) {
    const cleaned = idbList.map(ensureProductHasValidImage);
    inMemoryProductsCache = cleaned;
    return cleaned;
  }
  return getLocalCachedProducts();
}

async function saveLocalCachedProduct(item: JewelryItem): Promise<void> {
  const cleanItem = ensureProductHasValidImage(item);
  const currentList = await getAllCachedProductsAsync();
  const idx = currentList.findIndex((p) => p.id === cleanItem.id);
  if (idx >= 0) {
    currentList[idx] = cleanItem;
  } else {
    currentList.unshift(cleanItem);
  }
  inMemoryProductsCache = currentList;
  await idbSet(LOCAL_PRODUCTS_CACHE_KEY, currentList);
  try {
    localStorage.setItem(LOCAL_PRODUCTS_CACHE_KEY, JSON.stringify(currentList));
  } catch {
    // IndexedDB stores the full product list without size limits
  }
  window.dispatchEvent(new CustomEvent(PRODUCTS_CHANGED_EVENT, { detail: currentList }));
}

async function removeLocalCachedProduct(productId: string): Promise<void> {
  const currentList = await getAllCachedProductsAsync();
  const filtered = currentList.filter((p) => p.id !== productId);
  inMemoryProductsCache = filtered;
  await idbSet(LOCAL_PRODUCTS_CACHE_KEY, filtered);
  try {
    localStorage.setItem(LOCAL_PRODUCTS_CACHE_KEY, JSON.stringify(filtered));
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent(PRODUCTS_CHANGED_EVENT, { detail: filtered }));
}

export function getDeletedProductIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markProductDeleted(productId: string) {
  try {
    const deleted = getDeletedProductIds();
    if (!deleted.includes(productId)) {
      deleted.push(productId);
      localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(deleted));
    }
  } catch (e) {
    console.warn('Could not record deleted product ID:', e);
  }
}

export interface ProductFormData {
  name: string;
  category: JewelryCategory;
  description: string;
  images: string[];
  videoUrl?: string;
  status: 'Published' | 'Draft' | 'Archived';
  metal?: string;
  gemstones?: string;
  occasion?: string;
  customizable?: boolean;
  featured?: boolean;
}

/**
 * No-op seed to avoid overwriting customized default catalogue products in Firestore
 */
export async function seedDefaultCatalogueProducts(): Promise<void> {
  return;
}

/**
 * Fetch all published products for the client store
 */
export async function getPublishedProducts(): Promise<JewelryItem[]> {
  const map = new Map<string, JewelryItem>();

  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('status', '==', 'Published')
    );
    const snap = await Promise.race([
      getDocs(q),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500)),
    ]);
    if (snap) {
      snap.forEach((d) => {
        const data = d.data();
        const rawImages = Array.isArray(data.images)
          ? data.images.map((img: string) => normalizeImageUrl(img)).filter((img: string) => img.length > 0)
          : [];
        const item = ensureProductHasValidImage({
          id: d.id,
          name: data.name,
          category: data.category,
          displayCategory: data.category,
          image: rawImages.length > 0 ? rawImages[0] : '',
          images: rawImages,
          videoUrl: data.videoUrl || '',
          status: data.status || 'Published',
          description: data.description || '',
          details: {
            metal: data.metal || '92.5 Sterling Silver',
            purity: '92.5 Sterling Grade',
            gemstones: data.gemstones || 'Emeralds & Fine CZ',
            finish: 'Liquid Platinum Polish',
            origin: 'Hyderabad Atelier',
            customizable: data.customizable ?? true,
          },
          occasion: data.occasion || 'Festive & Weddings',
          featured: data.featured ?? false,
          authorEmail: data.authorEmail,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined,
        });
        map.set(d.id, item);
      });
    }
  } catch (error) {
    console.warn('Products Firestore fetch notice (using local IndexedDB cache):', error);
  }

  // Merge local/IndexedDB cached products (takes precedence so newly uploaded images show immediately)
  const localItems = await getAllCachedProductsAsync();
  localItems
    .filter((p) => (p.status || 'Published') === 'Published')
    .forEach((p) => {
      map.set(p.id, ensureProductHasValidImage(p));
    });

  return Array.from(map.values());
}

/**
 * Real-time listener for all products (Admin view)
 */
export function subscribeAllProducts(
  onSuccess: (products: JewelryItem[]) => void,
  onError: (err: unknown) => void
) {
  let latestFirestoreItems: JewelryItem[] = [];

  const emitMerged = async () => {
    const map = new Map<string, JewelryItem>();
    latestFirestoreItems.forEach((it) => map.set(it.id, ensureProductHasValidImage(it)));
    const localItems = await getAllCachedProductsAsync();
    localItems.forEach((it) => map.set(it.id, ensureProductHasValidImage(it)));
    onSuccess(Array.from(map.values()));
  };

  // Emit cached products immediately
  emitMerged();

  const handleLocalProductsEvent = () => {
    emitMerged();
  };
  window.addEventListener(PRODUCTS_CHANGED_EVENT, handleLocalProductsEvent);

  const colRef = collection(db, PRODUCTS_COLLECTION);
  const unsubFirestore = onSnapshot(
    colRef,
    (snap) => {
      const items: JewelryItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        const rawImages = Array.isArray(data.images)
          ? data.images.map((img: string) => normalizeImageUrl(img)).filter((img: string) => img.length > 0)
          : [];
        items.push(
          ensureProductHasValidImage({
            id: d.id,
            name: data.name,
            category: data.category,
            displayCategory: data.category,
            image: rawImages.length > 0 ? rawImages[0] : '',
            images: rawImages,
            videoUrl: data.videoUrl || '',
            status: data.status || 'Published',
            description: data.description || '',
            details: {
              metal: data.metal || '92.5 Sterling Silver',
              purity: '92.5 Sterling Grade',
              gemstones: data.gemstones || 'Emeralds & Fine CZ',
              finish: 'Liquid Platinum Polish',
              origin: 'Hyderabad Atelier',
              customizable: data.customizable ?? true,
            },
            occasion: data.occasion || 'Festive & Weddings',
            featured: data.featured ?? false,
            authorEmail: data.authorEmail,
            authorUid: data.authorUid,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
          })
        );
      });
      latestFirestoreItems = items;
      emitMerged();
    },
    (err) => {
      console.warn('Products snapshot notice (using local IndexedDB cache):', err);
      emitMerged();
      onError(err);
    }
  );

  return () => {
    window.removeEventListener(PRODUCTS_CHANGED_EVENT, handleLocalProductsEvent);
    unsubFirestore();
  };
}

/**
 * Save new product to IndexedDB, localStorage, and Firestore
 */
export async function createProduct(formData: ProductFormData): Promise<string> {
  const adminIdentity = getActiveAdminIdentity();
  const productId = 'jb-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
  const cleanImages = (formData.images || [])
    .map((img) => normalizeImageUrl(img))
    .filter((img) => img.length > 0);
  const finalImages = cleanImages.length > 0 ? cleanImages : [heroIsolatedJewelryImg];

  const newItem: JewelryItem = ensureProductHasValidImage({
    id: productId,
    name: formData.name.trim(),
    category: formData.category,
    displayCategory: formData.category,
    image: finalImages[0],
    images: finalImages,
    videoUrl: formData.videoUrl || '',
    status: formData.status || 'Published',
    description: formData.description.trim(),
    details: {
      metal: formData.metal || '92.5 Sterling Silver',
      purity: '92.5 Sterling Grade',
      gemstones: formData.gemstones || 'Emeralds & Fine CZ',
      finish: 'Liquid Platinum Polish',
      origin: 'Hyderabad Atelier',
      customizable: formData.customizable ?? true,
    },
    occasion: formData.occasion || 'Festive & Celebrations',
    featured: formData.featured ?? false,
    authorEmail: adminIdentity?.email || BOOTSTRAPPED_ADMIN_EMAIL,
    createdAt: new Date().toISOString(),
  });

  // 1. Always save to local IndexedDB cache first so it never fails or shows blank
  await saveLocalCachedProduct(newItem);

  // 2. Sync to Firestore with an 800ms timeout so UI never hangs
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await Promise.race([
      setDoc(docRef, {
        name: newItem.name,
        category: newItem.category,
        description: newItem.description,
        images: finalImages,
        videoUrl: newItem.videoUrl || '',
        status: newItem.status,
        metal: newItem.details?.metal || '92.5 Sterling Silver',
        gemstones: newItem.details?.gemstones || 'Emeralds & Fine CZ',
        occasion: newItem.occasion || 'Festive & Celebrations',
        customizable: newItem.details?.customizable ?? true,
        featured: newItem.featured ?? false,
        authorEmail: adminIdentity?.email || BOOTSTRAPPED_ADMIN_EMAIL,
        authorUid: auth.currentUser?.uid || adminIdentity?.uid || 'admin-universal-uid',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 800)),
    ]);
  } catch (error) {
    console.warn('Product saved in IndexedDB cache (Firestore sync notice):', error);
  }

  return productId;
}

/**
 * Update an existing product in IndexedDB, localStorage, and Firestore
 */
export async function updateProduct(productId: string, formData: Partial<ProductFormData>): Promise<void> {
  const adminIdentity = getActiveAdminIdentity();
  const existingCached = (await getAllCachedProductsAsync()).find((p) => p.id === productId);
  const baseDefault = CATALOGUE_ITEMS.find((p) => p.id === productId);
  const base = existingCached || baseDefault;

  const cleanImages = (formData.images || base?.images || (base?.image ? [base.image] : []))
    .map((img) => normalizeImageUrl(img))
    .filter((img) => img.length > 0);
  const finalImages = cleanImages.length > 0 ? cleanImages : [baseDefault?.image || heroIsolatedJewelryImg];

  const updatedItem: JewelryItem = ensureProductHasValidImage({
    id: productId,
    name: (formData.name ?? base?.name ?? 'Artisan Jewellery').trim(),
    category: (formData.category ?? base?.category ?? 'HAARAMS') as JewelryCategory,
    displayCategory: (formData.category ?? base?.displayCategory ?? base?.category ?? 'HAARAMS') as string,
    image: finalImages[0],
    images: finalImages,
    videoUrl: formData.videoUrl ?? base?.videoUrl ?? '',
    status: formData.status ?? base?.status ?? 'Published',
    description: (formData.description ?? base?.description ?? '').trim(),
    details: {
      metal: formData.metal || base?.details?.metal || '92.5 Sterling Silver',
      purity: '92.5 Sterling Grade',
      gemstones: formData.gemstones || base?.details?.gemstones || 'Emeralds & Fine CZ',
      finish: 'Liquid Platinum Polish',
      origin: 'Hyderabad Atelier',
      customizable: formData.customizable ?? base?.details?.customizable ?? true,
    },
    occasion: formData.occasion || base?.occasion || 'Festive & Weddings',
    featured: formData.featured ?? base?.featured ?? false,
    authorEmail: adminIdentity?.email || BOOTSTRAPPED_ADMIN_EMAIL,
    updatedAt: new Date().toISOString(),
  });

  // 1. Immediately persist to IndexedDB & local cache so the updated image never disappears or fails
  await saveLocalCachedProduct(updatedItem);

  // 2. Also sync to Firestore with an 800ms timeout so UI never hangs
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  try {
    await Promise.race([
      setDoc(
        docRef,
        {
          name: updatedItem.name,
          category: updatedItem.category,
          description: updatedItem.description,
          images: finalImages,
          videoUrl: updatedItem.videoUrl || '',
          status: updatedItem.status,
          metal: updatedItem.details?.metal || '92.5 Sterling Silver',
          gemstones: updatedItem.details?.gemstones || 'Emeralds & Fine CZ',
          occasion: updatedItem.occasion || 'Festive & Weddings',
          customizable: updatedItem.details?.customizable ?? true,
          featured: updatedItem.featured ?? false,
          authorEmail: adminIdentity?.email || BOOTSTRAPPED_ADMIN_EMAIL,
          authorUid: auth.currentUser?.uid || adminIdentity?.uid || 'admin-universal-uid',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      ),
      new Promise<void>((resolve) => setTimeout(resolve, 800)),
    ]);
  } catch (syncErr) {
    console.warn('Updated product saved in IndexedDB (Firestore sync notice):', syncErr);
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string): Promise<void> {
  markProductDeleted(productId);
  await removeLocalCachedProduct(productId);
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    console.warn(`Firestore delete note for ${productId}:`, error);
  }
}
