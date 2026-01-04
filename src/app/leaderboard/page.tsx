"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import { Button as ShadcnButton } from "@/components/ui/button"; // Renamed to avoid conflict if we use custom button
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Share2, Download, Trophy, Target, Loader2, Clock, ChevronRight, Crown, Medal, X, FileText, FileDown, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useTournament } from "@/contexts";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { exportLeaderboardAsPDF, exportMatchAsPDF, exportAllMatchesAsPDF } from "@/lib/export-leaderboard";
import AnimatedTitle from "@/components/zodius/AnimatedTitle";
import Button from "@/components/zodius/Button";

const PLACEMENT_POINTS = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0];
const KILL_POINTS = 1;

// Animated background component - Removed for clean black bg as per other pages
const Background = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none bg-black">
    {/* Clean black background to match landing page */}
  </div>
);

// Rank Badge - Updated styling
const RankBadge = ({ rank, size = "md" }: { rank: number; size?: "sm" | "md" }) => {
  const getRankStyle = () => {
    if (rank === 1) return "bg-yellow-300 text-black";
    if (rank === 2) return "bg-gray-300 text-black";
    if (rank === 3) return "bg-yellow-600 text-white";
    return "bg-zinc-800 text-gray-400";
  };

  const sizeClass = size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-base";

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center font-zentry font-black",
      sizeClass,
      getRankStyle()
    )}>
      {rank}
    </div>
  );
};

// Compact team row - Updated styling
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
    if (rank === 1) return "border-l-4 border-yellow-300 bg-yellow-300/5";
    if (rank === 2) return "border-l-4 border-gray-300 bg-gray-300/5";
    if (rank === 3) return "border-l-4 border-yellow-600 bg-yellow-600/5";
    if (isQualified) return "border-l-4 border-green-500 bg-green-500/5";
    return "border-l-2 border-zinc-800 hover:bg-zinc-800/30";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "grid grid-cols-[32px_12px_1fr_40px_48px_48px_48px_60px] gap-1 items-center px-4 py-3 rounded-r-lg transition-all mb-2",
        getRowStyle()
      )}
    >
      <RankBadge rank={rank} />
      
      {/* Spacer */}
      <div />
      
      <div className="min-w-0 flex items-center">
        <span className={cn(
          "font-zentry text-xl md:text-2xl truncate uppercase tracking-wide",
          rank === 1 ? "text-yellow-300" :
          rank === 2 ? "text-gray-300" :
          rank === 3 ? "text-yellow-600" :
          "text-white"
        )}>
          {team?.name || "Unknown"}
        </span>
      </div>

      {/* Games Played */}
      <div className="text-center font-circular-web text-sm text-gray-500">
        {stat.matchesPlayed}
      </div>

      {/* Total Kills */}
      <div className="text-center font-zentry text-lg text-red-500">
        {stat.totalKills}
      </div>

      {/* Placement Points */}
      <div className="text-center font-zentry text-lg text-blue-400">
        {stat.totalPlacement}
      </div>

      {/* Booyah Count */}
      <div className="text-center text-sm">
        {stat.booyahCount > 0 ? (
          <span className="text-yellow-400 font-black font-zentry flex items-center justify-center gap-1">
            <Crown className="w-3 h-3" />
            {stat.booyahCount}
          </span>
        ) : (
          <span className="text-gray-600">-</span>
        )}
      </div>

      {/* Total Points */}
      <div className="text-center">
        <span className={cn(
          "font-zentry text-2xl font-black",
          rank === 1 ? "text-yellow-300" :
          rank === 2 ? "text-gray-300" :
          rank === 3 ? "text-yellow-600" :
          "text-white"
        )}>
          {stat.totalPoints}
        </span>
      </div>
    </motion.div>
  );
};

