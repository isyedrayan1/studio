// ============================================
// ARENA ACE - UTILITY FUNCTIONS
// ============================================
// Only calculation logic, NO mock data
// Data comes from Firebase

import type { 
  Team, 
  Match, 
  Score, 
  Day, 
  Group,
  LeaderboardEntry,
  TournamentSettings,
  DEFAULT_TOURNAMENT_SETTINGS,
  BracketMatch
} from './types';

// ============================================
// LEADERBOARD CALCULATION
// ============================================

/**
 * Calculate leaderboard for a specific day
 * Handles both normal BR days and Finals Day (mixed BR + CS)
 */
export function calculateLeaderboard(
  teams: Team[],
  matches: Match[],
  scores: Score[],
  groups: Group[],
  bracketMatches: BracketMatch[] = [],
  dayId?: string,
  settings: TournamentSettings = {
    killPoints: 1,
    placementPoints: [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0],
    maxTeamsPerMatch: 12,
  },
  qualifyCount: number = 12
): LeaderboardEntry[] {
  
  // If specific day is selected, check if it's Finals Day
  if (dayId) {
    const dayMatches = matches.filter(m => m.dayId === dayId);
    const dayBracketMatches = bracketMatches.filter(b => b.dayId === dayId);
    
    // Finals Day has both BR and CS matches
    const hasBR = dayMatches.some(m => m.type === 'br-championship');
    const hasCS = dayBracketMatches.length > 0;
    
    if (hasBR && hasCS) {
      // Use Finals Day logic
      return calculateFinalsLeaderboard(
        teams,
        dayMatches,
        scores,
        dayBracketMatches,
        settings,
        qualifyCount
      );
    }
    
    // Filter matches for this day only
    matches = dayMatches;
  }
  
  // Normal BR leaderboard logic
  return calculateNormalLeaderboard(teams, matches, scores, groups, settings, qualifyCount);
}

/**
 * Calculate normal BR leaderboard (Day 1, Day 2, or any BR-only day)
 */
function calculateNormalLeaderboard(
  teams: Team[],
  matches: Match[],
  scores: Score[],
  groups: Group[],
  settings: TournamentSettings,
  qualifyCount: number
): LeaderboardEntry[] {
  // Build a map of team stats
  const statsMap = new Map<string, {
    totalKills: number;
    totalPlacementPoints: number;
    totalPoints: number;
    matchesPlayed: number;
    bestPlacement: number;
    groupName?: string;
  }>();

  // Get finished matches only
  const finishedMatches = matches.filter(
    m => m.status === 'finished' || m.status === 'locked'
  );

  // Get all team IDs that participated in this day's matches
  const participatingTeamIds = new Set<string>();
  finishedMatches.forEach(match => {
    match.teamIds.forEach(teamId => participatingTeamIds.add(teamId));
  });

  // Initialize ONLY teams that participated in this day
  participatingTeamIds.forEach(teamId => {
    const team = teams.find(t => t.id === teamId);
    if (team) {
      // Find which group this team belongs to
      const group = groups.find(g => g.teamIds.includes(team.id));
      
      statsMap.set(team.id, {
        totalKills: 0,
        totalPlacementPoints: 0,
        totalPoints: 0,
        matchesPlayed: 0,
        bestPlacement: Infinity,
        groupName: group?.name,
      });
    }
  });

  // Calculate scores for each team
  finishedMatches.forEach(match => {
    const matchScores = scores.filter(s => s.matchId === match.id);
    
    matchScores.forEach(score => {
      const stats = statsMap.get(score.teamId);
      if (stats) {
        const killPoints = score.kills * settings.killPoints;
        const placementPoints = settings.placementPoints[score.placement - 1] || 0;
        
        stats.totalKills += score.kills;
        stats.totalPlacementPoints += placementPoints;
        stats.totalPoints += killPoints + placementPoints;
        stats.matchesPlayed += 1;
        
        if (score.placement > 0 && score.placement < stats.bestPlacement) {
          stats.bestPlacement = score.placement;
        }
      }
    });
  });

  // Sort by total points, then by kills, then by best placement
  const sorted = Array.from(statsMap.entries())
    .sort(([, a], [, b]) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
      return a.bestPlacement - b.bestPlacement;
    });

  // Build leaderboard entries
  return sorted.map(([teamId, stats], index) => {
    const team = teams.find(t => t.id === teamId)!;
    const rank = index + 1;
    
    return {
      teamId,
      teamName: team?.name || 'Unknown Team',
      groupName: stats.groupName,
      rank,
      matchesPlayed: stats.matchesPlayed,
      totalKills: stats.totalKills,
      totalPlacementPoints: stats.totalPlacementPoints,
      totalPoints: stats.totalPoints,
      bestPlacement: stats.bestPlacement === Infinity ? 0 : stats.bestPlacement,
      isQualified: rank <= qualifyCount,
      hasBooyah: false, // Set separately based on match results
    };
  });
}

