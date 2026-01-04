"use client";

import React from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "@/components/zodius/Hero";
import About from "@/components/zodius/About";
import CollegeShowcase from "@/components/zodius/CollegeShowcase";
import Features from "@/components/zodius/Features";
import Story from "@/components/zodius/Story";
import Contact from "@/components/zodius/Contact";
import Button from "@/components/zodius/Button";
import PodiumCard from "@/components/zodius/PodiumCard";
import { useTournament } from "@/contexts";
import { calculateLeaderboard } from "@/lib/utils-tournament";
import { LeaderboardTable } from "@/components/public/leaderboard-table";
import { TimelineCard } from "@/components/ui/animated-cards";
import AnimatedTitle from "@/components/zodius/AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const { teams, days, groups, matches, scores, loading } = useTournament();

  const sortedDays = React.useMemo(() => [...days].sort((a, b) => a.dayNumber - b.dayNumber), [days]);
  const activeDay = sortedDays.find(d => d.status === "active") || sortedDays[0];
  const qualificationCutoff = activeDay?.qualifyCount ?? 12;

  const leaderboardEntries = React.useMemo(
    () => calculateLeaderboard(teams, matches, scores, groups, [], undefined, undefined, qualificationCutoff),
    [teams, matches, scores, groups, qualificationCutoff]
  );
  const leaderboardPreview = leaderboardEntries.slice(0, 8);

  const totalKills = leaderboardEntries.reduce((sum, entry) => sum + entry.totalKills, 0);
  const finishedMatches = matches.filter(m => m.status === "finished" || m.status === "locked").length;

  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden bg-blue-50">
      <Hero />
      <About />
      <CollegeShowcase />
      
      
      {/* Live Rankings Section - Top 3 Podium */}
      <section id="leaderboard" className="bg-black py-20 text-blue-50">
        <div className="container mx-auto px-5 md:px-10">
          <div className="flex flex-col items-center text-center mb-16">
            <AnimatedTitle 
              title="Li<b>v</b>e Rank<b>i</b>ngs" 
              containerClass="mt-5 !text-gray-300 tracking-wider"
            />
            <p className="mt-5 font-circular-web text-lg text-gray-400 max-w-lg">
              Top 3 squads leading the FFSAL tournament.
            </p>
          </div>

          {/* Top 3 Podium Display */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {leaderboardPreview.slice(0, 3).map((entry, index) => (
                <PodiumCard
                  key={entry.teamId}
                  teamName={entry.teamName}
                  totalPoints={entry.totalPoints}
                  totalKills={entry.totalKills}
                  wins={entry.hasBooyah ? 1 : 0}
                  rank={index + 1}
                />
              ))}
            </div>
          </div>

          {/* View Full Leaderboard Button */}
          <div className="flex justify-center">
            <Link href="/leaderboard">
              <Button
                id="view-leaderboard"
                title="View Full Leaderboard"
                rightIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                }
                containerClass="bg-yellow-300 gap-2 !flex"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section - Text Only */}
      <section className="bg-black pb-20">
        <div className="container mx-auto px-5 md:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <div className="flex flex-col items-center justify-center p-8">
                <span className="text-6xl md:text-7xl font-zentry font-black text-primary">{teams.length}</span>
                <span className="text-sm uppercase text-gray-400 mt-3 font-general tracking-wider">Teams</span>
             </div>
             <div className="flex flex-col items-center justify-center p-8">
                <span className="text-6xl md:text-7xl font-zentry font-black text-accent">{finishedMatches}/{matches.length}</span>
                <span className="text-sm uppercase text-gray-400 mt-3 font-general tracking-wider">Matches</span>
             </div>
             <div className="flex flex-col items-center justify-center p-8">
                <span className="text-6xl md:text-7xl font-zentry font-black text-red-500">{totalKills}</span>
                <span className="text-sm uppercase text-gray-400 mt-3 font-general tracking-wider">Total Kills</span>
             </div>
             <div className="flex flex-col items-center justify-center p-8">
                <span className="text-3xl md:text-4xl font-zentry font-black uppercase text-center leading-tight text-yellow-300">{activeDay?.name || "Stage 1"}</span>
                <span className="text-sm uppercase text-gray-400 mt-3 font-general tracking-wider">Current Stage</span>
             </div>
          </div>
        </div>
      </section>

      <Features />

      {/* Tournament Stages Section */}
      <section id="schedule" className="bg-black py-20 text-blue-50">
        <div className="container mx-auto px-5 md:px-10">
          <div className="flex flex-col items-center text-center mb-16">
            <AnimatedTitle 
              title="T<b>o</b>urnament St<b>a</b>ges" 
              containerClass="mt-5 !text-gray-300 tracking-wider"
            />
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            {sortedDays.map((day, idx) => {
              const dayMatches = matches.filter(m => m.dayId === day.id);
              const completedCount = dayMatches.filter(m => m.status === "finished" || m.status === "locked").length;
              const isActive = day.status === "active";
              const isCompleted = day.status === "completed" || day.status === "locked";
              
              // Determine logic description based on matches in the day
              const matchTypes = Array.from(new Set(dayMatches.map(m => m.type)));
              const type = matchTypes[0] || 'br-shortlist';
              
              const descriptions: Record<string, string> = {
                "br-shortlist": "Kill-based qualification rounds - Every elimination counts!",
                "br-championship": "Grand Finals Battle - The ultimate showdown for the trophy!",
                "cs-bracket": "Knockout elimination bracket - Single elimination showdown!",
              };
              
              return (
                <TimelineCard
                  key={day.id}
                  dayNumber={day.dayNumber}
                  title={day.name}
                  description={descriptions[type] || "Tournament matches"}
                  status={isActive ? "active" : isCompleted ? "completed" : "upcoming"}
                  matchCount={dayMatches.length}
                  completedMatches={completedCount}
                  qualifyCount={day.qualifyCount}
                  delay={idx * 0.1}
                />
              );
            })}
          </div>
        </div>
      </section>

      <Story />
      <Contact />
    </main>
  );
}
