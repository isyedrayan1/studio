"use client";

// ============================================
// AUTHENTICATION CONTEXT
// ============================================
// Provides auth state and user profile throughout the app

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import type { User } from '@/lib/types';
import {
  signIn as fbSignIn,
  register as fbRegister,
  signOut as fbSignOut,
  onAuthChange,
  getUserProfile,
} from '@/lib/firebase';

interface AuthContextType {
  // State
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAssociate: boolean;
  
  // Actions
  signIn: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  
  // Role checks
  canEdit: boolean;  // admin or associate
  canDelete: boolean;  // admin only
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthChange(async (user) => {
      setFirebaseUser(user);
      
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      await fbSignIn(email, password);
    } finally {
      setLoading(false);
    }
  }, []);

  // Register new user (creates associate by default)
  const register = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      await fbRegister(email, password, name);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await fbSignOut();
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Computed values
  const isAuthenticated = !!firebaseUser;
  const isAdmin = userProfile?.role === 'admin';
  const isAssociate = userProfile?.role === 'associate';
  const canEdit = isAdmin || isAssociate;
  const canDelete = isAdmin;

  const value: AuthContextType = {
    firebaseUser,
    userProfile,
    loading,
    isAuthenticated,
    isAdmin,
    isAssociate,
    signIn,
    register,
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
