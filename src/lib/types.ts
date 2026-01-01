// ============================================
// ARENA ACE - DYNAMIC TOURNAMENT TYPE SYSTEM
// ============================================
// All types are designed for dynamic admin control
// Nothing is hardcoded - groups, days, matches are all configurable

// ============================================
// CORE ENTITIES
// ============================================

/**
 * Tournament - The top-level container
 */
export type Tournament = {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'completed';
  createdAt: string;
  updatedAt: string;
  settings: TournamentSettings;
};

export type TournamentSettings = {
  killPoints: number; // Points per kill (default: 1)
  placementPoints: number[]; // Points by placement [1st, 2nd, 3rd...12th]
  maxTeamsPerMatch: number; // BR lobby limit (default: 12)
  championRushThreshold?: number; // Points to trigger champion rush (Day 2)
};

/**
 * Team - A competing team in the tournament
 */
export type Team = {
  id: string;
  name: string;
  tag?: string; // Short tag like "PHN", "KDRP"
  captainName?: string;
  captainUid?: string;
  logoUrl?: string;
  groupId?: string; // Optional: which group this team belongs to
  createdAt: string;
};

/**
 * Day - A tournament day with a specific event type
 */
export type Day = {
  id: string;
  dayNumber: number;
  name: string; // "Shortlisting", "BR Championship", "CS Finals"
  type: DayType;
  status: 'upcoming' | 'active' | 'paused' | 'completed' | 'locked';
  qualifyCount?: number; // How many teams qualify from this day
  date?: string; // Date of the day (YYYY-MM-DD)
  startTime?: string; // Start time (HH:mm)
  endTime?: string; // End time (HH:mm)
  createdAt: string;
};

export type DayType = 
  | 'br-shortlist'      // Day 1: Kill-based qualification
  | 'br-championship'   // Day 2: Champion Rush logic
  | 'cs-bracket';       // Day 3: Elimination bracket

/**
 * Group - A grouping of teams for match formation
 */
export type Group = {
  id: string;
  name: string; // "Group A", "Group B", etc.
  dayId: string; // Which day this group belongs to
  teamIds: string[]; // Teams in this group
  createdAt: string;
};

/**
 * Match - A single game/lobby within a day
 */
export type Match = {
  id: string;
  dayId: string;
  matchNumber: number;
  groupIds: string[]; // Groups that combine for this match
  teamIds: string[]; // Direct team IDs participating in this match (derived from groups)
  status: 'upcoming' | 'live' | 'finished' | 'locked';
  createdAt: string;
};

/**
 * Score - Score entry for a team in a specific match
 */
export type Score = {
  id: string;
  matchId: string;
  teamId: string;
  kills: number;
  placement: number; // 1 = first, 12 = last
  totalPoints?: number; // Calculated: kills * killPoints + placementPoints[placement]
};

/**
 * Announcement - Public announcements
 */
export type Announcement = {
  id: string;
  content: string;
  priority: 'normal' | 'urgent';
  active: boolean;
  createdAt: string;
};

/**
 * User - Admin or Associate
 */
export type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'associate';
  createdAt: string;
};

// ============================================
// CALCULATED / VIEW TYPES
// ============================================

/**
 * LeaderboardEntry - Calculated ranking for a team
 */
export type LeaderboardEntry = {
  teamId: string;
  teamName: string;
  groupName?: string;
  rank: number;
  matchesPlayed: number;
  totalKills: number;
  totalPlacementPoints: number;
  totalPoints: number;
  bestPlacement: number;
  isQualified: boolean;
  hasChampionRush?: boolean; // For Day 2
  hasBooyah?: boolean; // Got 1st place after champion rush
};

/**
 * MatchWithDetails - Match with populated team/score data
 */
export type MatchWithDetails = Match & {
  teams: TeamWithScore[];
  groupNames: string[];
};

export type TeamWithScore = {
  team: Team;
  score?: Score;
};

/**
 * BracketMatch - For CS elimination brackets
 */
export type BracketMatch = {
  id: string;
  dayId: string;
  round: number; // 1 = quarters, 2 = semis, 3 = finals
  matchInRound: number;
  team1Id?: string;
  team2Id?: string;
  winnerId?: string;
  status: 'upcoming' | 'live' | 'finished';
};

// ============================================
// FORM / INPUT TYPES
// ============================================

export type CreateTeamInput = Omit<Team, 'id' | 'createdAt'>;
export type UpdateTeamInput = Partial<CreateTeamInput>;

export type CreateDayInput = Omit<Day, 'id' | 'createdAt' | 'status'>;
export type UpdateDayInput = Partial<CreateDayInput>;

export type CreateGroupInput = Omit<Group, 'id' | 'createdAt'>;
export type UpdateGroupInput = Partial<CreateGroupInput>;

export type CreateMatchInput = Omit<Match, 'id' | 'createdAt' | 'status'>;
export type UpdateMatchInput = Partial<Omit<Match, 'id' | 'createdAt'>>;

export type CreateScoreInput = Omit<Score, 'id' | 'totalPoints'>;
export type UpdateScoreInput = Partial<CreateScoreInput>;

export type CreateAnnouncementInput = Omit<Announcement, 'id' | 'createdAt'>;

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_TOURNAMENT_SETTINGS: TournamentSettings = {
  killPoints: 1,
  placementPoints: [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0], // 1st to 12th
  maxTeamsPerMatch: 12,
  championRushThreshold: 60,
};
