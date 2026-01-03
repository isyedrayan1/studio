"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShieldCheck,
  ShieldX,
  Clock,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle,
  XCircle,
  Filter,
  Eye,
} from "lucide-react";
import { useTournament, useAuth } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import { verifyScore, rejectScore } from "@/lib/firebase/scores";
import Image from "next/image";
import type { Score } from "@/lib/types";

// Free Fire BR Scoring System
const PLACEMENT_POINTS = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0];
const KILL_POINTS = 1;

export default function AdminVerificationPage() {
  const { scores, matches, days, teams, loading, error, getTeamById } = useTournament();
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const [selectedDayId, setSelectedDayId] = useState<string>("all");
  const [selectedMatchId, setSelectedMatchId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Image preview dialog
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Rejection dialog
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; score: Score | null }>({
    open: false,
    score: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");

  // Get scores that have proof images (submitted by associates)
  const scoresWithProof = useMemo(() => {
    return scores.filter(s => s.proofImageUrl);
  }, [scores]);

  // Filter scores
  const filteredScores = useMemo(() => {
    let filtered = scoresWithProof;
    
    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(s => s.verificationStatus === statusFilter);
    }
    
    // Filter by day
    if (selectedDayId !== "all") {
      const dayMatches = matches.filter(m => m.dayId === selectedDayId).map(m => m.id);
      filtered = filtered.filter(s => dayMatches.includes(s.matchId));
    }
    
    // Filter by match
    if (selectedMatchId !== "all") {
      filtered = filtered.filter(s => s.matchId === selectedMatchId);
    }
    
    return filtered;
  }, [scoresWithProof, statusFilter, selectedDayId, selectedMatchId, matches]);

  // Get matches for selected day
  const dayMatches = useMemo(() => {
    if (selectedDayId === "all") return matches;
    return matches.filter(m => m.dayId === selectedDayId);
  }, [selectedDayId, matches]);

  const calculatePoints = (kills: number, placement: number): number => {
    const placementPts = PLACEMENT_POINTS[placement - 1] ?? 0;
    return kills * KILL_POINTS + placementPts;
  };

  const getMatchInfo = (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    const day = match ? days.find(d => d.id === match.dayId) : null;
    return { match, day };
  };

  const handleVerify = async (score: Score) => {
    if (!userProfile?.id) return;
    
    setIsProcessing(true);
    try {
      await verifyScore(score.matchId, score.teamId, userProfile.id);
      toast({
        title: "Score Verified ✓",
        description: `${getTeamById(score.teamId)?.name}'s score has been verified`,
      });
    } catch (err) {
      console.error("Failed to verify:", err);
      toast({
        title: "Error",
        description: "Failed to verify score",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectDialog.score || !userProfile?.id || !rejectionReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    try {
      await rejectScore(
        rejectDialog.score.matchId,
        rejectDialog.score.teamId,
        userProfile.id,
        rejectionReason.trim()
      );
      toast({
        title: "Score Rejected",
        description: `${getTeamById(rejectDialog.score.teamId)?.name}'s score has been rejected`,
        variant: "destructive",
      });
      setRejectDialog({ open: false, score: null });
      setRejectionReason("");
    } catch (err) {
      console.error("Failed to reject:", err);
      toast({
        title: "Error",
        description: "Failed to reject score",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-600 gap-1"><ShieldCheck className="h-3 w-3" /> Verified</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="gap-1"><ShieldX className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600 gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
    }
  };

  // Stats
  const stats = {
    pending: scoresWithProof.filter(s => s.verificationStatus === "pending" || !s.verificationStatus).length,
    verified: scoresWithProof.filter(s => s.verificationStatus === "verified").length,
    rejected: scoresWithProof.filter(s => s.verificationStatus === "rejected").length,
    total: scoresWithProof.length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
        <ShieldCheck className="h-8 w-8 md:h-12 md:w-12 text-primary flex-shrink-0" />
        <div>
          <h1 className="text-2xl md:text-5xl font-bold tracking-tight md:tracking-wider">Score Verification</h1>
          <p className="text-muted-foreground text-sm md:text-xl tracking-normal md:tracking-widest mt-0.5 md:mt-1">
            Review and verify scores submitted by associates with proof images
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-yellow-600/30 bg-yellow-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-muted-foreground uppercase">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-600/30 bg-green-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
                <p className="text-xs text-muted-foreground uppercase">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-600/30 bg-red-600/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <ShieldX className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-xs text-muted-foreground uppercase">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-3xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground uppercase">Total Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Day</label>
              <Select value={selectedDayId} onValueChange={(v) => { setSelectedDayId(v); setSelectedMatchId("all"); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  {days.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      Day {day.dayNumber}: {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Match</label>
              <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by match" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Matches</SelectItem>
                  {dayMatches.map((match) => (
                    <SelectItem key={match.id} value={match.id}>
                      Match {match.matchNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scores Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions ({filteredScores.length})</CardTitle>
          <CardDescription>
            Click on a proof image to view it in full size
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-destructive">Failed to load data</p>
            </div>
          ) : filteredScores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShieldCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No submissions found</p>
              <p className="text-sm text-muted-foreground">
                {statusFilter === "pending" ? "All scores have been reviewed!" : "Try changing the filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Match</TableHead>
                    <TableHead className="text-center">Kills</TableHead>
                    <TableHead className="text-center">Placement</TableHead>
                    <TableHead className="text-center">Points</TableHead>
                    <TableHead>Proof</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScores.map((score) => {
                    const team = getTeamById(score.teamId);
                    const { match, day } = getMatchInfo(score.matchId);
                    const totalPoints = calculatePoints(score.kills, score.placement);
                    
                    return (
                      <TableRow key={score.id}>
                        <TableCell className="font-semibold">
                          {team?.name || "Unknown"}
                          {team?.tag && (
                            <span className="text-xs text-muted-foreground ml-1">[{team.tag}]</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>Match {match?.matchNumber}</p>
                            <p className="text-xs text-muted-foreground">Day {day?.dayNumber}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-primary">
                          {score.kills}
                        </TableCell>
                        <TableCell className="text-center">
                          #{score.placement}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {totalPoints}
                        </TableCell>
                        <TableCell>
                          {score.proofImageUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => setPreviewImage(score.proofImageUrl || null)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(score.verificationStatus)}
                          {score.rejectionReason && (
                            <p className="text-xs text-destructive mt-1 max-w-[150px] truncate" title={score.rejectionReason}>
                              {score.rejectionReason}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 gap-1"
                              onClick={() => handleVerify(score)}
                              disabled={isProcessing || score.verificationStatus === "verified"}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Verify
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="gap-1"
                              onClick={() => setRejectDialog({ open: true, score })}
                              disabled={isProcessing || score.verificationStatus === "rejected"}
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Proof Image</DialogTitle>
            <DialogDescription>
              Verify that the kills and placement match the submitted values
            </DialogDescription>
          </DialogHeader>
          {previewImage && (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
              <Image
                src={previewImage}
                alt="Proof screenshot"
                fill
                className="object-contain bg-muted"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewImage(null)}>
              Close
            </Button>
            {previewImage && (
              <Button asChild variant="default">
                <a href={previewImage} target="_blank" rel="noopener noreferrer" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, score: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Score</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {getTeamById(rejectDialog.score?.teamId || "")?.name}'s score submission.
              This will be shown to the associate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">
                <strong>Kills:</strong> {rejectDialog.score?.kills} | 
                <strong> Placement:</strong> #{rejectDialog.score?.placement} | 
                <strong> Points:</strong> {rejectDialog.score ? calculatePoints(rejectDialog.score.kills, rejectDialog.score.placement) : 0}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Rejection Reason *</label>
              <Textarea
                placeholder="e.g., Kills don't match the screenshot, image is blurry, wrong match screenshot..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, score: null })}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={isProcessing || !rejectionReason.trim()}
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
              Reject Score
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
