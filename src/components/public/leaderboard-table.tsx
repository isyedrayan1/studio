"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LeaderboardEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Trophy, Flame, Target, Crosshair, Crown, Sparkles } from "lucide-react";

interface LeaderboardTableProps {
  leaderboard?: LeaderboardEntry[];
  qualificationCutoff?: number;
}

// Animated rank badge component
const RankBadge = ({ rank }: { rank: number }) => {
  const getRankStyle = () => {
    if (rank === 1) return "from-yellow-500 via-yellow-400 to-yellow-600 text-black shadow-yellow-500/50";
    if (rank === 2) return "from-gray-300 via-gray-200 to-gray-400 text-black shadow-gray-400/50";
    if (rank === 3) return "from-amber-600 via-amber-500 to-amber-700 text-black shadow-amber-500/50";
    return "from-zinc-700 via-zinc-600 to-zinc-800 text-white shadow-zinc-500/30";
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30, delay: rank * 0.02 }}
      className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center font-display text-xl font-bold bg-gradient-to-br shadow-lg",
        getRankStyle()
      )}
    >
      {rank}
    </motion.div>
  );
};

// Team row component
const TeamRow = ({ 
  entry, 
  index,
  qualificationCutoff 
}: { 
  entry: LeaderboardEntry;
  index: number;
  qualificationCutoff: number;
}) => {
  const getRowGradient = () => {
    if (entry.rank === 1) return "from-yellow-900/40 via-yellow-800/20 to-transparent border-l-yellow-500";
    if (entry.rank === 2) return "from-gray-600/30 via-gray-700/20 to-transparent border-l-gray-400";
    if (entry.rank === 3) return "from-amber-900/30 via-amber-800/20 to-transparent border-l-amber-600";
    if (entry.isQualified) return "from-green-900/20 via-green-800/10 to-transparent border-l-green-500";
    return "from-zinc-800/50 via-zinc-800/30 to-transparent border-l-zinc-600";
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      className={cn(
        "grid grid-cols-[auto_1fr_80px_80px_100px] md:grid-cols-[auto_1fr_100px_100px_120px] gap-2 md:gap-4 items-center p-3 md:p-4 rounded-lg border-l-4 bg-gradient-to-r backdrop-blur-sm mb-2 hover:scale-[1.01] transition-transform group",
        getRowGradient(),
        entry.rank <= 3 && "shadow-lg",
        entry.isQualified && entry.rank > 3 && "opacity-90",
        index === qualificationCutoff - 1 && qualificationCutoff > 0 && "border-b-2 border-b-accent/30 pb-4 mb-4"
      )}
    >
      {/* Rank */}
      <RankBadge rank={entry.rank} />

      {/* Team Name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg md:text-xl truncate tracking-wide group-hover:text-primary transition-colors">
            {entry.teamName}
          </h3>
          {entry.groupName && (
            <span className="text-xs text-muted-foreground font-mono bg-zinc-800 px-2 py-0.5 rounded">
              {entry.groupName}
            </span>
          )}
        </div>
      </div>

      {/* Matches Played */}
      <div className="text-center">
        <span className="text-sm text-muted-foreground block md:hidden">MP</span>
        <span className="font-semibold text-lg">{entry.matchesPlayed}</span>
      </div>

      {/* Kills */}
      <div className="text-center">
        <span className="text-sm text-muted-foreground block md:hidden">Elims</span>
        <div className="flex items-center justify-center gap-1">
          <Crosshair className="w-4 h-4 text-primary hidden md:block" />
          <span className="font-bold text-lg text-primary">{entry.totalKills}</span>
        </div>
      </div>

      {/* Total Points */}
      <div className="text-center">
        <span className="text-sm text-muted-foreground block md:hidden">Total</span>
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30, delay: index * 0.03 + 0.2 }}
          className={cn(
            "inline-flex items-center justify-center px-3 py-1 rounded-lg font-display text-xl md:text-2xl font-bold",
            entry.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
            entry.rank === 2 ? "bg-gray-400/20 text-gray-300" :
            entry.rank === 3 ? "bg-amber-500/20 text-amber-400" :
            "bg-zinc-700/50 text-white"
          )}
        >
          {entry.totalPoints}
        </motion.div>
      </div>
    </motion.div>
  );
};

export function LeaderboardTable({ 
  leaderboard = [], 
  qualificationCutoff = 12 
}: LeaderboardTableProps) {
  
  // Empty state
  if (leaderboard.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="relative mb-6">
          <Trophy className="h-24 w-24 text-muted-foreground/30" />
          <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-primary animate-pulse" />
        </div>
        <h3 className="text-3xl font-display tracking-wider text-muted-foreground mb-2">
          NO RANKINGS YET
        </h3>
        <p className="text-lg text-muted-foreground/70 max-w-md">
          The leaderboard will be populated once matches are completed.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Column Headers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden md:grid grid-cols-[auto_1fr_100px_100px_120px] gap-4 items-center px-4 py-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
      >
        <div className="w-10 text-center text-sm font-display text-muted-foreground tracking-wider">#</div>
        <div className="text-sm font-display text-muted-foreground tracking-wider">TEAM</div>
        <div className="text-center text-sm font-display text-muted-foreground tracking-wider">MATCHES</div>
        <div className="text-center text-sm font-display text-muted-foreground tracking-wider">ELIMS</div>
        <div className="text-center text-sm font-display text-muted-foreground tracking-wider">TOTAL</div>
      </motion.div>

      {/* Team Rows */}
      <AnimatePresence mode="popLayout">
        {leaderboard.map((entry, index) => (
          <TeamRow
            key={entry.teamId}
            entry={entry}
            index={index}
            qualificationCutoff={qualificationCutoff}
          />
        ))}
      </AnimatePresence>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 backdrop-blur-sm"
      >
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-primary" />
            <span>1 point per elimination</span>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span>Placement: 1st=12, 2nd=9, 3rd=8...</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" />
            <span>{leaderboard.length} teams competing</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
