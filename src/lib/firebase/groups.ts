// ============================================
// FIREBASE SERVICES - GROUP OPERATIONS
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
import type { Group } from '../types';

const groupsRef = collection(db, COLLECTIONS.GROUPS);

// Get all groups
export async function getGroups(): Promise<Group[]> {
  const q = query(groupsRef, orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  })) as Group[];
}

// Get groups by day
export async function getGroupsByDay(dayId: string): Promise<Group[]> {
  const q = query(groupsRef, where('dayId', '==', dayId), orderBy('name', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  })) as Group[];
}

// Get single group
export async function getGroup(id: string): Promise<Group | null> {
  const docRef = doc(db, COLLECTIONS.GROUPS, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  } as Group;
}

// Helper to remove undefined values
function removeUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) clean[key] = value;
  });
  return clean;
}

// Add group
export async function addGroup(data: Omit<Group, 'id' | 'createdAt'>): Promise<string> {
  const cleanData = removeUndefined({ ...data, createdAt: serverTimestamp() });
  const docRef = await addDoc(groupsRef, cleanData);
  return docRef.id;
}

// Update group
export async function updateGroup(id: string, data: Partial<Omit<Group, 'id' | 'createdAt'>>): Promise<void> {
  const cleanData = removeUndefined(data as Record<string, unknown>);
  const docRef = doc(db, COLLECTIONS.GROUPS, id);
  await updateDoc(docRef, cleanData);
}

// Delete group
export async function deleteGroup(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.GROUPS, id);
  await deleteDoc(docRef);
}

// Add team to group
export async function addTeamToGroup(groupId: string, teamId: string): Promise<void> {
  const group = await getGroup(groupId);
  if (!group) throw new Error('Group not found');
  
  const updatedTeamIds = [...new Set([...group.teamIds, teamId])];
  await updateGroup(groupId, { teamIds: updatedTeamIds });
}

// Remove team from group
export async function removeTeamFromGroup(groupId: string, teamId: string): Promise<void> {
  const group = await getGroup(groupId);
  if (!group) throw new Error('Group not found');
  
  const updatedTeamIds = group.teamIds.filter(id => id !== teamId);
  await updateGroup(groupId, { teamIds: updatedTeamIds });
}

// Real-time listener for groups
export function subscribeToGroups(callback: (groups: Group[]) => void): Unsubscribe {
  const q = query(groupsRef, orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Group[];
    callback(groups);
  });
}

// Real-time listener for groups by day
export function subscribeToGroupsByDay(dayId: string, callback: (groups: Group[]) => void): Unsubscribe {
  const q = query(groupsRef, where('dayId', '==', dayId), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const groups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Group[];
    callback(groups);
  });
}
