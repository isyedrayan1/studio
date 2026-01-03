"use client";

import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Flame, 
  Trophy, 
  Calendar, 
  Users, 
  Swords, 
  Crown,
  ChevronRight,
  Zap,
  Target,
  Medal,
  ArrowRight,
  Crosshair,
  Shield,
  Gamepad2,
  Star,
  Sparkles,
} from "lucide-react";
import { AnnouncementBanner } from "@/components/public/announcement-banner";
import { Badge } from "@/components/ui/badge";
import { useTournament } from "@/contexts";
import { cn } from "@/lib/utils";
import { 
  FadeInUp, 
  StaggerContainer,
  FloatingElement,
  AnimatedCounter,
  RevealOnScroll,
  Magnetic,
  TextReveal,
  fadeInUp,
} from "@/components/ui/animated-components";
import { 
  EmberParticles, 
  GridBackground, 
  AnimatedLines,
  NoiseOverlay,
} from "@/components/ui/particle-background";
import { 
  FeatureCard, 
  StatsCard, 
  RankCard, 
  TimelineCard,
  TiltCard,
} from "@/components/ui/animated-cards";
import React from "react";
import { LeaderboardTable } from "@/components/public/leaderboard-table";
import { calculateLeaderboard } from "@/lib/utils-tournament";

const heroImage = PlaceHolderImages.find((img) => img.id === "hero-1");

// Live Data Indicator Component
function LiveDataIndicator({ loading }: { loading: boolean }) {
  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1 }}
    >
      <motion.div
        className={cn(
          "w-2 h-2 rounded-full",
          loading ? "bg-yellow-500" : "bg-emerald-500"
        )}
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <span className="text-xs text-muted-foreground">
        {loading ? "Syncing..." : "Live"}
      </span>
    </motion.div>
  );
}

