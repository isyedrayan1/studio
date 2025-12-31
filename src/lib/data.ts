import type { Team, Match, Announcement, LeaderboardEntry } from './definitions';

export const mockTeams: Team[] = [
  { id: 'T1', name: 'Vortex Vipers', group: 'A', captainName: 'Vex', captainUid: 'UID123' },
  { id: 'T2', name: 'Nova Nebula', group: 'A', captainName: 'Nova', captainUid: 'UID124' },
  { id: 'T3', name: 'Crimson Curse', group: 'A', captainName: 'Crimson', captainUid: 'UID125' },
  { id: 'T4', name: 'Abyssal Avengers', group: 'A', captainName: 'Abyss', captainUid: 'UID126' },
  { id: 'T5', name: 'Quantum Quakers', group: 'B', captainName: 'Quake', captainUid: 'UID127' },
  { id: 'T6', name: 'Solaris Syndicate', group: 'B', captainName: 'Solar', captainUid: 'UID128' },
  { id: 'T7', name: 'Celestial Centurions', group: 'B', captainName: 'Celeste', captainUid: 'UID129' },
  { id: 'T8', name: 'Inferno Infantry', group: 'B', captainName: 'Inferno', captainUid: 'UID130' },
  { id: 'T9', name: 'Reaper Regiment', group: 'C', captainName: 'Reap', captainUid: 'UID131' },
  { id: 'T10', name: 'Blitz Brigade', group: 'C', captainName: 'Blitz', captainUid: 'UID132' },
  { id: 'T11', name: 'Phantom Phalanx', group: 'C', captainName: 'Phantom', captainUid: 'UID133' },
  { id: 'T12', name: 'Warden Warriors', group: 'C', captainName: 'Warden', captainUid: 'UID134' },
];

export const mockMatches: Match[] = [
  {
    id: 'M1',
    day: 1,
    matchInDay: 1,
    status: 'finished',
    teams: mockTeams.slice(0, 12).map((team, index) => ({
      teamId: team.id,
      placement: index + 1,
      kills: Math.floor(Math.random() * 10),
    })),
  },
  {
    id: 'M2',
    day: 1,
    matchInDay: 2,
    status: 'finished',
    teams: [...mockTeams.slice(0, 12)].sort(() => 0.5 - Math.random()).map((team, index) => ({
      teamId: team.id,
      placement: index + 1,
      kills: Math.floor(Math.random() * 12),
    })),
  },
  {
    id: 'M3',
    day: 1,
    matchInDay: 3,
    status: 'live',
    teams: mockTeams.slice(0, 12).map((team) => ({
      teamId: team.id,
      placement: 0,
      kills: 0,
    })),
  },
    {
    id: 'M4',
    day: 1,
    matchInDay: 4,
    status: 'upcoming',
    teams: [],
  },
  {
    id: 'M5',
    day: 2,
    matchInDay: 1,
    status: 'upcoming',
    teams: [],
  },
];

export const mockAnnouncements: Announcement[] = [
    {
        id: 'A1',
        content: 'Welcome to Arena Ace! Day 1 matches will commence shortly. Stay tuned!',
        date: new Date().toISOString(),
    },
    {
        id: 'A2',
        content: 'Technical pause in Match 2. We will be back online soon.',
        date: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    }
];

const PLACEMENT_POINTS = [20, 17, 15, 13, 12, 11, 10, 9, 8, 7, 6, 5];

export const calculateLeaderboard = (teams: Team[], matches: Match[]): LeaderboardEntry[] => {
  const leaderboardMap = new Map<string, Omit<LeaderboardEntry, 'rank' | 'rankChange' | 'teamName' | 'teamGroup'>>();

  teams.forEach(team => {
    leaderboardMap.set(team.id, {
      teamId: team.id,
      totalPoints: 0,
      totalKills: 0,
      placementPoints: 0,
    });
  });

  matches.forEach(match => {
    if (match.status === 'finished') {
      match.teams.forEach(score => {
        const teamStats = leaderboardMap.get(score.teamId);
        if (teamStats) {
          const placementPoints = PLACEMENT_POINTS[score.placement - 1] || 0;
          const killPoints = score.kills;
          teamStats.totalKills += score.kills;
          teamStats.placementPoints += placementPoints;
          teamStats.totalPoints += placementPoints + killPoints;
        }
      });
    }
  });

  const sortedLeaderboard = Array.from(leaderboardMap.values())
    .sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      return b.totalKills - a.totalKills;
    })
    .map((entry, index) => {
        const team = teams.find(t => t.id === entry.teamId)!;
        return {
            ...entry,
            teamName: team.name,
            teamGroup: team.group,
            rank: index + 1,
            rankChange: 0, // Placeholder for animation
        }
    });

    return sortedLeaderboard;
};

export const initialLeaderboard = calculateLeaderboard(mockTeams, mockMatches);
