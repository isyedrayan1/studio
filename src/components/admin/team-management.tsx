"use client";

import { useState } from "react";
import type { Team } from "@/lib/types";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, PlusCircle, Trash2, Users } from "lucide-react";

interface TeamManagementProps {
  teams?: Team[];
  onAddTeam?: (team: Omit<Team, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateTeam?: (teamId: string, data: Partial<Team>) => Promise<void>;
  onDeleteTeam?: (teamId: string) => Promise<void>;
}

export function TeamManagement({ 
  teams = [], 
  onAddTeam, 
  onUpdateTeam, 
  onDeleteTeam 
}: TeamManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveTeam = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const teamData = {
      name: formData.get("name") as string,
      tag: formData.get("tag") as string || undefined,
      captainName: formData.get("captainName") as string || undefined,
      captainUid: formData.get("captainUid") as string || undefined,
    };

    try {
      if (editingTeam) {
        await onUpdateTeam?.(editingTeam.id, teamData);
        toast({ title: "Team Updated", description: `${teamData.name} has been successfully updated.` });
      } else {
        await onAddTeam?.(teamData);
        toast({ title: "Team Added", description: `${teamData.name} has been added to the roster.` });
      }
      setEditingTeam(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save team.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    try {
      await onDeleteTeam?.(teamId);
      toast({ title: "Team Removed", description: `${teamName} has been removed.`, variant: "destructive" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete team.", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg text-muted-foreground tracking-wider">
          {teams.length} team{teams.length !== 1 ? 's' : ''} registered
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTeam(null)} className="text-lg tracking-wider gap-2">
              <PlusCircle /> Add New Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSaveTeam}>
              <DialogHeader>
                <DialogTitle className="text-3xl tracking-wider">
                  {editingTeam ? "Edit Team" : "Add New Team"}
                </DialogTitle>
                <DialogDescription>
                  Enter the details for the team. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-lg tracking-wider">Team Name *</Label>
                  <Input id="name" name="name" defaultValue={editingTeam?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tag" className="text-lg tracking-wider">Team Tag (Short)</Label>
                  <Input id="tag" name="tag" defaultValue={editingTeam?.tag} placeholder="e.g. PHN, KDRP" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="captainName" className="text-lg tracking-wider">Captain Name</Label>
                  <Input id="captainName" name="captainName" defaultValue={editingTeam?.captainName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="captainUid" className="text-lg tracking-wider">Captain UID</Label>
                  <Input id="captainUid" name="captainUid" defaultValue={editingTeam?.captainUid} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="text-lg tracking-wider" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingTeam ? "Save Changes" : "Create Team"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl tracking-wider text-muted-foreground">No Teams Yet</h3>
          <p className="text-muted-foreground/70 mt-2">
            Click &quot;Add New Team&quot; to register your first team.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-lg tracking-wider">Team Name</TableHead>
                <TableHead className="text-lg tracking-wider">Tag</TableHead>
                <TableHead className="text-lg tracking-wider">Captain</TableHead>
                <TableHead className="text-lg tracking-wider">Captain UID</TableHead>
                <TableHead className="text-right text-lg tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team) => (
                <TableRow key={team.id} className="text-lg">
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.tag || '-'}</TableCell>
                  <TableCell>{team.captainName || '-'}</TableCell>
                  <TableCell>{team.captainUid || '-'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingTeam(team); setIsDialogOpen(true); }}>
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTeam(team.id, team.name)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
