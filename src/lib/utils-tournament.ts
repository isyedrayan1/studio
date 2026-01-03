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
  DEFAULT_TOURNAMENT_SETTINGS 
} from './types';

// ============================================
// LEADERBOARD CALCULATION
// ============================================

/**
 * Calculate leaderboard for a specific day
 * Works for both BR Shortlist and BR Championship
 */
export function calculateLeaderboard(
  teams: Team[],
  matches: Match[],
  scores: Score[],
  groups: Group[],
  settings: TournamentSettings = {
    killPoints: 1,
    placementPoints: [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0],
    maxTeamsPerMatch: 12,
    championRushThreshold: 60,
  },
  qualifyCount: number = 12
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

  // Initialize all teams
  teams.forEach(team => {
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
  });

  // Get finished matches only
  const finishedMatches = matches.filter(
    m => m.status === 'finished' || m.status === 'locked'
  );

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
      hasChampionRush: stats.totalPoints >= (settings.championRushThreshold || 60),
      hasBooyah: false, // Set separately based on match results
    };
  });
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
