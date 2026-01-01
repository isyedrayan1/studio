// ============================================
// FIREBASE SERVICES - TEAM OPERATIONS
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
import type { Team } from '../types';

const teamsRef = collection(db, COLLECTIONS.TEAMS);

// Get all teams
export async function getTeams(): Promise<Team[]> {
  const q = query(teamsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  })) as Team[];
}

// Get single team
export async function getTeam(id: string): Promise<Team | null> {
  const docRef = doc(db, COLLECTIONS.TEAMS, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  } as Team;
}

// Add team
export async function addTeam(data: Omit<Team, 'id' | 'createdAt'>): Promise<string> {
  // Remove undefined values - Firestore doesn't accept them
  const cleanData: Record<string, unknown> = { createdAt: serverTimestamp() };
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  });
  
  const docRef = await addDoc(teamsRef, cleanData);
  return docRef.id;
}

// Update team
export async function updateTeam(id: string, data: Partial<Omit<Team, 'id' | 'createdAt'>>): Promise<void> {
  // Remove undefined values - Firestore doesn't accept them
  const cleanData: Record<string, unknown> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  });
  
  const docRef = doc(db, COLLECTIONS.TEAMS, id);
  await updateDoc(docRef, cleanData);
}

// Delete team
export async function deleteTeam(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.TEAMS, id);
  await deleteDoc(docRef);
}

// Real-time listener for teams
export function subscribeToTeams(callback: (teams: Team[]) => void): Unsubscribe {
  const q = query(teamsRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const teams = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Team[];
    callback(teams);
  });
}
