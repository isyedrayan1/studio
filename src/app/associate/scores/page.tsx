"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { useTournament } from "@/contexts";
import { useToast } from "@/hooks/use-toast";

// Default placement points (can be moved to tournament settings later)
const PLACEMENT_POINTS = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0];
const KILL_POINTS = 1;

export default function AssociateScoresPage() {
  const { matches, days, scores, loading, error, setScore, getTeamById } = useTournament();
  const { toast } = useToast();

  // Selection
  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Local score edits - keyed by matchId to avoid stale state
  const [localScores, setLocalScores] = useState<Record<string, Record<string, { kills: number; placement: number }>>>({});

  const filteredMatches = selectedDayId ? matches.filter(m => m.dayId === selectedDayId) : [];
  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  // Get or initialize local scores for current match
  const currentMatchScores = useMemo(() => {
    if (!selectedMatch) return {};
    
    // If we have local edits, use them
    if (localScores[selectedMatchId]) {
      return localScores[selectedMatchId];
    }
    
    // Otherwise initialize from server data
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

  const updateLocalScore = (teamId: string, field: "kills" | "placement", value: number) => {
    setLocalScores(prev => ({
      ...prev,
      [selectedMatchId]: {
        ...currentMatchScores,
        [teamId]: { ...currentMatchScores[teamId], [field]: value },
      },
    }));
  };

  const calculatePoints = (kills: number, placement: number): number => {
    const placementPts = PLACEMENT_POINTS[placement - 1] ?? 0;
    return kills * KILL_POINTS + placementPts;
  };

  const handleSave = async () => {
    if (!selectedMatch) return;
    setIsSaving(true);
    try {
      for (const teamId of Object.keys(currentMatchScores)) {
        const { kills, placement } = currentMatchScores[teamId];
        await setScore(selectedMatchId, teamId, kills, placement);
      }
      // Clear local edits after successful save
      setLocalScores(prev => {
        const next = { ...prev };
        delete next[selectedMatchId];
        return next;
      });
      toast({ title: "Saved", description: "Scores saved successfully" });
    } catch (err: unknown) {
      console.error("Failed to save scores:", err);
      toast({ title: "Error", description: "Failed to save scores", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Trophy className="h-12 w-12 text-primary" />
        <div>
          <h1 className="text-5xl font-bold tracking-wider">Score Entry</h1>
          <p className="text-muted-foreground text-xl tracking-widest mt-1">
            Enter kills and placement for each team.
          </p>
        </div>
      </div>

      {/* Selection */}
      <div className="flex items-center gap-4 flex-wrap">
        <Select value={selectedDayId} onValueChange={(v) => { setSelectedDayId(v); setSelectedMatchId(""); }}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Day" />
          </SelectTrigger>
          <SelectContent>
            {days.map((day) => (
              <SelectItem key={day.id} value={day.id}>
                Day {day.dayNumber}: {day.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedMatchId} onValueChange={setSelectedMatchId} disabled={!selectedDayId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Match" />
          </SelectTrigger>
          <SelectContent>
            {filteredMatches.map((match) => (
              <SelectItem key={match.id} value={match.id}>
                Match {match.matchNumber}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedMatch && (
          <Badge className="ml-auto">
            {selectedMatch.teamIds.length} teams
          </Badge>
        )}
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
            <p className="text-xl text-muted-foreground">Select a day and match to enter scores</p>
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
            <CardTitle>Match {selectedMatch?.matchNumber} Scores</CardTitle>
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Scores
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="w-[100px]">Kills</TableHead>
                  <TableHead className="w-[100px]">Placement</TableHead>
                  <TableHead className="w-[100px] text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedMatch?.teamIds.map((teamId, idx) => {
                  const team = getTeamById(teamId);
                  const local = currentMatchScores[teamId] || { kills: 0, placement: idx + 1 };
                  const points = calculatePoints(local.kills, local.placement);
                  return (
                    <TableRow key={teamId}>
                      <TableCell className="font-mono">{idx + 1}</TableCell>
                      <TableCell className="font-semibold">
                        {team?.name || "Unknown"} 
                        {team?.tag && <span className="text-muted-foreground ml-1">({team.tag})</span>}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={local.kills}
                          onChange={(e) => updateLocalScore(teamId, "kills", parseInt(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          max={12}
                          value={local.placement}
                          onChange={(e) => updateLocalScore(teamId, "placement", parseInt(e.target.value) || 1)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg">{points}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Points = Kills × {KILL_POINTS} + Placement Points</p>
              <p>Placement: 1st={PLACEMENT_POINTS[0]}, 2nd={PLACEMENT_POINTS[1]}, 3rd={PLACEMENT_POINTS[2]}... 12th={PLACEMENT_POINTS[11]}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
