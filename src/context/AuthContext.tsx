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

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  createAdminAccountWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogleAdmin: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isAdmin: false,
  loading: true,
  loginWithEmail: async () => {},
  createAdminAccountWithEmail: async () => {},
  loginWithGoogleAdmin: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    validateFirebaseConnection();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userEmail = (user.email || '').toLowerCase().trim();
        const isTargetAdmin = userEmail === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

        if (isTargetAdmin) {
          setIsAdmin(true);
          try {
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
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
      throw new Error(`Access restricted. Only the authorized administrator (${BOOTSTRAPPED_ADMIN_EMAIL}) can access this panel.`);
    }
    await signInWithEmailAndPassword(auth, cleanEmail, pass);
  };

  const createAdminAccountWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
      throw new Error(`Access restricted. Only ${BOOTSTRAPPED_ADMIN_EMAIL} can be initialized as administrator.`);
    }
    const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    if (res.user) {
      try {
        const adminDocRef = doc(db, 'admins', res.user.uid);
        await setDoc(adminDocRef, {
          email: cleanEmail,
          role: 'admin',
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Created admin registration record:', err);
      }
    }
  };

  const loginWithGoogleAdmin = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const signedInEmail = (result.user.email || '').toLowerCase().trim();
    if (signedInEmail !== BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
      await signOut(auth);
      throw new Error(`Access Denied: You logged in with ${result.user.email}. Only ${BOOTSTRAPPED_ADMIN_EMAIL} is authorized.`);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out Error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        loginWithEmail,
        createAdminAccountWithEmail,
        loginWithGoogleAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
