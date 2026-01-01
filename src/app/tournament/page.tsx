"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Crown, 
  Loader2, 
  Trophy, 
  Medal, 
  CheckCircle,
  Swords,
  Target,
  Flame,
  ArrowLeft,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { useTournament } from "@/contexts";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import type { BracketMatch } from "@/lib/types";

// Skull icon for kills
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
  </svg>
);

// Placement points
const PLACEMENT_POINTS = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0];
const KILL_POINTS = 1;

export default function TournamentPage() {
  const { teams, days, matches, scores, loading, getTeamById, bracketMatches } = useTournament();
  
  // Sort days
  const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
  const [activeTab, setActiveTab] = useState<string>("");
  
  // Set default tab to first day
  const selectedDayId = activeTab || sortedDays[0]?.id || "";
  const selectedDay = days.find(d => d.id === selectedDayId);

  // Match view state for per-match leaderboard
  const [selectedMatchId, setSelectedMatchId] = useState<string>("overall");

  // Get matches for selected day
  const dayMatches = matches
    .filter(m => m.dayId === selectedDayId)
    .sort((a, b) => a.matchNumber - b.matchNumber);

  // Calculate standings for overall day
  const dayStandings = useMemo(() => {
    const teamStats: Record<string, { 
      teamId: string;
      totalKills: number;
      totalPoints: number;
      matchesPlayed: number;
      bestPlacement: number;
    }> = {};

    // Initialize all teams that participated in matches for this day
    const dayMatchIds = new Set(dayMatches.map(m => m.id));
    const dayScores = scores.filter(s => dayMatchIds.has(s.matchId));
    
    dayScores.forEach(score => {
      if (!teamStats[score.teamId]) {
        teamStats[score.teamId] = {
          teamId: score.teamId,
          totalKills: 0,
          totalPoints: 0,
          matchesPlayed: 0,
          bestPlacement: 13,
        };
      }
      
      const placementPts = PLACEMENT_POINTS[score.placement - 1] || 0;
      const points = score.kills * KILL_POINTS + placementPts;
      
      teamStats[score.teamId].totalKills += score.kills;
      teamStats[score.teamId].totalPoints += points;
      teamStats[score.teamId].matchesPlayed += 1;
      if (score.placement < teamStats[score.teamId].bestPlacement) {
        teamStats[score.teamId].bestPlacement = score.placement;
      }
    });

    return Object.values(teamStats)
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
        return a.bestPlacement - b.bestPlacement;
      });
  }, [dayMatches, scores]);

  // Calculate standings for a specific match
  const matchStandings = useMemo(() => {
    if (selectedMatchId === "overall") return [];
    
    const matchScores = scores.filter(s => s.matchId === selectedMatchId);
    
    return matchScores
      .map(score => {
        const placementPts = PLACEMENT_POINTS[score.placement - 1] || 0;
        const points = score.kills * KILL_POINTS + placementPts;
        return {
          teamId: score.teamId,
          kills: score.kills,
          placement: score.placement,
          points,
        };
      })
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.kills - a.kills;
      });
  }, [selectedMatchId, scores]);

  const qualifyCount = selectedDay?.qualifyCount || 0;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="w-6 text-center font-mono text-xl">{rank}</span>;
  };

  if (loading) {
    return (
      <main className="flex-1 w-full flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
          <p className="text-xl text-muted-foreground tracking-wider">Loading tournament data...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full">
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <div className="relative">
            <Trophy className="w-16 h-16 text-primary drop-shadow-[0_2px_4px_hsl(var(--primary)/0.5)]" />
            <Flame className="absolute -top-2 -right-2 w-6 h-6 text-orange-500 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-wider mt-4">
            TOURNAMENT HUB
          </h1>
          <p className="text-xl text-muted-foreground mt-2 tracking-widest">
            Live standings and match results
          </p>
        </div>

        {/* Back button */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {sortedDays.length === 0 ? (
          <Card className="border-dashed max-w-xl mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Trophy className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-xl text-muted-foreground">No tournament days set up yet</p>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={selectedDayId} onValueChange={(v) => { setActiveTab(v); setSelectedMatchId("overall"); }} className="space-y-8">
            {/* Day Tabs */}
            <TabsList className="w-full justify-center gap-2 bg-transparent h-auto flex-wrap">
              {sortedDays.map((day) => {
                const isActive = day.status === "active";
                const isCompleted = day.status === "completed" || day.status === "locked";
                
                return (
                  <TabsTrigger
                    key={day.id}
                    value={day.id}
                    className={cn(
                      "relative px-6 py-4 text-xl tracking-wider data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg border-2 border-transparent",
                      "data-[state=active]:border-primary",
                      isActive && "ring-2 ring-primary/50 ring-offset-2 ring-offset-background"
                    )}
                  >
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    )}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm opacity-70">Day {day.dayNumber}</span>
                      <span className="font-bold">{day.name}</span>
                      {isCompleted && (
                        <CheckCircle className="h-4 w-4 text-green-500 absolute -top-1 -right-1" />
                      )}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Day Content */}
            {sortedDays.map((day) => (
              <TabsContent key={day.id} value={day.id} className="space-y-8">
                {/* Day Info Card */}
                <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
                  <CardContent className="py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary/20">
                          {day.type === "cs-bracket" ? (
                            <Swords className="h-8 w-8 text-primary" />
                          ) : (
                            <Target className="h-8 w-8 text-primary" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-3xl font-bold tracking-wider">{day.name}</h2>
                          <p className="text-muted-foreground">
                            {day.type === "br-shortlist" && "Battle Royale - Kill-based Qualification"}
                            {day.type === "br-championship" && "Battle Royale - Champion Rush"}
                            {day.type === "cs-bracket" && "Clash Squad - Elimination Bracket"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={day.status === "active" ? "default" : "secondary"} className="text-lg px-4 py-2">
                          {day.status === "active" ? "LIVE" : day.status === "completed" ? "COMPLETED" : day.status.toUpperCase()}
                        </Badge>
                        {day.qualifyCount && day.qualifyCount > 0 && (
                          <Badge variant="outline" className="text-lg px-4 py-2 border-accent text-accent">
                            Top {day.qualifyCount} Qualify
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* CS Bracket special view */}
                {day.type === "cs-bracket" ? (
                  <BracketView dayId={day.id} bracketMatches={bracketMatches} getTeamById={getTeamById} />
                ) : (
                  <>
                    {/* Match Selector */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <h3 className="text-2xl font-bold tracking-wider">Leaderboard</h3>
                      <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                        <SelectTrigger className="w-[220px]">
                          <SelectValue placeholder="Select view" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="overall">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-primary" />
                              Overall Standings
                            </div>
                          </SelectItem>
                          {dayMatches.map((match) => (
                            <SelectItem key={match.id} value={match.id}>
                              <div className="flex items-center gap-2">
                                <Swords className="h-4 w-4" />
                                Match {match.matchNumber}
                                {match.status === "live" && (
                                  <Badge variant="destructive" className="text-xs ml-2">LIVE</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Leaderboard Table */}
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-muted/30">
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {selectedMatchId === "overall" ? (
                              <>
                                <Trophy className="h-6 w-6 text-primary" />
                                <span className="text-2xl tracking-wider">Overall Day {day.dayNumber} Standings</span>
                              </>
                            ) : (
                              <>
                                <Swords className="h-6 w-6 text-primary" />
                                <span className="text-2xl tracking-wider">
                                  Match {dayMatches.find(m => m.id === selectedMatchId)?.matchNumber} Results
                                </span>
                              </>
                            )}
                          </div>
                          <Badge variant="outline">
                            {selectedMatchId === "overall" ? dayStandings.length : matchStandings.length} teams
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {selectedMatchId === "overall" ? (
                          // Overall standings
                          dayStandings.length === 0 ? (
                            <div className="py-16 text-center">
                              <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                              <p className="text-xl text-muted-foreground">No results yet</p>
                              <p className="text-sm text-muted-foreground/70">Standings will appear when matches are completed</p>
                            </div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow className="text-lg tracking-wider hover:bg-transparent">
                                  <TableHead className="w-[80px] text-center">Rank</TableHead>
                                  <TableHead>Team</TableHead>
                                  <TableHead className="text-center">Matches</TableHead>
                                  <TableHead className="text-center">Kills</TableHead>
                                  <TableHead className="text-right">Points</TableHead>
                                  {qualifyCount > 0 && (
                                    <TableHead className="text-center w-[100px]">Status</TableHead>
                                  )}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {dayStandings.map((stat, idx) => {
                                  const team = getTeamById(stat.teamId);
                                  const rank = idx + 1;
                                  const isQualified = qualifyCount > 0 && rank <= qualifyCount;
                                  
                                  return (
                                    <TableRow 
                                      key={stat.teamId}
                                      className={cn(
                                        "text-lg transition-colors",
                                        isQualified && "bg-green-500/10 hover:bg-green-500/20",
                                        rank <= 3 && !isQualified && "bg-muted/30",
                                        idx === qualifyCount - 1 && qualifyCount > 0 && "border-b-2 border-accent"
                                      )}
                                    >
                                      <TableCell className="text-center">
                                        <div className="flex justify-center">
                                          {getRankBadge(rank)}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <span className="font-bold text-xl">{team?.name || "Unknown"}</span>
                                          {team?.tag && (
                                            <Badge variant="outline" className="text-xs">{team.tag}</Badge>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center text-muted-foreground">
                                        {stat.matchesPlayed}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          <SkullIcon className="h-5 w-5 text-red-500" />
                                          <span className="font-mono font-bold">{stat.totalKills}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <span className="font-bold text-2xl text-primary">{stat.totalPoints}</span>
                                      </TableCell>
                                      {qualifyCount > 0 && (
                                        <TableCell className="text-center">
                                          {isQualified ? (
                                            <Badge className="bg-green-600 text-white gap-1">
                                              <CheckCircle className="h-3 w-3" />
                                              QUALIFIED
                                            </Badge>
                                          ) : (
                                            <span className="text-muted-foreground">—</span>
                                          )}
                                        </TableCell>
                                      )}
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          )
                        ) : (
                          // Match-specific standings
                          matchStandings.length === 0 ? (
                            <div className="py-16 text-center">
                              <Swords className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                              <p className="text-xl text-muted-foreground">No results yet</p>
                              <p className="text-sm text-muted-foreground/70">Scores will appear when this match is completed</p>
                            </div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow className="text-lg tracking-wider hover:bg-transparent">
                                  <TableHead className="w-[80px] text-center">Rank</TableHead>
                                  <TableHead>Team</TableHead>
                                  <TableHead className="text-center">Placement</TableHead>
                                  <TableHead className="text-center">Kills</TableHead>
                                  <TableHead className="text-right">Points</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {matchStandings.map((stat, idx) => {
                                  const team = getTeamById(stat.teamId);
                                  const rank = idx + 1;
                                  
                                  return (
                                    <TableRow 
                                      key={stat.teamId}
                                      className={cn(
                                        "text-lg transition-colors",
                                        rank <= 3 && "bg-muted/30",
                                        stat.placement === 1 && "bg-yellow-500/10"
                                      )}
                                    >
                                      <TableCell className="text-center">
                                        <div className="flex justify-center">
                                          {getRankBadge(rank)}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <span className="font-bold text-xl">{team?.name || "Unknown"}</span>
                                          {team?.tag && (
                                            <Badge variant="outline" className="text-xs">{team.tag}</Badge>
                                          )}
                                          {stat.placement === 1 && (
                                            <Badge className="bg-yellow-500 text-black">BOOYAH!</Badge>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Badge variant={stat.placement <= 3 ? "default" : "outline"}>
                                          #{stat.placement}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          <SkullIcon className="h-5 w-5 text-red-500" />
                                          <span className="font-mono font-bold">{stat.kills}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <span className="font-bold text-2xl text-primary">{stat.points}</span>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          )
                        )}
                      </CardContent>
                    </Card>

                    {/* Points Legend */}
                    <Card className="bg-muted/20">
                      <CardContent className="py-4">
                        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                          <span className="font-semibold">Points System:</span>
                          <span>Kill = {KILL_POINTS} pt</span>
                          <span className="text-primary">1st = {PLACEMENT_POINTS[0]} pts</span>
                          <span>2nd = {PLACEMENT_POINTS[1]} pts</span>
                          <span>3rd = {PLACEMENT_POINTS[2]} pts</span>
                          <span>... 12th = {PLACEMENT_POINTS[11]} pts</span>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </main>
  );
}

// ============================================
// BRACKET VIEW COMPONENT
// ============================================

const ROUND_NAMES: Record<number, string> = {
  1: "Quarterfinals",
  2: "Semifinals",
  3: "Finals",
};

const STATUS_CONFIG = {
  upcoming: { label: "Upcoming", color: "bg-slate-500" },
  live: { label: "LIVE", color: "bg-red-500 animate-pulse" },
  finished: { label: "Finished", color: "bg-blue-500" },
};

interface BracketViewProps {
  dayId: string;
  bracketMatches: BracketMatch[];
  getTeamById: (id: string) => { id: string; name: string; tag?: string } | undefined;
}

function BracketView({ dayId, bracketMatches, getTeamById }: BracketViewProps) {
  const dayBracket = bracketMatches.filter(m => m.dayId === dayId);
  const hasBracket = dayBracket.length > 0;

  // Find champion
  const finals = dayBracket.find(m => m.round === 3);
  const champion = finals?.winnerId ? getTeamById(finals.winnerId) : null;

  // Check if any match is live
  const hasLiveMatch = dayBracket.some(m => m.status === "live");

  const renderMatchCard = (match: BracketMatch) => {
    const team1 = match.team1Id ? getTeamById(match.team1Id) : null;
    const team2 = match.team2Id ? getTeamById(match.team2Id) : null;
    const isLive = match.status === "live";
    const isFinished = match.status === "finished";

    return (
      <Card 
        key={match.id} 
        className={cn(
          isFinished && "opacity-75",
          match.round === 3 && "border-primary border-2",
          isLive && "ring-2 ring-red-500"
        )}
      >
        <CardHeader className="py-2 px-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {ROUND_NAMES[match.round]} - Match {match.matchInRound}
            </span>
            <Badge className={cn(STATUS_CONFIG[match.status].color, "text-white text-xs gap-1")}>
              {isLive && <Radio className="h-3 w-3" />}
              {STATUS_CONFIG[match.status].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-2 px-4 space-y-2">
          {/* Team 1 */}
          <div className={cn(
            "flex items-center justify-between p-3 rounded-md transition-colors",
            match.winnerId === match.team1Id 
              ? "bg-green-500/20 border border-green-500" 
              : match.winnerId && match.winnerId !== match.team1Id
                ? "bg-red-500/10 opacity-50"
                : "bg-muted/50"
          )}>
            <div className="flex items-center gap-2">
              {match.winnerId === match.team1Id && <Crown className="h-4 w-4 text-yellow-500" />}
              <span className={cn("font-medium", match.winnerId === match.team1Id && "text-green-500")}>
                {team1?.name || "TBD"}
              </span>
              {team1?.tag && <Badge variant="outline" className="text-xs">{team1.tag}</Badge>}
            </div>
          </div>
          
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <span>VS</span>
          </div>
          
          {/* Team 2 */}
          <div className={cn(
            "flex items-center justify-between p-3 rounded-md transition-colors",
            match.winnerId === match.team2Id 
              ? "bg-green-500/20 border border-green-500" 
              : match.winnerId && match.winnerId !== match.team2Id
                ? "bg-red-500/10 opacity-50"
                : "bg-muted/50"
          )}>
            <div className="flex items-center gap-2">
              {match.winnerId === match.team2Id && <Crown className="h-4 w-4 text-yellow-500" />}
              <span className={cn("font-medium", match.winnerId === match.team2Id && "text-green-500")}>
                {team2?.name || "TBD"}
              </span>
              {team2?.tag && <Badge variant="outline" className="text-xs">{team2.tag}</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!hasBracket) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Swords className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-xl text-muted-foreground">Bracket not ready yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            The bracket will appear here once it&apos;s initialized.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Live indicator */}
      {hasLiveMatch && (
        <div className="flex justify-center">
          <Badge className="bg-red-500 text-white gap-1 text-lg px-4 py-2 animate-pulse">
            <Radio className="h-4 w-4" />
            LIVE MATCH IN PROGRESS
          </Badge>
        </div>
      )}

      {/* Champion Banner */}
      {champion && (
        <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500">
          <CardContent className="flex items-center justify-center gap-4 py-8">
            <Crown className="h-12 w-12 text-yellow-500" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-widest">🏆 CHAMPION 🏆</p>
              <h2 className="text-5xl font-bold">{champion.name}</h2>
              {champion.tag && <Badge className="mt-2 text-lg">{champion.tag}</Badge>}
            </div>
            <Crown className="h-12 w-12 text-yellow-500" />
          </CardContent>
        </Card>
      )}

      {/* Bracket Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Quarterfinals */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2 justify-center lg:justify-start">
            <Swords className="h-5 w-5" />
            Quarterfinals
          </h3>
          <div className="space-y-4">
            {dayBracket.filter(m => m.round === 1).map(renderMatchCard)}
          </div>
        </div>

        {/* Semifinals */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2 justify-center lg:justify-start">
            <Swords className="h-5 w-5" />
            Semifinals
          </h3>
          <div className="space-y-4">
            {dayBracket.filter(m => m.round === 2).map(renderMatchCard)}
          </div>
        </div>

        {/* Finals */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2 justify-center lg:justify-start">
            <Trophy className="h-5 w-5 text-primary" />
            Grand Finals
          </h3>
          <div className="space-y-4">
            {dayBracket.filter(m => m.round === 3).map(renderMatchCard)}
          </div>
        </div>
      </div>
    </div>
  );
}