/**
 * Calculate Finals Day leaderboard (Day 3 with BR Final + CS Bracket)
 * Rankings determined by CS Bracket results, with BR Final for 5th-12th
 */
function calculateFinalsLeaderboard(
  teams: Team[],
  dayMatches: Match[],
  scores: Score[],
  bracketMatches: BracketMatch[],
  settings: TournamentSettings,
  qualifyCount: number
): LeaderboardEntry[] {
  
  const leaderboard: LeaderboardEntry[] = [];
  
  // 1. Get CS Bracket results
  const grandFinal = bracketMatches.find(b => b.round === 3); // Round 3 = Grand Final
  const semiFinals = bracketMatches.filter(b => b.round === 2); // Round 2 = Semi-Finals
  
  // 2. Get BR Final match
  const brMatch = dayMatches.find(m => m.type === 'br-championship');
  const brScores = brMatch ? scores.filter(s => s.matchId === brMatch.id) : [];
  
  // Helper function to create leaderboard entry
  const createEntry = (teamId: string, rank: number, isQualified: boolean): LeaderboardEntry | null => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return null;
    
    // Get all scores for this team across all matches
    const teamScores = scores.filter(s => s.teamId === teamId);
    const brScore = brScores.find(s => s.teamId === teamId);
    
    const totalKills = teamScores.reduce((sum, s) => sum + s.kills, 0);
    const totalPlacementPoints = teamScores.reduce((sum, s) => {
      const placementPts = settings.placementPoints[s.placement - 1] || 0;
      return sum + placementPts;
    }, 0);
    const totalPoints = teamScores.reduce((sum, s) => {
      const killPts = s.kills * settings.killPoints;
      const placementPts = settings.placementPoints[s.placement - 1] || 0;
      return sum + killPts + placementPts;
    }, 0);
    
    return {
      teamId,
      teamName: team.name,
      rank,
      matchesPlayed: teamScores.length,
      totalKills,
      totalPlacementPoints,
      totalPoints,
      bestPlacement: brScore?.placement || 0,
      isQualified,
      hasBooyah: teamScores.some(s => s.isBooyah),
    };
  };
  
  // 3. Build rankings based on CS Bracket results
  
  // 1st Place: CS Grand Final Winner
  if (grandFinal?.winnerId) {
    const entry = createEntry(grandFinal.winnerId, 1, true);
    if (entry) leaderboard.push(entry);
  }
  
  // 2nd Place: CS Grand Final Loser
  if (grandFinal) {
    const finalLoser = grandFinal.team1Id === grandFinal.winnerId 
      ? grandFinal.team2Id 
      : grandFinal.team1Id;
    if (finalLoser) {
      const entry = createEntry(finalLoser, 2, true);
      if (entry) leaderboard.push(entry);
    }
  }
  
  // 3rd & 4th Place: Semi-Final Losers (ranked by BR Final score)
  const semiLosers: Array<{ teamId: string; brPoints: number }> = [];
  
  semiFinals.forEach(semi => {
    const loser = semi.team1Id === semi.winnerId ? semi.team2Id : semi.team1Id;
    if (loser) {
      const brScore = brScores.find(s => s.teamId === loser);
      const brPoints = brScore ? (brScore.totalPoints || 0) : 0;
      semiLosers.push({ teamId: loser, brPoints });
    }
  });
  
  // Sort semi losers by BR Final performance
  semiLosers.sort((a, b) => b.brPoints - a.brPoints);
  
  semiLosers.forEach((item, idx) => {
    const entry = createEntry(item.teamId, 3 + idx, idx === 0); // 3rd is qualified, 4th is not
    if (entry) leaderboard.push(entry);
  });
  
  // 5th-12th Place: BR Final rankings (teams not in CS Bracket)
  const csTeamIds = new Set([
    grandFinal?.team1Id,
    grandFinal?.team2Id,
    ...semiLosers.map(l => l.teamId)
  ].filter(Boolean));
  
  const brOnlyScores = brScores
    .filter(s => !csTeamIds.has(s.teamId))
    .sort((a, b) => {
      const aTotalPoints = a.totalPoints || 0;
      const bTotalPoints = b.totalPoints || 0;
      if (bTotalPoints !== aTotalPoints) return bTotalPoints - aTotalPoints;
      if (b.kills !== a.kills) return b.kills - a.kills;
      return a.placement - b.placement;
    });
  
  brOnlyScores.forEach((score, idx) => {
    const entry = createEntry(score.teamId, 5 + idx, false);
    if (entry) leaderboard.push(entry);
  });
  
  return leaderboard;
}

