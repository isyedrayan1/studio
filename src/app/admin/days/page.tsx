"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Play,
  Pause,
  CheckCircle,
  Lock,
  Users,
  Trophy,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useTournament } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import type { Day, LeaderboardEntry } from "@/lib/types";
import { CelebrationDialog } from "@/components/admin/celebration-dialog";
import { calculateLeaderboard } from "@/lib/utils-tournament";

const STATUS_CONFIG = {
  upcoming: { label: "Upcoming", color: "bg-slate-500", icon: Clock },
  active: { label: "Active", color: "bg-green-500", icon: Play },
  paused: { label: "Paused", color: "bg-yellow-500", icon: Pause },
  completed: { label: "Completed", color: "bg-blue-500", icon: CheckCircle },
  locked: { label: "Locked", color: "bg-red-500", icon: Lock },
};

export default function DaysPage() {
  const { days, teams, groups, matches, scores, loading, error, addDay, updateDay, deleteDay, getGroupsByDay, deleteMatch } = useTournament();
  const { toast } = useToast();

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formName, setFormName] = useState<string>("Day 1");
  const [formQualifyCount, setFormQualifyCount] = useState<number>(12);
  const [formDayNumber, setFormDayNumber] = useState<number>(1);

  // End day confirmation
  const [isEndDayOpen, setIsEndDayOpen] = useState(false);
  const [dayToEnd, setDayToEnd] = useState<Day | null>(null);

  // Celebration dialog
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [celebrationDay, setCelebrationDay] = useState<Day | null>(null);
  const [qualifiedTeams, setQualifiedTeams] = useState<LeaderboardEntry[]>([]);

  // Auto-calculate next day number
  const getNextDayNumber = () => {
    if (days.length === 0) return 1;
    return Math.max(...days.map((d) => d.dayNumber)) + 1;
  };

  const resetForm = () => {
    const nextNum = getNextDayNumber();
    setFormName(`Day ${nextNum}`);
    setFormDayNumber(nextNum);
    setFormQualifyCount(12);
  };

  // Auto-update qualifyCount when type changes


  const openEditDialog = (day: Day) => {
    setSelectedDay(day);
    setFormName(day.name);
    setFormDayNumber(day.dayNumber);
    setFormQualifyCount(day.qualifyCount || 12);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (day: Day) => {
    setSelectedDay(day);
    setIsDeleteOpen(true);
  };

  const handleAdd = async () => {
    setIsSubmitting(true);
    try {
      await addDay({
        dayNumber: formDayNumber,
        name: formName || `Day ${formDayNumber}`,
        status: "upcoming",
        qualifyCount: formQualifyCount,
      });
      toast({ title: "Success", description: `${formName || 'Day'} created` });
      setIsAddOpen(false);
      resetForm();
    } catch (err: unknown) {
      console.error("Failed to create day:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: `Failed: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedDay) return;
    setIsSubmitting(true);
    try {
      await updateDay(selectedDay.id, {
        dayNumber: formDayNumber,
        name: formName,
        qualifyCount: formQualifyCount,
      });
      toast({ title: "Success", description: `${formName} updated` });
      setIsEditOpen(false);
      setSelectedDay(null);
      resetForm();
    } catch (err: unknown) {
      console.error("Failed to update day:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: `Failed: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete day and its related matches
  const handleDelete = async () => {
    if (!selectedDay) return;
    setIsSubmitting(true);
    try {
      // 1. Find all matches for this day
      const dayMatches = matches.filter(m => m.dayId === selectedDay.id);

      // 2. Delete all matches (scores cascade delete from matches usually, or need explicit check)
      // Assuming firebase deleteMatch handles its own score cleanup or we just delete matches
      await Promise.all(dayMatches.map(m => deleteMatch(m.id)));

      // 3. Delete the day
      await deleteDay(selectedDay.id);
      toast({ title: "Success", description: `Day ${selectedDay.dayNumber} and its matches deleted` });
      setIsDeleteOpen(false);
      setSelectedDay(null);
    } catch (err: unknown) {
      console.error("Failed to delete day:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: `Failed: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (day: Day, newStatus: Day["status"]) => {
    try {
      const now = new Date().toISOString();
      const updates: Partial<Day> = { status: newStatus };

      // Auto-capture timestamps
      if (newStatus === "active" && day.status === "upcoming") {
        updates.startTime = now;
      }
      if (newStatus === "completed") {
        updates.endTime = now;
      }
      // Clear endTime when restarting a completed day
      if (newStatus === "active" && day.status === "completed") {
        updates.endTime = undefined;
      }

      await updateDay(day.id, updates);
      toast({ title: "Status Updated", description: `Day ${day.dayNumber} is now ${STATUS_CONFIG[newStatus].label}` });
    } catch (err: unknown) {
      console.error("Failed to update status:", err);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const openEndDayConfirm = (day: Day) => {
    setDayToEnd(day);
    setIsEndDayOpen(true);
  };

  const handleEndDay = async () => {
    if (!dayToEnd) return;

    try {
      // Calculate qualified teams before ending day
      const dayMatches = matches.filter(m => m.dayId === dayToEnd.id);
      const dayScores = scores.filter(s =>
        dayMatches.some(m => m.id === s.matchId)
      );
      const dayGroups = getGroupsByDay(dayToEnd.id);
      
      const qualifyCount = dayToEnd.qualifyCount || 12;
      
      const leaderboard = calculateLeaderboard(
        teams,
        dayMatches,
        dayScores,
        dayGroups,
        [], // bracketMatches
        dayToEnd.id, // dayId
        undefined, // settings (use default)
        qualifyCount
      );

      const qualified = leaderboard.slice(0, qualifyCount);

      // End the day
      await handleStatusChange(dayToEnd, "completed");
 
      setIsEndDayOpen(false);
 
      // Show celebration dialog with qualified teams
      setCelebrationDay(dayToEnd);
      setQualifiedTeams(qualified);
      setIsCelebrationOpen(true);
 
      setDayToEnd(null);
    } catch (error) {
      console.error("Error ending day:", error);
      toast({
        title: "Error",
        description: "Failed to end day",
        variant: "destructive",
      });
    }
  };

  // Get team count for a day
  const getTeamsInDay = (day: Day): { current: number; expected: number } => {
    // Count teams in groups
    const dayGroups = getGroupsByDay(day.id);
    const teamIdsInGroups = new Set<string>();
    dayGroups.forEach((g) => g.teamIds.forEach((t) => teamIdsInGroups.add(t)));
 
    // Count teams in direct matches
    const dayMatches = matches.filter(m => m.dayId === day.id);
    const teamIdsInMatches = new Set<string>();
    dayMatches.forEach((m) => m.teamIds.forEach((t) => teamIdsInMatches.add(t)));
 
    const combinedTeamIds = new Set([...Array.from(teamIdsInGroups), ...Array.from(teamIdsInMatches)]);
    
    return { 
      current: combinedTeamIds.size, 
      expected: combinedTeamIds.size || 0 
    };
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return null;
    return new Date(isoString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Calendar className="h-12 w-12 text-primary" />
        <div>
          <h1 className="text-5xl font-bold tracking-wider">Day Management</h1>
          <p className="text-muted-foreground text-xl tracking-widest mt-1">
            Create and manage tournament days.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/admin/dashboard">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Button
          className="gap-2"
          onClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Day
        </Button>
      </div>

      {/* Days Display */}
      {error ? (
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <p className="text-xl text-destructive font-semibold">Connection Error</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 text-muted-foreground/50 mb-4 animate-spin" />
            <p className="text-xl text-muted-foreground">Loading days...</p>
          </CardContent>
        </Card>
      ) : days.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">No days found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Click &quot;Add Day&quot; to create your first tournament day.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {days.sort((a, b) => a.dayNumber - b.dayNumber).map((day) => {
            const StatusIcon = STATUS_CONFIG[day.status].icon;
            const teamsInDay = getTeamsInDay(day);
            const groupsInDay = getGroupsByDay(day.id).length;

            return (
              <Card key={day.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary font-bold text-xl">
                        {day.dayNumber}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold tracking-wide">{day.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Tournament Day
                        </p>
                      </div>
                    </div>
                    <Badge className={`${STATUS_CONFIG[day.status].color} text-white gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {STATUS_CONFIG[day.status].label}
                    </Badge>
                  </div>
                </CardHeader>

                <Separator />

                <CardContent className="pt-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {teamsInDay.current}/{teamsInDay.expected} teams • {groupsInDay} groups
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <span>Top {day.qualifyCount} advance</span>
                    </div>
                    {day.startTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Started: {formatDateTime(day.startTime)}</span>
                      </div>
                    )}
                    {day.endTime && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        <span>Ended: {formatDateTime(day.endTime)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <Separator />

                <CardFooter className="pt-4 flex flex-wrap gap-2">
                  {/* Status Actions */}
                  {day.status === "upcoming" && (
                    <Button
                      size="sm"
                      className="gap-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleStatusChange(day, "active")}
                    >
                      <Play className="h-3 w-3" />
                      Start Day
                    </Button>
                  )}
                  {day.status === "active" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => handleStatusChange(day, "paused")}
                      >
                        <Pause className="h-3 w-3" />
                        Pause
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => openEndDayConfirm(day)}
                      >
                        <CheckCircle className="h-3 w-3" />
                        End Day
                      </Button>
                    </>
                  )}
                  {day.status === "paused" && (
                    <>
                      <Button
                        size="sm"
                        className="gap-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusChange(day, "active")}
                      >
                        <Play className="h-3 w-3" />
                        Resume
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => openEndDayConfirm(day)}
                      >
                        <CheckCircle className="h-3 w-3" />
                        End Day
                      </Button>
                    </>
                  )}
                  {day.status === "completed" && (
                    <>
                      <Button
                        size="sm"
                        className="gap-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleStatusChange(day, "active")}
                      >
                        <Play className="h-3 w-3" />
                        Restart Day
                      </Button>
                      <Button
                        size="sm"
                        className="gap-1 bg-red-600 hover:bg-red-700"
                        onClick={() => handleStatusChange(day, "locked")}
                      >
                        <Lock className="h-3 w-3" />
                        Lock Results
                      </Button>
                    </>
                  )}
                  {day.status === "locked" && (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      Results Locked
                    </Badge>
                  )}

                  <div className="flex-1" />

                  {/* Edit/Delete Actions */}
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(day)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(day)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Day Dialog - Simple */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Day</DialogTitle>
            <DialogDescription>Setup your tournament day details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Day Name</Label>
                <Input
                  placeholder="e.g. Grand Finals"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Day Number</Label>
                <Input
                  type="number"
                  min={1}
                  value={formDayNumber}
                  onChange={(e) => setFormDayNumber(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Shortlist Numbers (Advance)</Label>
              <Input
                type="number"
                min={1}
                value={formQualifyCount}
                onChange={(e) => setFormQualifyCount(parseInt(e.target.value) || 1)}
              />
              <p className="text-xs text-muted-foreground">Top {formQualifyCount} teams advance to next day</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Day"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Day Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Day Settings</DialogTitle>
            <DialogDescription>Update the name, number, and rules for this day.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Day Name</Label>
                <Input
                  placeholder="e.g. Grand Finals"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Day Number</Label>
                <Input
                  type="number"
                  min={1}
                  value={formDayNumber}
                  onChange={(e) => setFormDayNumber(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Shortlist Numbers (Advance)</Label>
              <Input
                type="number"
                min={1}
                value={formQualifyCount}
                onChange={(e) => setFormQualifyCount(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Day {selectedDay?.dayNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the day and **all created matches/scores** associated with it. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* End Day Confirmation */}
      <AlertDialog open={isEndDayOpen} onOpenChange={setIsEndDayOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Day {dayToEnd?.dayNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to end this day? This will mark the day as completed and record the end time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEndDay}
              className="bg-blue-600 hover:bg-blue-700"
            >
              End Day
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Celebration Dialog */}
      {celebrationDay && (
        <CelebrationDialog
          open={isCelebrationOpen}
          onOpenChange={setIsCelebrationOpen}
          day={celebrationDay}
          qualifiedTeams={qualifiedTeams}
        />
      )}
    </div>
  );
}
