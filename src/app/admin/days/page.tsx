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
import type { Day, DayType, LeaderboardEntry } from "@/lib/types";
import { CelebrationDialog } from "@/components/admin/celebration-dialog";
import { calculateLeaderboard } from "@/lib/utils-tournament";

const DAY_TYPES: { value: DayType; label: string; description: string; defaultQualify: number }[] = [
  { value: "br-shortlist", label: "BR Shortlisting", description: "17 teams → Top 12 qualify", defaultQualify: 12 },
  { value: "br-championship", label: "BR Championship", description: "12 teams → Champion Rush → Top 8 qualify", defaultQualify: 8 },
  { value: "cs-bracket", label: "CS Ranked", description: "8 teams → Knockout → 1 Champion", defaultQualify: 1 },
];

const STATUS_CONFIG = {
  upcoming: { label: "Upcoming", color: "bg-slate-500", icon: Clock },
  active: { label: "Active", color: "bg-green-500", icon: Play },
  paused: { label: "Paused", color: "bg-yellow-500", icon: Pause },
  completed: { label: "Completed", color: "bg-blue-500", icon: CheckCircle },
  locked: { label: "Locked", color: "bg-red-500", icon: Lock },
};

// Get display name from day type
function getDayTypeName(type: DayType): string {
  return DAY_TYPES.find((t) => t.value === type)?.label || type;
}

export default function DaysPage() {
  const { days, teams, groups, matches, scores, loading, error, addDay, updateDay, deleteDay, getGroupsByDay } = useTournament();
  const { toast } = useToast();

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formType, setFormType] = useState<DayType>("br-shortlist");
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
    setFormType("br-shortlist");
    setFormQualifyCount(12);
  };

  // Auto-update qualifyCount when type changes
  const handleTypeChange = (newType: DayType) => {
    setFormType(newType);
    const typeConfig = DAY_TYPES.find(t => t.value === newType);
    if (typeConfig) {
      setFormQualifyCount(typeConfig.defaultQualify);
    }
  };

  const openEditDialog = (day: Day) => {
    setSelectedDay(day);
    setFormDayNumber(day.dayNumber);
    setFormType(day.type);
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
      const nextDayNumber = getNextDayNumber();
      await addDay({
        dayNumber: nextDayNumber,
        name: getDayTypeName(formType),
        type: formType,
        status: "upcoming",
        qualifyCount: formQualifyCount,
      });
      toast({ title: "Success", description: `Day ${nextDayNumber} created` });
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
        name: getDayTypeName(formType),
        type: formType,
        qualifyCount: formQualifyCount,
      });
      toast({ title: "Success", description: `Day ${formDayNumber} updated` });
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

  const handleDelete = async () => {
    if (!selectedDay) return;
    setIsSubmitting(true);
    try {
      await deleteDay(selectedDay.id);
      toast({ title: "Success", description: `Day ${selectedDay.dayNumber} deleted` });
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
      const leaderboard = calculateLeaderboard(
        teams,
        dayMatches,
        dayScores,
        dayGroups
      );
      
      const qualifyCount = dayToEnd.qualifyCount || 12;
      const qualified = leaderboard.slice(0, qualifyCount);

      // End the day
      await handleStatusChange(dayToEnd, "completed");
      
      // If Day 1 (br-shortlist) is ending, auto-create Day 2 match
      if (dayToEnd.type === "br-shortlist") {
        const day2 = days.find(d => d.type === "br-championship");
        if (day2) {
          // Calculate top 12 teams from Day 1
          const day1Matches = matches.filter(m => m.dayId === dayToEnd.id);
          const teamScores: Record<string, { kills: number; points: number }> = {};
          
          day1Matches.forEach(match => {
            match.teamIds.forEach(teamId => {
              const score = scores.find(s => s.matchId === match.id && s.teamId === teamId);
              if (!teamScores[teamId]) teamScores[teamId] = { kills: 0, points: 0 };
              if (score) {
                teamScores[teamId].kills += score.kills;
                teamScores[teamId].points += score.totalPoints ?? 0;
              }
            });
          });
          
          // Sort and get top 12
          const qualifyCount = dayToEnd.qualifyCount || 12;
          const topTeamIds = Object.entries(teamScores)
            .sort((a, b) => b[1].points - a[1].points || b[1].kills - a[1].kills)
            .slice(0, qualifyCount)
            .map(([teamId]) => teamId);
          
          // Create Day 2 match with top teams
          if (topTeamIds.length > 0) {
            const { addMatch } = await import("@/lib/firebase");
            await addMatch({
              dayId: day2.id,
              matchNumber: 1,
              groupIds: [],
              teamIds: topTeamIds,
              status: "upcoming",
            });
            
            toast({
              title: "Day 2 Match Created",
              description: `Top ${topTeamIds.length} teams automatically added to Day 2`,
            });
          }
        }
      }
      
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

  // Get team count for a day based on its type
  const getTeamsInDay = (day: Day): { current: number; expected: number } => {
    if (day.type === "br-shortlist") {
      // Day 1: Count teams in groups
      const dayGroups = getGroupsByDay(day.id);
      const teamIds = new Set<string>();
      dayGroups.forEach((g) => g.teamIds.forEach((t) => teamIds.add(t)));
      return { current: teamIds.size, expected: teamIds.size || 18 };
    } else if (day.type === "br-championship") {
      // Day 2: Should be top 12 from Day 1
      const day1 = days.find(d => d.type === "br-shortlist");
      const qualifyCount = day1?.qualifyCount || 12;
      return { current: qualifyCount, expected: qualifyCount };
    } else {
      // Day 3: Should be top 8 from Day 2
      const day2 = days.find(d => d.type === "br-championship");
      const qualifyCount = day2?.qualifyCount || 8;
      return { current: qualifyCount, expected: qualifyCount };
    }
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
                          {DAY_TYPES.find((t) => t.value === day.type)?.description}
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
                        {day.type === "br-shortlist" 
                          ? `${teamsInDay.current}/${teamsInDay.expected} teams • ${groupsInDay} groups`
                          : `${teamsInDay.expected} teams`
                        }
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
                    <Button
                      size="sm"
                      className="gap-1 bg-red-600 hover:bg-red-700"
                      onClick={() => handleStatusChange(day, "locked")}
                    >
                      <Lock className="h-3 w-3" />
                      Lock Results
                    </Button>
                  )}
                  {day.status === "locked" && (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <Lock className="h-3 w-3" />
                      Results Locked
                    </Badge>
                  )}

                  <div className="flex-1" />

                  {/* Edit/Delete Actions */}
                  {day.status !== "locked" && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(day)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(day)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
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
            <DialogTitle>Add Day {getNextDayNumber()}</DialogTitle>
            <DialogDescription>Select the type and qualification settings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Day Type</Label>
              <Select value={formType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="font-semibold">{type.label}</span>
                      <span className="text-muted-foreground ml-2">— {type.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Teams Qualify</Label>
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
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : `Create Day ${getNextDayNumber()}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Day Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Day {selectedDay?.dayNumber}</DialogTitle>
            <DialogDescription>Update day settings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Day Number</Label>
                <Input
                  type="number"
                  min={1}
                  value={formDayNumber}
                  onChange={(e) => setFormDayNumber(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label>Teams Qualify</Label>
                <Input
                  type="number"
                  min={1}
                  value={formQualifyCount}
                  onChange={(e) => setFormQualifyCount(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Day Type</Label>
              <Select value={formType} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAY_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} — {type.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              This will delete all groups and matches in this day. This action cannot be undone.
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
