"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Trophy, Flame, Target, Crosshair, Crown, Sparkles, Play, Clock, Lock, CheckCircle, Download, Share2 } from "lucide-react";
import Link from "next/link";
import { useTournament } from "@/contexts";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const PLACEMENT_POINTS = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0];
const KILL_POINTS = 1;

// Animated background component
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/20 to-transparent" />
    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-accent/15 to-transparent" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/15 to-transparent" />
  </div>
);

// Compact rank badge
const RankBadge = ({ rank, size = "md" }: { rank: number; size?: "sm" | "md" }) => {
  const getRankStyle = () => {
    if (rank === 1) return "from-yellow-500 via-yellow-400 to-yellow-600 text-black";
    if (rank === 2) return "from-gray-300 via-gray-200 to-gray-400 text-black";
    if (rank === 3) return "from-amber-600 via-amber-500 to-amber-700 text-black";
    return "from-zinc-700 via-zinc-600 to-zinc-800 text-white";
  };

  const sizeClass = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-base";

  return (
    <div className={cn(
      "rounded flex items-center justify-center font-display font-bold bg-gradient-to-br",
      sizeClass,
      getRankStyle()
    )}>
      {rank}
    </div>
  );
};

// Compact team row for two-column layout
const CompactTeamRow = ({ 
  stat, 
  rank, 
  team, 
  isQualified,
  index 
}: { 
  stat: { teamId: string; totalKills: number; totalPlacement: number; totalPoints: number; matchesPlayed: number; booyahCount: number; bestPlacement: number };
  rank: number;
  team: { name: string; tag?: string } | undefined;
  isQualified: boolean;
  index: number;
}) => {
  const getRowStyle = () => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-900/50 via-yellow-800/30 to-yellow-900/20 border-l-yellow-500";
    if (rank === 2) return "bg-gradient-to-r from-gray-600/40 via-gray-700/30 to-gray-800/20 border-l-gray-400";
    if (rank === 3) return "bg-gradient-to-r from-amber-900/40 via-amber-800/30 to-amber-900/20 border-l-amber-600";
    if (isQualified) return "bg-gradient-to-r from-green-900/30 via-green-800/20 to-green-900/10 border-l-green-500";
    return "bg-gradient-to-r from-zinc-800/60 via-zinc-800/40 to-zinc-800/20 border-l-zinc-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: rank <= 9 ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className={cn(
        "grid grid-cols-[32px_8px_1fr_36px_42px_42px_42px_52px] gap-0.5 items-center px-2 py-2 rounded border-l-3 hover:brightness-110 transition-all",
        getRowStyle()
      )}
    >
      <RankBadge rank={rank} />
      
      {/* Spacer */}
      <div />
      
      <div className="min-w-0 flex items-center">
        <span className="font-display text-lg truncate tracking-widest">
          {team?.name || "Unknown"}
        </span>
      </div>

      {/* Games Played */}
      <div className="text-center text-sm text-muted-foreground font-medium">
        {stat.matchesPlayed}
      </div>

      {/* Total Kills */}
      <div className="text-center text-sm font-bold text-primary">
        {stat.totalKills}
      </div>

      {/* Placement Points */}
      <div className="text-center text-sm font-semibold text-accent">
        {stat.totalPlacement}
      </div>

      {/* Booyah Count */}
      <div className="text-center text-sm">
        {stat.booyahCount > 0 ? (
          <span className="text-yellow-400 font-bold flex items-center justify-center gap-0.5">
            <Crown className="w-3.5 h-3.5" />
            {stat.booyahCount}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </div>

      {/* Total Points */}
      <div className="text-center">
        <span className={cn(
          "font-display text-base font-bold",
          rank === 1 ? "text-yellow-300" :
          rank === 2 ? "text-gray-200" :
          rank === 3 ? "text-amber-300" :
          "text-white"
        )}>
          {stat.totalPoints}
        </span>
      </div>
    </motion.div>
  );
};

