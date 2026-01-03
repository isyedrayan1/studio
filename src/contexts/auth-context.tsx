"use client";

// ============================================
// AUTHENTICATION CONTEXT
// ============================================
// Provides auth state for admins (Firebase Auth + Firestore) and associates (Firestore)

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import type { User, AssociateAccount } from '@/lib/types';
import {
  signIn as fbSignIn,
  signInAnonymously as fbSignInAnonymously,
  signOut as fbSignOut,
  onAuthChange,
  getUserProfile,
  validateAssociateLogin,
} from '@/lib/firebase';

interface AuthContextType {
  // State
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  associateAccount: AssociateAccount | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAssociate: boolean;
  
  // Actions
  signInAdmin: (email: string, password: string) => Promise<void>;
  signInAssociate: (loginId: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Role checks
  canEdit: boolean;  // admin or associate
  canDelete: boolean;  // admin only
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [associateAccount, setAssociateAccount] = useState<AssociateAccount | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore associate session from localStorage
  useEffect(() => {
    const storedAssociate = localStorage.getItem('associateAccount');
    if (storedAssociate) {
      try {
        const account = JSON.parse(storedAssociate);
        setAssociateAccount(account);
      } catch (e) {
        localStorage.removeItem('associateAccount');
      }
    }
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        // Load user profile from Firestore
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Sign in as admin (Firebase Auth)
  const signInAdmin = useCallback(async (email: string, password: string) => {
    await fbSignIn(email, password);
    // Auth state will update via onAuthChange
  }, []);

  // Sign in as associate (Firestore validation + Anonymous Firebase Auth)
  const signInAssociate = useCallback(async (loginId: string, password: string) => {
    const account = await validateAssociateLogin(loginId, password);
    if (!account) {
      throw new Error('Invalid login credentials or account is disabled');
    }
    
    // Sign in to Firebase anonymously to enable Storage/Firestore rules
    try {
      await fbSignInAnonymously();
    } catch (e) {
      console.warn('Anonymous sign-in failed, but associate login proceeding:', e);
    }

    setAssociateAccount(account);
    localStorage.setItem('associateAccount', JSON.stringify(account));
    setLoading(false);
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      if (firebaseUser) {
        await fbSignOut();
      }
      setUserProfile(null);
      setAssociateAccount(null);
      localStorage.removeItem('associateAccount');
    } finally {
      setLoading(false);
    }
  }, [firebaseUser]);

  // Computed values
  const isAuthenticated = !!firebaseUser || !!associateAccount;
  const isAdmin = !!userProfile && userProfile.role === 'admin';
  const isAssociate = !!associateAccount;
  const canEdit = isAdmin || isAssociate;
  const canDelete = isAdmin;

  const value: AuthContextType = {
    firebaseUser,
    userProfile,
    associateAccount,
    loading,
    isAuthenticated,
    isAdmin,
    isAssociate,
    signInAdmin,
    signInAssociate,
    signOut,
    canEdit,
    canDelete,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
