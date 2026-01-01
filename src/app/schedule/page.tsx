"use client";

import { useTournament } from "@/contexts/tournament-context";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Swords, Loader2, Trophy } from "lucide-react";

export default function SchedulePage() {
  const { days, matches, bracketMatches, loading, getTeamById } = useTournament();

  // Sort days by dayNumber
  const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);

  if (loading) {
    return (
      <main className="flex-1 w-full flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex-1 w-full">
      <div className="container py-12">
        <div className="flex flex-col items-center text-center mb-12">
          <CalendarDays className="w-16 h-16 text-primary drop-shadow-[0_2px_4px_hsl(var(--primary)/0.5)]" />
          <h1 className="text-6xl md:text-7xl font-bold font-display mt-4">
            MATCH SCHEDULE
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Three days of intense Free Fire competition
          </p>
        </div>

        {sortedDays.length === 0 ? (
          <div className="text-center py-16">
            <Swords className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-2xl text-muted-foreground">No Schedule Yet</h3>
            <p className="text-lg text-muted-foreground/70 mt-2">
              Match schedule will appear once the tournament is set up.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {sortedDays.map((day) => {
              // For cs-bracket days, show bracket matches
              if (day.type === "cs-bracket") {
                const dayBracketMatches = bracketMatches.filter(m => m.dayId === day.id);
                
                return (
                  <section key={day.id}>
                    <div className="flex items-center gap-4 mb-6">
                      <h2 className="text-5xl font-bold text-accent">
                        {day.name}
                      </h2>
                      <Badge variant="secondary" className="text-lg">Knockout</Badge>
                    </div>
                    
                    {dayBracketMatches.length === 0 ? (
                      <Card className="p-8 text-center">
                        <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <p className="text-xl text-muted-foreground">
                          Bracket will be initialized when Day 2 is complete
                        </p>
                      </Card>
                    ) : (
                      <div className="space-y-6">
                        {[1, 2, 3].map(roundNum => {
                          const roundMatches = dayBracketMatches.filter(m => m.round === roundNum);
                          if (roundMatches.length === 0) return null;
                          
                          const roundName = roundNum === 1 ? "Quarter-Finals" : 
                                           roundNum === 2 ? "Semi-Finals" : "Finals";
                          
                          return (
                            <div key={roundNum}>
                              <h3 className="text-2xl font-semibold capitalize mb-3 text-muted-foreground">
                                {roundName}
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                {roundMatches.map(match => {
                                  const team1 = match.team1Id ? getTeamById(match.team1Id) : null;
                                  const team2 = match.team2Id ? getTeamById(match.team2Id) : null;
                                  return (
                                  <Card key={match.id} className="relative">
                                    {match.status === "live" && (
                                      <div className="absolute top-2 right-2">
                                        <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                                      </div>
                                    )}
                                    <CardContent className="p-4 space-y-2">
                                      <div className={`p-2 rounded ${match.winnerId === match.team1Id ? "bg-green-500/20 border border-green-500" : ""}`}>
                                        <span className="font-medium">
                                          {team1?.name || "TBD"}
                                        </span>
                                      </div>
                                      <div className="text-center text-muted-foreground text-sm">VS</div>
                                      <div className={`p-2 rounded ${match.winnerId === match.team2Id ? "bg-green-500/20 border border-green-500" : ""}`}>
                                        <span className="font-medium">
                                          {team2?.name || "TBD"}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>
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
                <section key={day.id}>
                  <div className="flex items-center gap-4 mb-6">
                    <h2 className="text-5xl font-bold text-accent">
                      {day.name}
                    </h2>
                    <Badge variant="outline" className="text-lg">
                      {dayMatches.length} matches
                    </Badge>
                  </div>
                  
                  {dayMatches.length === 0 ? (
                    <Card className="p-8 text-center">
                      <Swords className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-xl text-muted-foreground">
                        No matches scheduled yet
                      </p>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {dayMatches.map((match) => (
                        <Card key={match.id} className="flex flex-col h-[160px]">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-3xl flex items-center gap-3">
                                <Swords className="h-7 w-7 flex-shrink-0 text-primary" />
                                <span>Match {match.matchNumber}</span>
                              </CardTitle>
                              <Badge
                                variant={
                                  match.status === "live"
                                    ? "destructive"
                                    : match.status === "finished"
                                    ? "secondary"
                                    : "outline"
                                }
                                className="text-md flex-shrink-0"
                              >
                                {match.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="flex-1 flex items-center justify-center">
                            {match.status === "upcoming" ? (
                              <p className="text-muted-foreground text-lg text-center">
                                Teams to be announced.
                              </p>
                            ) : match.status === "live" ? (
                              <p className="text-primary text-lg animate-pulse text-center">
                                Match is currently live!
                              </p>
                            ) : (
                              <p className="text-muted-foreground text-lg text-center">
                                View results on the leaderboard.
                              </p>
                            )}
                          </CardContent>
                        </Card>
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
