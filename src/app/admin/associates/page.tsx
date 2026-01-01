"use client";

import { useState, useEffect } from "react";
import { useAuth, useTournament } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import {
  getAssociateAccounts,
  addAssociateAccount,
  updateAssociateAccount,
  deleteAssociateAccount,
} from "@/lib/firebase";
import type { AssociateAccount } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function AssociateAccountsPage() {
  const { userProfile } = useAuth();
  const { teams } = useTournament();
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<AssociateAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState<AssociateAccount | null>(null);
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [teamId, setTeamId] = useState("");
  const [active, setActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Load accounts
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await getAssociateAccounts();
      setAccounts(data);
    } catch (error) {
      console.error("Error loading accounts:", error);
      toast({
        title: "Error",
        description: "Failed to load associate accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!loginId || !password || !teamId) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const team = teams.find((t) => t.id === teamId);
      await addAssociateAccount({
        loginId,
        password,
        teamId,
        teamName: team?.name || "",
        active,
        createdBy: userProfile?.id || "unknown",
      });

      toast({ title: "Success", description: "Associate account created" });
      setIsAddOpen(false);
      resetForm();
      loadAccounts();
    } catch (error) {
      console.error("Error adding account:", error);
      toast({
        title: "Error",
        description: "Failed to create account",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedAccount || !loginId || !password || !teamId) return;

    try {
      const team = teams.find((t) => t.id === teamId);
      await updateAssociateAccount(selectedAccount.id, {
        loginId,
        password,
        teamId,
        teamName: team?.name || "",
        active,
      });

      toast({ title: "Success", description: "Account updated" });
      setIsEditOpen(false);
      resetForm();
      loadAccounts();
    } catch (error) {
      console.error("Error updating account:", error);
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;

    try {
      await deleteAssociateAccount(selectedAccount.id);
      toast({ title: "Success", description: "Account deleted" });
      setIsDeleteOpen(false);
      setSelectedAccount(null);
      loadAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEditDialog = (account: AssociateAccount) => {
    setSelectedAccount(account);
    setLoginId(account.loginId);
    setPassword(account.password);
    setTeamId(account.teamId);
    setActive(account.active);
    setIsEditOpen(true);
  };

  const openDeleteDialog = (account: AssociateAccount) => {
    setSelectedAccount(account);
    setIsDeleteOpen(true);
  };

  const resetForm = () => {
    setLoginId("");
    setPassword("");
    setTeamId("");
    setActive(true);
    setSelectedAccount(null);
    setShowPassword(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-wider">Associate Accounts</h1>
          <p className="text-muted-foreground text-xl tracking-widest mt-1">
            Manage login credentials for score entry associates
          </p>
        </div>
        <Button onClick={openAddDialog} size="lg" className="tracking-wider">
          <UserPlus className="mr-2 h-5 w-5" />
          Add Account
        </Button>
      </div>

      {/* Accounts Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Login ID</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No associate accounts created yet
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-mono">{account.loginId}</TableCell>
                  <TableCell className="font-mono">{'•'.repeat(account.password.length)}</TableCell>
                  <TableCell>{account.teamName || account.teamId}</TableCell>
                  <TableCell>
                    <Badge variant={account.active ? "default" : "secondary"}>
                      {account.active ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(account)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(account)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Associate Account</DialogTitle>
            <DialogDescription>
              Create login credentials for a score entry associate
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-login-id">Login ID</Label>
              <Input
                id="add-login-id"
                placeholder="e.g., TEAM001"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">Password</Label>
              <div className="relative">
                <Input
                  id="add-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-team">Assign Team</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={active} onCheckedChange={setActive} id="add-active" />
              <Label htmlFor="add-active">Account Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Create Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Associate Account</DialogTitle>
            <DialogDescription>Update account credentials and settings</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-login-id">Login ID</Label>
              <Input
                id="edit-login-id"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-team">Assign Team</Label>
              <Select value={teamId} onValueChange={setTeamId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={active} onCheckedChange={setActive} id="edit-active" />
              <Label htmlFor="edit-active">Account Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Associate Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAccount?.loginId}? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
