// ============================================
// FIREBASE SERVICES - BRACKET MATCH OPERATIONS
// ============================================
// For Day 3 CS Knockout format

import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { COLLECTIONS } from './collections';
import type { BracketMatch } from '../types';

const bracketMatchesRef = collection(db, COLLECTIONS.BRACKET_MATCHES);

// Get all bracket matches
export async function getBracketMatches(): Promise<BracketMatch[]> {
  const snapshot = await getDocs(bracketMatchesRef);
  const matches = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as BracketMatch[];
  // Sort in memory instead of using Firebase indexes
  return matches.sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    return a.matchInRound - b.matchInRound;
  });
}

// Get bracket matches by day
export async function getBracketMatchesByDay(dayId: string): Promise<BracketMatch[]> {
  const q = query(bracketMatchesRef, where('dayId', '==', dayId));
  const snapshot = await getDocs(q);
  const matches = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as BracketMatch[];
  // Sort in memory instead of using Firebase indexes
  return matches.sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    return a.matchInRound - b.matchInRound;
  });
}

// Helper to remove undefined values
function removeUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) clean[key] = value;
  });
  return clean;
}

// Add bracket match
export async function addBracketMatch(data: Omit<BracketMatch, 'id'>): Promise<string> {
  const cleanData = removeUndefined({ ...data, createdAt: serverTimestamp() });
  const docRef = await addDoc(bracketMatchesRef, cleanData);
  return docRef.id;
}

// Update bracket match
export async function updateBracketMatch(id: string, data: Partial<Omit<BracketMatch, 'id'>>): Promise<void> {
  const cleanData = removeUndefined(data as Record<string, unknown>);
  const docRef = doc(db, COLLECTIONS.BRACKET_MATCHES, id);
  await updateDoc(docRef, cleanData);
}

// Delete bracket match
export async function deleteBracketMatch(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.BRACKET_MATCHES, id);
  await deleteDoc(docRef);
}

// Delete all bracket matches for a day
export async function deleteBracketMatchesByDay(dayId: string): Promise<void> {
  const matches = await getBracketMatchesByDay(dayId);
  const batch = writeBatch(db);
  matches.forEach(match => {
    const docRef = doc(db, COLLECTIONS.BRACKET_MATCHES, match.id);
    batch.delete(docRef);
  });
  await batch.commit();
}

// Initialize bracket for a day with 8 teams
export async function initializeBracket(dayId: string, teamIds: string[]): Promise<void> {
  // Delete existing bracket for this day
  await deleteBracketMatchesByDay(dayId);
  
  // Create Round 1 matches (Quarterfinals: 4 matches)
  const round1Matches: Omit<BracketMatch, 'id'>[] = [
    { dayId, round: 1, matchInRound: 1, team1Id: teamIds[0], team2Id: teamIds[7], status: 'upcoming' },
    { dayId, round: 1, matchInRound: 2, team1Id: teamIds[1], team2Id: teamIds[6], status: 'upcoming' },
    { dayId, round: 1, matchInRound: 3, team1Id: teamIds[2], team2Id: teamIds[5], status: 'upcoming' },
    { dayId, round: 1, matchInRound: 4, team1Id: teamIds[3], team2Id: teamIds[4], status: 'upcoming' },
  ];
  
  // Create Round 2 matches (Semifinals: 2 matches) - teams TBD
  const round2Matches: Omit<BracketMatch, 'id'>[] = [
    { dayId, round: 2, matchInRound: 1, status: 'upcoming' },
    { dayId, round: 2, matchInRound: 2, status: 'upcoming' },
  ];
  
  // Create Finals match - teams TBD
  const finalsMatch: Omit<BracketMatch, 'id'> = { dayId, round: 3, matchInRound: 1, status: 'upcoming' };
  
  // Add all matches
  for (const match of [...round1Matches, ...round2Matches, finalsMatch]) {
    await addBracketMatch(match);
  }
}

// Set winner and advance to next round
export async function setWinnerAndAdvance(
  matchId: string,
  winnerId: string,
  allBracketMatches: BracketMatch[]
): Promise<void> {
  // Update the current match
  await updateBracketMatch(matchId, { winnerId, status: 'finished' });
  
  // Find the current match
  const currentMatch = allBracketMatches.find(m => m.id === matchId);
  if (!currentMatch) return;
  
  // Determine next round and position
  const nextRound = currentMatch.round + 1;
  if (nextRound > 3) return; // Finals already done
  
  // Find next match based on current position
  // Round 1 matches 1,2 → Round 2 match 1
  // Round 1 matches 3,4 → Round 2 match 2
  // Round 2 matches 1,2 → Finals
  let nextMatchInRound: number;
  let slot: 'team1Id' | 'team2Id';
  
  if (currentMatch.round === 1) {
    nextMatchInRound = currentMatch.matchInRound <= 2 ? 1 : 2;
    slot = currentMatch.matchInRound % 2 === 1 ? 'team1Id' : 'team2Id';
  } else {
    nextMatchInRound = 1;
    slot = currentMatch.matchInRound === 1 ? 'team1Id' : 'team2Id';
  }
  
  // Find and update next match
  const nextMatch = allBracketMatches.find(
    m => m.dayId === currentMatch.dayId && m.round === nextRound && m.matchInRound === nextMatchInRound
  );
  
  if (nextMatch) {
    await updateBracketMatch(nextMatch.id, { [slot]: winnerId });
  }
}

// Real-time listener for bracket matches
export function subscribeToBracketMatches(callback: (matches: BracketMatch[]) => void): Unsubscribe {
  return onSnapshot(bracketMatchesRef, (snapshot) => {
    const matches = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as BracketMatch[];
    // Sort in memory instead of using Firebase indexes
    const sorted = matches.sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return a.matchInRound - b.matchInRound;
    });
    callback(sorted);
  }, (error) => {
    console.error('Bracket matches subscription error:', error);
  });
}
