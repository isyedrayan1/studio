// ============================================
// FIREBASE SERVICES - ASSOCIATE ACCOUNTS
// ============================================
// Manage associate login credentials created by admins

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
  serverTimestamp,
  Unsubscribe,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';
import type { AssociateAccount } from '../types';

const associateAccountsRef = collection(db, COLLECTIONS.ASSOCIATE_ACCOUNTS);

// Get all associate accounts
export async function getAssociateAccounts(): Promise<AssociateAccount[]> {
  const snapshot = await getDocs(associateAccountsRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  })) as AssociateAccount[];
}

// Get associate account by login ID
export async function getAssociateAccountByLoginId(loginId: string): Promise<AssociateAccount | null> {
  const q = query(associateAccountsRef, where('loginId', '==', loginId));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  } as AssociateAccount;
}

// Validate associate login
export async function validateAssociateLogin(loginId: string, password: string): Promise<AssociateAccount | null> {
  const account = await getAssociateAccountByLoginId(loginId);
  if (!account) return null;
  if (!account.active) return null;
  if (account.password !== password) return null;
  return account;
}

// Add associate account
export async function addAssociateAccount(data: Omit<AssociateAccount, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(associateAccountsRef, {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Update associate account
export async function updateAssociateAccount(id: string, data: Partial<Omit<AssociateAccount, 'id' | 'createdAt'>>): Promise<void> {
  const docRef = doc(db, COLLECTIONS.ASSOCIATE_ACCOUNTS, id);
  await updateDoc(docRef, data);
}

// Delete associate account
export async function deleteAssociateAccount(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.ASSOCIATE_ACCOUNTS, id);
  await deleteDoc(docRef);
}

// Real-time listener for associate accounts
export function subscribeToAssociateAccounts(callback: (accounts: AssociateAccount[]) => void): Unsubscribe {
  return onSnapshot(associateAccountsRef, (snapshot) => {
    const accounts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })) as AssociateAccount[];
    callback(accounts);
  });
}
