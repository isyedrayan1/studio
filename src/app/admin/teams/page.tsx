"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Plus, ArrowLeft, Pencil, Trash2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useTournament } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import type { Team } from "@/lib/types";

export default function TeamsPage() {
  const { teams, loading, error, addTeam, updateTeam, deleteTeam } = useTournament();
  const { toast } = useToast();

  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formCaptainName, setFormCaptainName] = useState("");
  const [formCaptainUid, setFormCaptainUid] = useState("");

  const resetForm = () => {
    setFormName("");
    setFormTag("");
    setFormCaptainName("");
    setFormCaptainUid("");
  };

  const openEditDialog = (team: Team) => {
    setSelectedTeam(team);
    setFormName(team.name);
    setFormTag(team.tag || "");
    setFormCaptainName(team.captainName || "");
    setFormCaptainUid(team.captainUid || "");
    setIsEditOpen(true);
  };

  const openDeleteDialog = (team: Team) => {
    setSelectedTeam(team);
    setIsDeleteOpen(true);
  };

  const handleAdd = async () => {
    if (!formName.trim()) {
      toast({ title: "Error", description: "Team name is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addTeam(formName.trim(), formTag.trim() || undefined);
      toast({ title: "Success", description: `Team "${formName}" created` });
      setIsAddOpen(false);
      resetForm();
    } catch (error: unknown) {
      console.error("Failed to create team:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({ title: "Error", description: `Failed to create team: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedTeam || !formName.trim()) {
      toast({ title: "Error", description: "Team name is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTeam(selectedTeam.id, {
        name: formName.trim(),
        tag: formTag.trim() || undefined,
        captainName: formCaptainName.trim() || undefined,
        captainUid: formCaptainUid.trim() || undefined,
      });
      toast({ title: "Success", description: `Team "${formName}" updated` });
      setIsEditOpen(false);
      setSelectedTeam(null);
      resetForm();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update team", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTeam) return;

    setIsSubmitting(true);
    try {
      await deleteTeam(selectedTeam.id);
      toast({ title: "Success", description: `Team "${selectedTeam.name}" deleted` });
      setIsDeleteOpen(false);
      setSelectedTeam(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete team", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Users className="h-12 w-12 text-primary" />
        <div>
          <h1 className="text-5xl font-bold tracking-wider">Team Management</h1>
          <p className="text-muted-foreground text-xl tracking-widest mt-1">
            Add, edit, and manage all competing teams.
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
          Add Team
        </Button>
      </div>

      {/* Teams List */}
      {error ? (
        <Card className="border-destructive">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <p className="text-xl text-destructive font-semibold">Connection Error</p>
            <p className="text-sm text-muted-foreground mt-1 text-center max-w-md">
              {error}
            </p>
            <p className="text-xs text-muted-foreground mt-4">
              Make sure Firestore rules allow read/write access.
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-16 w-16 text-muted-foreground/50 mb-4 animate-spin" />
            <p className="text-xl text-muted-foreground">Loading teams...</p>
          </CardContent>
        </Card>
      ) : teams.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-xl text-muted-foreground">No teams found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Click &quot;Add Team&quot; to create your first team.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Teams ({teams.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Team Name</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Captain</TableHead>
                  <TableHead>UID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team, index) => (
                  <TableRow key={team.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-semibold">{team.name}</TableCell>
                    <TableCell>{team.tag || "—"}</TableCell>
                    <TableCell>{team.captainName || "—"}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {team.captainUid || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(team)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteDialog(team)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Team Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team</DialogTitle>
            <DialogDescription>
              Enter the team details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Team Phoenix"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tag">Tag (Short Name)</Label>
              <Input
                id="tag"
                placeholder="e.g., PHX"
                value={formTag}
                onChange={(e) => setFormTag(e.target.value.toUpperCase())}
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="captain">Captain Name</Label>
              <Input
                id="captain"
                placeholder="e.g., John Doe"
                value={formCaptainName}
                onChange={(e) => setFormCaptainName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="uid">Captain UID (Free Fire)</Label>
              <Input
                id="uid"
                placeholder="e.g., 1234567890"
                value={formCaptainUid}
                onChange={(e) => setFormCaptainUid(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Team"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update the team details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Team Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Team Phoenix"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-tag">Tag (Short Name)</Label>
              <Input
                id="edit-tag"
                placeholder="e.g., PHX"
                value={formTag}
                onChange={(e) => setFormTag(e.target.value.toUpperCase())}
                maxLength={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-captain">Captain Name</Label>
              <Input
                id="edit-captain"
                placeholder="e.g., John Doe"
                value={formCaptainName}
                onChange={(e) => setFormCaptainName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-uid">Captain UID (Free Fire)</Label>
              <Input
                id="edit-uid"
                placeholder="e.g., 1234567890"
                value={formCaptainUid}
                onChange={(e) => setFormCaptainUid(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedTeam?.name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
