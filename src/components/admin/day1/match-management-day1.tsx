"use client";

import { useState } from "react";
import { day1Matches, mockDay1Teams } from "@/lib/data";
import type { Day1Match, Day1MatchScore, Day1Team } from "@/lib/definitions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, LockOpen, Save, Swords } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const SkullIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2c-3.31 0-6 2.69-6 6 0 1.95.93 3.69 2.38 4.78C6.67 13.56 6 14.7 6 16v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2c0-1.3-.67-2.44-1.38-3.22C17.07 11.69 18 10.03 18 8c0-3.31-2.69-6-6-6z" />
      <path d="M9 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" /><path d="M15 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" /><path d="M12 17c-1.66 0-3 1.34-3 3h6c0-1.66-1.34-3-3-3z" />
    </svg>
);

export function MatchManagementDay1() {
  const [matches, setMatches] = useState<Day1Match[]>(day1Matches);
  const { toast } = useToast();

  const handleScoreChange = (matchId: number, teamId: string, field: 'kills' | 'placement', value: number) => {
    setMatches(prevMatches => prevMatches.map(match => {
        if (match.matchId === matchId) {
            const updatedTeams = match.scores.map(teamScore => 
                teamScore.teamId === teamId ? { ...teamScore, [field]: value } : teamScore
            );
            return { ...match, scores: updatedTeams };
        }
        return match;
    }));
  };
  
  const handleLockMatch = (matchId: number) => {
    setMatches(prevMatches => prevMatches.map(match => {
        if (match.matchId === matchId) {
            const newStatus = match.status === 'locked' ? 'finished' : 'locked';
            toast({
                title: `Match ${newStatus}`,
                description: `Match ${matchId} has been ${newStatus}. Score entry is ${newStatus === 'locked' ? 'disabled' : 'enabled'}.`,
            });
            return { ...match, status: newStatus };
        }
        return match;
    }));
  }

  const handleSaveChanges = (matchId: number) => {
    toast({
      title: "Scores Saved",
      description: `Scores for Match ${matchId} have been successfully saved.`,
    });
     // Here you would typically send the data to your backend.
  };

  const getTeamName = (teamId: string) => {
      return mockDay1Teams.find(t => t.teamId === teamId)?.teamName || 'Unknown Team';
  }

  return (
     <Card>
        <CardHeader>
             <CardTitle className="text-3xl tracking-wider flex items-center gap-3">
                <Swords className="h-8 w-8" />
                Match & Score Entry (Day-1)
            </CardTitle>
            <CardDescription>Enter Kills and Placement for each of the 9 qualifier matches.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="multiple" className="w-full space-y-4">
                {matches.map((match) => (
                    <AccordionItem key={`match-${match.matchId}`} value={`item-${match.matchId}`} className="border rounded-lg">
                    <AccordionTrigger className="text-2xl tracking-wider text-accent p-4 hover:no-underline">
                        <div className="flex justify-between w-full items-center">
                            <span>Match {match.matchId} <span className="text-muted-foreground text-lg ml-2">({match.groupsCombined.join(' + ')})</span></span>
                            <Badge variant={
                                match.status === "finished" ? "secondary"
                                : match.status === 'locked' ? 'destructive'
                                : "outline"
                                } className="text-md tracking-wider mr-4">
                                {match.status}
                            </Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-4">
                        {match.scores.map((score, index) => (
                            <div key={score.teamId} className="flex items-center gap-4 p-2 rounded-md bg-secondary/50">
                                <div className="w-8 text-center text-lg text-muted-foreground">{index + 1}</div>
                                <Label className="flex-1 text-xl tracking-wider">{getTeamName(score.teamId)}</Label>
                                <div className="flex items-center gap-2">
                                    <SkullIcon className="h-5 w-5 text-muted-foreground" />
                                    <Input 
                                        type="number" 
                                        className="w-20 text-lg" 
                                        value={score.kills}
                                        onChange={(e) => handleScoreChange(match.matchId, score.teamId, 'kills', parseInt(e.target.value) || 0)}
                                        disabled={match.status === 'locked'}
                                        min="0"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Label className="text-lg">#</Label>
                                    <Input 
                                        type="number" 
                                        className="w-20 text-lg" 
                                        value={score.placement}
                                        onChange={(e) => handleScoreChange(match.matchId, score.teamId, 'placement', parseInt(e.target.value) || 0)}
                                        disabled={match.status === 'locked'}
                                        min="1"
                                        max={match.scores.length}
                                    />
                                </div>
                            </div>
                        ))}
                        </div>
                        <div className="flex justify-between mt-4 pt-4 border-t">
                            <div className="flex items-center space-x-2">
                                <Switch id={`lock-${match.matchId}`} checked={match.status === 'locked'} onCheckedChange={() => handleLockMatch(match.matchId)}/>
                                <Label htmlFor={`lock-${match.matchId}`} className="text-lg tracking-wider flex items-center gap-2">
                                    {match.status === 'locked' ? <Lock className="h-5 w-5"/> : <LockOpen className="h-5 w-5"/> }
                                    Lock Scores
                                </Label>
                            </div>
                            <Button onClick={() => handleSaveChanges(match.matchId)} disabled={match.status === 'locked'} className="gap-2 text-lg tracking-wider">
                                <Save className="h-5 w-5"/> Save Changes
                            </Button>
                        </div>
                    </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </CardContent>
     </Card>
  );
}
