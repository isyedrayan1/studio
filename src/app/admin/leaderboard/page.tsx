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
import { Crown, Loader2, Trophy, Medal, CheckCircle, Target, Lock, Play, Clock, Share2, Download, FileText, FileDown } from "lucide-react";
import { useTournament } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import { exportLeaderboardAsImage, shareLeaderboardImage, exportLeaderboardAsPDF, exportMatchAsPDF, exportAllMatchesAsPDF } from "@/lib/export-leaderboard";

const PLACEMENT_POINTS = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0];
const KILL_POINTS = 1;

export default function AdminLeaderboardPage() {
  const { teams, days, matches, scores, loading, getTeamById } = useTournament();
  const { toast } = useToast();
  const [selectedDayId, setSelectedDayId] = useState<string>("all");
  const [matchesDayId, setMatchesDayId] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  // Get the selected day's qualify count
  const selectedDay = days.find(d => d.id === selectedDayId);
  const qualifyCount = selectedDay?.qualifyCount || 0;

  // Only allow export if results are announced (Day is completed or locked)
  const isResultsAnnounced = selectedDayId === "all"
    ? days.length > 0 && days.every(d => d.status === "completed" || d.status === "locked")
    : selectedDay?.status === "completed" || selectedDay?.status === "locked";

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

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      const dayName = selectedDayId === "all" ? "Overall Standings" : `Day ${selectedDay?.dayNumber} - ${selectedDay?.name}`;
      await exportLeaderboardAsPDF(
        standings,
        dayName,
        "Arena Ace Tournament",
        getTeamById
      );
      toast({
        title: "Success",
        description: "Leaderboard PDF generated!",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Error",
        description: "Failed to export leaderboard as PDF",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadMatchPDF = async (match: any, matchStandings: any[]) => {
    try {
      setIsExporting(true);
      const dayName = `Day ${selectedDay?.dayNumber || ""}`;
      await exportMatchAsPDF(match, matchStandings, dayName, "Arena Ace Tournament", getTeamById);
      toast({ title: "Match PDF generated!" });
    } catch (err) {
      toast({ title: "Failed to generate Match PDF", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadAllMatchesPDF = async () => {
    try {
      setIsExporting(true);
      const dayName = matchesDayId === "all" ? "All Tournament Matches" : `Day ${days.find(d => d.id === matchesDayId)?.dayNumber || ""} Matches`;
      await exportAllMatchesAsPDF(allMatchStandings, dayName, "Arena Ace Tournament", getTeamById);
      toast({ title: "All Matches Report generated!" });
    } catch (err) {
      toast({ title: "Failed to generate report", variant: "destructive" });
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
    }> = {};

    // Filter matches by selected day
    const relevantMatches = selectedDayId === "all" 
      ? matches 
      : matches.filter(m => m.dayId === selectedDayId);

    // Get only teams that participated in these matches
    const participatingTeamIds = new Set<string>();
    relevantMatches.forEach(match => {
      match.teamIds.forEach(teamId => participatingTeamIds.add(teamId));
    });

    // Initialize ONLY participating teams
    participatingTeamIds.forEach(teamId => {
      teamStats[teamId] = {
        teamId,
        totalKills: 0,
        totalPlacement: 0,
        totalPoints: 0,
        matchesPlayed: 0,
        booyahCount: 0,
      };
    });

    // Aggregate scores for teams that have played matches
    relevantMatches.forEach(match => {
      match.teamIds.forEach(teamId => {
        const score = scores.find(s => s.matchId === match.id && s.teamId === teamId);
        if (score && teamStats[teamId]) {
          const placementPts = PLACEMENT_POINTS[score.placement - 1] ?? 0;
          const totalPts = (score.kills * KILL_POINTS) + placementPts;

          teamStats[teamId].totalKills += score.kills;
          teamStats[teamId].totalPlacement += placementPts;
          teamStats[teamId].totalPoints += totalPts;
          teamStats[teamId].matchesPlayed += 1;
          
          // Track Booyahs
          if (score.isBooyah || score.placement === 1) teamStats[teamId].booyahCount += 1;
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
      };
    });
  }, [matchesForDisplay, scores, days]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-wider">Leaderboard</h1>
          <p className="text-muted-foreground text-xl tracking-widest mt-1">
            Live tournament standings • Admin view
          </p>
        </div>

        {/* Export/Share Buttons */}
        <div className="flex gap-2">
          {!isResultsAnnounced ? (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted/30 border border-dashed border-border rounded-md text-muted-foreground text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>Exports available after results announced</span>
            </div>
          ) : (
            <>
              <Button 
                onClick={handleExportPDF} 
                disabled={isExporting}
                variant="outline"
                size="lg"
                className="border-primary/50 hover:bg-primary/5"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                )}
                Download PDF
              </Button>
              <Button 
                onClick={handleExportImage} 
                disabled={isExporting}
                variant="outline"
                size="lg"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download Image
              </Button>
              <Button 
                onClick={handleShareImage} 
                disabled={isExporting}
                size="lg"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Share2 className="h-4 w-4 mr-2" />
                )}
                Share
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs: Master Leaderboard vs All Matches */}
      <Tabs defaultValue="master" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
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
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm space-y-2">
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
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="pt-6">
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
            <Card id="leaderboard-master-table">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-primary" />
                    {selectedDayId === "all" ? "Overall Standings" : `Day ${selectedDay?.dayNumber} Standings`}
                    <Badge variant="secondary" className="ml-auto">{standings.length} teams</Badge>
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="hidden sm:flex"
                  >
                    <FileDown className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px] text-center">Rank</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-center">Matches</TableHead>
                      <TableHead className="text-center">Kills</TableHead>
                      <TableHead className="text-center">Booyahs</TableHead>

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

                {/* Scoring System Info */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                  <h4 className="font-bold">📊 Scoring System:</h4>
                  <div className="grid grid-cols-1 gap-2">
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
          <div className="flex items-center justify-between gap-4">
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

            {allMatchStandings.length > 0 && (
              <Button 
                onClick={handleDownloadAllMatchesPDF} 
                disabled={isExporting}
                variant="outline"
                size="sm"
                className="mt-6"
              >
                <FileText className="h-4 w-4 mr-2" />
                Export All Matches PDF
              </Button>
            )}
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
              {allMatchStandings.map(({ match, matchDay, standings }) => {
                const hasScores = standings.some(s => s.placement > 0);

                return (
                  <Card key={match.id} className={`${match.status === 'live' ? 'border-primary border-2' : ''}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          {match.name || `Match ${match.matchNumber || 1}`}
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
                          {(match.status === 'finished' || match.status === 'locked') && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors" 
                              onClick={() => handleDownloadMatchPDF(match, standings)}
                              title="Download Match PDF"
                            >
                              <FileDown className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[60px] text-center">Rank</TableHead>
                            <TableHead>Team</TableHead>
                            {match.type !== 'cs-bracket' && (
                              <>
                                <TableHead className="text-center">Kills</TableHead>
                                <TableHead className="text-center">Placement</TableHead>
                                <TableHead className="text-center">Place Pts</TableHead>
                                <TableHead className="text-center">Total Points</TableHead>
                              </>
                            )}
                            {match.type === 'cs-bracket' && (
                              <TableHead className="text-center">Result</TableHead>
                            )}
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
                                {match.type !== 'cs-bracket' && (
                                  <>
                                    <TableCell className="text-center font-bold">
                                      {hasScore ? result.kills : <span className="text-muted-foreground">-</span>}
                                    </TableCell>
                                    <TableCell className="text-center font-mono">
                                      {hasScore ? result.placement : <span className="text-muted-foreground">-</span>}
                                    </TableCell>
                                    <TableCell className="text-center font-bold">
                                      {hasScore ? result.placementPts : <span className="text-muted-foreground">-</span>}
                                    </TableCell>
                                    <TableCell className="text-center">
                                      {hasScore ? (
                                        <div className="flex items-center justify-center gap-2">
                                          <Badge variant="default" className="text-base px-3 py-1">
                                            {result.totalPoints}
                                          </Badge>
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground">-</span>
                                      )}
                                    </TableCell>
                                  </>
                                )}
                                {match.type === 'cs-bracket' && (
                                  <TableCell className="text-center">
                                    {result.placement === 1 ? (
                                      <Badge className="bg-green-500 text-white">✓ WINNER</Badge>
                                    ) : result.placement === 2 ? (
                                      <Badge variant="destructive">ELIMINATED</Badge>
                                    ) : (
                                      <span className="text-muted-foreground">-</span>
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
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
