"use client";

import { useState, useEffect } from "react";
import type { LeaderboardEntry } from "@/lib/definitions";
import { initialLeaderboard, mockTeams, mockMatches, calculateLeaderboard } from "@/lib/data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

// Custom skull icon for kills
const SkullIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2c-3.31 0-6 2.69-6 6 0 1.95.93 3.69 2.38 4.78C6.67 13.56 6 14.7 6 16v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2c0-1.3-.67-2.44-1.38-3.22C17.07 11.69 18 10.03 18 8c0-3.31-2.69-6-6-6z" />
    <path d="M9 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
    <path d="M15 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
    <path d="M12 17c-1.66 0-3 1.34-3 3h6c0-1.66-1.34-3-3-3z" />
  </svg>
);

const QUALIFICATION_CUTOFF = 8;

export function LeaderboardTable() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate a match finishing
      const newMatches = [...mockMatches];
      const liveMatch = newMatches.find(m => m.status === 'live');
      if (liveMatch) {
        liveMatch.status = 'finished';
        liveMatch.teams = [...mockTeams.slice(0, 12)].sort(() => 0.5 - Math.random()).map((team, index) => ({
            teamId: team.id,
            placement: index + 1,
            kills: Math.floor(Math.random() * 15),
        }));

        const nextUpcoming = newMatches.find(m => m.status === 'upcoming');
        if (nextUpcoming) {
            nextUpcoming.status = 'live';
        }

        const oldLeaderboard = leaderboard;
        const newLeaderboardData = calculateLeaderboard(mockTeams, newMatches);

        // Calculate rank changes for animation
        const finalLeaderboard = newLeaderboardData.map(newEntry => {
            const oldEntry = oldLeaderboard.find(o => o.teamId === newEntry.teamId);
            const rankChange = oldEntry ? oldEntry.rank - newEntry.rank : 0;
            return { ...newEntry, rankChange };
        });
        
        setLeaderboard(finalLeaderboard);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [leaderboard]);
  

  return (
    <div className="rounded-lg border bg-card/50 backdrop-blur-sm overflow-hidden">
        <Table>
            <TableHeader>
                <TableRow className="text-lg tracking-wider hover:bg-transparent border-b-accent">
                    <TableHead className="w-[80px] text-center">Rank</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">Placement Pts</TableHead>
                    <TableHead className="text-center">Kills</TableHead>
                    <TableHead className="text-right text-primary">Total Points</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {leaderboard.map((entry, index) => (
                    <TableRow key={entry.teamId} className={cn(
                        "transition-all duration-500 ease-in-out text-xl tracking-wider",
                        entry.rank <= QUALIFICATION_CUTOFF ? "bg-accent/10 hover:bg-accent/20" : "hover:bg-muted/10",
                        entry.rankChange > 0 ? "animate-pulse-green" : entry.rankChange < 0 ? "animate-pulse-red" : "",
                        index === 0 && "border-b-2 border-primary/50",
                        index === QUALIFICATION_CUTOFF - 1 && "border-b-2 border-accent/30",
                    )}>
                        <TableCell className="text-center font-bold text-2xl">
                            <div className="flex items-center justify-center gap-2">
                                {entry.rank}
                                {entry.rankChange > 0 ? <ArrowUp className="h-5 w-5 text-green-400" />
                                : entry.rankChange < 0 ? <ArrowDown className="h-5 w-5 text-red-400" />
                                : <Minus className="h-5 w-5 text-muted-foreground" />}
                            </div>
                        </TableCell>
                        <TableCell className="font-semibold text-2xl">{entry.teamName}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{entry.placementPoints}</TableCell>
                        <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <SkullIcon className="h-5 w-5" />
                                {entry.totalKills}
                            </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-2xl text-primary">{entry.totalPoints}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        <style jsx>{`
            @keyframes pulse-green {
                0%, 100% { background-color: transparent; }
                50% { background-color: rgba(74, 222, 128, 0.1); }
            }
            @keyframes pulse-red {
                0%, 100% { background-color: transparent; }
                50% { background-color: rgba(248, 113, 113, 0.1); }
            }
            .animate-pulse-green {
                animation: pulse-green 2s ease-in-out;
            }
            .animate-pulse-red {
                animation: pulse-red 2s ease-in-out;
            }
        `}</style>
    </div>
  );
}
