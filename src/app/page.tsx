"use client";

import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
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
} from "lucide-react";
import { AnnouncementBanner } from "@/components/public/announcement-banner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTournament } from "@/contexts";
import { cn } from "@/lib/utils";

const heroImage = PlaceHolderImages.find((img) => img.id === "hero-1");

export default function Home() {
  const { teams, days, matches, scores, loading, getTeamById } = useTournament();

  // Calculate live stats
  const stats = {
    totalTeams: teams.length,
    totalMatches: matches.length,
    totalScores: scores.length,
    completedMatches: matches.filter(m => m.status === "finished" || m.status === "locked").length,
  };
  const liveMatches = matches.filter(m => m.status === "live").length;
  const totalKills = scores.reduce((sum, s) => sum + s.kills, 0);

  // Get top 3 teams by total points
  const teamPoints = new Map<string, number>();
  scores.forEach(s => {
    teamPoints.set(s.teamId, (teamPoints.get(s.teamId) || 0) + (s.totalPoints || 0));
  });
  const topTeams = Array.from(teamPoints.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([teamId, points]) => ({ team: getTeamById(teamId), points }));

  // Get active/upcoming day
  const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
  const activeDay = sortedDays.find(d => d.status === "active") || sortedDays[0];

  return (
    <main className="flex-1 w-full">
      <div className="flex flex-col">
        {/* Announcement Banner */}
        <AnnouncementBanner />
        
        {/* Hero Section - Free Fire Themed */}
        <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover scale-110"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          {/* Strong gradient overlays for drama */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.7)_100%)]" />
          
          {/* Animated accent lines - Fire effect */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-primary to-transparent opacity-80 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-accent to-transparent opacity-80 animate-pulse" style={{ animationDelay: '0.5s' }} />
          
          {/* Side accent bars */}
          <div className="absolute left-0 top-1/4 w-2 h-1/2 bg-gradient-to-b from-transparent via-primary to-transparent opacity-60" />
          <div className="absolute right-0 top-1/4 w-2 h-1/2 bg-gradient-to-b from-transparent via-accent to-transparent opacity-60" />
          
          {/* Content */}
          <div className="relative z-10 container flex flex-col items-center text-center gap-10 px-4 py-16">
            {/* Live badge with glow */}
            {liveMatches > 0 && (
              <div className="relative">
                <div className="absolute inset-0 bg-primary blur-xl opacity-50 animate-pulse" />
                <Badge variant="destructive" className="relative text-xl px-6 py-3 animate-pulse gap-2 shadow-2xl">
                  <span className="w-3 h-3 bg-white rounded-full animate-ping" />
                  🔥 {liveMatches} MATCH{liveMatches > 1 ? "ES" : ""} LIVE NOW
                </Badge>
              </div>
            )}
            
            {/* Title with dramatic styling */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary blur-3xl opacity-30" />
                  <h1 className="relative font-display text-8xl md:text-[12rem] lg:text-[14rem] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-primary to-primary drop-shadow-2xl leading-none tracking-wide">
                    FFSAL
                  </h1>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary" />
                  <p className="text-2xl md:text-3xl lg:text-4xl text-white/90 font-bold uppercase">
                    Free Fire Students League
                  </p>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary" />
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-xl md:text-2xl lg:text-3xl text-white font-semibold">
                  ⚔️ Three Days of Intense Battle Royale Action ⚔️
                </p>
                <p className="text-lg md:text-xl text-accent font-semibold">
                  Presented by <span className="text-primary">Thinkbotz Association</span> • AIML Department
                </p>
                <p className="text-base md:text-lg text-muted-foreground">
                  Annamacharya Institute of Technology and Sciences, Kadapa-Chennur
                </p>
              </div>
            </div>

            {/* CTA Buttons with glow effects */}
            <div className="flex flex-col sm:flex-row gap-6 mt-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary blur-xl opacity-0 group-hover:opacity-70 transition-opacity" />
                <Button asChild size="lg" className="relative text-xl px-10 py-7 bg-primary hover:bg-primary/90 shadow-2xl group font-bold border-2 border-primary/50">
                  <Link href="/tournament" className="flex items-center gap-3">
                    <Trophy className="h-6 w-6" />
                    ENTER TOURNAMENT
                    <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-accent blur-xl opacity-0 group-hover:opacity-70 transition-opacity" />
                <Button asChild variant="outline" size="lg" className="relative text-xl px-10 py-7 border-2 border-accent text-accent hover:bg-accent hover:text-background font-bold shadow-xl">
                  <Link href="/schedule" className="flex items-center gap-3">
                    <Calendar className="h-6 w-6" />
                    VIEW SCHEDULE
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Tournament Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 w-full max-w-4xl">
              <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-primary/30">
                <div className="text-4xl md:text-5xl font-bold text-primary">3</div>
                <div className="text-sm md:text-base text-muted-foreground mt-1">Days</div>
              </div>
              <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-accent/30">
                <div className="text-4xl md:text-5xl font-bold text-accent">{stats.totalTeams}</div>
                <div className="text-sm md:text-base text-muted-foreground mt-1">Teams</div>
              </div>
              <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-primary/30">
                <div className="text-4xl md:text-5xl font-bold text-primary">{stats.totalMatches}</div>
                <div className="text-sm md:text-base text-muted-foreground mt-1">Matches</div>
              </div>
              <div className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-lg border border-accent/30">
                <div className="text-4xl md:text-5xl font-bold text-accent">{stats.totalScores}</div>
                <div className="text-sm md:text-base text-muted-foreground mt-1">Scores</div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Stats Bar */}
        <section className="w-full bg-card/80 backdrop-blur-sm border-y border-border/50 py-6">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <StatCard 
                icon={<Users className="h-8 w-8 text-primary" />}
                value={stats.totalTeams}
                label="Teams"
                loading={loading}
              />
              <StatCard 
                icon={<Swords className="h-8 w-8 text-accent" />}
                value={`${stats.completedMatches}/${stats.totalMatches}`}
                label="Matches Played"
                loading={loading}
              />
              <StatCard 
                icon={<Target className="h-8 w-8 text-red-500" />}
                value={totalKills}
                label="Total Kills"
                loading={loading}
              />
              <StatCard 
                icon={<Zap className="h-8 w-8 text-yellow-500" />}
                value={activeDay?.name || "—"}
                label="Current Stage"
                loading={loading}
                isText
              />
            </div>
          </div>
        </section>

        {/* Top Teams Preview */}
        {topTeams.length > 0 && (
          <section className="w-full py-16 md:py-20">
            <div className="container">
              <div className="flex flex-col items-center text-center mb-12">
                <Crown className="h-12 w-12 text-yellow-500 mb-4" />
                <h2 className="text-5xl md:text-6xl font-bold tracking-wider">
                  CURRENT LEADERS
                </h2>
                <p className="text-xl text-muted-foreground mt-3">
                  Top performers in the tournament
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {topTeams.map((entry, idx) => {
                  const rankColors = [
                    "from-yellow-500/20 to-yellow-600/10 border-yellow-500/50",
                    "from-gray-400/20 to-gray-500/10 border-gray-400/50",
                    "from-amber-600/20 to-amber-700/10 border-amber-600/50",
                  ];
                  const rankIcons = [
                    <Crown key="1" className="h-8 w-8 text-yellow-500" />,
                    <Medal key="2" className="h-8 w-8 text-gray-400" />,
                    <Medal key="3" className="h-8 w-8 text-amber-600" />,
                  ];
                  
                  return (
                    <Card 
                      key={entry.team?.id || idx}
                      className={cn(
                        "relative overflow-hidden bg-gradient-to-br border-2 transition-transform hover:scale-105",
                        rankColors[idx],
                        idx === 0 && "md:-translate-y-4 md:scale-105"
                      )}
                    >
                      {/* Rank badge */}
                      <div className="absolute top-4 right-4">
                        {rankIcons[idx]}
                      </div>
                      
                      <CardContent className="pt-8 pb-6 px-6 text-center">
                        <div className="text-6xl font-bold text-muted-foreground/30 mb-2">
                          #{idx + 1}
                        </div>
                        <h3 className="text-3xl font-bold mb-1">
                          {entry.team?.name || "Unknown"}
                        </h3>
                        {entry.team?.tag && (
                          <Badge variant="outline" className="mb-4">{entry.team.tag}</Badge>
                        )}
                        <div className="mt-4 text-4xl font-bold text-primary">
                          {entry.points}
                          <span className="text-lg text-muted-foreground ml-2">pts</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex justify-center mt-10">
                <Button asChild variant="outline" size="lg" className="gap-2 text-lg font-semibold">
                  <Link href="/tournament">
                    View Full Leaderboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Tournament Days Preview */}
        <section className="w-full py-16 md:py-20 bg-muted/30">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-12">
              <Flame className="h-12 w-12 text-primary mb-4" />
              <h2 className="text-5xl md:text-6xl font-bold font-display">
                TOURNAMENT STAGES
              </h2>
              <p className="text-xl text-muted-foreground mt-3">
                Three days of intense competition
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {sortedDays.map((day) => {
                const dayMatches = matches.filter(m => m.dayId === day.id);
                const completedCount = dayMatches.filter(m => m.status === "finished" || m.status === "locked").length;
                const isActive = day.status === "active";
                const isCompleted = day.status === "completed" || day.status === "locked";
                
                return (
                  <Card 
                    key={day.id}
                    className={cn(
                      "relative overflow-hidden transition-all duration-300 hover:border-primary/50",
                      isActive && "border-primary ring-2 ring-primary/20",
                      isCompleted && "bg-muted/50"
                    )}
                  >
                    {isActive && (
                      <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse" />
                    )}
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={isActive ? "default" : isCompleted ? "secondary" : "outline"}
                          className={cn(
                            isActive && "bg-primary animate-pulse"
                          )}
                        >
                          {isActive ? "LIVE" : isCompleted ? "COMPLETED" : "UPCOMING"}
                        </Badge>
                        <span className="text-4xl font-bold text-muted-foreground/30">
                          {day.dayNumber.toString().padStart(2, "0")}
                        </span>
                      </div>
                      <CardTitle className="text-3xl mt-2">
                        {day.name}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        {day.type === "br-shortlist" && "Kill-based qualification rounds"}
                        {day.type === "br-championship" && "Champion Rush competition"}
                        {day.type === "cs-bracket" && "Knockout elimination bracket"}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-mono">{completedCount}/{dayMatches.length} matches</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-500"
                          style={{ width: `${dayMatches.length ? (completedCount / dayMatches.length) * 100 : 0}%` }}
                        />
                      </div>
                      
                      {day.qualifyCount && (
                        <p className="text-sm text-accent">
                          Top {day.qualifyCount} teams qualify
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex justify-center mt-10">
              <Button asChild size="lg" className="gap-2 text-lg font-semibold">
                <Link href="/tournament">
                  <Trophy className="h-5 w-5" />
                  Enter Tournament Hub
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Full Leaderboard Section - Free Fire Themed */}
        {topTeams.length > 0 && (
          <section className="w-full py-20 bg-gradient-to-b from-background via-background/95 to-background">
            <div className="container">
              <div className="flex flex-col items-center text-center mb-16">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary blur-2xl opacity-20" />
                  <Trophy className="relative h-16 w-16 text-primary mb-6" />
                </div>
                <h2 className="text-6xl md:text-7xl font-bold mb-4">
                  LIVE LEADERBOARD
                </h2>
                <p className="text-2xl text-accent font-semibold">
                  Top Teams Battle for Glory
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="h-px w-24 bg-gradient-to-r from-transparent to-primary" />
                  <span className="text-lg text-muted-foreground">Updated Live</span>
                  <div className="h-px w-24 bg-gradient-to-l from-transparent to-primary" />
                </div>
              </div>

              {/* Top 3 Podium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
                {topTeams.map((entry, idx) => {
                  const team = entry.team;
                  const points = entry.points;
                  const rankData = [
                    { 
                      icon: <Crown className="h-12 w-12 text-yellow-400" />,
                      title: "CHAMPION",
                      borderColor: "border-yellow-500",
                      bgGradient: "from-yellow-500/20 via-yellow-600/10 to-transparent",
                      textColor: "text-yellow-400",
                      scale: "md:scale-110 md:-translate-y-8",
                      shadow: "shadow-2xl shadow-yellow-500/20"
                    },
                    {
                      icon: <Medal className="h-10 w-10 text-gray-300" />,
                      title: "RUNNER UP",
                      borderColor: "border-gray-400",
                      bgGradient: "from-gray-400/20 via-gray-500/10 to-transparent",
                      textColor: "text-gray-300",
                      scale: "md:scale-105",
                      shadow: "shadow-xl shadow-gray-400/10"
                    },
                    {
                      icon: <Medal className="h-10 w-10 text-amber-600" />,
                      title: "3RD PLACE",
                      borderColor: "border-amber-600",
                      bgGradient: "from-amber-600/20 via-amber-700/10 to-transparent",
                      textColor: "text-amber-600",
                      scale: "md:scale-105",
                      shadow: "shadow-xl shadow-amber-600/10"
                    }
                  ][idx];

                  return (
                    <Card 
                      key={team?.id || idx}
                      className={cn(
                        "relative overflow-hidden bg-gradient-to-br border-2 transition-all hover:scale-105",
                        rankData.borderColor,
                        rankData.bgGradient,
                        rankData.scale,
                        rankData.shadow
                      )}
                    >
                      {/* Glowing top border */}
                      <div className={cn("absolute top-0 left-0 right-0 h-1", rankData.borderColor.replace('border-', 'bg-'), "opacity-80")} />
                      
                      {/* Rank Icon */}
                      <div className="absolute top-6 right-6">
                        {rankData.icon}
                      </div>
                      
                      <CardContent className="pt-12 pb-8 px-8 text-center">
                        <div className="mb-4">
                          <Badge variant="outline" className={cn("text-xs mb-2", rankData.textColor, rankData.borderColor)}>
                            {rankData.title}
                          </Badge>
                          <div className={cn("text-8xl font-bold mb-2", rankData.textColor)}>
                            #{idx + 1}
                          </div>
                        </div>
                        
                        <h3 className="text-3xl font-bold mb-2">
                          {team?.name || "Unknown"}
                        </h3>
                        
                        {team?.tag && (
                          <Badge variant="secondary" className="mb-4 text-base px-4 py-1">
                            {team.tag}
                          </Badge>
                        )}
                        
                        <div className={cn("mt-6 text-5xl font-bold", rankData.textColor)}>
                          {points}
                          <span className="text-xl text-muted-foreground ml-2">pts</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* View Full Button */}
              <div className="flex justify-center">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary blur-xl opacity-0 group-hover:opacity-70 transition-opacity" />
                  <Button asChild variant="outline" size="lg" className="relative gap-3 text-xl px-12 py-8 border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold shadow-2xl">
                    <Link href="/tournament">
                      <Trophy className="h-6 w-6" />
                      VIEW FULL LEADERBOARD
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Quick Links */}
        <section className="w-full py-16">
          <div className="container">
            <div className="flex justify-center max-w-md mx-auto">
              <Link href="/schedule" className="group w-full">
                <Card className="h-full transition-all duration-300 hover:border-accent/50 hover:bg-accent/5 group-hover:scale-[1.02]">
                  <CardContent className="flex items-center gap-6 p-6">
                    <div className="p-4 rounded-xl bg-accent/20 text-accent">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-1">Match Schedule</h3>
                      <p className="text-muted-foreground">View all upcoming matches and times</p>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// Stat Card Component
function StatCard({ 
  icon, 
  value, 
  label, 
  loading,
  isText = false 
}: { 
  icon: React.ReactNode; 
  value: string | number; 
  label: string; 
  loading: boolean;
  isText?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="p-3 rounded-xl bg-muted/50">
        {icon}
      </div>
      <div>
        <div className={cn(
          "font-bold",
          isText ? "text-xl md:text-2xl" : "text-3xl md:text-4xl"
        )}>
          {loading ? "—" : value}
        </div>
        <div className="text-sm text-muted-foreground uppercase">
          {label}
        </div>
      </div>
    </div>
  );
}
