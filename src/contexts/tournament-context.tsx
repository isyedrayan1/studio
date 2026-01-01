"use client";

// ============================================
// TOURNAMENT DATA CONTEXT
// ============================================
// Provides real-time tournament data throughout the app

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Team, Day, Group, Match, Score, Announcement, BracketMatch } from '@/lib/types';
import {
  subscribeToTeams,
  subscribeToGroups,
  subscribeToDays,
  subscribeToMatches,
  subscribeToScores,
  subscribeToAnnouncements,
  subscribeToBracketMatches,
  addTeam as fbAddTeam,
  updateTeam as fbUpdateTeam,
  deleteTeam as fbDeleteTeam,
  addDay as fbAddDay,
  updateDay as fbUpdateDay,
  deleteDay as fbDeleteDay,
  addGroup as fbAddGroup,
  updateGroup as fbUpdateGroup,
  deleteGroup as fbDeleteGroup,
  addMatch as fbAddMatch,
  updateMatch as fbUpdateMatch,
  deleteMatch as fbDeleteMatch,
  setMatchLock as fbSetMatchLock,
  setScore as fbSetScore,
  addAnnouncement as fbAddAnnouncement,
  deleteAnnouncement as fbDeleteAnnouncement,
  initializeBracket as fbInitializeBracket,
  updateBracketMatch as fbUpdateBracketMatch,
  setWinnerAndAdvance as fbSetWinnerAndAdvance,
  deleteBracketMatchesByDay as fbDeleteBracketMatchesByDay,
} from '@/lib/firebase';

interface TournamentContextType {
  // Data
  teams: Team[];
  days: Day[];
  groups: Group[];
  matches: Match[];
  scores: Score[];
  announcements: Announcement[];
  bracketMatches: BracketMatch[];
  
  // Loading states
  loading: boolean;
  error: string | null;
  
  // Team actions
  addTeam: (name: string, tag?: string, captainName?: string, captainUid?: string) => Promise<string>;
  updateTeam: (id: string, data: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  
  // Day actions
  addDay: (data: Omit<Day, 'id' | 'createdAt'>) => Promise<string>;
  updateDay: (id: string, data: Partial<Day>) => Promise<void>;
  deleteDay: (id: string) => Promise<void>;
  
  // Group actions
  addGroup: (data: Omit<Group, 'id' | 'createdAt'>) => Promise<string>;
  updateGroup: (id: string, data: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  
  // Match actions
  addMatch: (data: Omit<Match, 'id' | 'createdAt'>) => Promise<string>;
  updateMatch: (id: string, data: Partial<Match>) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
  setMatchLock: (id: string, locked: boolean) => Promise<void>;
  
  // Score actions
  setScore: (matchId: string, teamId: string, kills: number, placement: number) => Promise<void>;
  
  // Bracket actions (Day 3 Knockout)
  initializeBracket: (dayId: string, teamIds: string[]) => Promise<void>;
  updateBracketMatch: (id: string, data: Partial<BracketMatch>) => Promise<void>;
  setWinnerAndAdvance: (matchId: string, winnerId: string) => Promise<void>;
  resetBracket: (dayId: string) => Promise<void>;
  
  // Announcement actions
  addAnnouncement: (content: string, priority?: 'normal' | 'urgent') => Promise<string>;
  deleteAnnouncement: (id: string) => Promise<void>;
  
  // Helpers
  getTeamById: (id: string) => Team | undefined;
  getDayById: (id: string) => Day | undefined;
  getGroupById: (id: string) => Group | undefined;
  getMatchById: (id: string) => Match | undefined;
  getGroupsByDay: (dayId: string) => Group[];
  getMatchesByDay: (dayId: string) => Match[];
  getScoresByMatch: (matchId: string) => Score[];
  getTeamScore: (matchId: string, teamId: string) => Score | undefined;
  getBracketMatchesByDay: (dayId: string) => BracketMatch[];
}

const TournamentContext = createContext<TournamentContextType | null>(null);

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [days, setDays] = useState<Day[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [scores, setScores] = useState<Score[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [bracketMatches, setBracketMatches] = useState<BracketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to all collections on mount
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];
    let loadedCount = 0;
    const totalCollections = 7;
    
    const onLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalCollections) {
        setLoading(false);
      }
    };
    
