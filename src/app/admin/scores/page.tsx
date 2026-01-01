"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trophy,
  Loader2,
  AlertCircle,
  Save,
  Lock,
  Unlock,
} from "lucide-react";
import { useTournament, useAuth } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import { toggleMatchLock } from "@/lib/firebase";

// Free Fire BR Scoring System
const PLACEMENT_POINTS = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0];
const KILL_POINTS = 1;

export default function ScoresPage() {
  const { matches, days, scores, loading, error, setScore, getTeamById } = useTournament();
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Local score edits
  const [localScores, setLocalScores] = useState<Record<string, Record<string, { kills: number; placement: number }>>>({});

  const filteredMatches = selectedDayId ? matches.filter(m => m.dayId === selectedDayId) : [];
  const selectedDay = days.find(d => d.id === selectedDayId);
  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  // Auto-select active day and live match on load
  useEffect(() => {
    if (!selectedDayId && days.length > 0) {
      const activeDay = days.find(d => d.status === "active");
      if (activeDay) {
        setSelectedDayId(activeDay.id);
      } else if (days.length > 0) {
        setSelectedDayId(days[0].id);
      }
    }
  }, [days, selectedDayId]);

  useEffect(() => {
    if (selectedDayId && !selectedMatchId && filteredMatches.length > 0) {
      const liveMatch = filteredMatches.find(m => m.status === "live");
      if (liveMatch) {
        setSelectedMatchId(liveMatch.id);
      } else if (filteredMatches.length > 0) {
        setSelectedMatchId(filteredMatches[0].id);
      }
    }
  }, [selectedDayId, selectedMatchId, filteredMatches]);

  // Initialize local scores from server
  const currentMatchScores = useMemo(() => {
    if (!selectedMatch) return {};
    
    if (localScores[selectedMatchId]) {
      return localScores[selectedMatchId];
    }
    
    const initial: Record<string, { kills: number; placement: number }> = {};
    selectedMatch.teamIds.forEach((teamId, idx) => {
      const existing = scores.find(s => s.matchId === selectedMatchId && s.teamId === teamId);
      initial[teamId] = {
        kills: existing?.kills ?? 0,
        placement: existing?.placement ?? (idx + 1),
      };
    });
    return initial;
  }, [selectedMatchId, selectedMatch, scores, localScores]);

  const isMatchLocked = selectedMatch?.locked ?? false;
  const canEdit = selectedDay?.status === "active" && selectedMatch?.status === "live" && !isMatchLocked;

  const updateLocalScore = (teamId: string, field: "kills" | "placement", value: number) => {
    if (!canEdit) {
      toast({
        title: "Cannot edit",
        description: isMatchLocked ? "Match is locked" : "Day must be active and match must be live",
        variant: "destructive",
      });
      return;
    }
    setLocalScores({
      ...localScores,
      [selectedMatchId]: {
        ...currentMatchScores,
        [teamId]: { ...currentMatchScores[teamId], [field]: value },
      },
    });
  };

  const calculatePoints = (kills: number, placement: number): number => {
    const placementPts = PLACEMENT_POINTS[placement - 1] ?? 0;
    return kills * KILL_POINTS + placementPts;
  };

  const handleSave = async () => {
    if (!selectedMatch || !userProfile) return;
    
    const matchScores = localScores[selectedMatchId];
    if (!matchScores) return;

    setIsSaving(true);
    try {
      for (const teamId of Object.keys(matchScores)) {
        const { kills, placement } = matchScores[teamId];
        await setScore(selectedMatchId, teamId, kills, placement, userProfile.id, selectedDay?.type);
      }
      
      toast({ 
        title: "Scores Saved",
        description: `Updated ${Object.keys(matchScores).length} teams`,
      });
      
      // Clear local edits
      setLocalScores(prev => {
        const next = { ...prev };
        delete next[selectedMatchId];
        return next;
      });
    } catch (err: any) {
      console.error("Failed to save scores:", err);
      toast({ 
        title: "Error", 
        description: err.message || "Failed to save scores", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleMatchLock = async () => {
    if (!selectedMatchId) return;
    try {
      await toggleMatchLock(selectedMatchId, isMatchLocked);
      toast({
        title: isMatchLocked ? "Match Unlocked" : "Match Locked",
        description: isMatchLocked ? "Scores can now be edited" : "No one can edit scores until unlocked",
      });
    } catch (err) {
      console.error("Failed to toggle match lock:", err);
      toast({
        title: "Error",
        description: "Failed to toggle match lock",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold tracking-wider">Score Management</h1>
        <p className="text-muted-foreground text-xl tracking-widest mt-1">
          Real-time score entry for all matches
        </p>
      </div>

      {/* Scoring Guide */}
      <Card className="bg-muted/20 border-primary/20">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <h3 className="font-bold">Kill Points</h3>
              </div>
              <p className="text-2xl font-bold">{KILL_POINTS} point per kill</p>
              <p className="text-xs text-muted-foreground">Rewards aggressive gameplay</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <h3 className="font-bold">Placement Points</h3>
              </div>
              <p className="text-sm">1st: {PLACEMENT_POINTS[0]} • 2nd: {PLACEMENT_POINTS[1]} • 3rd: {PLACEMENT_POINTS[2]}</p>
              <p className="text-xs text-muted-foreground">Higher finish = more points</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                <h3 className="font-bold">Total Score Formula</h3>
              </div>
              <p className="text-sm font-mono">Kills + Placement</p>
              <p className="text-xs text-muted-foreground">Example: 8 kills + 2nd = 17 pts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Tournament Day</label>
          <Select value={selectedDayId} onValueChange={(v) => { setSelectedDayId(v); setSelectedMatchId(""); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day.id} value={day.id}>
                  <div className="flex items-center gap-2">
                    Day {day.dayNumber}: {day.name}
                    {day.status === "active" && (
                      <Badge variant="default" className="ml-2">Active</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Match</label>
          <Select value={selectedMatchId} onValueChange={setSelectedMatchId} disabled={!selectedDayId}>
            <SelectTrigger>
              <SelectValue placeholder="Select match" />
            </SelectTrigger>
            <SelectContent>
              {filteredMatches.map((match) => (
                <SelectItem key={match.id} value={match.id}>
                  <div className="flex items-center gap-2">
                    Match {match.matchNumber}
                    {match.status === "live" && (
                      <Badge variant="destructive" className="ml-2">● Live</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Score Entry */}
      {error ? (
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <p className="text-xl text-destructive font-semibold">Connection Error</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 text-muted-foreground/50 mb-4 animate-spin" />
            <p className="text-xl text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : !selectedMatchId ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">Select a match to enter scores</p>
          </CardContent>
        </Card>
      ) : selectedMatch && selectedMatch.teamIds.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">No teams in this match</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Match {selectedMatch?.matchNumber} - All Teams
                {isMatchLocked && (
                  <Badge variant="destructive" className="ml-2">
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {selectedMatch?.teamIds.length} teams • {canEdit ? "Editing enabled" : "Read-only"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleToggleMatchLock} 
                variant={isMatchLocked ? "destructive" : "outline"}
                className="gap-2"
              >
                {isMatchLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {isMatchLocked ? "Unlock Match" : "Lock Match"}
              </Button>
              <Button onClick={handleSave} disabled={isSaving || !canEdit} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSaving ? "Saving..." : "Save Scores"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead className="w-[120px] text-center">Kills</TableHead>
                  <TableHead className="w-[120px] text-center">Placement</TableHead>
                  <TableHead className="w-[100px] text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedMatch?.teamIds.map((teamId, idx) => {
                  const team = getTeamById(teamId);
                  const local = currentMatchScores[teamId] || { kills: 0, placement: idx + 1 };
                  const points = calculatePoints(local.kills, local.placement);
                  
                  return (
                    <TableRow key={teamId}>
                      <TableCell className="font-mono text-center">{idx + 1}</TableCell>
                      <TableCell className="font-semibold">
                        {team?.name || "Unknown"} 
                        {team?.tag && <span className="text-muted-foreground ml-1">({team.tag})</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={local.kills === 0 ? "" : local.kills}
                          onChange={(e) => updateLocalScore(teamId, "kills", parseInt(e.target.value) || 0)}
                          disabled={!canEdit}
                          className="w-20 text-center font-bold text-lg mx-auto cursor-text"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min={1}
                          max={12}
                          placeholder="1-12"
                          value={local.placement}
                          onChange={(e) => updateLocalScore(teamId, "placement", parseInt(e.target.value) || 1)}
                          disabled={!canEdit}
                          className="w-20 text-center font-bold text-lg mx-auto cursor-text"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-lg px-4 py-1">
                          {points}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* Placement Reference */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
              <h4 className="font-bold">📊 Placement Points Reference:</h4>
              <div className="grid grid-cols-6 gap-2">
                {PLACEMENT_POINTS.map((pts, idx) => (
                  <div key={idx} className="text-center">
                    <span className="font-mono">{idx + 1}st:</span>
                    <span className="ml-1 font-bold text-primary">{pts}pts</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
