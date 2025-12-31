"use client";

import { useState } from "react";
import { mockTeams } from "@/lib/data";
import type { Team } from "@/lib/definitions";
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
import { Pencil, PlusCircle, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const { toast } = useToast();

  const handleSaveTeam = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newTeamData = {
      id: editingTeam ? editingTeam.id : `T${teams.length + 1}`,
      name: formData.get("name") as string,
      group: formData.get("group") as 'A' | 'B' | 'C' | 'D',
      captainName: formData.get("captainName") as string,
      captainUid: formData.get("captainUid") as string,
    };

    if (editingTeam) {
      setTeams(teams.map((t) => (t.id === editingTeam.id ? newTeamData : t)));
      toast({ title: "Team Updated", description: `${newTeamData.name} has been successfully updated.` });
    } else {
      setTeams([...teams, newTeamData]);
      toast({ title: "Team Added", description: `${newTeamData.name} has been added to the roster.` });
    }

    setEditingTeam(null);
    setIsDialogOpen(false);
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter(t => t.id !== teamId));
    toast({ title: "Team Removed", description: "The team has been removed.", variant: "destructive" });
  }

  return (
    <>
      <div className="flex justify-end mb-4">
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
                  Enter the details for the team. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-lg tracking-wider">Team Name</Label>
                  <Input id="name" name="name" defaultValue={editingTeam?.name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group" className="text-lg tracking-wider">Group</Label>
                   <Select name="group" defaultValue={editingTeam?.group}>
                    <SelectTrigger id="group">
                        <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="A">Group A</SelectItem>
                        <SelectItem value="B">Group B</SelectItem>
                        <SelectItem value="C">Group C</SelectItem>
                        <SelectItem value="D">Group D</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="captainName" className="text-lg tracking-wider">Captain Name</Label>
                  <Input id="captainName" name="captainName" defaultValue={editingTeam?.captainName} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="captainUid" className="text-lg tracking-wider">Captain UID</Label>
                  <Input id="captainUid" name="captainUid" defaultValue={editingTeam?.captainUid} required />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="text-lg tracking-wider">{editingTeam ? "Save Changes" : "Create Team"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-lg tracking-wider">Team Name</TableHead>
              <TableHead className="text-lg tracking-wider">Group</TableHead>
              <TableHead className="text-lg tracking-wider">Captain</TableHead>
              <TableHead className="text-lg tracking-wider">Captain UID</TableHead>
              <TableHead className="text-right text-lg tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id} className="text-lg">
                <TableCell className="font-medium">{team.name}</TableCell>
                <TableCell>{team.group}</TableCell>
                <TableCell>{team.captainName}</TableCell>
                <TableCell>{team.captainUid}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingTeam(team); setIsDialogOpen(true); }}>
                    <Pencil className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTeam(team.id)}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