    try {
      unsubscribers.push(subscribeToTeams((data) => {
        setTeams(data);
        onLoaded();
      }));
      unsubscribers.push(subscribeToDays((data) => {
        setDays(data);
        onLoaded();
      }));
      unsubscribers.push(subscribeToGroups((data) => {
        setGroups(data);
        onLoaded();
      }));
      unsubscribers.push(subscribeToMatches((data) => {
        setMatches(data);
        onLoaded();
      }));
      unsubscribers.push(subscribeToScores((data) => {
        setScores(data);
        onLoaded();
      }));
      unsubscribers.push(subscribeToAnnouncements((data) => {
        setAnnouncements(data);
        onLoaded();
      }));
      unsubscribers.push(subscribeToBracketMatches((data) => {
        setBracketMatches(data);
        onLoaded();
      }));
    } catch (err) {
      console.error('Error setting up Firebase listeners:', err);
      setError('Failed to connect to database. Check Firebase configuration.');
      setLoading(false);
    }
    
    // Fallback timeout in case listeners never fire (empty collections)
    const timeout = setTimeout(() => setLoading(false), 3000);
    
    return () => {
      unsubscribers.forEach(unsub => unsub());
      clearTimeout(timeout);
    };
  }, []);

  // Team actions
  const addTeam = useCallback(async (name: string, tag?: string, captainName?: string, captainUid?: string) => {
    return fbAddTeam({ name, tag, captainName, captainUid });
  }, []);
  
  const updateTeam = useCallback(async (id: string, data: Partial<Team>) => {
    const { id: _, createdAt: __, ...updateData } = data as Team;
    return fbUpdateTeam(id, updateData);
  }, []);
  
  const deleteTeam = useCallback(async (id: string) => {
    return fbDeleteTeam(id);
  }, []);

  // Day actions
  const addDay = useCallback(async (data: Omit<Day, 'id' | 'createdAt'>) => {
    return fbAddDay(data);
  }, []);
  
  const updateDay = useCallback(async (id: string, data: Partial<Day>) => {
    const { id: _, createdAt: __, ...updateData } = data as Day;
    return fbUpdateDay(id, updateData);
  }, []);
  
  const deleteDay = useCallback(async (id: string) => {
    return fbDeleteDay(id);
  }, []);

  // Group actions
  const addGroup = useCallback(async (data: Omit<Group, 'id' | 'createdAt'>) => {
    return fbAddGroup(data);
  }, []);
  
  const updateGroup = useCallback(async (id: string, data: Partial<Group>) => {
    const { id: _, createdAt: __, ...updateData } = data as Group;
    return fbUpdateGroup(id, updateData);
  }, []);
  
  const deleteGroup = useCallback(async (id: string) => {
    return fbDeleteGroup(id);
  }, []);

  // Match actions
  const addMatch = useCallback(async (data: Omit<Match, 'id' | 'createdAt'>) => {
    return fbAddMatch(data);
  }, []);
  
  const updateMatch = useCallback(async (id: string, data: Partial<Match>) => {
    const { id: _, createdAt: __, ...updateData } = data as Match;
    return fbUpdateMatch(id, updateData);
  }, []);
  
  const deleteMatch = useCallback(async (id: string) => {
    return fbDeleteMatch(id);
  }, []);
  
  const setMatchLock = useCallback(async (id: string, locked: boolean) => {
    return fbSetMatchLock(id, locked);
  }, []);

  // Score actions
  const setScore = useCallback(async (matchId: string, teamId: string, kills: number, placement: number) => {
    return fbSetScore(matchId, teamId, kills, placement);
  }, []);

  // Bracket actions
  const initializeBracket = useCallback(async (dayId: string, teamIds: string[]) => {
    return fbInitializeBracket(dayId, teamIds);
  }, []);
  
  const updateBracketMatch = useCallback(async (id: string, data: Partial<BracketMatch>) => {
    return fbUpdateBracketMatch(id, data);
  }, []);
  
  const setWinnerAndAdvance = useCallback(async (matchId: string, winnerId: string) => {
    return fbSetWinnerAndAdvance(matchId, winnerId, bracketMatches);
  }, [bracketMatches]);
  
  const resetBracket = useCallback(async (dayId: string) => {
    return fbDeleteBracketMatchesByDay(dayId);
  }, []);

  // Announcement actions
  const addAnnouncement = useCallback(async (content: string, priority: 'normal' | 'urgent' = 'normal') => {
    return fbAddAnnouncement(content, priority);
  }, []);
  
  const deleteAnnouncement = useCallback(async (id: string) => {
    return fbDeleteAnnouncement(id);
  }, []);

  // Helpers
  const getTeamById = useCallback((id: string) => teams.find(t => t.id === id), [teams]);
  const getDayById = useCallback((id: string) => days.find(d => d.id === id), [days]);
  const getGroupById = useCallback((id: string) => groups.find(g => g.id === id), [groups]);
  const getMatchById = useCallback((id: string) => matches.find(m => m.id === id), [matches]);
  const getGroupsByDay = useCallback((dayId: string) => groups.filter(g => g.dayId === dayId), [groups]);
  const getMatchesByDay = useCallback((dayId: string) => matches.filter(m => m.dayId === dayId), [matches]);
  const getScoresByMatch = useCallback((matchId: string) => scores.filter(s => s.matchId === matchId), [scores]);
  const getTeamScore = useCallback((matchId: string, teamId: string) => 
    scores.find(s => s.matchId === matchId && s.teamId === teamId), [scores]);
  const getBracketMatchesByDay = useCallback((dayId: string) => 
    bracketMatches.filter(m => m.dayId === dayId), [bracketMatches]);

  const value: TournamentContextType = {
    teams,
    days,
    groups,
    matches,
    scores,
    announcements,
    bracketMatches,
    loading,
    error,
    addTeam,
    updateTeam,
    deleteTeam,
    addDay,
    updateDay,
    deleteDay,
    addGroup,
    updateGroup,
    deleteGroup,
    addMatch,
    updateMatch,
    deleteMatch,
    setMatchLock,
    setScore,
    initializeBracket,
    updateBracketMatch,
    setWinnerAndAdvance,
    resetBracket,
    addAnnouncement,
    deleteAnnouncement,
    getTeamById,
    getDayById,
    getGroupById,
    getMatchById,
    getGroupsByDay,
    getMatchesByDay,
    getScoresByMatch,
    getTeamScore,
    getBracketMatchesByDay,
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
}