// Match card component
const MatchCard = ({ 
  match, 
  matchDay, 
  standings, 
  getTeamById,
  index 
}: { 
  match: any;
  matchDay: any;
  standings: any[];
  getTeamById: (id: string) => any;
  index: number;
}) => {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "rounded-lg overflow-hidden border backdrop-blur-sm",
        isLive ? "border-primary shadow-lg shadow-primary/20" : "border-zinc-700/50",
        "bg-zinc-900/50"
      )}
    >
      {/* Match Header */}
      <div className={cn(
        "px-3 py-2 flex items-center justify-between",
        isLive ? "bg-primary/20" : "bg-zinc-800/50"
      )}>
        <div className="flex items-center gap-2">
          <Target className={cn("w-4 h-4", isLive ? "text-primary" : "text-muted-foreground")} />
          <span className="font-display text-base tracking-wide">
            Match {match.matchNumber || 1}
          </span>
          <span className="text-xs text-muted-foreground">• Day {matchDay?.dayNumber}</span>
        </div>
        <div className="flex items-center gap-1">
          {isLive && (
            <Badge className="bg-primary/90 text-white text-xs px-1.5 py-0 gap-1">
              <Play className="w-2.5 h-2.5" /> LIVE
            </Badge>
          )}
          {isFinished && (
            <Badge className="bg-green-600/90 text-white text-xs px-1.5 py-0">
              <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Done
            </Badge>
          )}
          {match.status === "upcoming" && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              <Clock className="w-2.5 h-2.5 mr-0.5" /> Soon
            </Badge>
          )}
        </div>
      </div>

      {/* Match Standings - Single Column */}
      <div className="p-2">
        {/* Column Header */}
        <div className="grid grid-cols-[28px_8px_1fr_40px_40px_50px] gap-1 px-2 py-1.5 text-[10px] font-display text-muted-foreground tracking-wider border-b border-zinc-700/50">
          <div className="text-center">#</div>
          <div />
          <div>TEAM</div>
          <div className="text-center">K</div>
          <div className="text-center">PL</div>
          <div className="text-center">PTS</div>
        </div>

        {/* All Teams in Single Column */}
        <div className="space-y-0.5 mt-1">
          {standings.map((result, idx) => {
            const team = getTeamById(result.teamId);
            const hasScore = result.hasScore;
            return (
              <div
                key={result.teamId}
                className={cn(
                  "grid grid-cols-[28px_8px_1fr_40px_40px_50px] gap-1 items-center px-2 py-1.5 rounded text-sm",
                  result.placement === 1 ? "bg-yellow-500/20 border-l-2 border-yellow-500" :
                  result.placement === 2 ? "bg-gray-400/10 border-l-2 border-gray-400" :
                  result.placement === 3 ? "bg-amber-500/10 border-l-2 border-amber-600" :
                  hasScore ? "bg-zinc-800/30" : "bg-zinc-800/20 opacity-50"
                )}
              >
                <RankBadge rank={hasScore ? result.placement : 0} size="sm" />
                <div />
                <span className="truncate font-display text-base tracking-widest">{team?.name || "Unknown"}</span>
                <span className="text-center font-bold text-primary">{hasScore ? result.kills : "-"}</span>
                <span className="text-center text-muted-foreground">{hasScore ? result.placementPts : "-"}</span>
                <span className={cn(
                  "text-center font-bold",
                  result.placement === 1 ? "text-yellow-400" : "text-white"
                )}>
                  {hasScore ? result.totalPoints : "-"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default function LeaderboardPage() {
  const { teams, days, matches, scores, loading, getTeamById } = useTournament();
  const { toast } = useToast();
  const [selectedDayId, setSelectedDayId] = useState<string>("all");
  const [matchesDayId, setMatchesDayId] = useState<string>("all");
  const leaderboardRef = useRef<HTMLDivElement>(null);

  // Auto-select active or most recent day on load
  useEffect(() => {
    if (days.length > 0) {
      // 1. Try to find an active day
      const activeDay = days.find(d => d.status === "active");
      if (activeDay) {
        setSelectedDayId(activeDay.id);
        setMatchesDayId(activeDay.id);
        return;
      }

      // 2. Try to find the most recent completed day
      const completedDays = days
        .filter(d => d.status === "completed" || d.status === "paused")
        .sort((a, b) => b.dayNumber - a.dayNumber);
      
      if (completedDays.length > 0) {
        setSelectedDayId(completedDays[0].id);
        setMatchesDayId(completedDays[0].id);
        return;
      }

      // 3. Fallback to the first upcoming day if any
      const upcomingDays = days
        .filter(d => d.status === "upcoming")
        .sort((a, b) => a.dayNumber - b.dayNumber);
      
      if (upcomingDays.length > 0) {
        setSelectedDayId(upcomingDays[0].id);
        setMatchesDayId(upcomingDays[0].id);
      }
    }
  }, [days]);

  const selectedDay = days.find(d => d.id === selectedDayId);
  const qualifyCount = selectedDay?.qualifyCount || 0;

  // Handle share - copy link to clipboard
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ 
        title: "Link copied successfully!", 
        duration: 2000 
      });
    } catch (err) {
      toast({ 
        title: "Failed to copy link", 
        variant: "destructive",
        duration: 2000 
      });
    }
  };

  // Handle download - screenshot of leaderboard table as image
  const handleDownload = async () => {
    if (!leaderboardRef.current) return;
    
    try {
      const canvas = await html2canvas(leaderboardRef.current, {
        backgroundColor: '#1a1a1a',
        scale: 2,
      });
      
      const link = document.createElement('a');
      const dayLabel = selectedDayId === "all" ? "Overall" : `Day${selectedDay?.dayNumber}`;
      link.download = `FFSAL_Leaderboard_${dayLabel}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      toast({ 
        title: "Screenshot saved!", 
        duration: 2000 
      });
    } catch (err) {
      toast({ 
        title: "Failed to capture screenshot", 
        variant: "destructive",
        duration: 2000 
      });
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
      bestPlacement: number;
    }> = {};

    const relevantMatches = selectedDayId === "all"
      ? matches
      : matches.filter(m => m.dayId === selectedDayId);

    // Initialize ALL teams with zero stats (not just those in matches)
    teams.forEach(team => {
      teamStats[team.id] = {
        teamId: team.id,
        totalKills: 0,
        totalPlacement: 0,
        totalPoints: 0,
        matchesPlayed: 0,
        booyahCount: 0,
        bestPlacement: 12,
      };
    });

    // Update stats for teams that have played matches
    relevantMatches.forEach(match => {
      match.teamIds.forEach(teamId => {
        const score = scores.find(s => s.matchId === match.id && s.teamId === teamId);
        if (score && teamStats[teamId]) {
          const placementPts = PLACEMENT_POINTS[score.placement - 1] ?? 0;
          const totalPts = score.kills + placementPts;

          teamStats[teamId].totalKills += score.kills;
          teamStats[teamId].totalPlacement += placementPts;
          teamStats[teamId].totalPoints += totalPts;
          teamStats[teamId].matchesPlayed += 1;
          if (score.isBooyah || score.placement === 1) teamStats[teamId].booyahCount += 1;
          if (score.placement < teamStats[teamId].bestPlacement) {
            teamStats[teamId].bestPlacement = score.placement;
          }
        }
      });
    });

    // Return ALL teams, sorted by points (teams with 0 points go to bottom)
    return Object.values(teamStats)
      .sort((a, b) => {
        // First sort by total points
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        // Then by kills
        if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
        // Then by placement points
        if (b.totalPlacement !== a.totalPlacement) return b.totalPlacement - a.totalPlacement;
        // Finally by matches played (more matches = higher rank for tiebreaker)
        return b.matchesPlayed - a.matchesPlayed;
      });
  }, [teams, matches, scores, selectedDayId]);

  // Get matches for the matches tab
  const matchesForDisplay = useMemo(() => {
    if (matchesDayId === "all") return matches;
    return matches.filter(m => m.dayId === matchesDayId);
  }, [matches, matchesDayId]);

  // Calculate match-specific standings
  const allMatchStandings = useMemo(() => {
    return matchesForDisplay.map(match => {
      const matchTeams = match.teamIds.map(teamId => {
        const score = scores.find(s => s.matchId === match.id && s.teamId === teamId);

        if (!score) {
          return {
            teamId,
            kills: 0,
            placement: 0,
            placementPts: 0,
            totalPoints: 0,
            isBooyah: false,
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

      const sortedTeams = matchTeams.sort((a, b) => {
        if (!a.hasScore && !b.hasScore) return 0;
        if (!a.hasScore) return 1;
        if (!b.hasScore) return -1;
        if (a.placement === 0 && b.placement === 0) return 0;
        if (a.placement === 0) return 1;
        if (b.placement === 0) return -1;
        return a.placement - b.placement;
      });

      const matchDay = days.find(d => d.id === match.dayId);

      return { match, matchDay, standings: sortedTeams };
    });
  }, [matchesForDisplay, scores, days]);

  // Split standings into two equal columns (first half left, second half right)
  const midpoint = Math.ceil(standings.length / 2);
  const leftColumn = standings.slice(0, midpoint);
  const rightColumn = standings.slice(midpoint);

  return (
    <main className="flex-1 w-full min-h-screen relative bg-gradient-to-b from-zinc-900 via-background to-zinc-900">
      <AnimatedBackground />
      
      <div className="container relative z-10 py-4 md:py-6">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-1 hover:bg-primary/10 hover:text-primary">
              <ArrowLeft className="h-3 w-3" />
              Back
            </Button>
          </Link>
        </motion.div>

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 mb-2">
            <Flame className="w-3 h-3 text-primary" />
            <span className="font-display text-xs tracking-widest text-primary">
              BATTLE ROYALE MAIN EVENT
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-wider">
            <span className="bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">
              {selectedDayId === "all" ? "OVERALL STANDINGS" : `DAY ${selectedDay?.dayNumber} STANDINGS`}
            </span>
          </h1>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="standings" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto bg-zinc-800/80 border border-zinc-700/50 p-1 h-auto mb-4">
            <TabsTrigger 
              value="standings" 
              className="text-sm py-2 data-[state=active]:bg-primary data-[state=active]:text-white font-display tracking-wider"
            >
              <Trophy className="h-3.5 w-3.5 mr-1.5" />
              STANDINGS
            </TabsTrigger>
            <TabsTrigger 
              value="matches" 
              className="text-sm py-2 data-[state=active]:bg-primary data-[state=active]:text-white font-display tracking-wider"
            >
              <Target className="h-3.5 w-3.5 mr-1.5" />
              MATCHES
            </TabsTrigger>
          </TabsList>

          {/* STANDINGS TAB */}
          <TabsContent value="standings" className="mt-0">
            {/* Day Selector + Actions */}
            <div className="flex items-center justify-between mb-4">
              {/* Day Selector - Left */}
              <Select value={selectedDayId} onValueChange={setSelectedDayId}>
                <SelectTrigger className="w-[200px] h-9 text-sm bg-zinc-800/80 border-zinc-700">
                  <SelectValue placeholder="Filter by day" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">All Days - Overall</SelectItem>
                  {days.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      Day {day.dayNumber}: {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Share & Download - Right */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700 hover:border-primary/50"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 bg-zinc-800/80 border-zinc-700 hover:bg-zinc-700 hover:border-primary/50"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            )}

            {/* Empty State */}
            {!loading && standings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Trophy className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-2xl font-display text-muted-foreground">NO STANDINGS YET</h3>
                <p className="text-muted-foreground/70">Leaderboard will appear once matches begin.</p>
              </div>
            )}

            {/* Two-Column Leaderboard */}
            {!loading && standings.length > 0 && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDayId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Leaderboard Content - wrapped for screenshot */}
                  <div ref={leaderboardRef} className="bg-zinc-900 p-4 rounded-lg">
                    {/* Column Headers */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-2">
                      <div className="grid grid-cols-[32px_8px_1fr_36px_42px_42px_42px_52px] gap-0.5 px-2 py-2 bg-zinc-800/50 rounded text-xs font-display text-muted-foreground tracking-wider">
                        <div className="text-center">#</div>
                        <div />
                        <div>TEAM</div>
                        <div className="text-center">GP</div>
                        <div className="text-center">ELIM</div>
                        <div className="text-center">PLC</div>
                        <div className="text-center">BOO</div>
                        <div className="text-center">TOTAL</div>
                      </div>
                      <div className="hidden lg:grid grid-cols-[32px_8px_1fr_36px_42px_42px_42px_52px] gap-0.5 px-2 py-2 bg-zinc-800/50 rounded text-xs font-display text-muted-foreground tracking-wider">
                        <div className="text-center">#</div>
                        <div />
                        <div>TEAM</div>
                        <div className="text-center">GP</div>
                        <div className="text-center">ELIM</div>
                        <div className="text-center">PLC</div>
                        <div className="text-center">BOO</div>
                        <div className="text-center">TOTAL</div>
                      </div>
                    </div>

                    {/* Standings Grid - First half left, second half right */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left Column: First half of teams */}
                      <div className="space-y-1">
                        {leftColumn.map((stat, idx) => {
                          const rank = idx + 1;
                          const team = getTeamById(stat.teamId);
                          const isQualified = selectedDayId !== "all" && qualifyCount > 0 && rank <= qualifyCount;
                          return (
                            <CompactTeamRow
                              key={stat.teamId}
                              stat={stat}
                            rank={rank}
                            team={team}
                            isQualified={isQualified}
                            index={idx}
                          />
                        );
                      })}
                    </div>

                    {/* Right Column: Second half of teams */}
                    <div className="space-y-1">
                      {rightColumn.map((stat, idx) => {
                        const rank = midpoint + idx + 1;
                        const team = getTeamById(stat.teamId);
                        const isQualified = selectedDayId !== "all" && qualifyCount > 0 && rank <= qualifyCount;
                        return (
                          <CompactTeamRow
                            key={stat.teamId}
                            stat={stat}
                            rank={rank}
                            team={team}
                            isQualified={isQualified}
                            index={idx}
                          />
                        );
                      })}
                    </div>
                  </div>
                  </div>
                  {/* End of leaderboard ref wrapper */}

                  {/* Footer */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 py-2 px-3 bg-zinc-800/50 rounded border border-zinc-700/50 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground"
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">GP</span>
                      <span>=Games</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Crosshair className="w-3 h-3 text-primary" />
                      <span>ELIM=Kills (1pt/elim)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3 text-accent" />
                      <span>PLC=Placement Pts</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Crown className="w-3 h-3 text-yellow-500" />
                      <span>BOO=Booyah Wins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-accent" />
                      <span>{standings.length} teams</span>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            )}
          </TabsContent>

          {/* MATCHES TAB */}
          <TabsContent value="matches" className="mt-0">
            {/* Day Selector for Matches */}
            <div className="flex justify-center mb-4">
              <Select value={matchesDayId} onValueChange={setMatchesDayId}>
                <SelectTrigger className="w-[200px] h-9 text-sm bg-zinc-800/80 border-zinc-700">
                  <SelectValue placeholder="Filter by day" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">All Days - All Matches</SelectItem>
                  {days.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      Day {day.dayNumber}: {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
            )}

            {/* Empty State */}
            {!loading && allMatchStandings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Target className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-2xl font-display text-muted-foreground">NO MATCHES FOUND</h3>
                <p className="text-muted-foreground/70">Matches will appear once created.</p>
              </div>
            )}

            {/* Match Cards Grid */}
            {!loading && allMatchStandings.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {allMatchStandings.map(({ match, matchDay, standings }, idx) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    matchDay={matchDay}
                    standings={standings}
                    getTeamById={getTeamById}
                    index={idx}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
