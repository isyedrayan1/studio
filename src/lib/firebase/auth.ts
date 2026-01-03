// ============================================
// FIREBASE SERVICES - AUTHENTICATION
// ============================================

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';
import { COLLECTIONS } from './collections';
import type { User } from '../types';

// Sign in with email/password
export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// Sign in anonymously (for associates)
export async function signInAnonymously(): Promise<FirebaseUser> {
  const userCredential = await firebaseSignInAnonymously(auth);
  return userCredential.user;
}

// Register new user with email/password - creates associate by default
export async function register(email: string, password: string, name: string): Promise<FirebaseUser> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Auto-create profile in Firestore as associate
  await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
    email: user.email,
    name: name,
    role: 'associate', // Default role for new registrations
    createdAt: serverTimestamp(),
  });
  
  return user;
}

// Sign out
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// Get current user
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

// Listen to auth state changes
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<User | null> {
  const docRef = doc(db, COLLECTIONS.USERS, uid);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  } as User;
}

// Create or update user profile
export async function setUserProfile(uid: string, data: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<void> {
  const docRef = doc(db, COLLECTIONS.USERS, uid);
  const existingUser = await getUserProfile(uid);
  
  if (existingUser) {
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } else {
    await setDoc(docRef, {
      ...data,
      role: data.role || 'associate',
      createdAt: serverTimestamp(),
    });
  }
}

// Check if user is admin
export async function isAdmin(uid: string): Promise<boolean> {
  const user = await getUserProfile(uid);
  return user?.role === 'admin';
}

// Check if user is associate or higher
export async function isAssociateOrHigher(uid: string): Promise<boolean> {
  const user = await getUserProfile(uid);
  return user?.role === 'admin' || user?.role === 'associate';
}
