'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { StudentProfile } from '@/types/profile';
import { apiClient } from '@/lib/api/client';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: StudentProfile | null;
  loading: boolean;
  token: string | null;
  register: (fullName: string, email: string, pass: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<StudentProfile | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  token: null,
  register: async () => {},
  login: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  refreshProfile: async () => null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const fetchProfile = async (firebaseUser: FirebaseUser): Promise<StudentProfile | null> => {
    try {
      const idToken = await firebaseUser.getIdToken();
      setToken(idToken);
      const res = await apiClient<StudentProfile>('/profile');
      setProfile(res);
      return res;
    } catch (err) {
      console.warn('Could not fetch student profile from backend:', err);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchProfile(firebaseUser);
      } else {
        setUser(null);
        setProfile(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (fullName: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, pass);
      const idToken = await credential.user.getIdToken();
      setToken(idToken);
      setUser(credential.user);

      // Create initial Firestore user document with full name
      await apiClient('/profile', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          email,
          gender: 'OTHER',
          category: 'GENERAL',
          familyAnnualIncome: 0,
        }),
      });

      await fetchProfile(credential.user);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      setUser(credential.user);
      await fetchProfile(credential.user);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      setUser(credential.user);
      await fetchProfile(credential.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async (): Promise<StudentProfile | null> => {
    if (!auth.currentUser) return null;
    return await fetchProfile(auth.currentUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        token,
        register,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
