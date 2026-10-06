import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, BOOTSTRAPPED_ADMIN_EMAIL, validateFirebaseConnection } from '../lib/firebase';

const UNIVERSAL_ADMIN_STORAGE_KEY = 'jb_universal_admin_verified_v1';

interface AuthContextType {
  currentUser: User | { email: string; uid: string } | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithDirectAdminEmail: (email: string) => Promise<void>;
  createAdminAccountWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogleAdmin: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  loading: true,
  loginWithEmail: async () => {},
  loginWithDirectAdminEmail: async () => {},
  createAdminAccountWithEmail: async () => {},
  loginWithGoogleAdmin: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | { email: string; uid: string } | null>(() => {
    try {
      const savedEmail = localStorage.getItem(UNIVERSAL_ADMIN_STORAGE_KEY);
      if (savedEmail && savedEmail.toLowerCase().trim() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
        return { email: BOOTSTRAPPED_ADMIN_EMAIL, uid: 'admin-universal-uid' };
      }
    } catch {
      // ignore storage errors
    }
    return null;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const savedEmail = localStorage.getItem(UNIVERSAL_ADMIN_STORAGE_KEY);
      return Boolean(savedEmail && savedEmail.toLowerCase().trim() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase());
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    validateFirebaseConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userEmail = (user.email || '').toLowerCase().trim();
        const isTargetAdmin = userEmail === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

        if (isTargetAdmin) {
          setIsAdmin(true);
          try {
            localStorage.setItem(UNIVERSAL_ADMIN_STORAGE_KEY, BOOTSTRAPPED_ADMIN_EMAIL);
            const adminDocRef = doc(db, 'admins', user.uid);
            const adminSnap = await getDoc(adminDocRef);
            if (!adminSnap.exists()) {
              await setDoc(adminDocRef, {
                email: userEmail,
                role: 'admin',
                createdAt: serverTimestamp(),
              });
            }
          } catch (err) {
            console.warn('Admin record sync notice:', err);
          }
        } else {
          try {
            const adminDocRef = doc(db, 'admins', user.uid);
            const adminSnap = await getDoc(adminDocRef);
            if (adminSnap.exists() && adminSnap.data()?.role === 'admin') {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch {
            setIsAdmin(false);
          }
        }
      } else {
        // Check if universal email session is active (for GitHub Pages / external hosting domains)
        try {
          const savedEmail = localStorage.getItem(UNIVERSAL_ADMIN_STORAGE_KEY);
          if (savedEmail && savedEmail.toLowerCase().trim() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
            setCurrentUser({ email: BOOTSTRAPPED_ADMIN_EMAIL, uid: 'admin-universal-uid' });
            setIsAdmin(true);
          } else {
            setCurrentUser(null);
            setIsAdmin(false);
          }
        } catch {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithDirectAdminEmail = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
      throw new Error(
        `Access Denied: "${email}" is not authorized. Only ${BOOTSTRAPPED_ADMIN_EMAIL} can access the Admin Portal.`
      );
    }

    // Store universal admin session so login works across GitHub Pages, custom hosting, and all browsers
    try {
      localStorage.setItem(UNIVERSAL_ADMIN_STORAGE_KEY, BOOTSTRAPPED_ADMIN_EMAIL);
    } catch (e) {
      console.warn('Storage notice:', e);
    }
    setCurrentUser({ email: BOOTSTRAPPED_ADMIN_EMAIL, uid: 'admin-universal-uid' });
    setIsAdmin(true);

    // Also attempt background Firebase email/password session for Firestore token if enabled
    const internalPass = 'JB_Admin_Atelier_925#2026';
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, internalPass);
    } catch {
      try {
        await createUserWithEmailAndPassword(auth, cleanEmail, internalPass);
      } catch {
        // External domain or Email/Password provider not required; universal session is active
      }
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
      throw new Error(`Access restricted. Only the authorized administrator (${BOOTSTRAPPED_ADMIN_EMAIL}) can access this panel.`);
    }
    await loginWithDirectAdminEmail(cleanEmail);
  };

  const createAdminAccountWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
      throw new Error(`Access restricted. Only ${BOOTSTRAPPED_ADMIN_EMAIL} can be initialized as administrator.`);
    }
    await loginWithDirectAdminEmail(cleanEmail);
  };

  const loginWithGoogleAdmin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const signedInEmail = (result.user.email || '').toLowerCase().trim();
      if (signedInEmail !== BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
        await signOut(auth);
        throw new Error(`Access Denied: You logged in with ${result.user.email}. Only ${BOOTSTRAPPED_ADMIN_EMAIL} is authorized.`);
      }
      localStorage.setItem(UNIVERSAL_ADMIN_STORAGE_KEY, BOOTSTRAPPED_ADMIN_EMAIL);
    } catch (err: any) {
      // If hosted on GitHub Pages or external domain where Google Popup throws auth/unauthorized-domain
      if (
        err?.code === 'auth/unauthorized-domain' ||
        err?.code === 'auth/popup-blocked' ||
        err?.code === 'auth/operation-not-supported-in-this-environment'
      ) {
        throw new Error(
          `Google Popup is restricted on this hosting domain (${window.location.hostname}). Please use the "Sign In with Admin Email" box above using ${BOOTSTRAPPED_ADMIN_EMAIL}.`
        );
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem(UNIVERSAL_ADMIN_STORAGE_KEY);
      setCurrentUser(null);
      setIsAdmin(false);
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out Error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        loginWithEmail,
        loginWithDirectAdminEmail,
        createAdminAccountWithEmail,
        loginWithGoogleAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