// Match card component - Updated styling
const MatchCard = ({ 
  match, 
  matchDay, 
  standings, 
  getTeamById,
  index,
  onExportPDF,
}: { 
  match: any;
  matchDay: any;
  standings: any[];
  getTeamById: (id: string) => any;
  index: number;
  onExportPDF: () => void;
}) => {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "rounded-xl overflow-hidden border bg-zinc-900/50",
        isLive ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : "border-zinc-800"
      )}
    >
      {/* Match Header */}
      <div className={cn(
        "px-4 py-3 flex items-center justify-between",
        isLive ? "bg-red-500/10" : "bg-zinc-800/50"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded flex items-center justify-center",
            isLive ? "bg-red-500 text-black" : "bg-zinc-700 text-gray-400"
          )}>
            <Target className="w-4 h-4" />
          </div>
          <div>
            <div className="font-zentry text-lg uppercase">
              {match.name || `Match ${match.matchNumber || 1}`}
            </div>
            <div className="text-xs font-circular-web text-gray-400 uppercase tracking-wider">
              Day {matchDay?.dayNumber}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(isFinished || match.status === 'locked') && (
            <button 
              onClick={(e) => { e.stopPropagation(); onExportPDF(); }}
              className="p-1 rounded-md hover:bg-zinc-800 text-gray-400 hover:text-white transition-colors"
              title="Download PDF"
            >
              <FileDown className="w-4 h-4" />
            </button>
          )}
          {isLive && (
            <span className="bg-red-500 text-black text-[10px] font-black font-general px-2 py-0.5 rounded uppercase animate-pulse">
              LIVE
            </span>
          )}
          {isFinished && (
            <span className="bg-green-500 text-black text-[10px] font-bold font-general px-2 py-0.5 rounded uppercase flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Finished
            </span>
          )}
          {match.status === 'locked' && (
            <span className="bg-zinc-700 text-gray-300 text-[10px] font-bold font-general px-2 py-0.5 rounded uppercase flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Locked
            </span>
          )}
          {match.status === "upcoming" && (
            <span className="bg-zinc-700 text-gray-300 text-[10px] font-medium font-general px-2 py-0.5 rounded uppercase">
              Soon
            </span>
          )}
        </div>
      </div>

      {/* Match Standings - Single Column */}
      <div className="p-3">
        {/* Column Header */}
        <div className={cn(
          "grid gap-1 px-2 py-2 text-[10px] font-general uppercase text-gray-500 tracking-wider",
          match.type === 'cs-bracket' 
            ? "grid-cols-[32px_8px_1fr_120px]" 
            : "grid-cols-[32px_8px_1fr_40px_40px_50px]"
        )}>
          <div className="text-center">Rank</div>
          <div />
          <div>TEAM</div>
          {match.type !== 'cs-bracket' && (
            <>
              <div className="text-center">Kills</div>
              <div className="text-center">Place</div>
              <div className="text-center">PTS</div>
            </>
          )}
          {match.type === 'cs-bracket' && (
            <div className="text-center">Result</div>
          )}
        </div>

        {/* All Teams in Single Column */}
        <div className="space-y-1 mt-1">
          {standings.map((result, idx) => {
            const team = getTeamById(result.teamId);
            const hasScore = result.hasScore;
            return (
              <div
                key={result.teamId}
                className={cn(
                  "grid gap-1 items-center px-2 py-2 rounded text-sm transition-colors",
                  match.type === 'cs-bracket'
                    ? "grid-cols-[32px_8px_1fr_120px]"
                    : "grid-cols-[32px_8px_1fr_40px_40px_50px]",
                   result.placement === 1 ? "bg-yellow-300/10 border-l-2 border-yellow-300" :
                   hasScore ? "bg-zinc-800/30 hover:bg-zinc-800/50" : "opacity-30"
                )}
              >
                <div className="flex justify-center">
                    <span className={cn(
                        "font-zentry text-lg",
                        result.placement === 1 ? "text-yellow-300" : 
                        result.placement === 2 ? "text-gray-300" :
                        result.placement === 3 ? "text-yellow-600" : "text-gray-500"
                    )}>
                        #{hasScore ? result.placement : "-"}
                    </span>
                </div>
                <div />
                <span className={cn(
                    "truncate font-zentry text-lg uppercase tracking-wide",
                    result.placement === 1 ? "text-yellow-300" : "text-gray-300"
                )}>
                    {team?.name || "Unknown"}
                </span>
                {match.type !== 'cs-bracket' && (
                  <>
                    <span className="text-center font-black font-zentry text-red-500">{hasScore ? result.kills : "-"}</span>
                    <span className="text-center font-circular-web text-blue-400">{hasScore ? result.placementPts : "-"}</span>
                    <span className={cn(
                      "text-center font-black font-zentry text-lg",
                      result.placement === 1 ? "text-yellow-300" : "text-white"
                    )}>
                      {hasScore ? result.totalPoints : "-"}
                    </span>
                  </>
                )}
                {match.type === 'cs-bracket' && (
                  <div className="flex justify-center">
                    {result.placement === 1 ? (
                      <span className="bg-green-500 text-black text-xs font-black px-3 py-1 rounded uppercase">
                        ✓ WINNER
                      </span>
                    ) : result.placement === 2 ? (
                      <span className="bg-red-500/20 text-red-400 text-xs font-medium px-3 py-1 rounded uppercase border border-red-500/30">
                        ELIMINATED
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Download Action at bottom of match card */}
      {(isFinished || match.status === 'locked') && (
        <div className="px-3 pb-3">
          <button 
            onClick={(e) => { e.stopPropagation(); onExportPDF(); }}
            className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-800/80 hover:bg-zinc-800 text-xs font-general uppercase tracking-widest text-gray-400 hover:text-white transition-all rounded-lg border border-zinc-700/50"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Match PDF</span>
          </button>
        </div>
      )}
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
      const activeDay = days.find(d => d.status === "active");
      if (activeDay) {
        setSelectedDayId(activeDay.id);
        setMatchesDayId(activeDay.id);
        return;
      }
      const completedDays = days
        .filter(d => d.status === "completed" || d.status === "paused")
        .sort((a, b) => b.dayNumber - a.dayNumber);
      if (completedDays.length > 0) {
        setSelectedDayId(completedDays[0].id);
        setMatchesDayId(completedDays[0].id);
        return;
      }
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
  
  // Only allow export/share if results are announced (Day is completed or locked)
  const isResultsAnnounced = selectedDayId === "all"
    ? days.length > 0 && days.every(d => d.status === "completed" || d.status === "locked")
    : selectedDay?.status === "completed" || selectedDay?.status === "locked";

  const isMatchesResultsAnnounced = matchesDayId === "all"
    ? days.length > 0 && days.every(d => d.status === "completed" || d.status === "locked")
    : days.find(d => d.id === matchesDayId)?.status === "completed" || days.find(d => d.id === matchesDayId)?.status === "locked";

  // Handle share
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copied successfully!", duration: 2000 });
    } catch (err) {
      toast({ title: "Failed to copy link", variant: "destructive", duration: 2000 });
    }
  };

  // Handle download PDF
  const handleDownloadPDF = async () => {
    try {
      const dayName = selectedDayId === "all" ? "Overall Standings" : `Day ${selectedDay?.dayNumber} - ${selectedDay?.name}`;
      await exportLeaderboardAsPDF(standings, dayName, "Arena Ace Tournament", getTeamById);
      toast({ title: "PDF Report generated!", duration: 2000 });
    } catch (err) {
      console.error("PDF Export failed:", err);
      toast({ title: "Failed to generate PDF", variant: "destructive", duration: 2000 });
    }
  };

  // Handle Match PDF
  const handleDownloadMatchPDF = async (match: any, matchStandings: any[]) => {
    try {
      const dayName = `Day ${selectedDay?.dayNumber || ""}`;
      await exportMatchAsPDF(match, matchStandings, dayName, "Arena Ace Tournament", getTeamById);
      toast({ title: "Match PDF generated!", duration: 2000 });
    } catch (err) {
      console.error("Match PDF Export failed:", err);
      toast({ title: "Failed to generate Match PDF", variant: "destructive", duration: 2000 });
    }
  };

  // Handle All Matches PDF
  const handleDownloadAllMatchesPDF = async () => {
    try {
      const dayName = matchesDayId === "all" ? "All Tournament Matches" : `Day ${days.find(d => d.id === matchesDayId)?.dayNumber || ""} Matches`;
      await exportAllMatchesAsPDF(allMatchStandings, dayName, "Arena Ace Tournament", getTeamById);
      toast({ title: "All Matches Report generated!", duration: 2000 });
    } catch (err) {
      console.error("All Matches PDF Export failed:", err);
      toast({ title: "Failed to generate report", variant: "destructive", duration: 2000 });
    }
  };

  // Calculate standings logic (unchanged)
  const standings = useMemo(() => {
    const teamStats: Record<string, any> = {};
    const relevantMatches = selectedDayId === "all" ? matches : matches.filter(m => m.dayId === selectedDayId);

    // Get only teams that participated in these matches
    const participatingTeamIds = new Set<string>();
    relevantMatches.forEach(match => {
      match.teamIds.forEach(teamId => participatingTeamIds.add(teamId));
    });

    // Initialize ONLY participating teams
    participatingTeamIds.forEach(teamId => {
      teamStats[teamId] = {
        teamId, totalKills: 0, totalPlacement: 0, totalPoints: 0, matchesPlayed: 0, booyahCount: 0, bestPlacement: 12,
      };
    });

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
          if (score.placement < teamStats[teamId].bestPlacement) teamStats[teamId].bestPlacement = score.placement;
        }
      });
    });

    return Object.values(teamStats).sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills;
      if (b.totalPlacement !== a.totalPlacement) return b.totalPlacement - a.totalPlacement;
      return b.matchesPlayed - a.matchesPlayed;
    });
  }, [teams, matches, scores, selectedDayId]);

  const matchesForDisplay = useMemo(() => {
    if (matchesDayId === "all") return matches;
    return matches.filter(m => m.dayId === matchesDayId);
  }, [matches, matchesDayId]);

  const allMatchStandings = useMemo(() => {
    return matchesForDisplay.map(match => {
      const matchTeams = match.teamIds.map(teamId => {
        const score = scores.find(s => s.matchId === match.id && s.teamId === teamId);
        if (!score) return { teamId, kills: 0, placement: 0, placementPts: 0, totalPoints: 0, isBooyah: false, hasScore: false };
        const placementPts = PLACEMENT_POINTS[score.placement - 1] ?? 0;
        const totalPts = (score.kills * KILL_POINTS) + placementPts;
        return { teamId, kills: score.kills, placement: score.placement, placementPts, totalPoints: totalPts, isBooyah: score.isBooyah || false, hasScore: true };
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

  const midpoint = Math.ceil(standings.length / 2);
  const leftColumn = standings.slice(0, midpoint);
  const rightColumn = standings.slice(midpoint);

  return (
    <main className="flex-1 w-full min-h-screen bg-black text-blue-50">
      <div className="container py-10 md:py-20 px-4 md:px-10">
        
        {/* Tabs */}
        <Tabs defaultValue="standings" className="w-full">
          <TabsList className="bg-transparent border-b border-white/10 w-full justify-center rounded-none p-0 h-auto mb-10 gap-8">
            <TabsTrigger 
              value="standings" 
              className="rounded-none border-b-2 border-transparent px-8 py-4 bg-transparent text-gray-400 font-general uppercase tracking-widest hover:text-white data-[state=active]:border-yellow-300 data-[state=active]:text-yellow-300 data-[state=active]:bg-transparent transition-all"
            >
              STANDINGS
            </TabsTrigger>
            <TabsTrigger 
              value="matches" 
              className="rounded-none border-b-2 border-transparent px-8 py-4 bg-transparent text-gray-400 font-general uppercase tracking-widest hover:text-white data-[state=active]:border-yellow-300 data-[state=active]:text-yellow-300 data-[state=active]:bg-transparent transition-all"
            >
              MATCHES
            </TabsTrigger>
          </TabsList>

          {/* STANDINGS TAB */}
          <TabsContent value="standings" className="mt-0 space-y-8">
            {/* Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <Select value={selectedDayId} onValueChange={setSelectedDayId}>
                <SelectTrigger className="w-full md:w-[240px] h-12 bg-zinc-900 border-zinc-800 text-white font-general uppercase tracking-wide">
                  <SelectValue placeholder="FILTER BY DAY" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white font-general">
                  <SelectItem value="all">OVERALL STANDINGS</SelectItem>
                  {days.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      DAY {day.dayNumber} - {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isResultsAnnounced && (
                <div className="flex items-center gap-3">
                  <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded text-gray-400 hover:text-white hover:border-gray-600 transition-all font-general text-xs uppercase"
                  >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                  </button>
                  <button
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded text-gray-400 hover:text-white hover:border-gray-600 transition-all font-general text-xs uppercase"
                  >
                      <FileText className="w-4 h-4" />
                      <span>Download PDF</span>
                  </button>
                </div>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 text-yellow-300 animate-spin" />
              </div>
            )}

            {/* Empty State */}
            {!loading && standings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-xl">
                <Trophy className="h-16 w-16 text-zinc-800 mb-6" />
                <h3 className="text-3xl font-zentry text-zinc-600 uppercase">NO DATA AVAILABLE</h3>
                <p className="font-circular-web text-zinc-500">Wait for the battle to begin.</p>
              </div>
            )}

            {/* Leaderboard Table */}
            {!loading && standings.length > 0 && (
               <AnimatePresence mode="wait">
               <motion.div
                 key={selectedDayId}
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
               >
                 {/* Leaderboard Content - wrapped for screenshot */}
                 <div ref={leaderboardRef} className="bg-black p-4 md:p-8 rounded-xl border border-zinc-800">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                        <div>
                            <h2 className="font-zentry text-3xl md:text-4xl text-white uppercase">
                                {selectedDayId === "all" ? "Tournament Leaderboard" : `Day ${selectedDay?.dayNumber} Leaderboard`}
                            </h2>
                            <p className="font-circular-web text-gray-400 mt-1">
                                {selectedDayId === "all" ? "Overall Points Table" : `Points Table for ${selectedDay?.name || "Matches"}`}
                            </p>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-2">
                           <div className="bg-yellow-300 text-black font-black font-general px-4 py-2 rounded uppercase text-sm">
                               {standings.length} SQUADS
                           </div>
                           {isResultsAnnounced && (
                              <button 
                                onClick={handleDownloadPDF}
                                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-700 rounded text-gray-400 hover:text-white hover:border-gray-300 transition-all font-general text-xs uppercase"
                              >
                                <FileDown className="w-4 h-4" />
                                <span>Export PDF</span>
                              </button>
                           )}
                        </div>
                    </div>

                   {/* Column Headers */}
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">
                     <div className="grid grid-cols-[32px_12px_1fr_40px_48px_48px_48px_60px] gap-1 px-4 py-3 bg-zinc-900/50 rounded text-[10px] md:text-xs font-general uppercase text-gray-500 tracking-widest">
                       <div className="text-center">#</div>
                       <div />
                       <div>TEAM</div>
                       <div className="text-center">GPS</div>
                       <div className="text-center">KILLS</div>
                       <div className="text-center">PLACE</div>
                       <div className="text-center">WIN</div>
                       <div className="text-center">PTS</div>
                     </div>
                     <div className="hidden lg:grid grid-cols-[32px_12px_1fr_40px_48px_48px_48px_60px] gap-1 px-4 py-3 bg-zinc-900/50 rounded text-[10px] md:text-xs font-general uppercase text-gray-500 tracking-widest">
                        <div className="text-center">#</div>
                        <div />
                        <div>TEAM</div>
                        <div className="text-center">GPS</div>
                        <div className="text-center">KILLS</div>
                        <div className="text-center">PLACE</div>
                        <div className="text-center">WIN</div>
                        <div className="text-center">PTS</div>
                     </div>
                   </div>

                   {/* Standings Grid */}
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-1">
                     {/* Left Column */}
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

                     {/* Right Column */}
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
               </motion.div>
             </AnimatePresence>
            )}
          </TabsContent>

          {/* MATCHES TAB */}
          <TabsContent value="matches" className="mt-0 space-y-8">
            <div className="flex items-center justify-between">
              <Select value={matchesDayId} onValueChange={setMatchesDayId}>
                <SelectTrigger className="w-[200px] h-12 bg-zinc-900 border-zinc-800 text-white font-general uppercase">
                  <SelectValue placeholder="FILTER BY DAY" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-white font-general">
                  <SelectItem value="all">ALL MATCHES</SelectItem>
                  {days.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      DAY {day.dayNumber} - {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isMatchesResultsAnnounced && allMatchStandings.length > 0 && (
                <button
                  onClick={handleDownloadAllMatchesPDF}
                  className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded text-gray-400 hover:text-white hover:border-gray-600 transition-all font-general text-xs uppercase"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download All Results</span>
                </button>
              )}
            </div>

            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-12 w-12 text-yellow-300 animate-spin" />
              </div>
            )}

            {!loading && allMatchStandings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-xl">
                <Target className="h-16 w-16 text-zinc-800 mb-6" />
                <h3 className="text-3xl font-zentry text-zinc-600 uppercase">NO MATCHES FOUND</h3>
                <p className="font-circular-web text-zinc-500">Scheduled matches will appear here.</p>
              </div>
            )}

            {!loading && allMatchStandings.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                {allMatchStandings.map(({ match, matchDay, standings }, idx) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    matchDay={matchDay}
                    standings={standings}
                    getTeamById={getTeamById}
                    index={idx}
                    onExportPDF={() => {
                        if (matchDay?.status === 'completed') {
                            handleDownloadMatchPDF(match, standings);
                        } else {
                            toast({ title: "Results not officially announced yet", variant: "default" });
                        }
                    }}
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
