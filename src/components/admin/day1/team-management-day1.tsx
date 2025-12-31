"use client";

import { useState } from "react";
import { mockDay1Teams } from "@/lib/data";
import type { Day1Team } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function TeamManagementDay1() {
  const [teams, setTeams] = useState<Day1Team[]>(mockDay1Teams);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Day1Team | null>(null);
  const { toast } = useToast();

  const handleSaveTeam = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newTeamData = {
      teamId: editingTeam ? editingTeam.teamId : `T${teams.length + 1}`,
      teamName: formData.get("teamName") as string,
      group: formData.get("group") as 'A' | 'B' | 'C',
    };

    if (!newTeamData.teamName || !newTeamData.group) {
        toast({ title: "Error", description: "Team Name and Group are required.", variant: "destructive" });
        return;
    }

    if (editingTeam) {
      setTeams(teams.map((t) => (t.teamId === editingTeam.teamId ? newTeamData : t)));
      toast({ title: "Team Updated", description: `${newTeamData.teamName} has been successfully updated.` });
    } else {
      setTeams([...teams, newTeamData]);
      toast({ title: "Team Added", description: `${newTeamData.teamName} has been added to the roster.` });
    }

    setEditingTeam(null);
    setIsDialogOpen(false);
  };

  const handleDeleteTeam = (teamId: string) => {
    setTeams(teams.filter(t => t.teamId !== teamId));
    toast({ title: "Team Removed", description: "The team has been removed.", variant: "destructive" });
  }

  const openAddDialog = () => {
    setEditingTeam(null);
    setIsDialogOpen(true);
  }

  const openEditDialog = (team: Day1Team) => {
    setEditingTeam(team);
    setIsDialogOpen(true);
  }


  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-3xl tracking-wider flex items-center gap-3">
                    <Users className="h-8 w-8" />
                    Team Management (Day 1)
                </CardTitle>
                <CardDescription>Register all 17 teams and assign them to groups A, B, or C.</CardDescription>
            </div>
            <Button onClick={openAddDialog} className="text-lg tracking-wider gap-2">
                <PlusCircle /> Add New Team
            </Button>
        </CardHeader>
        <CardContent>
             <div className="rounded-lg border">
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-lg tracking-wider">Team Name</TableHead>
                        <TableHead className="text-lg tracking-wider text-center">Group</TableHead>
                        <TableHead className="text-right text-lg tracking-wider">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {teams.map((team) => (
                    <TableRow key={team.teamId} className="text-lg">
                        <TableCell className="font-medium">{team.teamName}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant="outline" className="text-md">Group {team.group}</Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(team)}>
                            <Pencil className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteTeam(team.teamId)}>
                            <Trash2 className="h-5 w-5" />
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSaveTeam}>
              <DialogHeader>
                <DialogTitle className="text-3xl tracking-wider">
                  {editingTeam ? "Edit Team" : "Add New Team"}
                </DialogTitle>
                <DialogDescription>
                  Enter the details for the Day 1 team. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="text-lg tracking-wider">Team Name</Label>
                  <Input id="teamName" name="teamName" defaultValue={editingTeam?.teamName} required />
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
                    </SelectContent>
                    </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="text-lg tracking-wider">{editingTeam ? "Save Changes" : "Create Team"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
    </>
  );
}
