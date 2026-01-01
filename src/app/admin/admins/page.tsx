"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import { db, auth } from "@/lib/firebase/config";
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import type { User } from "@/lib/types";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2, Shield } from "lucide-react";

export default function AdminManagementPage() {
  const { firebaseUser } = useAuth();
  const { toast } = useToast();

  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  // Load admins
  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const adminList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as User[];
      setAdmins(adminList);
    } catch (error) {
      console.error("Error loading admins:", error);
      toast({
        title: "Error",
        description: "Failed to load admins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!email || !password || !name) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);

    try {
      // Step 1: Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Step 2: Create Firestore document
      await setDoc(doc(db, "users", newUser.uid), {
        email: newUser.email,
        name: name,
        role: 'admin',
        createdAt: serverTimestamp(),
      });

      toast({ 
        title: "Success", 
        description: `Admin account created for ${email}` 
      });
      
      setIsAddOpen(false);
      resetForm();
      loadAdmins();
    } catch (error: any) {
      console.error("Error creating admin:", error);
      let errorMessage = "Failed to create admin account";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    // Prevent self-deletion
    if (selectedAdmin.id === firebaseUser?.uid) {
      toast({
        title: "Error",
        description: "You cannot delete your own account",
        variant: "destructive",
      });
      return;
    }

    try {
      // Delete Firestore document
      await deleteDoc(doc(db, "users", selectedAdmin.id));
      
      // Note: Deleting Firebase Auth user requires admin SDK (backend)
      // For now, we just delete the Firestore document
      // The user can still login but won't have admin access
      
      toast({ 
        title: "Success", 
        description: "Admin removed (Auth user still exists)" 
      });
      
      setIsDeleteOpen(false);
      setSelectedAdmin(null);
      loadAdmins();
    } catch (error) {
      console.error("Error deleting admin:", error);
      toast({
        title: "Error",
        description: "Failed to delete admin",
        variant: "destructive",
      });
    }
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openDeleteDialog = (admin: User) => {
    setSelectedAdmin(admin);
    setIsDeleteOpen(true);
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setName("");
    setSelectedAdmin(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold tracking-wider">Admin Management</h1>
          <p className="text-muted-foreground text-xl tracking-widest mt-1">
            Create and manage admin accounts
          </p>
        </div>
        <Button onClick={openAddDialog} size="lg" className="tracking-wider">
          <UserPlus className="mr-2 h-5 w-5" />
          Add Admin
        </Button>
      </div>

      {/* Admins Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
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
            ) : admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No admin accounts found
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.email}</TableCell>
                  <TableCell>{admin.name}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Admin
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(admin)}
                      disabled={admin.id === firebaseUser?.uid}
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

      {/* Add Admin Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Admin Account</DialogTitle>
            <DialogDescription>
              Create a new admin with full access to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Full Name</Label>
              <Input
                id="add-name"
                placeholder="Enter admin name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">Password</Label>
              <Input
                id="add-password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAdmin} disabled={creating}>
              {creating ? "Creating..." : "Create Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedAdmin?.email} from admin access?
              This will remove their admin permissions but their account will still exist.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmin}>
              Remove Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
