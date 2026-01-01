// ============================================
// FIREBASE SERVICES - DAY OPERATIONS
// ============================================

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';
import type { Day } from '../types';

const daysRef = collection(db, COLLECTIONS.DAYS);

// Get all days
export async function getDays(): Promise<Day[]> {
  const q = query(daysRef, orderBy('dayNumber', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  })) as Day[];
}

// Get single day
export async function getDay(id: string): Promise<Day | null> {
  const docRef = doc(db, COLLECTIONS.DAYS, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  } as Day;
}

// Helper to remove undefined values
function removeUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) clean[key] = value;
  });
  return clean;
}

// Add day
export async function addDay(data: Omit<Day, 'id' | 'createdAt'>): Promise<string> {
  const cleanData = removeUndefined({ ...data, createdAt: serverTimestamp() });
  const docRef = await addDoc(daysRef, cleanData);
  return docRef.id;
}

// Update day
export async function updateDay(id: string, data: Partial<Omit<Day, 'id' | 'createdAt'>>): Promise<void> {
  const cleanData = removeUndefined(data as Record<string, unknown>);
  const docRef = doc(db, COLLECTIONS.DAYS, id);
  await updateDoc(docRef, cleanData);
}

// Delete day
export async function deleteDay(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.DAYS, id);
  await deleteDoc(docRef);
}

// Real-time listener for days
export function subscribeToDays(callback: (days: Day[]) => void): Unsubscribe {
  const q = query(daysRef, orderBy('dayNumber', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const days = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Day[];
    callback(days);
  });
}
