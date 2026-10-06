import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const SETTINGS_DOC_REF = doc(db, 'settings', 'community');
const CACHE_KEY = 'jb_instagram_community_count';
const FOLLOWER_CHANGE_EVENT = 'jb_follower_count_changed';
const DEFAULT_COUNT = 104280; // 104K reached milestone

export interface CommunitySettings {
  instagramFollowersCount: number;
  lastUpdated?: any;
}

/**
 * Clean numeric string formatter (e.g. 104,280)
 */
export function formatFollowerCount(count: number): string {
  return count.toLocaleString('en-US');
}

/**
 * Realtime listener for Instagram follower count with instantaneous local fallback
 */
export function subscribeFollowerCount(callback: (count: number) => void): () => void {
  const emitFromCacheOrDefault = () => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = parseInt(cached, 10);
      if (!isNaN(parsed) && parsed > 0) {
        callback(parsed);
        return;
      }
    }
    callback(DEFAULT_COUNT);
  };

  // 1. Immediately emit cached or default count so UI has zero delay
  emitFromCacheOrDefault();

  // 2. Listen for immediate local updates from Admin CMS
  const handleLocalUpdate = () => {
    emitFromCacheOrDefault();
  };
  window.addEventListener(FOLLOWER_CHANGE_EVENT, handleLocalUpdate);
  window.addEventListener('storage', handleLocalUpdate);

  // 3. Fetch live updates from Firestore `settings/community`
  let unsubFirestore: (() => void) | null = null;
  try {
    unsubFirestore = onSnapshot(
      SETTINGS_DOC_REF,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (typeof data.instagramFollowersCount === 'number') {
            localStorage.setItem(CACHE_KEY, data.instagramFollowersCount.toString());
            callback(data.instagramFollowersCount);
          }
        }
      },
      (error) => {
        console.warn('Community count Firestore subscription error:', error);
      }
    );
  } catch (err) {
    console.warn('Failed to attach Firestore snapshot:', err);
  }

  return () => {
    window.removeEventListener(FOLLOWER_CHANGE_EVENT, handleLocalUpdate);
    window.removeEventListener('storage', handleLocalUpdate);
    if (unsubFirestore) unsubFirestore();
  };
}

/**
 * Updates follower count (Admin or automated sync)
 */
export async function updateFollowerCount(newCount: number): Promise<void> {
  localStorage.setItem(CACHE_KEY, newCount.toString());
  window.dispatchEvent(new Event(FOLLOWER_CHANGE_EVENT));
  try {
    await setDoc(
      SETTINGS_DOC_REF,
      {
        instagramFollowersCount: newCount,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Updated follower count locally:', err);
  }
}
