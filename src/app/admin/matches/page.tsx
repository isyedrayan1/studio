"use client";

import { useState, useMemo } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Swords,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Users,
  Play,
  CheckCircle,
  Lock,
  Info,
} from "lucide-react";
import Link from "next/link";
import { useTournament } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import type { Match, Day } from "@/lib/types";

const STATUS_CONFIG = {
  upcoming: { label: "Upcoming", color: "bg-slate-500" },
  live: { label: "Live", color: "bg-green-500" },
  finished: { label: "Finished", color: "bg-blue-500" },
  locked: { label: "Locked", color: "bg-red-500" },
};

export default function MatchesPage() {
  const { matches, days, groups, teams, scores, loading, error, addMatch, updateMatch, deleteMatch, getGroupsByDay, getTeamById } = useTournament();
  const { toast } = useToast();

  // Filter
  const [selectedDayId, setSelectedDayId] = useState<string>("all");

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formDayId, setFormDayId] = useState("");
  const [formGroupIds, setFormGroupIds] = useState<string[]>([]);
  const [formTeamIds, setFormTeamIds] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState<"groups" | "teams">("groups");

  const filteredMatches = selectedDayId === "all"
    ? matches
    : matches.filter(m => m.dayId === selectedDayId);

  // Helper to check if a day uses groups (br-shortlist) or direct teams
  const getDayType = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    return day?.type || "br-shortlist";
  };

  const isGroupBasedDay = (dayId: string) => getDayType(dayId) === "br-shortlist";

  // Calculate qualified teams from previous stage (br-shortlist) based on scores
  const qualifiedTeamsFromPreviousStage = useMemo(() => {
    // Find the latest completed or active shortlist day
    const shortlistDay = days
      .filter(d => d.type === "br-shortlist")
      .sort((a, b) => b.dayNumber - a.dayNumber)[0];

    if (!shortlistDay) return [];

    // Get all matches for that day
    const dayMatches = matches.filter(m => m.dayId === shortlistDay.id);

    // Collect all scores for that day
    const teamScores: Record<string, { kills: number; points: number }> = {};
    dayMatches.forEach(match => {
      match.teamIds.forEach(teamId => {
        const score = scores.find(s => s.matchId === match.id && s.teamId === teamId);
        if (!teamScores[teamId]) teamScores[teamId] = { kills: 0, points: 0 };
        if (score) {
          teamScores[teamId].kills += score.kills;
          teamScores[teamId].points += score.totalPoints ?? 0;
        }
      });
    });

    // Sort by points (descending), then kills (descending)
    return Object.entries(teamScores)
      .sort((a, b) => b[1].points - a[1].points || b[1].kills - a[1].kills)
      .map(([teamId]) => teamId);
  }, [days, matches, scores]);

  // Get qualified teams based on Day's qualifyCount
  const getQualifiedTeams = (forDayType: string) => {
    if (forDayType === 'br-championship') {
      // Find the shortlist day this championship follows
      const shortlistDay = days.find(d => d.type === 'br-shortlist');
      return qualifiedTeamsFromPreviousStage.slice(0, shortlistDay?.qualifyCount || 12);
    }
    // For bracket, this is handled separately
    return [];
  };

  const getDayName = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    return day ? `Day ${day.dayNumber}` : "Unknown";
  };

  const getNextMatchNumber = (dayId: string) => {
    const dayMatches = matches.filter(m => m.dayId === dayId);
    if (dayMatches.length === 0) return 1;
    return Math.max(...dayMatches.map(m => m.matchNumber)) + 1;
  };

  const getTeamsFromGroups = (groupIds: string[]): string[] => {
    const teamIds = new Set<string>();
    groupIds.forEach(gId => {
      const group = groups.find(g => g.id === gId);
      if (group) group.teamIds.forEach(t => teamIds.add(t));
    });
    return Array.from(teamIds);
  };

  const resetForm = () => {
    setFormDayId(days[0]?.id || "");
    setFormGroupIds([]);
    setFormTeamIds([]);
  };

  const openAddDialog = () => {
    const dayToUse = selectedDayId !== "all" ? selectedDayId : days[0]?.id || "";
    setFormDayId(dayToUse);
    setFormGroupIds([]);
    // For non-group days (Day 2), pre-populate with qualified teams from Day 1
    const dayType = getDayType(dayToUse);
    if (dayType === 'br-championship') {
      setFormTeamIds(getQualifiedTeams('br-championship'));
      setSelectionMode("teams");
    } else if (dayType === 'br-shortlist') {
      setSelectionMode("groups");
      setFormTeamIds([]);
    } else {
      setSelectionMode("teams");
      setFormTeamIds([]);
    }
    setIsAddOpen(true);
  };

  const openEditDialog = (match: Match) => {
    setSelectedMatch(match);
    setFormDayId(match.dayId);
    setFormGroupIds([...match.groupIds]);
    setFormTeamIds([...match.teamIds]);
    setSelectionMode(match.groupIds.length > 0 ? "groups" : "teams");
    setIsEditOpen(true);
  };

  const openDeleteDialog = (match: Match) => {
    setSelectedMatch(match);
    setIsDeleteOpen(true);
  };

  const toggleGroup = (groupId: string) => {
    setFormGroupIds(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const toggleTeam = (teamId: string) => {
    setFormTeamIds(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleDayChange = (dayId: string) => {
    setFormDayId(dayId);
    setFormGroupIds([]);
    // For Day 2, pre-populate with qualified teams from Day 1
    const dayType = getDayType(dayId);
    if (dayType === 'br-championship') {
      setSelectionMode("teams");
      setFormTeamIds(getQualifiedTeams('br-championship'));
    } else if (dayType === 'br-shortlist') {
      setSelectionMode("groups");
      setFormTeamIds([]);
    } else {
      setSelectionMode("teams");
      setFormTeamIds([]);
    }
  };

  const handleAdd = async () => {
    if (!formDayId) {
      toast({ title: "Error", description: "Day is required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const matchNumber = getNextMatchNumber(formDayId);
      // Use groups for br-shortlist, direct teams for others
      const teamIds = selectionMode === "groups" ? getTeamsFromGroups(formGroupIds) : formTeamIds;
      await addMatch({
        dayId: formDayId,
        matchNumber,
        groupIds: selectionMode === "groups" ? formGroupIds : [],
        teamIds,
        status: "upcoming",
      });
      toast({ title: "Success", description: `Match ${matchNumber} created` });
      setIsAddOpen(false);
      resetForm();
    } catch (err: unknown) {
      console.error("Failed to create match:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: `Failed: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedMatch) return;
    setIsSubmitting(true);
    try {
      const teamIds = selectionMode === "groups" ? getTeamsFromGroups(formGroupIds) : formTeamIds;
      await updateMatch(selectedMatch.id, {
        dayId: formDayId,
        groupIds: selectionMode === "groups" ? formGroupIds : [],
        teamIds,
      });
      toast({ title: "Success", description: `Match updated` });
      setIsEditOpen(false);
      setSelectedMatch(null);
      resetForm();
    } catch (err: unknown) {
      console.error("Failed to update match:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: `Failed: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMatch) return;
    setIsSubmitting(true);
    try {
      await deleteMatch(selectedMatch.id);
      toast({ title: "Success", description: `Match deleted` });
      setIsDeleteOpen(false);
      setSelectedMatch(null);
    } catch (err: unknown) {
      console.error("Failed to delete match:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: `Failed: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (match: Match, newStatus: Match["status"]) => {
    try {
      await updateMatch(match.id, { status: newStatus });
      toast({ title: "Status Updated", description: `Match is now ${STATUS_CONFIG[newStatus].label}` });
    } catch (err: unknown) {
      console.error("Failed to update status:", err);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  // Show all groups when in "groups" mode, regardless of the day
  const availableGroups = groups;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Swords className="h-12 w-12 text-primary" />
        <div>
          <h1 className="text-5xl font-bold tracking-wider">Match Management</h1>
          <p className="text-muted-foreground text-xl tracking-widest mt-1">
            Create matches and manage status.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
          <Select value={selectedDayId} onValueChange={setSelectedDayId}>
            <SelectTrigger className="w-[180px]">
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
        <Button className="gap-2" onClick={openAddDialog} disabled={days.length === 0}>
          <Plus className="h-4 w-4" />
          Add Match
        </Button>
      </div>

      {/* Matches Display */}
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
            <p className="text-xl text-muted-foreground">Loading matches...</p>
          </CardContent>
        </Card>
      ) : days.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Swords className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">No days created yet</p>
            <Link href="/admin/days" className="mt-4">
              <Button>Go to Days</Button>
            </Link>
          </CardContent>
        </Card>
      ) : filteredMatches.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Swords className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">No matches found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Click &quot;Add Match&quot; to create one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMatches
            .sort((a, b) => a.dayId.localeCompare(b.dayId) || a.matchNumber - b.matchNumber)
            .map((match) => (
              <Card key={match.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Match {match.matchNumber}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{getDayName(match.dayId)}</Badge>
                      <Badge className={`${STATUS_CONFIG[match.status].color} text-white`}>
                        {STATUS_CONFIG[match.status].label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Users className="h-4 w-4" />
                    <span>{match.teamIds.length} teams</span>
                  </div>
                  {/* Show groups for Day 1 */}
                  {isGroupBasedDay(match.dayId) && match.groupIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {match.groupIds.map((gId) => {
                        const group = groups.find(g => g.id === gId);
                        return (
                          <Badge key={gId} variant="secondary" className="text-xs">
                            {group?.name || "?"}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  {/* Show team names for Day 2+ */}
                  {!isGroupBasedDay(match.dayId) && match.teamIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {match.teamIds.slice(0, 6).map((teamId) => {
                        const team = getTeamById(teamId);
                        return (
                          <Badge key={teamId} variant="secondary" className="text-xs">
                            {team?.tag || team?.name || "?"}
                          </Badge>
                        );
                      })}
                      {match.teamIds.length > 6 && (
                        <Badge variant="secondary" className="text-xs">
                          +{match.teamIds.length - 6} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
                <Separator />
                <CardFooter className="pt-3 flex flex-wrap gap-2">
                  {/* Status Actions */}
                  {match.status === "upcoming" && (
                    <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange(match, "live")}>
                      <Play className="h-3 w-3" /> Start
                    </Button>
                  )}
                  {match.status === "live" && (
                    <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange(match, "finished")}>
                      <CheckCircle className="h-3 w-3" /> Finish
                    </Button>
                  )}
                  {match.status === "finished" && (
                    <Button size="sm" className="gap-1 bg-red-600 hover:bg-red-700" onClick={() => handleStatusChange(match, "locked")}>
                      <Lock className="h-3 w-3" /> Lock
                    </Button>
                  )}
                  {match.status === "locked" && (
                    <Badge variant="outline" className="gap-1 text-muted-foreground">
                      <Lock className="h-3 w-3" /> Locked
                    </Badge>
                  )}
                  <div className="flex-1" />
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(match)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(match)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
      )}

      {/* Add Match Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Match</DialogTitle>
            <DialogDescription>
              {formDayId &&
                "Choose participant selection method."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Day</Label>
              <Select value={formDayId} onValueChange={handleDayChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      Day {day.dayNumber}: {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formDayId && <p className="text-xs text-muted-foreground">Match #{getNextMatchNumber(formDayId)}</p>}
            </div>

            {/* Selection Mode */}
            <div className="space-y-3">
              <Label>Selection Method</Label>
              <RadioGroup
                value={selectionMode}
                onValueChange={(v) => setSelectionMode(v as "groups" | "teams")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="groups" id="mode-groups" />
                  <Label htmlFor="mode-groups" className="cursor-pointer">Select Groups</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="teams" id="mode-teams" />
                  <Label htmlFor="mode-teams" className="cursor-pointer">Select Individual Teams</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Group Selection */}
            {formDayId && selectionMode === "groups" && (
              <div className="space-y-2">
                <Label>Select Groups ({formGroupIds.length} selected, {getTeamsFromGroups(formGroupIds).length} teams)</Label>
                <ScrollArea className="h-[150px] border rounded-md p-2">
                  {availableGroups.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No groups for this day</p>
                  ) : (
                    <div className="space-y-2">
                      {availableGroups.map((group) => (
                        <div key={group.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`group-${group.id}`}
                            checked={formGroupIds.includes(group.id)}
                            onCheckedChange={() => toggleGroup(group.id)}
                          />
                          <label htmlFor={`group-${group.id}`} className="text-sm cursor-pointer flex-1">
                            {group.name} ({group.teamIds.length} teams)
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}

            {/* Team Selection */}
            {formDayId && selectionMode === "teams" && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Select Teams ({formTeamIds.length} selected)</Label>
                  {qualifiedTeamsFromPreviousStage.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      <Info className="h-3 w-3 mr-1" />
                      Top qualifiers from previous stage
                    </Badge>
                  )}
                </div>
                <ScrollArea className="h-[200px] border rounded-md p-2">
                  {teams.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No teams available</p>
                  ) : (
                    <div className="space-y-2">
                      {/* Show qualified teams first, then others */}
                      {[...teams].sort((a, b) => {
                        const aQualified = qualifiedTeamsFromPreviousStage.includes(a.id);
                        const bQualified = qualifiedTeamsFromPreviousStage.includes(b.id);
                        if (aQualified && !bQualified) return -1;
                        if (!aQualified && bQualified) return 1;
                        return qualifiedTeamsFromPreviousStage.indexOf(a.id) - qualifiedTeamsFromPreviousStage.indexOf(b.id);
                      }).map((team) => {
                        const rank = qualifiedTeamsFromPreviousStage.indexOf(team.id) + 1;
                        const isQualified = rank > 0 && rank <= 12; // This 12 could be dynamic based on shortlistDay.qualifyCount
                        return (
                          <div key={team.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`team-add-${team.id}`}
                              checked={formTeamIds.includes(team.id)}
                              onCheckedChange={() => toggleTeam(team.id)}
                            />
                            <label htmlFor={`team-add-${team.id}`} className="text-sm cursor-pointer flex-1 flex items-center gap-2">
                              {rank > 0 && <Badge variant={isQualified ? "default" : "outline"} className="text-xs w-6 justify-center">#{rank}</Badge>}
                              {team.name} {team.tag && <span className="text-muted-foreground">({team.tag})</span>}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={isSubmitting || !formDayId}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Match"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Match Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Match {selectedMatch?.matchNumber}</DialogTitle>
            <DialogDescription>
              {formDayId &&
                "Update match participants."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Day</Label>
              <Select value={formDayId} onValueChange={handleDayChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      Day {day.dayNumber}: {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>



            {/* Selection Mode */}
            <div className="space-y-3">
              <Label>Selection Method</Label>
              <RadioGroup
                value={selectionMode}
                onValueChange={(v) => setSelectionMode(v as "groups" | "teams")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="groups" id="edit-mode-groups" />
                  <Label htmlFor="edit-mode-groups" className="cursor-pointer">Select Groups</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="teams" id="edit-mode-teams" />
                  <Label htmlFor="edit-mode-teams" className="cursor-pointer">Select Individual Teams</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Group Selection */}
            {formDayId && selectionMode === "groups" && (
              <div className="space-y-2">
                <Label>Select Groups ({formGroupIds.length} selected)</Label>
                <ScrollArea className="h-[150px] border rounded-md p-2">
                  <div className="space-y-2">
                    {availableGroups.map((group) => (
                      <div key={group.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-group-${group.id}`}
                          checked={formGroupIds.includes(group.id)}
                          onCheckedChange={() => toggleGroup(group.id)}
                        />
                        <label htmlFor={`edit-group-${group.id}`} className="text-sm cursor-pointer flex-1">
                          {group.name} ({group.teamIds.length} teams)
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Team Selection */}
            {formDayId && selectionMode === "teams" && (
              <div className="space-y-2">
                <Label>Select Teams ({formTeamIds.length} selected)</Label>
                <ScrollArea className="h-[200px] border rounded-md p-2">
                  <div className="space-y-2">
                    {[...teams].sort((a, b) => {
                      const aQualified = qualifiedTeamsFromPreviousStage.includes(a.id);
                      const bQualified = qualifiedTeamsFromPreviousStage.includes(b.id);
                      if (aQualified && !bQualified) return -1;
                      if (!aQualified && bQualified) return 1;
                      return qualifiedTeamsFromPreviousStage.indexOf(a.id) - qualifiedTeamsFromPreviousStage.indexOf(b.id);
                    }).map((team) => {
                      const rank = qualifiedTeamsFromPreviousStage.indexOf(team.id) + 1;
                      const isQualified = rank > 0 && rank <= 12;
                      return (
                        <div key={team.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`team-edit-${team.id}`}
                            checked={formTeamIds.includes(team.id)}
                            onCheckedChange={() => toggleTeam(team.id)}
                          />
                          <label htmlFor={`team-edit-${team.id}`} className="text-sm cursor-pointer flex-1 flex items-center gap-2">
                            {rank > 0 && <Badge variant={isQualified ? "default" : "outline"} className="text-xs w-6 justify-center">#{rank}</Badge>}
                            {team.name} {team.tag && <span className="text-muted-foreground">({team.tag})</span>}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
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
            <AlertDialogTitle>Delete Match {selectedMatch?.matchNumber}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the match and all scores. This cannot be undone.
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
    </div >
  );
}
