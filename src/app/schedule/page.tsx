"use client";

import { useTournament } from "@/contexts/tournament-context";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Swords, Loader2, Trophy, ArrowLeft, Clock } from "lucide-react";
import AnimatedTitle from "@/components/zodius/AnimatedTitle";
import Button from "@/components/zodius/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SchedulePage() {
  const { days, matches, bracketMatches, loading, getTeamById } = useTournament();

  // Sort days by dayNumber
  const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);

  if (loading) {
    return (
      <main className="flex-1 w-full min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-300" />
      </main>
    );
  }

  return (
    <main className="flex-1 w-full min-h-screen bg-black text-blue-50">
      <div className="container py-10 md:py-20 px-4 md:px-10">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <p className="font-general text-sm uppercase tracking-widest text-blue-50 mb-4">
              TOURNAMENT SCHEDULE
          </p>
          <AnimatedTitle 
            title="M<b>a</b>tch Sch<b>e</b>dule" 
            containerClass="mt-5 !text-white text-center"
          />
          <p className="font-circular-web text-gray-400 mt-4 max-w-lg">
            Follow the action through three days of intense competition.
          </p>
        </div>

        {sortedDays.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-xl">
            <Swords className="h-16 w-16 text-zinc-800 mb-6" />
            <h3 className="text-3xl font-zentry text-zinc-600 uppercase">NO SCHEDULE YET</h3>
            <p className="font-circular-web text-zinc-500">Matches will be announced soon.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {sortedDays.map((day) => {
              // Check if this day has cs-bracket matches
              const dayBracketMatches = bracketMatches.filter(m => m.dayId === day.id);
              const hasBracketMatches = dayBracketMatches.length > 0;
              
              // For days with bracket matches, show bracket view
              if (hasBracketMatches) {
                
                return (
                  <section key={day.id} className="relative pl-0 md:pl-8 border-l-0 md:border-l-2 border-zinc-800">
                    {/* Day Point Marker */}
                    <div className="hidden md:flex absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-yellow-300 shadow-[0_0_10px_rgba(253,224,71,0.5)]" />

                    <div className="flex flex-col md:flex-row items-baseline gap-4 mb-8">
                      <h2 className="text-4xl md:text-6xl font-zentry uppercase text-white">
                        {day.name}
                      </h2>
                      <div className="px-3 py-1 rounded bg-yellow-600/20 text-yellow-600 font-general uppercase text-xs tracking-wider border border-yellow-600/30">
                        Knockout Stage
                      </div>
                    </div>
                    
                    {dayBracketMatches.length === 0 ? (
                       <div className="p-8 text-center bg-zinc-900/30 rounded-xl border border-zinc-800">
                        <Trophy className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
                        <p className="text-lg text-gray-400 font-circular-web">
                          Bracket initialization pending completion of Day 2.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-12">
                        {[1, 2, 3].map(roundNum => {
                          const roundMatches = dayBracketMatches.filter(m => m.round === roundNum);
                          if (roundMatches.length === 0) return null;
                          
                          const roundName = roundNum === 1 ? "Quarter-Finals" : 
                                           roundNum === 2 ? "Semi-Finals" : "Finals";
                          
                          return (
                            <div key={roundNum}>
                              <h3 className="text-2xl font-zentry text-gray-500 uppercase mb-6 pl-4 border-l-4 border-zinc-800">{roundName}</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                {roundMatches.map(match => {
                                  const team1 = match.team1Id ? getTeamById(match.team1Id) : null;
                                  const team2 = match.team2Id ? getTeamById(match.team2Id) : null;
                                  return (
                                  <div key={match.id} className="relative bg-zinc-900 border border-zinc-800 p-4 rounded-xl group hover:border-zinc-700 transition-all">
                                    {match.status === "live" && (
                                      <div className="absolute top-2 right-2">
                                        <span className="animate-pulse text-[10px] uppercase font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded">LIVE</span>
                                      </div>
                                    )}
                                    <div className="space-y-3 mt-2">
                                      <div className={cn(
                                          "p-3 rounded-lg border transition-all",
                                          match.winnerId === match.team1Id ? "bg-green-500/10 border-green-500/50" : "bg-black border-zinc-800"
                                      )}>
                                        <span className={cn(
                                            "font-zentry text-lg uppercase",
                                            match.winnerId === match.team1Id ? "text-white" : "text-gray-400"
                                        )}>
                                          {team1?.name || "TBD"}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 justify-center opacity-30">
                                          <div className="h-[1px] w-full bg-white"/>
                                          <span className="font-general text-xs uppercase">VS</span>
                                          <div className="h-[1px] w-full bg-white"/>
                                      </div>

                                      <div className={cn(
                                          "p-3 rounded-lg border transition-all",
                                          match.winnerId === match.team2Id ? "bg-green-500/10 border-green-500/50" : "bg-black border-zinc-800"
                                      )}>
                                        <span className={cn(
                                            "font-zentry text-lg uppercase",
                                            match.winnerId === match.team2Id ? "text-white" : "text-gray-400"
                                        )}>
                                          {team2?.name || "TBD"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              }
              
              // Regular BR matches
              const dayMatches = matches.filter(m => m.dayId === day.id)
                .sort((a, b) => a.matchNumber - b.matchNumber);
              
              return (
                <section key={day.id} className="relative pl-0 md:pl-8 border-l-0 md:border-l-2 border-zinc-800">
                    {/* Day Point Marker */}
                    <div className="hidden md:flex absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />

                  <div className="flex flex-col md:flex-row items-baseline gap-4 mb-8">
                    <h2 className="text-4xl md:text-6xl font-zentry uppercase text-white">
                      {day.name}
                    </h2>
                    <span className="font-general text-gray-400 uppercase text-sm tracking-wider">
                      {dayMatches.length} matches scheduled
                    </span>
                  </div>
                  
                  {dayMatches.length === 0 ? (
                    <div className="p-8 text-center bg-zinc-900/30 rounded-xl border border-zinc-800">
                      <Swords className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
                      <p className="text-lg text-gray-400 font-circular-web">
                        No matches scheduled yet for this day.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {dayMatches.map((match) => (
                        <div key={match.id} className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all group">
                          <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 group-hover:bg-zinc-800/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-zinc-700 transition-all">
                                    <Swords className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-zentry text-xl uppercase text-white">{match.name || `Match ${match.matchNumber}`}</h3>
                                    <p className="font-circular-web text-xs text-gray-500">Battle Royale</p>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-xs font-general uppercase tracking-wider py-1",
                                    match.status === "live" ? "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse" : 
                                    match.status === "finished" ? "bg-green-500/10 text-green-500 border-green-500/20" : 
                                    "bg-zinc-800 text-gray-400 border-zinc-700"
                                )}
                            >
                                {match.status}
                            </Badge>
                          </div>
                          
                          <div className="p-6 flex-1 flex items-center justify-center bg-black/20">
                            {match.status === "upcoming" ? (
                              <div className="text-center">
                                <Clock className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                                <p className="text-gray-500 font-circular-web text-sm">
                                  Teams waiting to deploy.
                                </p>
                              </div>
                            ) : match.status === "live" ? (
                              <div className="text-center">
                                <span className="relative flex h-3 w-3 mx-auto mb-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                <p className="text-red-500 font-zentry uppercase tracking-wide animate-pulse">
                                  Match is Live!
                                </p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Trophy className="w-8 h-8 text-yellow-600/50 mx-auto mb-2" />
                                <p className="text-gray-500 font-circular-web text-sm">
                                  Match concluded. check leaderboard.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
