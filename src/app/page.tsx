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
  const totalTeams = teams.length;
  const totalMatches = matches.length;
  const completedMatches = matches.filter(m => m.status === "finished" || m.status === "locked").length;
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
        
        {/* Hero Section */}
        <section className="relative w-full min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover scale-105"
              priority
              data-ai-hint={heroImage.imageHint}
            />
          )}
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
          
          {/* Animated accent lines */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />
          
          {/* Content */}
          <div className="relative z-10 container flex flex-col items-center text-center gap-8 px-4 py-12">
            {/* Live badge */}
            {liveMatches > 0 && (
              <Badge variant="destructive" className="text-lg px-4 py-2 animate-pulse gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                {liveMatches} MATCH{liveMatches > 1 ? "ES" : ""} LIVE NOW
              </Badge>
            )}
            
            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-7xl md:text-9xl lg:text-[12rem] font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary to-primary/50 drop-shadow-2xl leading-none">
                ARENA ACE
              </h1>
              <p className="text-2xl md:text-3xl lg:text-4xl tracking-[0.3em] text-foreground/90 font-light">
                THE ULTIMATE FREE FIRE SHOWDOWN
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Button asChild size="lg" className="text-xl tracking-widest px-8 py-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 group">
                <Link href="/tournament" className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  View Tournament
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-xl tracking-widest px-8 py-6 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <Link href="/schedule" className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Match Schedule
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Live Stats Bar */}
        <section className="w-full bg-card/80 backdrop-blur-sm border-y border-border/50 py-6">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <StatCard 
                icon={<Users className="h-8 w-8 text-primary" />}
                value={totalTeams}
                label="Teams"
                loading={loading}
              />
              <StatCard 
                icon={<Swords className="h-8 w-8 text-accent" />}
                value={`${completedMatches}/${totalMatches}`}
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
                <p className="text-xl text-muted-foreground mt-3 tracking-widest">
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
                        <h3 className="text-3xl font-bold tracking-wider mb-1">
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
                <Button asChild variant="outline" size="lg" className="gap-2 text-lg">
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
              <h2 className="text-5xl md:text-6xl font-bold tracking-wider">
                TOURNAMENT STAGES
              </h2>
              <p className="text-xl text-muted-foreground mt-3 tracking-widest">
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
                      <CardTitle className="text-3xl tracking-wider mt-2">
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
              <Button asChild size="lg" className="gap-2 text-lg">
                <Link href="/tournament">
                  <Trophy className="h-5 w-5" />
                  Enter Tournament Hub
                </Link>
              </Button>
            </div>
          </div>
        </section>

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
                      <h3 className="text-2xl font-bold tracking-wider mb-1">Match Schedule</h3>
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
          "font-bold tracking-wider",
          isText ? "text-xl md:text-2xl" : "text-3xl md:text-4xl"
        )}>
          {loading ? "—" : value}
        </div>
        <div className="text-sm text-muted-foreground tracking-wider uppercase">
          {label}
        </div>
      </div>
    </div>
  );
}
