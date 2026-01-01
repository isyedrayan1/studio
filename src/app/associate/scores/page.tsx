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
  CheckCircle,
} from "lucide-react";
import { useTournament, useAuth } from "@/contexts";
import { useToast } from "@/hooks/use-toast";

// Free Fire BR Scoring System
const PLACEMENT_POINTS = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0];
const KILL_POINTS = 1;

export default function AssociateScoresPage() {
  const { matches, days, scores, loading, error, setScore, getTeamById } = useTournament();
  const { associateAccount, userProfile } = useAuth();
  const { toast } = useToast();

  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Local score edits (only for my team)
  const [localScore, setLocalScore] = useState<{ kills: number; placement: number } | null>(null);

  const myTeamId = associateAccount?.teamId;
  const myTeam = myTeamId ? getTeamById(myTeamId) : null;

  // Filter matches that include my team
  const myMatches = useMemo(() => {
    if (!myTeamId) return [];
    return matches.filter(m => m.teamIds.includes(myTeamId));
  }, [matches, myTeamId]);

  const filteredMatches = selectedDayId ? myMatches.filter(m => m.dayId === selectedDayId) : myMatches;
  const selectedDay = days.find(d => d.id === selectedDayId);
  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  // Auto-select active day and live match
  useEffect(() => {
    if (!selectedDayId && days.length > 0) {
      const activeDay = days.find(d => d.status === "active");
      if (activeDay) {
        const activeDayMatches = myMatches.filter(m => m.dayId === activeDay.id);
        if (activeDayMatches.length > 0) {
          setSelectedDayId(activeDay.id);
        }
      } else if (myMatches.length > 0) {
        setSelectedDayId(myMatches[0].dayId);
      }
    }
  }, [days, selectedDayId, myMatches]);

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

  // Get or initialize local score for my team
  const currentScore = useMemo(() => {
    if (!selectedMatch || !myTeamId) return null;
    
    // If we have local edit, use it
    if (localScore) {
      return localScore;
    }
    
    // Otherwise initialize from server data
    const existing = scores.find(s => s.matchId === selectedMatchId && s.teamId === myTeamId);
    return {
      kills: existing?.kills ?? 0,
      placement: existing?.placement ?? 1,
    };
  }, [selectedMatchId, selectedMatch, scores, localScore, myTeamId]);

  // Check if match is locked
  const isMatchLocked = selectedMatch?.locked ?? false;
  const canEdit = selectedDay?.status === "active" && selectedMatch?.status === "live" && !isMatchLocked;

  const updateLocalScore = (field: "kills" | "placement", value: number) => {
    if (!canEdit) {
      toast({ 
        title: "Cannot edit", 
        description: isMatchLocked ? "Match is locked" : "Day or match not active", 
        variant: "destructive" 
      });
      return;
    }
    setLocalScore(prev => ({
      kills: prev?.kills ?? 0,
      placement: prev?.placement ?? 1,
      [field]: value,
    }));
  };

  const calculatePoints = (kills: number, placement: number): number => {
    const placementPts = PLACEMENT_POINTS[placement - 1] ?? 0;
    return kills * KILL_POINTS + placementPts;
  };

  const handleManualSave = async () => {
    if (!selectedMatchId || !myTeamId || !currentScore || !userProfile?.id) return;
    setIsSaving(true);
    try {
      await setScore(selectedMatchId, myTeamId, currentScore.kills, currentScore.placement, userProfile.id, selectedDay?.type);
      setLocalScore(null);
      toast({ 
        title: "Score Submitted! ✓", 
        description: `${currentScore.kills} kills, ${calculatePoints(currentScore.kills, currentScore.placement)} points`,
        duration: 3000,
      });
    } catch (err: unknown) {
      console.error("Failed to save:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to save";
      toast({ title: "Error", description: errMsg, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Check if score has been submitted
  const existingScore = scores.find(s => s.matchId === selectedMatchId && s.teamId === myTeamId);
  const hasSubmittedScore = !!existingScore && existingScore.placement > 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Trophy className="h-12 w-12 text-primary" />
        <div>
          <h1 className="text-5xl font-bold tracking-wider">Score Entry</h1>
          <p className="text-muted-foreground text-xl tracking-widest mt-1">
            Enter kills and placement for your team.
          </p>
        </div>
      </div>

      {/* Scoring Guide */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold">Scoring System:</p>
              <p className="text-xs text-muted-foreground">1 Kill = {KILL_POINTS} point | Placement: 1st={PLACEMENT_POINTS[0]}pts, 2nd={PLACEMENT_POINTS[1]}pts, 3rd={PLACEMENT_POINTS[2]}pts... 12th={PLACEMENT_POINTS[11]}pts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Day</label>
          <Select value={selectedDayId} onValueChange={(v) => { setSelectedDayId(v); setSelectedMatchId(""); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select Day" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day.id} value={day.id}>
                  <div className="flex items-center gap-2">
                    <span>Day {day.dayNumber}: {day.name}</span>
                    {day.status === "active" && <Badge variant="default" className="text-xs">Active</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Match</label>
          <Select value={selectedMatchId} onValueChange={setSelectedMatchId} disabled={!selectedDayId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Match" />
            </SelectTrigger>
            <SelectContent>
              {filteredMatches.map((match) => (
                <SelectItem key={match.id} value={match.id}>
                  <div className="flex items-center gap-2">
                    <span>Match {match.matchNumber}</span>
                    {match.status === "live" && <Badge variant="default" className="text-xs">Live</Badge>}
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
      ) : !myTeam ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">No team assigned to your account</p>
          </CardContent>
        </Card>
      ) : !selectedMatchId || !currentScore ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">Select a day and match to enter scores</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Submitted Score Display */}
          {hasSubmittedScore && (
            <Card className="border-green-600 bg-green-50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" />
                  Score Submitted Successfully
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Kills</p>
                    <p className="text-2xl font-bold">{existingScore?.kills || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Placement</p>
                    <p className="text-2xl font-bold">#{existingScore?.placement || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Placement Pts</p>
                    <p className="text-2xl font-bold">{PLACEMENT_POINTS[(existingScore?.placement || 1) - 1] || 0}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Total Points</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {calculatePoints(existingScore?.kills || 0, existingScore?.placement || 1)}
                    </p>
                  </div>
                </div>
                {existingScore?.isBooyah && (
                  <div className="mt-4">
                    <Badge variant="default" className="text-base">🏆 Booyah! Winner!</Badge>
                  </div>
                )}
                {existingScore?.hasChampionRush && (
                  <div className="mt-2">
                    <Badge variant="destructive" className="text-base">🔥 Champion Rush Badge</Badge>
                  </div>
                )}
                {canEdit && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      You can edit your score below until the match is locked.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Score Entry Form */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {hasSubmittedScore ? "Edit Score" : "Enter Score"} - {myTeam.name}
                </CardTitle>
                {isMatchLocked && (
                  <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Match is locked
                  </p>
                )}
                {!canEdit && !isMatchLocked && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedDay?.status !== "active" ? "Day must be active" : "Match must be live"} to edit scores
                  </p>
                )}
              </div>
              <Button onClick={handleManualSave} disabled={isSaving || !canEdit} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {hasSubmittedScore ? "Update Score" : "Submit Score"}
              </Button>
            </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Kills</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={currentScore.kills === 0 ? "" : currentScore.kills}
                    onChange={(e) => updateLocalScore("kills", parseInt(e.target.value) || 0)}
                    disabled={!canEdit}
                    className="text-center font-bold text-2xl h-16 cursor-text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Placement (1-12)</label>
                  <Input
                    type="number"
                    min={1}
                    max={12}
                    placeholder="1-12"
                    value={currentScore.placement}
                    onChange={(e) => updateLocalScore("placement", parseInt(e.target.value) || 1)}
                    disabled={!canEdit}
                    className="text-center font-bold text-2xl h-16 cursor-text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Total Points</label>
                  <div className="h-16 flex items-center justify-center border rounded-md bg-muted">
                    <span className="text-4xl font-bold text-primary">
                      {calculatePoints(currentScore.kills, currentScore.placement)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-semibold">Scoring System:</p>
                <p>• Each Kill = {KILL_POINTS} point</p>
                <p>• Placement Points: 1st={PLACEMENT_POINTS[0]}, 2nd={PLACEMENT_POINTS[1]}, 3rd={PLACEMENT_POINTS[2]}, 4th={PLACEMENT_POINTS[3]}, 5th={PLACEMENT_POINTS[4]}, 6th={PLACEMENT_POINTS[5]}, 7th={PLACEMENT_POINTS[6]}, 8th={PLACEMENT_POINTS[7]}, 9th={PLACEMENT_POINTS[8]}, 10th={PLACEMENT_POINTS[9]}, 11th={PLACEMENT_POINTS[10]}, 12th={PLACEMENT_POINTS[11]}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}
