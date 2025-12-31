// --- LEGACY / OVERALL TYPES ---

export type Team = {
  id: string;
  name: string;
  group: 'A' | 'B' | 'C' | 'D';
  captainName: string;
  captainUid: string;
  logoUrl?: string; // Optional: URL to team logo
};

export type MatchScore = {
  teamId: string;
  placement: number;
  kills: number;
};

export type Match = {
  id: string;
  day: number;
  matchInDay: number;
  teams: MatchScore[];
  status: 'upcoming' | 'live' | 'finished' | 'locked';
};

export type LeaderboardEntry = {
  teamId: string;
  teamName: string;
  teamGroup: 'A' | 'B' | 'C' | 'D';
  rank: number;
  totalPoints: number;
  totalKills: number;
  placementPoints: number;
  rankChange: number; // positive for up, negative for down, 0 for no change
};

export type Announcement = {
  id: string;
  content: string;
  date: string;
};


// --- DAY 1 SPECIFIC TYPES ---

export type Day1Team = {
  teamId: string;
  teamName: string;
  group: 'A' | 'B' | 'C';
}

export type Day1MatchScore = {
  teamId: string;
  kills: number;
  placement: number; // 1-12 or 1-11 depending on match
}

export type Day1Match = {
  matchId: number; // 1-9
  groupsCombined: ('A' | 'B' | 'C')[];
  scores: Day1MatchScore[];
  status: 'upcoming' | 'finished' | 'locked';
}

export type Day1LeaderboardEntry = {
  teamId: string;
  teamName: string;
  group: 'A' | 'B' | 'C';
  rank: number;
  matchesPlayed: number;
  totalKills: number;
  bestPlacement: number; // For tie-breaking
}
