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
  const { signIn, register, firebaseUser, userProfile, loading: authLoading, isAdmin, isAssociate } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect based on role when already logged in
  useEffect(() => {
    if (firebaseUser && userProfile && !authLoading) {
      if (isAdmin) {
        router.push("/admin/dashboard");
      } else if (isAssociate) {
        router.push("/associate/scores");
      }
    }
  }, [firebaseUser, userProfile, authLoading, isAdmin, isAssociate, router]);

  // Show nothing while redirecting
  if (firebaseUser && userProfile && !authLoading) {
    return null;
  }

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast({
        title: "Login Successful",
        description: "Redirecting...",
      });
      // Redirect is handled by useEffect based on role
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

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Registration Failed",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      await register(email, password, name);
      toast({
        title: "Registration Successful",
        description: "Welcome! Redirecting to score entry...",
      });
      // Redirect is handled by useEffect based on role
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      toast({
        title: "Registration Failed",
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
            <CardTitle className="text-4xl tracking-wider">Arena Ace</CardTitle>
            <CardDescription className="tracking-widest">
              Sign in or register to manage tournaments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="login" className="tracking-wider">Login</TabsTrigger>
                <TabsTrigger value="register" className="tracking-wider">Register</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="tracking-wider text-lg">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-lg"
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="tracking-wider text-lg">Password</Label>
                    <Input 
                      id="login-password" 
                      type="password" 
                      placeholder="Enter your password"
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="text-lg" 
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" className="w-full text-xl tracking-widest py-6" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Log In"
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name" className="tracking-wider text-lg">Name</Label>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Enter your name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-lg"
                      autoComplete="name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email" className="tracking-wider text-lg">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-lg"
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password" className="tracking-wider text-lg">Password</Label>
                    <Input 
                      id="reg-password" 
                      type="password" 
                      placeholder="At least 6 characters"
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="text-lg" 
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm" className="tracking-wider text-lg">Confirm Password</Label>
                    <Input 
                      id="reg-confirm" 
                      type="password" 
                      placeholder="Confirm your password"
                      required 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="text-lg" 
                      autoComplete="new-password"
                    />
                  </div>
                  <Button type="submit" className="w-full text-xl tracking-widest py-6" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Register as Associate
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    New registrations get Associate access for score entry.
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
