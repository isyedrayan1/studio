"use client";

import { useState } from "react";
import type { Match, Team, Score } from "@/lib/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, LockOpen, Save, Gamepad2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const SkullIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2c-3.31 0-6 2.69-6 6 0 1.95.93 3.69 2.38 4.78C6.67 13.56 6 14.7 6 16v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2c0-1.3-.67-2.44-1.38-3.22C17.07 11.69 18 10.03 18 8c0-3.31-2.69-6-6-6z" />
      <path d="M9 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" /><path d="M15 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" /><path d="M12 17c-1.66 0-3 1.34-3 3h6c0-1.66-1.34-3-3-3z" />
    </svg>
);

interface MatchManagementProps {
  matches?: Match[];
  teams?: Team[];
  scores?: Score[];
  onUpdateScore?: (matchId: string, teamId: string, kills: number, placement: number) => Promise<void>;
  onLockMatch?: (matchId: string, locked: boolean) => Promise<void>;
}

export function MatchManagement({ 
  matches = [], 
  teams = [], 
  scores = [],
  onUpdateScore,
  onLockMatch 
}: MatchManagementProps) {
  const [localScores, setLocalScores] = useState<Record<string, { kills: number; placement: number }>>({});
  const { toast } = useToast();

  // Get score for a team in a match
  const getScore = (matchId: string, teamId: string) => {
    const key = `${matchId}-${teamId}`;
    if (localScores[key]) return localScores[key];
    const score = scores.find(s => s.matchId === matchId && s.teamId === teamId);
    return { kills: score?.kills ?? 0, placement: score?.placement ?? 0 };
  };

  // Get team name by ID
  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name ?? 'Unknown Team';
  };

  // Group matches by day
  const matchesByDay = matches.reduce((acc, match) => {
    const dayId = match.dayId;
    (acc[dayId] = acc[dayId] || []).push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  const handleScoreChange = (matchId: string, teamId: string, field: 'kills' | 'placement', value: number) => {
    const key = `${matchId}-${teamId}`;
    const current = getScore(matchId, teamId);
    setLocalScores(prev => ({
      ...prev,
      [key]: { ...current, [field]: value }
    }));
  };
  
  const handleLockMatch = async (matchId: string, currentlyLocked: boolean) => {
    try {
      await onLockMatch?.(matchId, !currentlyLocked);
      toast({
        title: currentlyLocked ? "Match Unlocked" : "Match Locked",
        description: `Match has been ${currentlyLocked ? 'unlocked' : 'locked'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update match status.",
        variant: "destructive"
      });
    }
  };

  const handleSaveChanges = async (match: Match) => {
    try {
      // Save all local scores for this match
      for (const teamId of match.teamIds) {
        const key = `${match.id}-${teamId}`;
        if (localScores[key]) {
          await onUpdateScore?.(match.id, teamId, localScores[key].kills, localScores[key].placement);
        }
      }
      toast({
        title: "Scores Saved",
        description: "Scores for the match have been successfully saved.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save scores.",
        variant: "destructive"
      });
    }
  };

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Gamepad2 className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-2xl font-semibold tracking-wider mb-2">No Matches Yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Create days and add matches to start managing scores. Matches will appear here once configured.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
      {Object.entries(matchesByDay).map(([dayId, dayMatches], index) => (
        <AccordionItem key={dayId} value={`item-${index}`}>
          <AccordionTrigger className="text-4xl tracking-wider text-accent py-6">
            Day {index + 1}
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1">
              {dayMatches.map((match, matchIndex) => {
                const isLocked = match.status === 'locked';
                return (
                  <Card key={match.id} className={isLocked ? 'border-destructive/50' : ''}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-3xl tracking-wider">Match {matchIndex + 1}</CardTitle>
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
                      {match.teamIds.length > 0 ? match.teamIds.map((teamId, teamIndex) => {
                        const score = getScore(match.id, teamId);
                        return (
                          <div key={teamId} className="flex items-center gap-4">
                            <div className="w-8 text-center text-lg text-muted-foreground">{teamIndex + 1}</div>
                            <Label className="flex-1 text-xl tracking-wider">{getTeamName(teamId)}</Label>
                            <div className="flex items-center gap-2">
                              <SkullIcon className="h-5 w-5 text-muted-foreground" />
                              <Input 
                                type="number" 
                                className="w-20 text-lg" 
                                value={score.kills}
                                onChange={(e) => handleScoreChange(match.id, teamId, 'kills', parseInt(e.target.value) || 0)}
                                disabled={isLocked}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Label className="text-lg">#</Label>
                              <Input 
                                type="number" 
                                className="w-20 text-lg" 
                                value={score.placement}
                                onChange={(e) => handleScoreChange(match.id, teamId, 'placement', parseInt(e.target.value) || 0)}
                                disabled={isLocked}
                              />
                            </div>
                          </div>
                        );
                      }) : (
                        <p className="text-muted-foreground text-center py-8">
                          Match has not started. No teams assigned.
                        </p>
                      )}
                    </CardContent>
                    {match.teamIds.length > 0 && (
                      <CardFooter className="justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`lock-${match.id}`} 
                            checked={isLocked} 
                            onCheckedChange={() => handleLockMatch(match.id, isLocked)}
                          />
                          <Label htmlFor={`lock-${match.id}`} className="text-lg tracking-wider flex items-center gap-2">
                            {isLocked ? <Lock className="h-5 w-5"/> : <LockOpen className="h-5 w-5"/> }
                            Lock Scores
                          </Label>
                        </div>
                        <Button 
                          onClick={() => handleSaveChanges(match)} 
                          disabled={isLocked} 
                          className="gap-2 text-lg tracking-wider"
                        >
                          <Save className="h-5 w-5"/> Save Changes
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
