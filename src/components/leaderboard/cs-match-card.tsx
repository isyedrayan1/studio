"use client";

import { motion } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BracketMatch, Team } from "@/lib/types";

interface CSMatchCardProps {
  match: BracketMatch;
  team1?: Team;
  team2?: Team;
  roundName?: string;
}

export function CSMatchCard({ match, team1, team2, roundName }: CSMatchCardProps) {
  const isComplete = match.status === 'finished';
  const isLive = match.status === 'live';
  const team1IsWinner = match.winnerId === match.team1Id;
  const team2IsWinner = match.winnerId === match.team2Id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50"
    >
      {/* Header */}
      <div className={cn(
        "px-6 py-4 flex items-center justify-between border-b border-zinc-800",
        isLive && "bg-red-500/10 border-red-500/30"
      )}>
        <h3 className="font-zentry text-xl uppercase text-white tracking-wider">
          {roundName || `Round ${match.round}`}
        </h3>
        <div className="flex items-center gap-2">
          {isLive && (
            <Badge className="bg-red-500 text-white animate-pulse">
              ● LIVE
            </Badge>
          )}
          {isComplete && (
            <Badge className="bg-green-500 text-black">
              COMPLETE
            </Badge>
          )}
          {match.status === 'upcoming' && (
            <Badge variant="outline" className="text-gray-400">
              UPCOMING
            </Badge>
          )}
        </div>
      </div>

      {/* Teams VS Layout */}
      <div className="p-8">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center">
          
          {/* Team 1 Card */}
          <motion.div
            whileHover={{ scale: team1IsWinner ? 1.02 : 1 }}
            className={cn(
              "relative rounded-xl p-6 border-2 transition-all duration-300",
              team1IsWinner && "border-green-500 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.3)]",
              team2IsWinner && "border-zinc-800 bg-zinc-900/30 opacity-40 grayscale",
              !isComplete && "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
            )}
          >
            {/* Winner Trophy */}
            {team1IsWinner && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <Trophy className="w-6 h-6 text-black" />
              </motion.div>
            )}

            {/* Team Info */}
            <div className="text-center space-y-4">
              <div className={cn(
                "w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl font-black",
                team1IsWinner ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-gray-400"
              )}>
                {team1?.tag?.[0] || team1?.name?.[0] || "?"}
              </div>
              
              <h4 className={cn(
                "font-zentry text-2xl uppercase tracking-wide",
                team1IsWinner ? "text-green-400" : "text-white"
              )}>
                {team1?.name || "TBD"}
              </h4>

              {team1?.tag && (
                <p className="text-sm text-gray-500 font-circular-web">
                  {team1.tag}
                </p>
              )}

              {/* Status Badge */}
              {team1IsWinner && (
                <Badge className="bg-green-500 text-black font-black">
                  ✓ WINNER
                </Badge>
              )}
              {team2IsWinner && (
                <div className="flex items-center justify-center gap-2 text-red-500">
                  <X className="w-4 h-4" />
                  <span className="text-sm font-medium">ELIMINATED</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* VS Divider */}
          <div className="flex flex-col items-center gap-2">
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center font-zentry text-2xl font-black",
              isLive ? "bg-red-500 text-black animate-pulse" : "bg-zinc-800 text-gray-400"
            )}>
              VS
            </div>
            {isLive && (
              <span className="text-xs text-red-500 font-medium animate-pulse">
                IN PROGRESS
              </span>
            )}
          </div>

          {/* Team 2 Card */}
          <motion.div
            whileHover={{ scale: team2IsWinner ? 1.02 : 1 }}
            className={cn(
              "relative rounded-xl p-6 border-2 transition-all duration-300",
              team2IsWinner && "border-green-500 bg-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.3)]",
              team1IsWinner && "border-zinc-800 bg-zinc-900/30 opacity-40 grayscale",
              !isComplete && "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
            )}
          >
            {/* Winner Trophy */}
            {team2IsWinner && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
              >
                <Trophy className="w-6 h-6 text-black" />
              </motion.div>
            )}

            {/* Team Info */}
            <div className="text-center space-y-4">
              <div className={cn(
                "w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl font-black",
                team2IsWinner ? "bg-green-500/20 text-green-400" : "bg-zinc-800 text-gray-400"
              )}>
                {team2?.tag?.[0] || team2?.name?.[0] || "?"}
              </div>
              
              <h4 className={cn(
                "font-zentry text-2xl uppercase tracking-wide",
                team2IsWinner ? "text-green-400" : "text-white"
              )}>
                {team2?.name || "TBD"}
              </h4>

              {team2?.tag && (
                <p className="text-sm text-gray-500 font-circular-web">
                  {team2.tag}
                </p>
              )}

              {/* Status Badge */}
              {team2IsWinner && (
                <Badge className="bg-green-500 text-black font-black">
                  ✓ WINNER
                </Badge>
              )}
              {team1IsWinner && (
                <div className="flex items-center justify-center gap-2 text-red-500">
                  <X className="w-4 h-4" />
                  <span className="text-sm font-medium">ELIMINATED</span>
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
