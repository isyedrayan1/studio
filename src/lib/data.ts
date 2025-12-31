import type { Team, Match, Announcement, LeaderboardEntry, Day1Team, Day1Match, Day1LeaderboardEntry } from './definitions';

// LEGACY MOCK DATA
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
  { id: 'M3', day: 1, matchInDay: 3, status: 'live', teams: mockTeams.slice(0, 12).map((team) => ({ teamId: team.id, placement: 0, kills: 0 })), },
  { id: 'M4', day: 1, matchInDay: 4, status: 'upcoming', teams: [], },
  { id: 'M5', day: 2, matchInDay: 1, status: 'upcoming', teams: [], },
];

export const mockAnnouncements: Announcement[] = [
    { id: 'A1', content: 'Welcome to Arena Ace! Day 1 matches will commence shortly. Stay tuned!', date: new Date().toISOString(), },
    { id: 'A2', content: 'Technical pause in Match 2. We will be back online soon.', date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), }
];

const PLACEMENT_POINTS = [20, 17, 15, 13, 12, 11, 10, 9, 8, 7, 6, 5];

export const calculateLeaderboard = (teams: Team[], matches: Match[]): LeaderboardEntry[] => {
  // This is now legacy, Day 1 has its own calculation
  return [];
};
export const initialLeaderboard = calculateLeaderboard(mockTeams, mockMatches);


// --- DAY 1 SPECIFIC DATA ---

export const mockDay1Teams: Day1Team[] = [
    { teamId: 'T1', teamName: 'Vortex Vipers', group: 'A' },
    { teamId: 'T2', teamName: 'Nova Nebula', group: 'A' },
    { teamId: 'T3', teamName: 'Crimson Curse', group: 'A' },
    { teamId: 'T4', teamName: 'Abyssal Avengers', group: 'A' },
    { teamId: 'T5', teamName: 'Quantum Quakers', group: 'A' },
    { teamId: 'T6', teamName: 'Solaris Syndicate', group: 'B' },
    { teamId: 'T7', teamName: 'Celestial Centurions', group: 'B' },
    { teamId: 'T8', teamName: 'Inferno Infantry', group: 'B' },
    { teamId: 'T9', teamName: 'Reaper Regiment', group: 'B' },
    { teamId: 'T10', teamName: 'Blitz Brigade', group: 'B' },
    { teamId: 'T11', teamName: 'Phantom Phalanx', group: 'C' },
    { teamId: 'T12', teamName: 'Warden Warriors', group: 'C' },
    { teamId: 'T13', teamName: 'Goliath Guard', group: 'C' },
    { teamId: 'T14', teamName: 'Titan Troop', group: 'C' },
    { teamId: 'T15', teamName: 'Omega Order', group: 'C' },
    { teamId: 'T16', teamName: 'Hydra Hunters', group: 'A' },
    { teamId: 'T17', teamName: 'Zenith Zealots', group: 'B' },
];

const getTeamsForGroups = (groups: Array<'A' | 'B' | 'C'>): Day1Team[] => {
    return mockDay1Teams.filter(team => groups.includes(team.group));
}

const generateInitialScores = (teams: Day1Team[]): { teamId: string, kills: number, placement: number }[] => {
    return teams.map(team => ({
        teamId: team.teamId,
        kills: 0,
        placement: 0,
    }));
}

export const day1Matches: Day1Match[] = [
    // GA + GB
    { matchId: 1, groupsCombined: ['A', 'B'], scores: generateInitialScores(getTeamsForGroups(['A', 'B'])), status: 'upcoming' },
    { matchId: 2, groupsCombined: ['A', 'B'], scores: generateInitialScores(getTeamsForGroups(['A', 'B'])), status: 'upcoming' },
    { matchId: 3, groupsCombined: ['A', 'B'], scores: generateInitialScores(getTeamsForGroups(['A', 'B'])), status: 'upcoming' },
    // GB + GC
    { matchId: 4, groupsCombined: ['B', 'C'], scores: generateInitialScores(getTeamsForGroups(['B', 'C'])), status: 'upcoming' },
    { matchId: 5, groupsCombined: ['B', 'C'], scores: generateInitialScores(getTeamsForGroups(['B', 'C'])), status: 'upcoming' },
    { matchId: 6, groupsCombined: ['B', 'C'], scores: generateInitialScores(getTeamsForGroups(['B', 'C'])), status: 'upcoming' },
    // GA + GC
    { matchId: 7, groupsCombined: ['A', 'C'], scores: generateInitialScores(getTeamsForGroups(['A', 'C'])), status: 'upcoming' },
    { matchId: 8, groupsCombined: ['A', 'C'], scores: generateInitialScores(getTeamsForGroups(['A', 'C'])), status: 'upcoming' },
    { matchId: 9, groupsCombined: ['A', 'C'], scores: generateInitialScores(getTeamsForGroups(['A', 'C'])), status: 'upcoming' },
];

// --- DAY 1 LEADERBOARD CALCULATION LOGIC ---

export const calculateDay1Leaderboard = (teams: Day1Team[], matches: Day1Match[]): Day1LeaderboardEntry[] => {
    const leaderboardMap = new Map<string, Omit<Day1LeaderboardEntry, 'rank' | 'teamName' | 'group'>>();

    teams.forEach(team => {
        leaderboardMap.set(team.teamId, {
            teamId: team.teamId,
            matchesPlayed: 0,
            totalKills: 0,
            bestPlacement: Infinity,
        });
    });

    matches.forEach(match => {
        if (match.status === 'finished' || match.status === 'locked') {
            match.scores.forEach(score => {
                const teamStats = leaderboardMap.get(score.teamId);
                if (teamStats) {
                    teamStats.matchesPlayed += 1;
                    teamStats.totalKills += score.kills;
                    if (score.placement < teamStats.bestPlacement && score.placement > 0) {
                        teamStats.bestPlacement = score.placement;
                    }
                }
            });
        }
    });

    const sortedLeaderboard = Array.from(leaderboardMap.values())
        .sort((a, b) => {
            if (b.totalKills !== a.totalKills) {
                return b.totalKills - a.totalKills;
            }
            // Lower placement is better
            return a.bestPlacement - b.bestPlacement;
        })
        .map((entry, index) => {
            const team = teams.find(t => t.id === entry.teamId) || teams.find(t => t.teamId === entry.teamId)!;
            return {
                ...entry,
                teamName: team.teamName,
                group: team.group,
                rank: index + 1,
            }
        });

    return sortedLeaderboard;
};

// Simulate some initial data for demonstration
const finishedMatches = day1Matches.slice(0, 2);
finishedMatches[0].status = 'finished';
finishedMatches[0].scores.forEach((s, i) => {
    s.kills = Math.floor(Math.random() * 15);
    s.placement = i + 1;
});
finishedMatches[1].status = 'finished';
finishedMatches[1].scores.forEach((s, i) => {
    s.kills = Math.floor(Math.random() * 15);
    s.placement = i + 1;
});


export const initialDay1Leaderboard = calculateDay1Leaderboard(mockDay1Teams, finishedMatches);
