"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Play,
  RotateCcw,
  Crown,
  Swords,
  ChevronRight,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useTournament } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import type { BracketMatch } from "@/lib/types";

const ROUND_NAMES: Record<number, string> = {
  1: "Quarterfinals",
  2: "Semifinals", 
  3: "Finals",
};

const STATUS_CONFIG = {
  upcoming: { label: "Upcoming", color: "bg-slate-500" },
  live: { label: "Live", color: "bg-green-500" },
  finished: { label: "Finished", color: "bg-blue-500" },
};

export default function BracketPage() {
  const searchParams = useSearchParams();
  const dayIdParam = searchParams.get("dayId");
  
  const { 
    days, 
    matches, 
    scores, 
    teams,
    bracketMatches, 
    loading, 
    error, 
    initializeBracket, 
    updateBracketMatch,
    setWinnerAndAdvance,
    resetBracket,
    getTeamById 
  } = useTournament();
  const { toast } = useToast();

  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitDialogOpen, setIsInitDialogOpen] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>(["", "", "", ""]);
  const [selectedMatch, setSelectedMatch] = useState<BracketMatch | null>(null);
  const [isWinnerDialogOpen, setIsWinnerDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Find the CS Ranked day - either from URL param or by finding day with cs-bracket matches
  const csDay = useMemo(() => {
    if (dayIdParam) {
      const dayFromParam = days.find(d => d.id === dayIdParam);
      if (dayFromParam) return dayFromParam;
    }
    // Fallback to first day that has cs-bracket matches
    const dayWithCSMatches = days.find(d => 
      matches.some(m => m.dayId === d.id && m.type === "cs-bracket")
    );
    return dayWithCSMatches;
  }, [days, dayIdParam, matches]);
  
  const csDayId = csDay?.id || "";

  // Get bracket matches for this CS Ranked day
  const dayBracket = bracketMatches.filter(m => m.dayId === csDayId);
  const hasBracket = dayBracket.length > 0;



  // Find champion (winner of finals)
  const champion = useMemo(() => {
    const finals = dayBracket.find(m => m.round === 3);
    return finals?.winnerId ? getTeamById(finals.winnerId) : null;
  }, [dayBracket, getTeamById]);

  const handleInitializeBracket = async () => {
    if (!csDayId) {
      toast({ title: "Error", description: "CS Ranked day not found", variant: "destructive" });
      return;
    }
    
    // Validate team selection
    const validTeams = selectedTeams.filter(t => t !== "");
    if (validTeams.length !== 4) {
      toast({ title: "Error", description: "Please select exactly 4 teams", variant: "destructive" });
      return;
    }
    
    // Check for duplicates
    const uniqueTeams = new Set(validTeams);
    if (uniqueTeams.size !== 4) {
      toast({ title: "Error", description: "Please select 4 different teams", variant: "destructive" });
      return;
    }
    
    setIsInitializing(true);
    try {
      await initializeBracket(csDayId, validTeams);
      toast({ title: "Success", description: "Bracket initialized with selected teams" });
      setIsInitDialogOpen(false);
      setSelectedTeams(["", "", "", ""]);
    } catch (err) {
      console.error("Failed to initialize bracket:", err);
      toast({ title: "Error", description: "Failed to initialize bracket", variant: "destructive" });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleStartMatch = async (match: BracketMatch) => {
    try {
      await updateBracketMatch(match.id, { status: "live" });
      toast({ title: "Match Started", description: `${ROUND_NAMES[match.round]} Match ${match.matchInRound} is now live` });
    } catch (err) {
      console.error("Failed to start match:", err);
      toast({ title: "Error", description: "Failed to start match", variant: "destructive" });
    }
  };

  const handleSelectWinner = async (winnerId: string) => {
    if (!selectedMatch) return;
    try {
      await setWinnerAndAdvance(selectedMatch.id, winnerId);
      const winner = getTeamById(winnerId);
      toast({ 
        title: "Winner Set", 
        description: `${winner?.name || "Team"} advances to next round!` 
      });
      setIsWinnerDialogOpen(false);
      setSelectedMatch(null);
    } catch (err) {
      console.error("Failed to set winner:", err);
      toast({ title: "Error", description: "Failed to set winner", variant: "destructive" });
    }
  };

  const handleResetBracket = async () => {
    if (!csDayId) return;
    try {
      await resetBracket(csDayId);
      toast({ title: "Bracket Reset", description: "Bracket has been cleared" });
      setIsResetDialogOpen(false);
    } catch (err) {
      console.error("Failed to reset bracket:", err);
      toast({ title: "Error", description: "Failed to reset bracket", variant: "destructive" });
    }
  };

  const renderMatchCard = (match: BracketMatch) => {
    const team1 = match.team1Id ? getTeamById(match.team1Id) : null;
    const team2 = match.team2Id ? getTeamById(match.team2Id) : null;
    const winner = match.winnerId ? getTeamById(match.winnerId) : null;
    const canStart = match.status === "upcoming" && team1 && team2;
    const canSetWinner = match.status === "live" && team1 && team2;
    const isFinished = match.status === "finished";

    return (
      <Card key={match.id} className={`${isFinished ? "opacity-75" : ""} ${match.round === 3 ? "border-primary border-2" : ""}`}>
        <CardHeader className="py-3 px-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {ROUND_NAMES[match.round]} - Match {match.matchInRound}
            </span>
            <Badge className={`${STATUS_CONFIG[match.status].color} text-white text-xs`}>
              {STATUS_CONFIG[match.status].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-2 px-4 space-y-2">
          {/* Team 1 */}
          <div className={`flex items-center justify-between p-2 rounded-md ${
            match.winnerId === match.team1Id ? "bg-green-500/20 border border-green-500" : "bg-muted/50"
          }`}>
            <div className="flex items-center gap-2">
              {match.winnerId === match.team1Id && <Crown className="h-4 w-4 text-yellow-500" />}
              <span className="font-medium">{team1?.name || "TBD"}</span>
              {team1?.tag && <Badge variant="outline" className="text-xs">{team1.tag}</Badge>}
            </div>
          </div>
          
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <span>VS</span>
          </div>
          
          {/* Team 2 */}
          <div className={`flex items-center justify-between p-2 rounded-md ${
            match.winnerId === match.team2Id ? "bg-green-500/20 border border-green-500" : "bg-muted/50"
          }`}>
            <div className="flex items-center gap-2">
              {match.winnerId === match.team2Id && <Crown className="h-4 w-4 text-yellow-500" />}
              <span className="font-medium">{team2?.name || "TBD"}</span>
              {team2?.tag && <Badge variant="outline" className="text-xs">{team2.tag}</Badge>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-2 pt-2">
            {canStart && (
              <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={() => handleStartMatch(match)}>
                <Play className="h-3 w-3" /> Start
              </Button>
            )}
            {canSetWinner && (
              <Button size="sm" className="gap-1" onClick={() => { setSelectedMatch(match); setIsWinnerDialogOpen(true); }}>
                <Trophy className="h-3 w-3" /> Set Winner
              </Button>
            )}
            {isFinished && winner && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Check className="h-4 w-4" />
                <span>{winner.name} wins</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Trophy className="h-12 w-12 text-primary" />
        <div>
          <h1 className="text-5xl font-bold tracking-wider">
            {csDay ? `Day ${csDay.dayNumber}: ${csDay.name}` : "CS Ranked"}
          </h1>
          <p className="text-muted-foreground text-xl tracking-widest mt-1">
            Knockout Bracket — 8 Teams → 1 Champion
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link href="/admin/days">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Days
          </Button>
        </Link>
        <div className="flex gap-2">
          {hasBracket && (
            <Button variant="outline" className="gap-2" onClick={() => setIsResetDialogOpen(true)}>
              <RotateCcw className="h-4 w-4" />
              Reset Bracket
            </Button>
          )}
          {!hasBracket && (
            <Button 
              className="gap-2" 
              onClick={() => setIsInitDialogOpen(true)}
              disabled={isInitializing || !csDayId}
            >
              {isInitializing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
              Initialize Bracket
            </Button>
          )}
        </div>
      </div>

      {/* Champion Banner */}
      {champion && (
        <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500">
          <CardContent className="flex items-center justify-center gap-4 py-8">
            <Crown className="h-12 w-12 text-yellow-500" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground uppercase tracking-widest">Champion</p>
              <h2 className="text-4xl font-bold">{champion.name}</h2>
              {champion.tag && <Badge className="mt-2">{champion.tag}</Badge>}
            </div>
            <Crown className="h-12 w-12 text-yellow-500" />
          </CardContent>
        </Card>
      )}

      {/* Content */}
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
            <p className="text-xl text-muted-foreground">Loading bracket...</p>
          </CardContent>
        </Card>
      ) : !csDay ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">No CS Ranked day found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Create a day with type &quot;CS Ranked&quot; first.
            </p>
            <Link href="/admin/days" className="mt-4">
              <Button>Go to Days</Button>
            </Link>
          </CardContent>
        </Card>
      ) : !hasBracket ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Swords className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">Bracket not initialized</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Click 'Initialize Bracket' to manually select 4 teams for the knockout stage
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8">
          {/* Bracket Visualization */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            {/* Quarterfinals */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Swords className="h-5 w-5" />
                Quarterfinals
              </h3>
              <div className="space-y-4">
                {dayBracket.filter(m => m.round === 1).map(renderMatchCard)}
              </div>
            </div>

            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center">
              <ChevronRight className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Semifinals */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Swords className="h-5 w-5" />
                Semifinals
              </h3>
              <div className="space-y-4">
                {dayBracket.filter(m => m.round === 2).map(renderMatchCard)}
              </div>
            </div>
          </div>

          <Separator />

          {/* Finals */}
          <div className="flex flex-col items-center">
            <h3 className="text-2xl font-bold flex items-center gap-2 mb-4">
              <Trophy className="h-6 w-6 text-primary" />
              Grand Finals
            </h3>
            <div className="w-full max-w-md">
              {dayBracket.filter(m => m.round === 3).map(renderMatchCard)}
            </div>
          </div>
        </div>
      )}

      {/* Winner Selection Dialog */}
      <Dialog open={isWinnerDialogOpen} onOpenChange={setIsWinnerDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Select Winner</DialogTitle>
            <DialogDescription>
              Choose the winner of this match. The winner will advance to the next round.
            </DialogDescription>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-3 py-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-auto py-4"
                onClick={() => selectedMatch.team1Id && handleSelectWinner(selectedMatch.team1Id)}
              >
                <Crown className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">{getTeamById(selectedMatch.team1Id || "")?.name || "TBD"}</span>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 h-auto py-4"
                onClick={() => selectedMatch.team2Id && handleSelectWinner(selectedMatch.team2Id)}
              >
                <Crown className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">{getTeamById(selectedMatch.team2Id || "")?.name || "TBD"}</span>
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWinnerDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Bracket?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all bracket matches and results. You&apos;ll need to reinitialize the bracket.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetBracket}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset Bracket
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Initialize Bracket Dialog - Manual Team Selection */}
      <Dialog open={isInitDialogOpen} onOpenChange={setIsInitDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Initialize CS Bracket</DialogTitle>
            <DialogDescription>
              Select 4 teams for the knockout stage. Teams will be seeded as: 1 vs 4, 2 vs 3
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} className="space-y-2">
                <Label>Team {idx + 1} (Seed #{idx + 1})</Label>
                <Select
                  value={selectedTeams[idx]}
                  onValueChange={(value) => {
                    const newTeams = [...selectedTeams];
                    newTeams[idx] = value;
                    setSelectedTeams(newTeams);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name} {team.tag && `(${team.tag})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleInitializeBracket} disabled={isInitializing}>
              {isInitializing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Initialize"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
