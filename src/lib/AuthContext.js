'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    // Fetch profile
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    if (userDoc.exists()) {
      setUserProfile(userDoc.data());
    }
    return result;
  }, []);

  const signUp = useCallback(async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Update display name
    await updateProfile(result.user, { displayName });
    // Create Firestore user doc
    await setDoc(doc(db, 'users', result.user.uid), {
      email,
      name: displayName,
      role: 'customer',
      createdAt: serverTimestamp(),
      cart: [],
      wishlist: [],
      phone: '',
      addresses: [],
    });
    setUserProfile({ email, name: displayName, role: 'customer', cart: [], wishlist: [], phone: '', addresses: [] });
    return result;
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  }, []);

  const isAdmin = userProfile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signIn, signUp, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
