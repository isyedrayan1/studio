// ============================================
// FIREBASE SERVICES - ANNOUNCEMENT OPERATIONS
// ============================================

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';
import type { Announcement } from '../types';

const announcementsRef = collection(db, COLLECTIONS.ANNOUNCEMENTS);

// Get all announcements
export async function getAnnouncements(): Promise<Announcement[]> {
  const q = query(announcementsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  })) as Announcement[];
}

// Get active announcements (not expired)
export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const q = query(
    announcementsRef,
    where('active', '==', true),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  })) as Announcement[];
}

// Get latest announcement
export async function getLatestAnnouncement(): Promise<Announcement | null> {
  const q = query(
    announcementsRef,
    where('active', '==', true),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  } as Announcement;
}

// Add announcement
export async function addAnnouncement(
  content: string,
  priority: 'normal' | 'urgent' = 'normal'
): Promise<string> {
  const docRef = await addDoc(announcementsRef, {
    content,
    priority,
    active: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Update announcement
export async function updateAnnouncement(
  id: string,
  data: Partial<Pick<Announcement, 'content' | 'priority' | 'active'>>
): Promise<void> {
  const docRef = doc(db, COLLECTIONS.ANNOUNCEMENTS, id);
  await updateDoc(docRef, data);
}

// Delete announcement
export async function deleteAnnouncement(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.ANNOUNCEMENTS, id);
  await deleteDoc(docRef);
}

// Deactivate announcement (soft delete)
export async function deactivateAnnouncement(id: string): Promise<void> {
  await updateAnnouncement(id, { active: false });
}

// Real-time listener for announcements
export function subscribeToAnnouncements(callback: (announcements: Announcement[]) => void): Unsubscribe {
  const q = query(announcementsRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const announcements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Announcement[];
    callback(announcements);
  });
}

// Real-time listener for active announcements
export function subscribeToActiveAnnouncements(callback: (announcements: Announcement[]) => void): Unsubscribe {
  const q = query(
    announcementsRef,
    where('active', '==', true),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const announcements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as Announcement[];
    callback(announcements);
  });
}
