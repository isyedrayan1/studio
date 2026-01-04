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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Layers,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useTournament } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import type { Group } from "@/lib/types";

export default function GroupsPage() {
  const { groups, days, teams, matches, loading, error, addGroup, updateGroup, deleteGroup, getTeamById } = useTournament();
  const { toast } = useToast();

  // Filter state
  const [selectedDayId, setSelectedDayId] = useState<string>("all");

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDayId, setFormDayId] = useState("");
  const [formTeamIds, setFormTeamIds] = useState<string[]>([]);

  // Only days with br-shortlist matches can have groups
  const groupableDays = days.filter(d => 
    matches.some(m => m.dayId === d.id && m.type === "br-shortlist")
  );
  const hasGroupableDays = groupableDays.length > 0;

  const filteredGroups = selectedDayId === "all" 
    ? groups 
    : groups.filter(g => g.dayId === selectedDayId);

  const getDayName = (dayId: string) => {
    const day = days.find(d => d.id === dayId);
    return day ? `Day ${day.dayNumber}: ${day.name}` : "Unknown";
  };

  const resetForm = () => {
    setFormName("");
    setFormDayId(groupableDays[0]?.id || "");
    setFormTeamIds([]);
  };

  const openAddDialog = () => {
    resetForm();
    // Only set to selected if it's a groupable day
    const targetDay = selectedDayId !== "all" && groupableDays.find(d => d.id === selectedDayId)
      ? selectedDayId 
      : groupableDays[0]?.id || "";
    setFormDayId(targetDay);
    setIsAddOpen(true);
  };

  const openEditDialog = (group: Group) => {
    setSelectedGroup(group);
    setFormName(group.name);
    setFormDayId(group.dayId);
    setFormTeamIds([...group.teamIds]);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (group: Group) => {
    setSelectedGroup(group);
    setIsDeleteOpen(true);
  };

  const toggleTeam = (teamId: string) => {
    setFormTeamIds(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleAdd = async () => {
    if (!formName.trim() || !formDayId) {
      toast({ title: "Error", description: "Name and Day are required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await addGroup({
        name: formName.trim(),
        dayId: formDayId,
        teamIds: formTeamIds,
      });
      toast({ title: "Success", description: `${formName} created` });
      setIsAddOpen(false);
      resetForm();
    } catch (err: unknown) {
      console.error("Failed to create group:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: `Failed: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedGroup || !formName.trim()) return;
    setIsSubmitting(true);
    try {
      await updateGroup(selectedGroup.id, {
        name: formName.trim(),
        dayId: formDayId,
        teamIds: formTeamIds,
      });
      toast({ title: "Success", description: `${formName} updated` });
      setIsEditOpen(false);
      setSelectedGroup(null);
      resetForm();
    } catch (err: unknown) {
      console.error("Failed to update group:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: `Failed: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGroup) return;
    setIsSubmitting(true);
    try {
      await deleteGroup(selectedGroup.id);
      toast({ title: "Success", description: `${selectedGroup.name} deleted` });
      setIsDeleteOpen(false);
      setSelectedGroup(null);
    } catch (err: unknown) {
      console.error("Failed to delete group:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: `Failed: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Layers className="h-12 w-12 text-primary" />
        <div>
          <h1 className="text-5xl font-bold tracking-wider">Group Management</h1>
          <p className="text-muted-foreground text-xl tracking-widest mt-1">
            Groups are used for Day 1 (BR Shortlisting) to organize team lobbies.
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
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by day" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Days</SelectItem>
              {groupableDays.map((day) => (
                <SelectItem key={day.id} value={day.id}>
                  Day {day.dayNumber}: {day.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="gap-2" onClick={openAddDialog} disabled={!hasGroupableDays}>
          <Plus className="h-4 w-4" />
          Add Group
        </Button>
      </div>

      {/* Groups Display */}
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
            <p className="text-xl text-muted-foreground">Loading groups...</p>
          </CardContent>
        </Card>
      ) : !hasGroupableDays ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Layers className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">No BR Shortlisting day found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Groups are only used for Day 1 (BR Shortlisting). Create that day first.
            </p>
            <Link href="/admin/days" className="mt-4">
              <Button>Go to Days</Button>
            </Link>
          </CardContent>
        </Card>
      ) : filteredGroups.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Layers className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">No groups found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Click &quot;Add Group&quot; to create groups for Day 1.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{group.name}</h3>
                  <Badge variant="outline">{getDayName(group.dayId)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Users className="h-4 w-4" />
                  <span>{group.teamIds.length} teams</span>
                </div>
                {group.teamIds.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {group.teamIds.slice(0, 6).map((teamId) => {
                      const team = getTeamById(teamId);
                      return (
                        <Badge key={teamId} variant="secondary" className="text-xs">
                          {team?.tag || team?.name || "?"}
                        </Badge>
                      );
                    })}
                    {group.teamIds.length > 6 && (
                      <Badge variant="secondary" className="text-xs">
                        +{group.teamIds.length - 6} more
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No teams assigned</p>
                )}
              </CardContent>
              <Separator />
              <CardFooter className="pt-3 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(group)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(group)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Group Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Group</DialogTitle>
            <DialogDescription>Create a new group and assign teams.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Group Name</Label>
              <Input
                placeholder="e.g. Group A"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Day (BR Shortlisting only)</Label>
              <Select value={formDayId} onValueChange={setFormDayId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {groupableDays.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      Day {day.dayNumber}: {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assign Teams ({formTeamIds.length} selected)</Label>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                {teams.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No teams available</p>
                ) : (
                  <div className="space-y-2">
                    {teams.map((team) => (
                      <div key={team.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`team-${team.id}`}
                          checked={formTeamIds.includes(team.id)}
                          onCheckedChange={() => toggleTeam(team.id)}
                        />
                        <label htmlFor={`team-${team.id}`} className="text-sm cursor-pointer flex-1">
                          {team.name} {team.tag && <span className="text-muted-foreground">({team.tag})</span>}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={isSubmitting || !formName.trim()}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {selectedGroup?.name}</DialogTitle>
            <DialogDescription>Update group settings and teams.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Group Name</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Day (BR Shortlisting only)</Label>
              <Select value={formDayId} onValueChange={setFormDayId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {groupableDays.map((day) => (
                    <SelectItem key={day.id} value={day.id}>
                      Day {day.dayNumber}: {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assign Teams ({formTeamIds.length} selected)</Label>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                <div className="space-y-2">
                  {teams.map((team) => (
                    <div key={team.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-team-${team.id}`}
                        checked={formTeamIds.includes(team.id)}
                        onCheckedChange={() => toggleTeam(team.id)}
                      />
                      <label htmlFor={`edit-team-${team.id}`} className="text-sm cursor-pointer flex-1">
                        {team.name} {team.tag && <span className="text-muted-foreground">({team.tag})</span>}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isSubmitting || !formName.trim()}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedGroup?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the group and unassign all teams. This cannot be undone.
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
    </div>
  );
}