// Hook to use tournament context
export function useTournament() {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
}

// Hook for just teams
export function useTeams() {
  const { teams, loading, addTeam, updateTeam, deleteTeam, getTeamById } = useTournament();
  return { teams, loading, addTeam, updateTeam, deleteTeam, getTeamById };
}

// Hook for just days
export function useDays() {
  const { days, loading, addDay, updateDay, deleteDay, getDayById } = useTournament();
  return { days, loading, addDay, updateDay, deleteDay, getDayById };
}

// Hook for just groups
export function useGroups() {
  const { groups, loading, addGroup, updateGroup, deleteGroup, getGroupById, getGroupsByDay } = useTournament();
  return { groups, loading, addGroup, updateGroup, deleteGroup, getGroupById, getGroupsByDay };
}

// Hook for just matches
export function useMatches() {
  const { matches, loading, addMatch, updateMatch, deleteMatch, setMatchLock, getMatchById, getMatchesByDay } = useTournament();
  return { matches, loading, addMatch, updateMatch, deleteMatch, setMatchLock, getMatchById, getMatchesByDay };
}

// Hook for just scores
export function useScores() {
  const { scores, loading, setScore, getScoresByMatch, getTeamScore } = useTournament();
  return { scores, loading, setScore, getScoresByMatch, getTeamScore };
}

// Hook for just announcements
export function useAnnouncements() {
  const { announcements, loading, addAnnouncement, deleteAnnouncement } = useTournament();
  return { announcements, loading, addAnnouncement, deleteAnnouncement };
}

// Hook for bracket matches (Day 3)
export function useBracket() {
  const { bracketMatches, loading, initializeBracket, updateBracketMatch, setWinnerAndAdvance, resetBracket, getBracketMatchesByDay } = useTournament();
  return { bracketMatches, loading, initializeBracket, updateBracketMatch, setWinnerAndAdvance, resetBracket, getBracketMatchesByDay };
}
