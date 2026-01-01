"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, UserPlus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signInAdmin, signInAssociate, firebaseUser, userProfile, associateAccount, loading: authLoading, isAdmin, isAssociate } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginId, setLoginId] = useState("");
  const [associatePassword, setAssociatePassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect based on role when logged in
  useEffect(() => {
    if (!authLoading && ((firebaseUser && userProfile) || associateAccount)) {
      const redirectTo = isAdmin ? '/admin/dashboard' : isAssociate ? '/associate/scores' : null;
      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [authLoading, firebaseUser, userProfile, associateAccount, isAdmin, isAssociate, router]);

  // Show loading while auth is being checked
  if (authLoading) {
    return (
      <main className="flex-1 w-full flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  // Already logged in - show nothing while redirecting
  if ((firebaseUser && userProfile) || associateAccount) {
    return null;
  }

  const handleAdminLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await signInAdmin(email, password);
      toast({
        title: "Login Successful",
        description: "Redirecting to admin dashboard...",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Invalid credentials";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssociateLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await signInAssociate(loginId, associatePassword);
      toast({
        title: "Login Successful",
        description: "Redirecting to score entry...",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Invalid credentials";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 w-full flex items-center justify-center py-12">
      <div className="container flex justify-center">
        <Card className="w-full max-w-md border-primary/50 shadow-lg shadow-primary/10">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/20 p-3 rounded-full border border-primary/50 mb-4">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-4xl font-display">FFSAL</CardTitle>
            <CardDescription>
              Free Fire Students Association League
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="admin" className="font-semibold">Admin</TabsTrigger>
                <TabsTrigger value="associate" className="font-semibold">Associate</TabsTrigger>
              </TabsList>
              
              {/* Admin Login Tab */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-lg">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="Enter admin email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-lg"
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="text-lg">Password</Label>
                    <Input 
                      id="admin-password" 
                      type="password" 
                      placeholder="Enter admin password"
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="text-lg" 
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" className="w-full text-xl font-semibold py-6" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Admin Login"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Associate Login Tab */}
              <TabsContent value="associate">
                <form onSubmit={handleAssociateLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="associate-id" className="text-lg">Login ID</Label>
                    <Input
                      id="associate-id"
                      type="text"
                      placeholder="Enter your login ID"
                      required
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="text-lg"
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="associate-password" className="text-lg">Password</Label>
                    <Input 
                      id="associate-password" 
                      type="password" 
                      placeholder="Enter your password"
                      required 
                      value={associatePassword}
                      onChange={(e) => setAssociatePassword(e.target.value)}
                      className="text-lg" 
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" className="w-full text-xl font-semibold py-6" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Associate Login"
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Contact admin for login credentials
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
