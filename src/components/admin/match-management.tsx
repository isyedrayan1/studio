"use client";

import { useState } from "react";
import { mockMatches, mockTeams } from "@/lib/data";
import type { Match, MatchScore, Team } from "@/lib/definitions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, LockOpen, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const SkullIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2c-3.31 0-6 2.69-6 6 0 1.95.93 3.69 2.38 4.78C6.67 13.56 6 14.7 6 16v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2c0-1.3-.67-2.44-1.38-3.22C17.07 11.69 18 10.03 18 8c0-3.31-2.69-6-6-6z" />
      <path d="M9 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" /><path d="M15 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" /><path d="M12 17c-1.66 0-3 1.34-3 3h6c0-1.66-1.34-3-3-3z" />
    </svg>
);

export function MatchManagement() {
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const { toast } = useToast();

  const matchesByDay = matches.reduce((acc, match) => {
    (acc[match.day] = acc[match.day] || []).push(match);
    return acc;
  }, {} as Record<number, Match[]>);

  const handleScoreChange = (matchId: string, teamId: string, field: 'kills' | 'placement', value: number) => {
    setMatches(prevMatches => prevMatches.map(match => {
        if (match.id === matchId) {
            const updatedTeams = match.teams.map(teamScore => 
                teamScore.teamId === teamId ? { ...teamScore, [field]: value } : teamScore
            );
            return { ...match, teams: updatedTeams };
        }
        return match;
    }));
  };
  
  const handleLockMatch = (matchId: string) => {
    setMatches(prevMatches => prevMatches.map(match => {
        if (match.id === matchId) {
            const newStatus = match.status === 'locked' ? 'finished' : 'locked';
            toast({
                title: `Match ${newStatus}`,
                description: `Match ${match.day}-${match.matchInDay} has been ${newStatus}.`,
            });
            return { ...match, status: newStatus };
        }
        return match;
    }));
  }

  const handleSaveChanges = (matchId: string) => {
    toast({
      title: "Scores Saved",
      description: "Scores for the match have been successfully saved.",
    });
  };

  return (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
      {Object.entries(matchesByDay).map(([day, dayMatches]) => (
        <AccordionItem key={`day-${day}`} value={`item-${day}`}>
          <AccordionTrigger className="text-4xl tracking-wider text-accent py-6">
            Day {day}
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1">
              {dayMatches.map((match) => (
                <Card key={match.id} className={match.status === 'locked' ? 'border-destructive/50' : ''}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-3xl tracking-wider">Match {match.matchInDay}</CardTitle>
                        <CardDescription>Enter scores for each team.</CardDescription>
                      </div>
                       <Badge variant={
                          match.status === "live" ? "destructive"
                          : match.status === "finished" ? "secondary"
                          : match.status === 'locked' ? 'destructive'
                          : "outline"
                        } className="text-md tracking-wider">
                          {match.status}
                        </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-96 overflow-y-auto pr-4">
                    {match.teams.length > 0 ? match.teams.map((score, index) => {
                      const team = mockTeams.find(t => t.id === score.teamId);
                      return (
                        <div key={score.teamId} className="flex items-center gap-4">
                            <div className="w-8 text-center text-lg text-muted-foreground">{index + 1}</div>
                            <Label className="flex-1 text-xl tracking-wider">{team?.name}</Label>
                            <div className="flex items-center gap-2">
                                <SkullIcon className="h-5 w-5 text-muted-foreground" />
                                <Input 
                                    type="number" 
                                    className="w-20 text-lg" 
                                    value={score.kills}
                                    onChange={(e) => handleScoreChange(match.id, score.teamId, 'kills', parseInt(e.target.value) || 0)}
                                    disabled={match.status === 'locked'}
                                />
                            </div>
                             <div className="flex items-center gap-2">
                                <Label className="text-lg">#</Label>
                                <Input 
                                    type="number" 
                                    className="w-20 text-lg" 
                                    value={score.placement}
                                    onChange={(e) => handleScoreChange(match.id, score.teamId, 'placement', parseInt(e.target.value) || 0)}
                                    disabled={match.status === 'locked'}
                                />
                            </div>
                        </div>
                      );
                    }) : <p className="text-muted-foreground text-center py-8">Match has not started. No teams assigned.</p>}
                  </CardContent>
                  {match.teams.length > 0 && (
                    <CardFooter className="justify-between">
                        <div className="flex items-center space-x-2">
                            <Switch id={`lock-${match.id}`} checked={match.status === 'locked'} onCheckedChange={() => handleLockMatch(match.id)}/>
                            <Label htmlFor={`lock-${match.id}`} className="text-lg tracking-wider flex items-center gap-2">
                                {match.status === 'locked' ? <Lock className="h-5 w-5"/> : <LockOpen className="h-5 w-5"/> }
                                Lock Scores
                            </Label>
                        </div>
                        <Button onClick={() => handleSaveChanges(match.id)} disabled={match.status === 'locked'} className="gap-2 text-lg tracking-wider">
                            <Save className="h-5 w-5"/> Save Changes
                        </Button>
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