export default function Home() {
  const { teams, days, groups, matches, scores, loading } = useTournament();

  const sortedDays = React.useMemo(() => [...days].sort((a, b) => a.dayNumber - b.dayNumber), [days]);
  const activeDay = sortedDays.find(d => d.status === "active") || sortedDays[0];
  const qualificationCutoff = activeDay?.qualifyCount ?? 12;

  const leaderboardEntries = React.useMemo(
    () => calculateLeaderboard(teams, matches, scores, groups, undefined, qualificationCutoff),
    [teams, matches, scores, groups, qualificationCutoff]
  );
  const leaderboardPreview = leaderboardEntries.slice(0, 8);

  const finishedMatches = matches.filter(m => m.status === "finished" || m.status === "locked").length;
  const liveMatches = matches.filter(m => m.status === "live").length;
  const totalKills = leaderboardEntries.reduce((sum, entry) => sum + entry.totalKills, 0);

  const stats = {
    daysCount: days.length,
    totalTeams: teams.length,
    totalMatches: matches.length,
    finishedMatches,
    totalKills,
  };

  const topTeams = leaderboardEntries
    .slice(0, 3)
    .map((entry) => ({
      team: teams.find((t) => t.id === entry.teamId),
      points: entry.totalPoints,
    }));

  return (
    <main className="flex-1 w-full overflow-hidden">
      {/* Live Data Indicator */}
      <LiveDataIndicator loading={loading} />
      
      <div className="flex flex-col">
        {/* Announcement Banner */}
        <AnnouncementBanner />
        
        {/* ============================================ */}
        {/* HERO SECTION - Epic Gaming Theme */}
        {/* ============================================ */}
        <section className="relative w-full min-h-[100vh] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          {heroImage && (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                priority
                data-ai-hint={heroImage.imageHint}
              />
            </motion.div>
          )}
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)]" />
          
          {/* Animated Effects */}
          <EmberParticles count={20} />
          <GridBackground />
          <AnimatedLines />
          <NoiseOverlay opacity={0.02} />
          
          {/* Animated Border Lines */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div 
            className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
          
          {/* Content */}
          <div className="relative z-10 container flex flex-col items-center text-center gap-8 px-4 py-16">
            {/* Live Badge */}
            <AnimatePresence>
              {liveMatches > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.8 }}
                  className="relative"
                >
                  <motion.div 
                    className="absolute inset-0 bg-primary blur-2xl"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <Badge variant="destructive" className="relative text-lg md:text-xl px-6 py-3 gap-2 shadow-2xl border-2 border-primary/50">
                    <motion.span 
                      className="w-3 h-3 bg-white rounded-full"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                    🔥 {liveMatches} MATCH{liveMatches > 1 ? "ES" : ""} LIVE NOW
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Main Title */}
            <motion.div 
              className="space-y-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
              }}
            >
              {/* FFSAL Logo Text */}
              <motion.div className="relative inline-block" variants={fadeInUp}>
                <motion.div 
                  className="absolute inset-0 bg-primary blur-[100px] opacity-30"
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.h1 
                  className="relative font-display text-[6rem] sm:text-[8rem] md:text-[12rem] lg:text-[16rem] font-bold leading-none tracking-wider"
                  style={{
                    background: "linear-gradient(180deg, #FFFFFF 0%, #FF4646 50%, #FF4646 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 0 30px rgba(255,70,70,0.5))",
                  }}
                >
                  FFSAL
                </motion.h1>
              </motion.div>
              
              {/* Subtitle */}
              <motion.div 
                className="flex items-center justify-center gap-4"
                variants={fadeInUp}
              >
                <motion.div 
                  className="h-px w-12 md:w-24 bg-gradient-to-r from-transparent to-primary"
                  initial={{ width: 0 }}
                  animate={{ width: "6rem" }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white/90 font-bold uppercase tracking-widest">
                  Free Fire Students League
                </h2>
                <motion.div 
                  className="h-px w-12 md:w-24 bg-gradient-to-l from-transparent to-primary"
                  initial={{ width: 0 }}
                  animate={{ width: "6rem" }}
                  transition={{ duration: 1, delay: 0.8 }}
                />
              </motion.div>
              
              {/* Tagline */}
              <motion.div className="space-y-3" variants={fadeInUp}>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white font-semibold flex items-center justify-center gap-3">
                  <Swords className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  Three Days of Intense Battle Royale Action
                  <Swords className="h-6 w-6 md:h-8 md:w-8 text-primary transform scale-x-[-1]" />
                </p>
                <p className="text-base md:text-lg lg:text-xl text-accent font-semibold">
                  Presented by <span className="text-primary">Thinkbotz Association</span> • AIML Department
                </p>
                <p className="text-sm md:text-base text-muted-foreground">
                  Annamacharya Institute of Technology and Sciences, Kadapa-Chennur
                </p>
              </motion.div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 md:gap-6 mt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <Magnetic>
                <Button asChild size="lg" className="relative text-lg md:text-xl px-8 md:px-12 py-6 md:py-8 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 font-bold border-2 border-primary/50 group overflow-hidden">
                  <Link href="/leaderboard" className="flex items-center gap-3">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Trophy className="h-5 w-5 md:h-6 md:w-6" />
                    ENTER TOURNAMENT
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </Magnetic>
              
              <Magnetic>
                <Button asChild variant="outline" size="lg" className="relative text-lg md:text-xl px-8 md:px-12 py-6 md:py-8 border-2 border-accent text-accent hover:bg-accent hover:text-background font-bold shadow-xl overflow-hidden group">
                  <Link href="/schedule" className="flex items-center gap-3">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Calendar className="h-5 w-5 md:h-6 md:w-6" />
                    VIEW SCHEDULE
                  </Link>
                </Button>
              </Magnetic>
            </motion.div>
            
            {/* Tournament Stats Cards */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 md:mt-16 w-full max-w-4xl"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <StatsCard icon={Calendar} value={stats.daysCount || "—"} label="Days" color="primary" delay={0} loading={loading} />
              <StatsCard icon={Users} value={stats.totalTeams || "—"} label="Teams" color="accent" delay={0.1} loading={loading} />
              <StatsCard icon={Swords} value={stats.totalMatches || "—"} label="Matches" color="primary" delay={0.2} loading={loading} />
              <StatsCard icon={Target} value={totalKills || "—"} label="Total Kills" color="gold" delay={0.3} loading={loading} />
            </motion.div>
            
            {/* Scroll Indicator */}
            <motion.div 
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <span className="text-sm uppercase tracking-widest">Scroll</span>
                <ChevronRight className="h-6 w-6 rotate-90" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ============================================ */}
        {/* LIVE STATS BAR */}
        {/* ============================================ */}
        <section className="relative w-full bg-card/90 backdrop-blur-md border-y border-border/50 py-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
          
          <div className="container relative">
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <motion.div variants={fadeInUp} className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20 text-primary">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold">
                    {loading ? "—" : <AnimatedCounter value={stats.totalTeams} />}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Teams</div>
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent/20 text-accent">
                  <Swords className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold">
                    {loading ? "—" : `${stats.finishedMatches}/${stats.totalMatches}`}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Matches</div>
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-red-500/20 text-red-500">
                  <Target className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold">
                    {loading ? "—" : <AnimatedCounter value={totalKills} />}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Total Kills</div>
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-500">
                  <Zap className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold">
                    {loading ? "—" : activeDay?.name || "—"}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase tracking-wider">Current Stage</div>
                </div>
              </motion.div>
            </StaggerContainer>
          </div>
        </section>

        {/* ============================================ */}
        {/* FEATURES SECTION */}
        {/* ============================================ */}
        <section className="relative w-full py-20 md:py-28 overflow-hidden">
          <GridBackground className="opacity-30" />
          
          <div className="container relative">
            <FadeInUp className="flex flex-col items-center text-center mb-16">
              <FloatingElement>
                <Gamepad2 className="h-12 w-12 text-primary mb-4" />
              </FloatingElement>
              <TextReveal text="TOURNAMENT FEATURES" className="text-5xl md:text-6xl font-bold" />
              <p className="text-xl text-muted-foreground mt-4 max-w-2xl">
                Experience the ultimate competitive Free Fire tournament with professional-grade organization
              </p>
            </FadeInUp>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                icon={Shield}
                title="Battle Royale"
                description="Classic BR mode with 4-player squads fighting for survival and glory"
                color="primary"
                delay={0}
              />
              <FeatureCard
                icon={Crosshair}
                title="Kill Points"
                description="Every elimination counts! Rack up kills to climb the leaderboard"
                color="accent"
                delay={0.1}
              />
              <FeatureCard
                icon={Crown}
                title="Championship"
                description="Top teams advance to the intense championship rounds"
                color="gold"
                delay={0.2}
              />
              <FeatureCard
                icon={Trophy}
                title="Grand Finals"
                description="Ultimate showdown to crown the FFSAL champions"
                color="emerald"
                delay={0.3}
              />
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* TOP TEAMS PODIUM */}
        {/* ============================================ */}
        {topTeams.length > 0 && (
          <section className="relative w-full py-20 md:py-28 bg-gradient-to-b from-background via-muted/10 to-background overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
            </div>
            
            <div className="container relative">
              <FadeInUp className="flex flex-col items-center text-center mb-16">
                <FloatingElement duration={4}>
                  <div className="relative">
                    <motion.div 
                      className="absolute inset-0 bg-yellow-500 blur-2xl opacity-30"
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <Crown className="relative h-16 w-16 text-yellow-500 mb-4" />
                  </div>
                </FloatingElement>
                <h2 className="text-5xl md:text-7xl font-bold mb-4">
                  CURRENT LEADERS
                </h2>
                <p className="text-xl text-muted-foreground">
                  Top performers battling for the championship
                </p>
              </FadeInUp>

              {/* Podium Layout - 2nd, 1st, 3rd */}
              <AnimatePresence mode="popLayout">
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto items-end"
                  layout
                >
                  {/* 2nd Place */}
                  {topTeams[1] && (
                    <motion.div 
                      className="order-2 md:order-1"
                      key={`rank-2-${topTeams[1].team?.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <RankCard
                        rank={2}
                        teamName={topTeams[1].team?.name || "Unknown"}
                        teamTag={topTeams[1].team?.tag}
                        points={topTeams[1].points}
                      />
                    </motion.div>
                  )}
                  
                  {/* 1st Place */}
                  {topTeams[0] && (
                    <motion.div 
                      className="order-1 md:order-2"
                      key={`rank-1-${topTeams[0].team?.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <RankCard
                        rank={1}
                        teamName={topTeams[0].team?.name || "Unknown"}
                        teamTag={topTeams[0].team?.tag}
                        points={topTeams[0].points}
                      />
                    </motion.div>
                  )}
                  
                  {/* 3rd Place */}
                  {topTeams[2] && (
                    <motion.div 
                      className="order-3"
                      key={`rank-3-${topTeams[2].team?.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <RankCard
                        rank={3}
                        teamName={topTeams[2].team?.name || "Unknown"}
                        teamTag={topTeams[2].team?.tag}
                        points={topTeams[2].points}
                      />
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              <FadeInUp className="flex justify-center mt-12">
                <Magnetic>
                  <Button asChild variant="outline" size="lg" className="gap-3 text-lg px-8 py-6 border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold group">
                    <Link href="/leaderboard">
                      <Trophy className="h-5 w-5" />
                      View Full Leaderboard
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </Magnetic>
              </FadeInUp>
            </div>
          </section>
        )}

        {/* ============================================ */}
        {/* LIVE LEADERBOARD SNAPSHOT */}
        {/* ============================================ */}
        {leaderboardPreview.length > 0 && (
          <section className="relative w-full py-20 md:py-24 bg-gradient-to-b from-background via-zinc-900/50 to-background overflow-hidden">
            <GridBackground className="opacity-20" />

            <div className="container relative">
              <FadeInUp className="flex flex-col items-center text-center mb-12">
                <FloatingElement>
                  <Trophy className="h-12 w-12 text-primary mb-4" />
                </FloatingElement>
                <h2 className="text-5xl md:text-7xl font-bold mb-3">
                  LIVE LEADERBOARD
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl">
                  Synced with real match data—top teams and points match the tournament hub
                </p>
              </FadeInUp>

              <div className="max-w-5xl mx-auto">
                <LeaderboardTable leaderboard={leaderboardPreview} qualificationCutoff={qualificationCutoff} />
              </div>

              <FadeInUp className="flex justify-center mt-10">
                <Magnetic>
                  <Button asChild size="lg" variant="outline" className="gap-3 text-lg px-8 py-6 border-2 border-accent text-accent hover:bg-accent hover:text-background font-bold group">
                    <Link href="/leaderboard">
                      <Trophy className="h-5 w-5" />
                      View Full Leaderboard
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </Magnetic>
              </FadeInUp>
            </div>
          </section>
        )}

        {/* ============================================ */}
        {/* TOURNAMENT STAGES TIMELINE */}
        {/* ============================================ */}
        <section className="relative w-full py-20 md:py-28 overflow-hidden">
          <AnimatedLines />
          
          <div className="container relative">
            <FadeInUp className="flex flex-col items-center text-center mb-16">
              <FloatingElement>
                <Flame className="h-12 w-12 text-primary mb-4" />
              </FloatingElement>
              <h2 className="text-5xl md:text-7xl font-bold mb-4">
                TOURNAMENT STAGES
              </h2>
              <p className="text-xl text-muted-foreground">
                Three days of intense competition
              </p>
            </FadeInUp>

            <div className="max-w-3xl mx-auto space-y-6">
              {sortedDays.map((day, idx) => {
                const dayMatches = matches.filter(m => m.dayId === day.id);
                const completedCount = dayMatches.filter(m => m.status === "finished" || m.status === "locked").length;
                const isActive = day.status === "active";
                const isCompleted = day.status === "completed" || day.status === "locked";
                
                const descriptions: Record<string, string> = {
                  "br-shortlist": "Kill-based qualification rounds - Every elimination counts!",
                  "br-championship": "Champion Rush competition - Battle for the top spots!",
                  "cs-bracket": "Knockout elimination bracket - Single elimination showdown!",
                };
                
                return (
                  <TimelineCard
                    key={day.id}
                    dayNumber={day.dayNumber}
                    title={day.name}
                    description={descriptions[day.type] || "Tournament matches"}
                    status={isActive ? "active" : isCompleted ? "completed" : "upcoming"}
                    matchCount={dayMatches.length}
                    completedMatches={completedCount}
                    qualifyCount={day.qualifyCount}
                    delay={idx * 0.1}
                  />
                );
              })}
            </div>

            <FadeInUp className="flex justify-center mt-12">
              <Magnetic>
                <Button asChild size="lg" className="gap-3 text-lg px-8 py-6 bg-primary hover:bg-primary/90 font-bold shadow-lg shadow-primary/30 group">
                  <Link href="/leaderboard">
                    <Trophy className="h-5 w-5" />
                    Enter Tournament Hub
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </Magnetic>
            </FadeInUp>
          </div>
        </section>

        {/* ============================================ */}
        {/* QUICK LINKS */}
        {/* ============================================ */}
        <section className="relative w-full py-16 md:py-20 bg-muted/20">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <RevealOnScroll direction="left">
                <Link href="/leaderboard" className="group block">
                  <TiltCard>
                    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 group-hover:border-primary/60 group-hover:shadow-[0_0_40px_rgba(255,70,70,0.2)]">
                      <div className="flex items-center gap-6">
                        <div className="p-4 rounded-xl bg-primary/20 text-primary group-hover:scale-110 transition-transform">
                          <Trophy className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-1">Leaderboard</h3>
                          <p className="text-muted-foreground">View live rankings and team standings</p>
                        </div>
                        <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-2 transition-all" />
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </RevealOnScroll>
              
              <RevealOnScroll direction="right">
                <Link href="/schedule" className="group block">
                  <TiltCard>
                    <div className="relative overflow-hidden rounded-xl border border-accent/30 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 group-hover:border-accent/60 group-hover:shadow-[0_0_40px_rgba(41,171,226,0.2)]">
                      <div className="flex items-center gap-6">
                        <div className="p-4 rounded-xl bg-accent/20 text-accent group-hover:scale-110 transition-transform">
                          <Calendar className="h-8 w-8" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-1">Match Schedule</h3>
                          <p className="text-muted-foreground">View upcoming matches and times</p>
                        </div>
                        <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-accent group-hover:translate-x-2 transition-all" />
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </RevealOnScroll>
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* CALL TO ACTION BANNER */}
        {/* ============================================ */}
        <section className="relative w-full py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20" />
          <EmberParticles count={15} />
          
          <div className="container relative">
            <motion.div 
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <FloatingElement duration={3}>
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-8 w-8 text-yellow-500" />
                  <Star className="h-10 w-10 text-primary" />
                  <Sparkles className="h-8 w-8 text-yellow-500" />
                </div>
              </FloatingElement>
              
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
                READY TO <span className="text-primary">DOMINATE</span>?
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl">
                Join the most exciting Free Fire tournament and prove your skills on the battlefield
              </p>
              
              <Magnetic>
                <Button asChild size="lg" className="text-xl px-12 py-8 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 font-bold border-2 border-primary/50 group">
                  <Link href="/leaderboard" className="flex items-center gap-3">
                    <Trophy className="h-6 w-6" />
                    ENTER THE ARENA
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </Button>
              </Magnetic>
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}
