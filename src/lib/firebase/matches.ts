// ============================================
// FIREBASE SERVICES - MATCH OPERATIONS
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
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';
import type { Match } from '../types';

const matchesRef = collection(db, COLLECTIONS.MATCHES);

// Get all matches
export async function getMatches(): Promise<Match[]> {
  const q = query(matchesRef, orderBy('matchNumber', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  })) as Match[];
}

// Get matches by day
export async function getMatchesByDay(dayId: string): Promise<Match[]> {
  const q = query(matchesRef, where('dayId', '==', dayId), orderBy('matchNumber', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  })) as Match[];
}

// Get single match
export async function getMatch(id: string): Promise<Match | null> {
  const docRef = doc(db, COLLECTIONS.MATCHES, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  } as Match;
}

// Helper to remove undefined values
function removeUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) clean[key] = value;
  });
  return clean;
}

// Add match
export async function addMatch(data: Omit<Match, 'id' | 'createdAt'>): Promise<string> {
  const cleanData = removeUndefined({ ...data, createdAt: serverTimestamp() });
  const docRef = await addDoc(matchesRef, cleanData);
  return docRef.id;
}

// Update match
export async function updateMatch(id: string, data: Partial<Omit<Match, 'id' | 'createdAt'>>): Promise<void> {
  const cleanData = removeUndefined(data as Record<string, unknown>);
  const docRef = doc(db, COLLECTIONS.MATCHES, id);
  await updateDoc(docRef, cleanData);
}

// Delete match
export async function deleteMatch(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.MATCHES, id);
  await deleteDoc(docRef);
}

// Lock/unlock match
export async function setMatchLock(id: string, locked: boolean): Promise<void> {
  await updateMatch(id, { status: locked ? 'locked' : 'finished' });
}

// Real-time listener for matches
export function subscribeToMatches(callback: (matches: Match[]) => void): Unsubscribe {
  const q = query(matchesRef, orderBy('matchNumber', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const matches = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Match[];
    callback(matches);
  });
}

// Real-time listener for matches by day
export function subscribeToMatchesByDay(dayId: string, callback: (matches: Match[]) => void): Unsubscribe {
  const q = query(matchesRef, where('dayId', '==', dayId), orderBy('matchNumber', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const matches = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Match[];
    callback(matches);
  });
}

// Lock/unlock match
export async function lockMatch(matchId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.MATCHES, matchId);
  await updateDoc(docRef, { locked: true });
}

export async function unlockMatch(matchId: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.MATCHES, matchId);
  await updateDoc(docRef, { locked: false });
}

export async function toggleMatchLock(matchId: string, currentLocked: boolean): Promise<void> {
  const docRef = doc(db, COLLECTIONS.MATCHES, matchId);
  await updateDoc(docRef, { locked: !currentLocked });
}
