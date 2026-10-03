import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface CustomerInquiry {
  id: string;
  source: 'BESPOKE_CUSTOMIZATION' | 'CONTACT_CONVERSATION';
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  jewelleryType?: string;
  inquiry: string;
  status: 'New' | 'Contacted' | 'Closed';
  createdAt: any;
}

const INQUIRIES_COLLECTION = 'inquiries';
const LOCAL_STORAGE_DELETED_INQUIRIES_KEY = 'jewelbotanica_deleted_inquiries_ids';
const LOCAL_STORAGE_INQUIRIES_BACKUP_KEY = 'jewelbotanica_inquiries_backup';

function getDeletedInquiryIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_DELETED_INQUIRIES_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {
    // Ignore storage parse error
  }
  return new Set();
}

function addDeletedInquiryId(id: string) {
  try {
    const ids = getDeletedInquiryIds();
    ids.add(id);
    localStorage.setItem(LOCAL_STORAGE_DELETED_INQUIRIES_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // Ignore storage write error
  }
}

/**
 * Saves a customer inquiry to Firestore with automatic timestamp
 */
export async function submitInquiry(data: {
  source: 'BESPOKE_CUSTOMIZATION' | 'CONTACT_CONVERSATION';
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  jewelleryType?: string;
  inquiry: string;
}): Promise<string> {
  const newRef = doc(collection(db, INQUIRIES_COLLECTION));
  const newRecord = {
    ...data,
    status: 'New',
    createdAt: serverTimestamp(),
  };

  try {
    await setDoc(newRef, newRecord);
  } catch (err) {
    console.warn('Firestore setDoc failed for inquiry, saving to local backup:', err);
  }

  // Also cache locally
  try {
    const rawBackup = localStorage.getItem(LOCAL_STORAGE_INQUIRIES_BACKUP_KEY);
    const backupList: CustomerInquiry[] = rawBackup ? JSON.parse(rawBackup) : [];
    backupList.unshift({
      id: newRef.id,
      ...data,
      status: 'New',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(LOCAL_STORAGE_INQUIRIES_BACKUP_KEY, JSON.stringify(backupList.slice(0, 100)));
  } catch {
    // Ignore
  }

  return newRef.id;
}

/**
 * Subscribes to live inquiries for the Admin Portal
 */
export function subscribeInquiries(
  callback: (inquiries: CustomerInquiry[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const q = query(collection(db, INQUIRIES_COLLECTION), orderBy('createdAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        const deletedIds = getDeletedInquiryIds();
        const items: CustomerInquiry[] = [];
        snapshot.forEach((d) => {
          if (deletedIds.has(d.id)) {
            // Already deleted by admin
            return;
          }
          const raw = d.data();
          items.push({
            id: d.id,
            source: raw.source || 'BESPOKE_CUSTOMIZATION',
            name: raw.name || 'Anonymous Patron',
            email: raw.email || '',
            phone: raw.phone || '',
            location: raw.location || '',
            jewelleryType: raw.jewelleryType || '',
            inquiry: raw.inquiry || '',
            status: raw.status || 'New',
            createdAt: raw.createdAt,
          });
        });

        // Merge with any local backup not present
        try {
          const rawBackup = localStorage.getItem(LOCAL_STORAGE_INQUIRIES_BACKUP_KEY);
          if (rawBackup) {
            const localList: CustomerInquiry[] = JSON.parse(rawBackup);
            for (const loc of localList) {
              if (!deletedIds.has(loc.id) && !items.find((i) => i.id === loc.id)) {
                items.push(loc);
              }
            }
          }
        } catch {
          // Ignore
        }

        callback(items);
      },
      (err) => {
        console.warn('Inquiries subscription error, loading from local backup:', err);
        const deletedIds = getDeletedInquiryIds();
        try {
          const rawBackup = localStorage.getItem(LOCAL_STORAGE_INQUIRIES_BACKUP_KEY);
          if (rawBackup) {
            const localList: CustomerInquiry[] = JSON.parse(rawBackup);
            callback(localList.filter((i) => !deletedIds.has(i.id)));
          }
        } catch {
          // Ignore
        }
        if (onError) onError(err);
      }
    );
  } catch (e: any) {
    if (onError) onError(e);
    return () => {};
  }
}

/**
 * Update an inquiry status (e.g. New -> Contacted / Closed)
 */
export async function updateInquiryStatus(id: string, status: 'New' | 'Contacted' | 'Closed'): Promise<void> {
  try {
    const ref = doc(db, INQUIRIES_COLLECTION, id);
    await setDoc(ref, { status, updatedAt: serverTimestamp() }, { merge: true });
  } catch (err) {
    console.warn('Firestore update status notice:', err);
  }

  // Update in local backup
  try {
    const rawBackup = localStorage.getItem(LOCAL_STORAGE_INQUIRIES_BACKUP_KEY);
    if (rawBackup) {
      const list: CustomerInquiry[] = JSON.parse(rawBackup);
      const updated = list.map((i) => (i.id === id ? { ...i, status } : i));
      localStorage.setItem(LOCAL_STORAGE_INQUIRIES_BACKUP_KEY, JSON.stringify(updated));
    }
  } catch {
    // Ignore
  }
}

/**
 * Delete an inquiry:
 * Immediately marks as deleted in local suppression storage and backup,
 * and attempts Firestore deleteDoc.
 */
export async function deleteInquiry(id: string): Promise<void> {
  // 1. Immediately record in suppression registry so onSnapshot will never return it
  addDeletedInquiryId(id);

  // 2. Remove from local backup
  try {
    const rawBackup = localStorage.getItem(LOCAL_STORAGE_INQUIRIES_BACKUP_KEY);
    if (rawBackup) {
      const list: CustomerInquiry[] = JSON.parse(rawBackup);
      const filtered = list.filter((i) => i.id !== id);
      localStorage.setItem(LOCAL_STORAGE_INQUIRIES_BACKUP_KEY, JSON.stringify(filtered));
    }
  } catch {
    // Ignore
  }

  // 3. Delete from Firestore
  try {
    const ref = doc(db, INQUIRIES_COLLECTION, id);
    await deleteDoc(ref);
  } catch (err: any) {
    console.warn('Firestore deleteDoc notice (handled locally):', err);
  }
}
