"use client";

import { motion } from "framer-motion";
import { Crown, Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Team } from "@/lib/types";

interface PodiumDisplayProps {
  champion?: Team;
  runnerUp?: Team;
  thirdPlace?: Team;
  remainingTeams?: Array<{ team: Team; rank: number; points: number }>;
}

// Medal SVG Components
const GoldMedal = () => (
  <svg viewBox="0 0 100 100" className="w-24 h-24">
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FFA500" />
        <stop offset="100%" stopColor="#FFD700" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#goldGradient)" stroke="#B8860B" strokeWidth="2" />
    <circle cx="50" cy="50" r="38" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.5" />
    <text x="50" y="65" textAnchor="middle" fontSize="40" fontWeight="black" fill="#000">1</text>
  </svg>
);

const SilverMedal = () => (
  <svg viewBox="0 0 100 100" className="w-20 h-20">
    <defs>
      <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E8E8E8" />
        <stop offset="50%" stopColor="#C0C0C0" />
        <stop offset="100%" stopColor="#E8E8E8" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#silverGradient)" stroke="#A8A8A8" strokeWidth="2" />
    <circle cx="50" cy="50" r="38" fill="none" stroke="#E8E8E8" strokeWidth="1" opacity="0.5" />
    <text x="50" y="65" textAnchor="middle" fontSize="40" fontWeight="black" fill="#000">2</text>
  </svg>
);

const BronzeMedal = () => (
  <svg viewBox="0 0 100 100" className="w-20 h-20">
    <defs>
      <linearGradient id="bronzeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CD7F32" />
        <stop offset="50%" stopColor="#B87333" />
        <stop offset="100%" stopColor="#CD7F32" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#bronzeGradient)" stroke="#8B4513" strokeWidth="2" />
    <circle cx="50" cy="50" r="38" fill="none" stroke="#CD7F32" strokeWidth="1" opacity="0.5" />
    <text x="50" y="65" textAnchor="middle" fontSize="40" fontWeight="black" fill="#000">3</text>
  </svg>
);

export function PodiumDisplay({ champion, runnerUp, thirdPlace, remainingTeams }: PodiumDisplayProps) {
  return (
    <div className="space-y-12">
      {/* Podium Section */}
      <div className="relative">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h2 className="font-zentry text-4xl md:text-5xl uppercase text-white mb-2 tracking-wider">
            Final Standings
          </h2>
          <p className="text-gray-400 font-circular-web">
            Tournament Champions
          </p>
        </motion.div>

        {/* Podium Layout */}
        <div className="max-w-5xl mx-auto">
          {/* Top Row - 2nd Place (Center, Elevated) */}
          <div className="flex justify-center mb-8">
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-64"
            >
              <div className="relative rounded-2xl p-6 bg-gradient-to-br from-gray-300/20 to-gray-400/10 border-2 border-gray-300 shadow-[0_0_30px_rgba(192,192,192,0.3)]">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <SilverMedal />
                </div>
                <div className="text-center pt-8 space-y-3">
                  <Badge className="bg-gray-300 text-black font-black">
                    🥈 RUNNER-UP
                  </Badge>
                  <h3 className="font-zentry text-2xl uppercase text-gray-300">
                    {runnerUp?.name || "TBD"}
                  </h3>
                  {runnerUp?.tag && (
                    <p className="text-sm text-gray-500">{runnerUp.tag}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Row - 1st and 3rd Place */}
          <div className="grid grid-cols-2 gap-8">
            {/* 1st Place (Left) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, type: "spring" }}
            >
              <div className="relative rounded-2xl p-8 bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 border-2 border-yellow-400 shadow-[0_0_40px_rgba(255,215,0,0.4)]">
                <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <GoldMedal />
                  </motion.div>
                </div>
                <div className="text-center pt-8 space-y-4">
                  <Crown className="w-12 h-12 mx-auto text-yellow-400" />
                  <Badge className="bg-yellow-400 text-black font-black text-lg px-4 py-1">
                    🏆 CHAMPION
                  </Badge>
                  <h3 className="font-zentry text-3xl uppercase text-yellow-400">
                    {champion?.name || "TBD"}
                  </h3>
                  {champion?.tag && (
                    <p className="text-sm text-gray-400">{champion.tag}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* 3rd Place (Right) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <div className="relative rounded-2xl p-6 bg-gradient-to-br from-orange-700/20 to-orange-900/10 border-2 border-orange-700 shadow-[0_0_30px_rgba(205,127,50,0.3)]">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <BronzeMedal />
                </div>
                <div className="text-center pt-8 space-y-3">
                  <Badge className="bg-orange-700 text-white font-black">
                    🥉 THIRD PLACE
                  </Badge>
                  <h3 className="font-zentry text-2xl uppercase text-orange-600">
                    {thirdPlace?.name || "TBD"}
                  </h3>
                  {thirdPlace?.tag && (
                    <p className="text-sm text-gray-500">{thirdPlace.tag}</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Remaining Teams List */}
      {remainingTeams && remainingTeams.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <div className="border-t border-zinc-800 pt-8">
            <h3 className="font-zentry text-2xl uppercase text-white mb-6 text-center">
              Remaining Teams
            </h3>
            <div className="space-y-2">
              {remainingTeams.map(({ team, rank, points }, idx) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + idx * 0.05 }}
                  className="flex items-center justify-between px-6 py-4 rounded-lg bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-zentry text-2xl text-gray-500 w-8">
                      {rank}
                    </span>
                    <div>
                      <h4 className="font-zentry text-lg uppercase text-white">
                        {team.name}
                      </h4>
                      {team.tag && (
                        <p className="text-xs text-gray-500">{team.tag}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-zentry text-xl text-gray-400">
                    {points} pts
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
