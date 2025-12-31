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
