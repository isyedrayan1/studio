"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  ImageIcon,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Trophy,
  Target,
  Crosshair,
} from "lucide-react";
import { useTournament } from "@/contexts";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Free Fire BR Scoring System
const PLACEMENT_POINTS = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0];
const KILL_POINTS = 1;

export default function AdminVerificationPage() {
  const { matches, days, scores, teams, loading, error, getTeamById } = useTournament();

  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<{ url: string; teamName: string } | null>(null);

  // Get matches for selected day
  const dayMatches = useMemo(() => {
    if (!selectedDayId) return matches;
    return matches.filter(m => m.dayId === selectedDayId);
  }, [matches, selectedDayId]);

  // Get scores for selected match
  const matchScores = useMemo(() => {
    if (!selectedMatchId) return [];
    return scores
      .filter(s => s.matchId === selectedMatchId)
      .sort((a, b) => a.placement - b.placement);
  }, [scores, selectedMatchId]);

  // Get overall stats
  const stats = useMemo(() => {
    const scoresWithProof = scores.filter(s => s.proofImageUrl);
    const scoresWithoutProof = scores.filter(s => !s.proofImageUrl && s.placement > 0);
    return {
      totalScores: scores.filter(s => s.placement > 0).length,
      withProof: scoresWithProof.length,
      withoutProof: scoresWithoutProof.length,
      proofRate: scores.length > 0 
        ? Math.round((scoresWithProof.length / scores.filter(s => s.placement > 0).length) * 100) 
        : 0,
    };
  }, [scores]);

  const calculatePoints = (kills: number, placement: number): number => {
    const placementPts = PLACEMENT_POINTS[placement - 1] ?? 0;
    return kills * KILL_POINTS + placementPts;
  };

  const selectedDay = days.find(d => d.id === selectedDayId);
  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <ShieldCheck className="h-8 w-8 md:h-12 md:w-12 text-primary flex-shrink-0" />
        <div>
          <h1 className="text-2xl md:text-5xl font-bold tracking-tight md:tracking-wider">Score Verification</h1>
          <p className="text-muted-foreground text-sm md:text-xl tracking-normal md:tracking-widest mt-0.5 md:mt-1">
            Review submitted scores with proof images for cross-checking
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold">{stats.totalScores}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Scores</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-green-500">{stats.withProof}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">With Proof</div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-500">{stats.withoutProof}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">No Proof</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/10 border-primary/30">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-primary">{stats.proofRate}%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Proof Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Day</label>
          <Select value={selectedDayId} onValueChange={(v) => { setSelectedDayId(v); setSelectedMatchId(""); }}>
            <SelectTrigger className="h-10 md:h-12">
              <SelectValue placeholder="All Days" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
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
          <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
            <SelectTrigger className="h-10 md:h-12">
              <SelectValue placeholder="Select Match to Review" />
            </SelectTrigger>
            <SelectContent>
              {dayMatches.map((match) => {
                const matchDay = days.find(d => d.id === match.dayId);
                const matchScoresCount = scores.filter(s => s.matchId === match.id && s.placement > 0).length;
                const proofsCount = scores.filter(s => s.matchId === match.id && s.proofImageUrl).length;
                return (
                  <SelectItem key={match.id} value={match.id}>
                    <div className="flex items-center gap-2">
                      <span>Match {match.matchNumber}</span>
                      {matchDay && <span className="text-muted-foreground text-xs">• Day {matchDay.dayNumber}</span>}
                      <Badge variant="outline" className="text-xs">
                        {proofsCount}/{matchScoresCount} proofs
                      </Badge>
                      {match.status === "live" && <Badge variant="default" className="text-xs">Live</Badge>}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {error ? (
          <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-16 w-16 text-destructive mb-4" />
              <p className="text-xl text-destructive font-semibold">Connection Error</p>
            </CardContent>
          </Card>
        ) : loading ? (
          <Card className="border-dashed animate-pulse">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 text-muted-foreground/50 mb-4 animate-spin" />
              <p className="text-lg text-muted-foreground">Loading scores...</p>
            </CardContent>
          </Card>
        ) : !selectedMatchId ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <ShieldCheck className="h-10 w-10 text-primary/50" />
              </div>
              <p className="text-xl text-muted-foreground font-medium">Select a Match</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Choose a match from the dropdown above to review submitted scores and proof images.
              </p>
            </CardContent>
          </Card>
        ) : matchScores.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Trophy className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <p className="text-xl text-muted-foreground font-medium">No Scores Yet</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                No scores have been submitted for this match.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Match {selectedMatch?.matchNumber} - Scores & Proof
              </CardTitle>
              <CardDescription>
                {selectedDay?.name} • {matchScores.length} teams • {matchScores.filter(s => s.proofImageUrl).length} with proof
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-16 text-center">#</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead className="text-center w-20">Kills</TableHead>
                      <TableHead className="text-center w-24">Placement</TableHead>
                      <TableHead className="text-center w-24">Points</TableHead>
                      <TableHead className="text-center w-32">Proof</TableHead>
                      <TableHead className="text-center w-20">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matchScores.map((score, idx) => {
                      const team = getTeamById(score.teamId);
                      const hasProof = !!score.proofImageUrl;
                      const points = calculatePoints(score.kills, score.placement);
                      
                      return (
                        <TableRow 
                          key={score.id}
                          className={cn(
                            idx === 0 && "bg-yellow-500/10",
                            idx === 1 && "bg-gray-400/10",
                            idx === 2 && "bg-amber-500/10",
                            !hasProof && "bg-yellow-500/5"
                          )}
                        >
                          <TableCell className="text-center font-bold">
                            {score.placement}
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">{team?.name || "Unknown"}</div>
                            {team?.tag && <div className="text-xs text-muted-foreground">[{team.tag}]</div>}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Crosshair className="h-3 w-3 text-primary" />
                              <span className="font-bold text-primary">{score.kills}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={score.placement === 1 ? "default" : "secondary"}>
                              #{score.placement}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={cn(
                              "font-bold text-lg",
                              score.placement === 1 && "text-yellow-500",
                              score.placement === 2 && "text-gray-400",
                              score.placement === 3 && "text-amber-600"
                            )}>
                              {points}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {hasProof ? (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Uploaded
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 gap-1">
                                <AlertTriangle className="h-3 w-3" />
                                Missing
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {hasProof ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="gap-1"
                                    onClick={() => setImagePreview({
                                      url: score.proofImageUrl!,
                                      teamName: team?.name || "Unknown"
                                    })}
                                  >
                                    <Eye className="h-3 w-3" />
                                    View
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh]">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <ImageIcon className="h-5 w-5" />
                                      Proof - {team?.name || "Unknown"}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    {/* Score Summary */}
                                    <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">{score.kills}</div>
                                        <div className="text-xs text-muted-foreground">Kills</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-2xl font-bold">#{score.placement}</div>
                                        <div className="text-xs text-muted-foreground">Placement</div>
                                      </div>
                                      <div className="text-center">
                                        <div className="text-2xl font-bold text-yellow-500">{points}</div>
                                        <div className="text-xs text-muted-foreground">Total Points</div>
                                      </div>
                                    </div>
                                    
                                    {/* Image */}
                                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                                      <Image
                                        src={score.proofImageUrl!}
                                        alt={`Proof for ${team?.name}`}
                                        fill
                                        className="object-contain"
                                      />
                                    </div>
                                    
                                    {/* Verification Note */}
                                    <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-sm text-blue-400">
                                      <p className="font-semibold">📋 Verification Reference</p>
                                      <p className="text-xs mt-1 text-muted-foreground">
                                        Compare the screenshot with the submitted kills ({score.kills}) and placement (#{score.placement}). 
                                        This is for cross-checking purposes only.
                                      </p>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <Button variant="ghost" size="sm" disabled className="gap-1 opacity-50">
                                <XCircle className="h-3 w-3" />
                                N/A
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Legend */}
              <div className="mt-4 p-3 bg-muted/30 rounded-lg flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500/30 rounded" />
                  <span>1st Place</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-400/30 rounded" />
                  <span>2nd Place</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-amber-500/30 rounded" />
                  <span>3rd Place</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>Proof Uploaded</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                  <span>Missing Proof</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