/**
 * Calculate points for a single score entry
 */
export function calculateScorePoints(
  kills: number,
  placement: number,
  settings: TournamentSettings
): number {
  const killPoints = kills * settings.killPoints;
  const placementPoints = settings.placementPoints[placement - 1] || 0;
  return killPoints + placementPoints;
}

/**
 * Get teams that are in specific groups (for forming a match lobby)
 */
export function getTeamsInGroups(
  teams: Team[],
  groups: Group[],
  groupIds: string[]
): Team[] {
  const selectedGroups = groups.filter(g => groupIds.includes(g.id));
  const teamIds = new Set(selectedGroups.flatMap(g => g.teamIds));
  return teams.filter(t => teamIds.has(t.id));
}

/**
 * Check if a match lobby is valid (within team limit)
 */
export function isValidLobby(
  teamCount: number,
  maxTeams: number = 12
): boolean {
  return teamCount > 0 && teamCount <= maxTeams;
}

/**
 * Get qualified teams from a day's leaderboard
 */
export function getQualifiedTeams(
  leaderboard: LeaderboardEntry[],
  qualifyCount: number
): LeaderboardEntry[] {
  return leaderboard.filter(entry => entry.rank <= qualifyCount);
}

/**
 * Get eliminated teams from a day's leaderboard
 */
export function getEliminatedTeams(
  leaderboard: LeaderboardEntry[],
  qualifyCount: number
): LeaderboardEntry[] {
  return leaderboard.filter(entry => entry.rank > qualifyCount);
}

/**
 * Get top N teams from BR Final match for CS Bracket seeding
 */
export function getTop4FromBRFinal(
  brMatch: Match,
  scores: Score[],
  settings: TournamentSettings
): string[] {
  const brScores = scores.filter(s => s.matchId === brMatch.id);
  
  // Sort by total points
  const sortedScores = brScores.sort((a, b) => {
    const aTotalPoints = a.totalPoints || 0;
    const bTotalPoints = b.totalPoints || 0;
    if (bTotalPoints !== aTotalPoints) return bTotalPoints - aTotalPoints;
    if (b.kills !== a.kills) return b.kills - a.kills;
    return a.placement - b.placement;
  });
  
  // Return top 4 team IDs
  return sortedScores.slice(0, 4).map(s => s.teamId);
}
