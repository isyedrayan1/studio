"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Crown, ArrowLeft, Loader2, Trophy, Medal, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useTournament } from "@/contexts";

export default function LeaderboardPage() {
  const { teams, days, matches, scores, loading, getTeamById } = useTournament();
  const [selectedDayId, setSelectedDayId] = useState<string>("all");

  // Get the selected day's qualify count
  const selectedDay = days.find(d => d.id === selectedDayId);
  const qualifyCount = selectedDay?.qualifyCount || 0;

  // Calculate standings
  const standings = useMemo(() => {
    const teamStats: Record<string, { 
      teamId: string;
      totalKills: number;
      totalPlacement: number;
      totalPoints: number;
      matchesPlayed: number;
    }> = {};

    // Initialize all teams
    teams.forEach(t => {
      teamStats[t.id] = {
        teamId: t.id,
        totalKills: 0,
        totalPlacement: 0,
        totalPoints: 0,
        matchesPlayed: 0,
      };
    });

    // Filter scores by day if selected
    const relevantMatches = selectedDayId === "all" 
      ? matches 
      : matches.filter(m => m.dayId === selectedDayId);
    
    const matchIds = new Set(relevantMatches.map(m => m.id));

    scores.forEach(score => {
      if (!matchIds.has(score.matchId)) return;
      if (!teamStats[score.teamId]) return;

      teamStats[score.teamId].totalKills += score.kills;
      teamStats[score.teamId].totalPlacement += score.placement;
      teamStats[score.teamId].totalPoints += score.totalPoints || 0;
      teamStats[score.teamId].matchesPlayed += 1;
    });

    // Convert to array and sort
    return Object.values(teamStats)
      .filter(s => s.matchesPlayed > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints || b.totalKills - a.totalKills);
  }, [teams, matches, scores, selectedDayId]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="w-5 text-center font-mono">{rank}</span>;
  };

  return (
    <main className="flex-1 w-full">
      <div className="container py-12">
        <div className="flex flex-col items-center text-center mb-12">
          <Crown className="w-16 h-16 text-primary drop-shadow-[0_2px_4px_hsl(var(--primary)/0.5)]" />
          <h1 className="text-6xl md:text-7xl font-bold tracking-wider mt-4">
            Leaderboard
          </h1>
          <p className="text-xl text-muted-foreground mt-2 tracking-widest">
            Live rankings updated after each match.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Select value={selectedDayId} onValueChange={setSelectedDayId}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {days.map((day) => (
                <SelectItem key={day.id} value={day.id}>
                  Day {day.dayNumber}: {day.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-16 w-16 text-muted-foreground/50 mb-4 animate-spin" />
              <p className="text-xl text-muted-foreground">Loading standings...</p>
            </CardContent>
          </Card>
        ) : standings.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Trophy className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-xl text-muted-foreground">No standings yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Leaderboard will appear once matches are played.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                {selectedDayId === "all" ? "Overall Standings" : `Day ${selectedDay?.dayNumber} Standings`}
                <Badge variant="outline" className="ml-auto">{standings.length} teams</Badge>
              </CardTitle>
              {selectedDayId !== "all" && qualifyCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  Top {qualifyCount} teams qualify for next round
                </p>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead className="text-center">Matches</TableHead>
                    <TableHead className="text-center">Kills</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                    {selectedDayId !== "all" && qualifyCount > 0 && (
                      <TableHead className="text-center w-[80px]">Status</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {standings.map((stat, idx) => {
                    const team = getTeamById(stat.teamId);
                    const rank = idx + 1;
                    const isQualified = selectedDayId !== "all" && qualifyCount > 0 && rank <= qualifyCount;
                    return (
                      <TableRow key={stat.teamId} className={isQualified ? "bg-green-500/10" : rank <= 3 ? "bg-muted/30" : ""}>
                        <TableCell className="font-bold">
                          <div className="flex items-center gap-2">
                            {getRankBadge(rank)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{team?.name || "Unknown"}</span>
                            {team?.tag && (
                              <Badge variant="outline" className="text-xs">{team.tag}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{stat.matchesPlayed}</TableCell>
                        <TableCell className="text-center font-mono">{stat.totalKills}</TableCell>
                        <TableCell className="text-right font-bold text-lg">{stat.totalPoints}</TableCell>
                        {selectedDayId !== "all" && qualifyCount > 0 && (
                          <TableCell className="text-center">
                            {isQualified ? (
                              <Badge className="bg-green-600 text-white gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Q
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-muted-foreground">—</Badge>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
