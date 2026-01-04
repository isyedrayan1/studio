// ============================================
// FIREBASE SERVICES - SCORE OPERATIONS
// ============================================

import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';
import type { Score } from '../types';

const scoresRef = collection(db, COLLECTIONS.SCORES);

// Generate score ID (matchId_teamId)
function getScoreId(matchId: string, teamId: string): string {
  return `${matchId}_${teamId}`;
}

// Helper to convert doc to Score
function docToScore(docData: any, docId: string): Score {
  return {
    id: docId,
    matchId: docData.matchId,
    teamId: docData.teamId,
    kills: docData.kills ?? 0,
    placement: docData.placement ?? 0,
    totalPoints: docData.totalPoints ?? 0,
    isBooyah: docData.isBooyah ?? false,
    locked: docData.locked ?? false,
    lastUpdatedBy: docData.lastUpdatedBy,
    lastUpdatedAt: docData.lastUpdatedAt?.toDate?.()?.toISOString(),
    proofImageUrl: docData.proofImageUrl,
  };
}

// Get all scores
export async function getScores(): Promise<Score[]> {
  const snapshot = await getDocs(scoresRef);
  return snapshot.docs.map(doc => docToScore(doc.data(), doc.id));
}

// Get scores by match
export async function getScoresByMatch(matchId: string): Promise<Score[]> {
  const q = query(scoresRef, where('matchId', '==', matchId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToScore(doc.data(), doc.id));
}

// Get scores by team
export async function getScoresByTeam(teamId: string): Promise<Score[]> {
  const q = query(scoresRef, where('teamId', '==', teamId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToScore(doc.data(), doc.id));
}

// Get single score
export async function getScore(matchId: string, teamId: string): Promise<Score | null> {
  const scoreId = getScoreId(matchId, teamId);
  const docRef = doc(db, COLLECTIONS.SCORES, scoreId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docToScore(docSnap.data(), docSnap.id);
}

// Set/update score (upsert)

export async function setScore(
  matchId: string,
  teamId: string,
  kills: number,
  placement: number,
  userId?: string,
  matchType?: 'br-shortlist' | 'br-championship' | 'cs-bracket',
  proofImageUrl?: string
): Promise<void> {
  const scoreId = getScoreId(matchId, teamId);
  const docRef = doc(db, COLLECTIONS.SCORES, scoreId);
  const existingScore = await getScore(matchId, teamId);
  
  // Check if score is locked (associates cannot edit locked scores)
  if (existingScore?.locked && userId !== 'admin') {
    throw new Error('Score is locked by admin');
  }
  
  // Calculate points using Free Fire BR scoring
  const KILL_POINTS = 1;
  const PLACEMENT_POINTS = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0]; // 1st to 12th
  const placementPts = PLACEMENT_POINTS[placement - 1] ?? 0;
  const totalPoints = (kills * KILL_POINTS) + placementPts;
  
  // Calculate special flags
  const isBooyah = placement === 1;
  
  if (existingScore) {
    const updateData: Record<string, unknown> = {
      kills,
      placement,
      totalPoints,
      isBooyah,
      lastUpdatedBy: userId || 'unknown',
      lastUpdatedAt: serverTimestamp(),
    };
    // Only update proofImageUrl if provided
    if (proofImageUrl !== undefined) {
      updateData.proofImageUrl = proofImageUrl;
    }
    await updateDoc(docRef, updateData);
  } else {
    await setDoc(docRef, {
      matchId,
      teamId,
      kills,
      placement,
      totalPoints,
      isBooyah,
      locked: false,
      lastUpdatedBy: userId || 'unknown',
      lastUpdatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      proofImageUrl: proofImageUrl || null,
    });
  }
}

// Delete score
export async function deleteScore(matchId: string, teamId: string): Promise<void> {
  const scoreId = getScoreId(matchId, teamId);
  const docRef = doc(db, COLLECTIONS.SCORES, scoreId);
  await deleteDoc(docRef);
}

// Delete all scores for a match
export async function deleteScoresByMatch(matchId: string): Promise<void> {
  const scores = await getScoresByMatch(matchId);
  await Promise.all(scores.map(score => deleteScore(matchId, score.teamId)));
}

// Real-time listener for all scores
export function subscribeToScores(callback: (scores: Score[]) => void): Unsubscribe {
  return onSnapshot(scoresRef, (snapshot) => {
    const scores = snapshot.docs.map(doc => docToScore(doc.data(), doc.id));
    callback(scores);
  });
}

// Real-time listener for scores by match
export function subscribeToScoresByMatch(matchId: string, callback: (scores: Score[]) => void): Unsubscribe {
  const q = query(scoresRef, where('matchId', '==', matchId));
  return onSnapshot(q, (snapshot) => {
    const scores = snapshot.docs.map(doc => docToScore(doc.data(), doc.id));
    callback(scores);
  });
}

// Lock score (admin only)
export async function lockScore(matchId: string, teamId: string): Promise<void> {
  const scoreId = getScoreId(matchId, teamId);
  const docRef = doc(db, COLLECTIONS.SCORES, scoreId);
  await updateDoc(docRef, {
    locked: true,
    lockedAt: serverTimestamp(),
  });
}

// Unlock score (admin only)
export async function unlockScore(matchId: string, teamId: string): Promise<void> {
  const scoreId = getScoreId(matchId, teamId);
  const docRef = doc(db, COLLECTIONS.SCORES, scoreId);
  await updateDoc(docRef, {
    locked: false,
    unlockedAt: serverTimestamp(),
  });
}

// Toggle score lock
export async function toggleScoreLock(matchId: string, teamId: string): Promise<boolean> {
  const score = await getScore(matchId, teamId);
  if (!score) return false;
  
  if (score.locked) {
    await unlockScore(matchId, teamId);
    return false;
  } else {
    await lockScore(matchId, teamId);
    return true;
  }
}
