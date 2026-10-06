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
import { OperationType, handleFirestoreError } from './firestoreError';
import { JewelryItem, JewelryCategory } from '../types/jewelry';
import { CATALOGUE_ITEMS } from '../data/jewelryData';

const PRODUCTS_COLLECTION = 'products';
const DELETED_PRODUCTS_KEY = 'jb_deleted_product_ids_v1';
const LOCAL_PRODUCTS_CACHE_KEY = 'jb_local_products_cache_v1';
const UNIVERSAL_ADMIN_STORAGE_KEY = 'jb_universal_admin_verified_v1';

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
  return null;
}

export function getLocalCachedProducts(): JewelryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalCachedProduct(item: JewelryItem) {
  try {
    const list = getLocalCachedProducts();
    const idx = list.findIndex((p) => p.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem(LOCAL_PRODUCTS_CACHE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Local product cache notice:', e);
  }
}

function removeLocalCachedProduct(productId: string) {
  try {
    const list = getLocalCachedProducts().filter((p) => p.id !== productId);
    localStorage.setItem(LOCAL_PRODUCTS_CACHE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
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
 * Seed all default 9 catalogue products into Firestore if they don't exist yet
 */
export async function seedDefaultCatalogueProducts(): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const deletedIds = getDeletedProductIds();

  for (const item of CATALOGUE_ITEMS) {
    if (deletedIds.includes(item.id)) continue;
    try {
      const docRef = doc(db, PRODUCTS_COLLECTION, item.id);
      await setDoc(
        docRef,
        {
          name: item.name,
          category: item.category,
          description: item.description,
          images: item.images && item.images.length > 0 ? item.images : [item.image],
          videoUrl: item.videoUrl || '',
          status: item.status || 'Published',
          metal: item.details?.metal || '92.5 Sterling Silver',
          gemstones: item.details?.gemstones || 'Emeralds & Fine CZ',
          occasion: item.occasion || 'Festive & Weddings',
          customizable: item.details?.customizable ?? true,
          featured: item.featured ?? false,
          authorEmail: user.email || 'Admin',
          authorUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn(`Seed product notice for ${item.id}:`, err);
    }
  }
}

/**
 * Fetch all published products for the client store
 */
export async function getPublishedProducts(): Promise<JewelryItem[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('status', '==', 'Published')
    );
    const snap = await getDocs(q);
    const items: JewelryItem[] = [];
    snap.forEach((d) => {
      const data = d.data();
      items.push({
        id: d.id,
        name: data.name,
        category: data.category,
        displayCategory: data.category,
        image: data.images && data.images.length > 0 ? data.images[0] : '',
        images: data.images || [],
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
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, PRODUCTS_COLLECTION);
    return [];
  }
}

/**
 * Real-time listener for all products (Admin view)
 */
export function subscribeAllProducts(
  onSuccess: (products: JewelryItem[]) => void,
  onError: (err: unknown) => void
) {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snap) => {
      const items: JewelryItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          name: data.name,
          category: data.category,
          displayCategory: data.category,
          image: data.images && data.images.length > 0 ? data.images[0] : '',
          images: data.images || [],
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
        });
      });
      onSuccess(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, PRODUCTS_COLLECTION);
      onError(err);
    }
  );
}

/**
 * Save new product to Firestore
 */
export async function createProduct(formData: ProductFormData): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in as administrator to create products.');

  const productId = 'jb-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);

  const payload = {
    name: formData.name.trim(),
    category: formData.category,
    description: formData.description.trim(),
    images: formData.images,
    videoUrl: formData.videoUrl || '',
    status: formData.status,
    metal: formData.metal || '92.5 Sterling Silver',
    gemstones: formData.gemstones || 'Emeralds & Fine CZ',
    occasion: formData.occasion || 'Festive & Celebrations',
    customizable: formData.customizable ?? true,
    featured: formData.featured ?? false,
    authorEmail: user.email || 'Admin',
    authorUid: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload);
    return productId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${PRODUCTS_COLLECTION}/${productId}`);
    throw error;
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(productId: string, formData: Partial<ProductFormData>): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('You must be signed in as administrator to update products.');

  const docRef = doc(db, PRODUCTS_COLLECTION, productId);

  const payload: Record<string, any> = {
    ...formData,
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(docRef, payload);
  } catch (error) {
    // If doc didn't exist in Firestore yet (e.g. from default 9 catalogue products), setDoc with full payload
    try {
      await setDoc(
        docRef,
        {
          name: formData.name || 'Artisan Jewellery',
          category: formData.category || 'HAARAMS',
          description: formData.description || '',
          images: formData.images || [],
          status: formData.status || 'Published',
          metal: formData.metal || '92.5 Sterling Silver',
          gemstones: formData.gemstones || 'Emeralds & Fine CZ',
          occasion: formData.occasion || 'Festive & Weddings',
          customizable: formData.customizable ?? true,
          featured: formData.featured ?? false,
          authorEmail: user.email || 'Admin',
          authorUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (createErr) {
      handleFirestoreError(createErr, OperationType.UPDATE, `${PRODUCTS_COLLECTION}/${productId}`);
      throw error;
    }
  }
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string): Promise<void> {
  markProductDeleted(productId);
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    console.warn(`Firestore delete note for ${productId}:`, error);
  }
}
