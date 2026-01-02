"use client";

import { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Crown, Loader2, Trophy, Medal, CheckCircle, Target, Lock, Play, Clock, Share2, Download, ArrowLeft } from "lucide-react";
import { useTournament } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import { exportLeaderboardAsImage, shareLeaderboardImage } from "@/lib/export-leaderboard";
import Link from "next/link";

const PLACEMENT_POINTS = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0];
const KILL_POINTS = 1;

export default function TournamentPage() {
  const { teams, days, matches, scores, loading, getTeamById } = useTournament();
  const { toast } = useToast();
  const [selectedDayId, setSelectedDayId] = useState<string>("all");
  const [matchesDayId, setMatchesDayId] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  // Get the selected day's qualify count
  const selectedDay = days.find(d => d.id === selectedDayId);
  const qualifyCount = selectedDay?.qualifyCount || 0;

  const handleExportImage = async () => {
    try {
      setIsExporting(true);
      const dayName = selectedDay?.name || "Master";
      await exportLeaderboardAsImage(
        "leaderboard-master-table",
        `Arena-Ace-${dayName}-Leaderboard.png`,
        "Arena Ace Tournament"
      );
      toast({
        title: "Success",
        description: "Leaderboard downloaded successfully!",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Error",
        description: "Failed to export leaderboard",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareImage = async () => {
    try {
      setIsExporting(true);
      await shareLeaderboardImage("leaderboard-master-table", "Arena Ace Tournament");
      toast({
        title: "Success",
        description: "Leaderboard ready to share!",
      });
    } catch (error) {
      console.error("Share failed:", error);
      toast({
        title: "Error",
        description: "Failed to share leaderboard",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate standings
  const standings = useMemo(() => {
    const teamStats: Record<string, {
      teamId: string;
      totalKills: number;
      totalPlacement: number;
      totalPoints: number;
      matchesPlayed: number;
      booyahCount: number;
      championRushCount: number;
    }> = {};

    // Filter matches by selected day
    const relevantMatches = selectedDayId === "all"
      ? matches
      : matches.filter(m => m.dayId === selectedDayId);

    // Get all teams that should be in this leaderboard (teams that are in any of the relevant matches)
    const teamsInMatches = new Set<string>();
    relevantMatches.forEach(match => {
      match.teamIds.forEach(teamId => teamsInMatches.add(teamId));
    });

    // Initialize only teams that play in these matches
    teamsInMatches.forEach(teamId => {
      teamStats[teamId] = {
        teamId,
        totalKills: 0,
        totalPlacement: 0,
        totalPoints: 0,
        matchesPlayed: 0,
        booyahCount: 0,
        championRushCount: 0,
      };
    });

    // Aggregate scores
    relevantMatches.forEach(match => {
      match.teamIds.forEach(teamId => {
        const score = scores.find(s => s.matchId === match.id && s.teamId === teamId);
        if (score) {
          const placementPts = PLACEMENT_POINTS[score.placement - 1] ?? 0;
          const totalPts = (score.kills * KILL_POINTS) + placementPts;

          teamStats[teamId].totalKills += score.kills;
          teamStats[teamId].totalPlacement += placementPts;
          teamStats[teamId].totalPoints += totalPts;
          teamStats[teamId].matchesPlayed += 1;

          // Track Booyahs and Champion Rush badges
          if (score.isBooyah) teamStats[teamId].booyahCount += 1;
          if (score.hasChampionRush) teamStats[teamId].championRushCount += 1;
        }
      });
    });

    // Convert to array and sort - SHOW ALL TEAMS (even with 0 points)
    const standingsArray = Object.values(teamStats)
      .sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
        return b.totalPlacement - a.totalPlacement;
      });

    return standingsArray;
  }, [teams, matches, scores, selectedDayId]);

  // Determine if we should show Champion Rush column (only for Day 2 or all days)
  const showChampionRush = selectedDayId === "all" || selectedDay?.type === 'br-championship';

  // Get matches for the matches tab
  const matchesForDisplay = useMemo(() => {
    if (matchesDayId === "all") return matches;
    return matches.filter(m => m.dayId === matchesDayId);
  }, [matches, matchesDayId]);

  // Calculate match-specific standings for ALL matches
  const allMatchStandings = useMemo(() => {
    return matchesForDisplay.map(match => {
      // Get ALL teams in this match (from match.teamIds)
      const matchTeams = match.teamIds.map(teamId => {
        const score = scores.find(s => s.matchId === match.id && s.teamId === teamId);

        if (!score) {
          // No score yet - show team with 0 points
          return {
            teamId,
            kills: 0,
            placement: 0,
            placementPts: 0,
            totalPoints: 0,
            isBooyah: false,
            hasChampionRush: false,
            hasScore: false,
          };
        }

        const placementPts = PLACEMENT_POINTS[score.placement - 1] ?? 0;
        const totalPts = (score.kills * KILL_POINTS) + placementPts;

        return {
          teamId,
          kills: score.kills,
          placement: score.placement,
          placementPts,
          totalPoints: totalPts,
          isBooyah: score.isBooyah || false,
          hasChampionRush: score.hasChampionRush || false,
          hasScore: true,
        };
      });

      // Sort by placement (1st place first, no scores at bottom)
      const sortedTeams = matchTeams.sort((a, b) => {
        if (!a.hasScore && !b.hasScore) return 0; // Both no score
        if (!a.hasScore) return 1; // a no score - put at bottom
        if (!b.hasScore) return -1; // b no score - put at bottom
        if (a.placement === 0 && b.placement === 0) return 0;
        if (a.placement === 0) return 1;
        if (b.placement === 0) return -1;
        return a.placement - b.placement;
      });

      const matchDay = days.find(d => d.id === match.dayId);

      return {
        match,
        matchDay,
        standings: sortedTeams,
        showChampionRush: matchDay?.type === 'br-championship',
      };
    });
  }, [matchesForDisplay, scores, days]);

  return (
    <div className="container py-8 md:py-12 space-y-6">
      {/* Back button */}
      <div className="flex justify-start">
        <Link href="/">
          <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-wider">Leaderboard</h1>
          <p className="text-muted-foreground text-lg md:text-xl tracking-widest mt-1">
            Live tournament standings
          </p>
        </div>

        {/* Export/Share Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleExportImage}
            disabled={isExporting}
            variant="outline"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download
          </Button>
          <Button
            onClick={handleShareImage}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4 mr-2" />
            )}
            Share
          </Button>
        </div>
      </div>

      {/* Tabs: Master Leaderboard vs All Matches */}
      <Tabs defaultValue="master" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto md:mx-0">
          <TabsTrigger value="master" className="text-base">
            <Trophy className="h-4 w-4 mr-2" />
            Master Standings
          </TabsTrigger>
          <TabsTrigger value="matches" className="text-base">
            <Target className="h-4 w-4 mr-2" />
            All Matches
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: MASTER LEADERBOARD */}
        <TabsContent value="master" className="space-y-4 mt-6">
          {/* Day Selector */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1 w-full md:max-w-sm space-y-2">
              <label className="text-sm font-medium">Filter by Day</label>
              <Select value={selectedDayId} onValueChange={setSelectedDayId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      All Days
                      <Badge variant="secondary">Overall</Badge>
                    </div>
                  </SelectItem>
                  {days.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      <div className="flex items-center gap-2">
                        Day {day.dayNumber}: {day.name}
                        {day.status === "active" && <Badge variant="default">Active</Badge>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDay && qualifyCount > 0 && (
              <Card className="bg-primary/10 border-primary/20 w-full md:w-auto">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Top {qualifyCount} qualify</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Master Standings Table */}
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
                <p className="text-xl text-muted-foreground">No scores available yet</p>
                <p className="text-sm text-muted-foreground mt-2">Scores will appear once matches begin</p>
              </CardContent>
            </Card>
          ) : (
            <Card id="leaderboard-master-table" className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  {selectedDayId === "all" ? "Overall Standings" : `Day ${selectedDay?.dayNumber} Standings`}
                  <Badge variant="secondary" className="ml-auto">{standings.length} teams</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px] text-center">Rank</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-center">Matches</TableHead>
                        <TableHead className="text-center">Kills</TableHead>
                        <TableHead className="text-center">Booyahs</TableHead>
                        {showChampionRush && <TableHead className="text-center">🔥 CR</TableHead>}
                        <TableHead className="text-center">Place Pts</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        {selectedDay && qualifyCount > 0 && <TableHead className="text-center w-[80px]">Status</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standings.map((standing, idx) => {
                        const team = getTeamById(standing.teamId);
                        const rank = idx + 1;
                        const isQualified = selectedDay && qualifyCount > 0 && rank <= qualifyCount;

                        return (
                          <TableRow
                            key={standing.teamId}
                            className={isQualified ? "bg-primary/5" : ""}
                          >
                            <TableCell className="text-center font-bold">
                              <div className="flex items-center justify-center gap-1">
                                {rank === 1 && <Crown className="h-4 w-4 text-yellow-500" />}
                                {rank === 2 && <Medal className="h-4 w-4 text-gray-400" />}
                                {rank === 3 && <Medal className="h-4 w-4 text-amber-700" />}
                                <span>{rank}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold">
                                {team?.name || "Unknown"}
                                {team?.tag && (
                                  <span className="text-muted-foreground ml-2 text-xs">
                                    ({team.tag})
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono">{standing.matchesPlayed}</TableCell>
                            <TableCell className="text-center font-bold">{standing.totalKills}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant={standing.booyahCount > 0 ? "default" : "secondary"} className="text-sm">
                                {standing.booyahCount > 0 ? `🏆 ${standing.booyahCount}` : "0"}
                              </Badge>
                            </TableCell>
                            {showChampionRush && (
                              <TableCell className="text-center">
                                <Badge variant={standing.championRushCount > 0 ? "destructive" : "secondary"} className="text-sm">
                                  {standing.championRushCount}
                                </Badge>
                              </TableCell>
                            )}
                            <TableCell className="text-center font-bold">{standing.totalPlacement}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="default" className="text-base px-3 py-1">
                                {standing.totalPoints}
                              </Badge>
                            </TableCell>
                            {selectedDay && qualifyCount > 0 && (
                              <TableCell className="text-center">
                                {isQualified && (
                                  <Badge variant="default" className="bg-green-600 text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    ✓
                                  </Badge>
                                )}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Scoring System Info */}
                <div className="p-4 bg-muted/30 border-t space-y-2 text-sm">
                  <h4 className="font-bold">📊 Scoring System:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold">Kill Points:</span> {KILL_POINTS} point per kill
                    </div>
                    <div>
                      <span className="font-semibold">Placement:</span> 1st={PLACEMENT_POINTS[0]}, 2nd={PLACEMENT_POINTS[1]}, 3rd={PLACEMENT_POINTS[2]}... 12th={PLACEMENT_POINTS[11]}
                    </div>
                  </div>
                  {selectedDay && qualifyCount > 0 && (
                    <div className="mt-2 pt-2 border-t border-border">
                      <span className="font-semibold">Qualification:</span> Top {qualifyCount} teams advance
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TAB 2: ALL MATCHES */}
        <TabsContent value="matches" className="space-y-4 mt-6">
          {/* Day Selector for Matches */}
          <div className="flex-1 max-w-sm space-y-2">
            <label className="text-sm font-medium">Filter Matches by Day</label>
            <Select value={matchesDayId} onValueChange={setMatchesDayId}>
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    All Days
                    <Badge variant="secondary">All Matches</Badge>
                  </div>
                </SelectItem>
                {days.map((day) => (
                  <SelectItem key={day.id} value={day.id}>
                    <div className="flex items-center gap-2">
                      Day {day.dayNumber}: {day.name}
                      {day.status === "active" && <Badge variant="default">Active</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* All Match Cards */}
          {loading ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-16 w-16 text-muted-foreground/50 mb-4 animate-spin" />
                <p className="text-xl text-muted-foreground">Loading matches...</p>
              </CardContent>
            </Card>
          ) : allMatchStandings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Target className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-xl text-muted-foreground">No matches found</p>
                <p className="text-sm text-muted-foreground mt-2">Matches will appear once created</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {allMatchStandings.map(({ match, matchDay, standings, showChampionRush }) => {
                const hasScores = standings.some(s => s.placement > 0);

                return (
                  <Card key={match.id} className={`${match.status === 'live' ? 'border-primary border-2' : ''}`}>
                    <CardHeader className="bg-muted/30">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Match {match.matchNumber || 1}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            Day {matchDay?.dayNumber}
                          </Badge>
                          {match.status === "live" && (
                            <Badge variant="destructive" className="text-xs flex items-center gap-1">
                              <Play className="h-3 w-3" />
                              Live
                            </Badge>
                          )}
                          {match.status === "finished" && (
                            <Badge variant="default" className="bg-green-600 text-xs">
                              Completed
                            </Badge>
                          )}
                          {match.status === "upcoming" && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Upcoming
                            </Badge>
                          )}
                          {match.locked && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Locked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[60px] text-center">Rank</TableHead>
                              <TableHead>Team</TableHead>
                              <TableHead className="text-center">Kills</TableHead>
                              <TableHead className="text-center">Placement</TableHead>
                              {showChampionRush && <TableHead className="text-center">🔥 CR</TableHead>}
                              <TableHead className="text-center">Place Pts</TableHead>
                              <TableHead className="text-center">Total Points</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {standings.map((result) => {
                              const team = getTeamById(result.teamId);
                              const rank = result.placement || "-";
                              const hasScore = result.hasScore;

                              return (
                                <TableRow
                                  key={result.teamId}
                                  className={result.placement === 1 ? "bg-primary/10" : hasScore ? "" : "bg-muted/30"}
                                >
                                  <TableCell className="text-center font-bold">
                                    {hasScore ? (
                                      <div className="flex items-center justify-center gap-1">
                                        {result.placement === 1 && <Crown className="h-4 w-4 text-yellow-500" />}
                                        {result.placement === 2 && <Medal className="h-4 w-4 text-gray-400" />}
                                        {result.placement === 3 && <Medal className="h-4 w-4 text-amber-700" />}
                                        <span>{rank}</span>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-semibold">
                                      {team?.name || "Unknown"}
                                      {team?.tag && (
                                        <span className="text-muted-foreground ml-2 text-xs">
                                          ({team.tag})
                                        </span>
                                      )}
                                    </div>
                                    {!hasScore && (
                                      <div className="text-xs text-muted-foreground">No score yet</div>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center font-bold">
                                    {hasScore ? result.kills : <span className="text-muted-foreground">-</span>}
                                  </TableCell>
                                  <TableCell className="text-center font-mono">
                                    {hasScore ? result.placement : <span className="text-muted-foreground">-</span>}
                                  </TableCell>
                                  {showChampionRush && (
                                    <TableCell className="text-center">
                                      {hasScore && result.hasChampionRush ? (
                                        <Badge variant="destructive" className="text-xs">
                                          🔥 Yes
                                        </Badge>
                                      ) : (
                                        <span className="text-muted-foreground text-xs">-</span>
                                      )}
                                    </TableCell>
                                  )}
                                  <TableCell className="text-center font-bold">
                                    {hasScore ? result.placementPts : <span className="text-muted-foreground">-</span>}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {hasScore ? (
                                      <div className="flex items-center justify-center gap-2">
                                        <Badge variant="default" className="text-base px-3 py-1">
                                          {result.totalPoints}
                                        </Badge>
                                        {result.isBooyah && (
                                          <Badge variant="default" className="text-xs">
                                            🏆
                                          </Badge>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
