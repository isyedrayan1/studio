"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { signInAdmin, signInAssociate, firebaseUser, userProfile, associateAccount, loading: authLoading, isAdmin, isAssociate } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginId, setLoginId] = useState("");
  const [associatePassword, setAssociatePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("admin");

  useEffect(() => {
    const role = searchParams.get("role");
    if (role === "associate") setActiveTab("associate");
    else setActiveTab("admin");
  }, [searchParams]);

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
      <div className="w-full flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-yellow-300" />
      </div>
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
    <div className="container flex justify-center px-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-blue-50 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-zinc-800 p-4 rounded-full border border-zinc-700 mb-6 w-20 h-20 flex items-center justify-center">
              <Shield className="h-10 w-10 text-yellow-300" />
            </div>
            <CardTitle className="text-5xl font-zentry text-white uppercase tracking-wider">LOG I<b>N</b></CardTitle>
            <p className="text-gray-400 font-general uppercase text-xs tracking-widest mt-2">
              Free Fire Students Association League
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-zinc-950 p-1 border border-zinc-800">
                <TabsTrigger 
                    value="admin" 
                    className="font-general uppercase text-xs tracking-wider data-[state=active]:bg-yellow-300 data-[state=active]:text-black text-gray-400"
                >
                    Admin
                </TabsTrigger>
                <TabsTrigger 
                    value="associate" 
                    className="font-general uppercase text-xs tracking-wider data-[state=active]:bg-yellow-300 data-[state=active]:text-black text-gray-400"
                >
                    Associate
                </TabsTrigger>
              </TabsList>
              
              {/* Admin Login Tab */}
              <TabsContent value="admin" className="space-y-6">
                <form onSubmit={handleAdminLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="font-general uppercase text-xs tracking-wider text-gray-400">Email Address</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@ffsal.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-black border-zinc-800 text-white placeholder:text-zinc-700 h-12 focus-visible:ring-yellow-300"
                      autoComplete="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password" className="font-general uppercase text-xs tracking-wider text-gray-400">Password</Label>
                    <Input 
                      id="admin-password" 
                      type="password" 
                      placeholder="••••••••"
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-black border-zinc-800 text-white placeholder:text-zinc-700 h-12 focus-visible:ring-yellow-300" 
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-yellow-300 text-black font-general uppercase text-sm hover:bg-yellow-400 transition-all font-bold tracking-wider" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Access Dashboard"
                    )}
                  </Button>
                </form>
                
                {/* Switcher for Admin Tab */}
                <div className="pt-4 border-t border-zinc-800 text-center">
                    <p className="text-gray-500 text-sm font-circular-web">
                        Are you an Associate?{" "}
                        <button onClick={() => setActiveTab("associate")} className="text-yellow-300 hover:underline font-semibold ml-1">
                            Click here to login
                        </button>
                    </p>
                </div>
              </TabsContent>
              
              {/* Associate Login Tab */}
              <TabsContent value="associate" className="space-y-6">
                <form onSubmit={handleAssociateLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="associate-id" className="font-general uppercase text-xs tracking-wider text-gray-400">Access ID</Label>
                    <Input
                      id="associate-id"
                      type="text"
                      placeholder="Enter your ID"
                      required
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="bg-black border-zinc-800 text-white placeholder:text-zinc-700 h-12 focus-visible:ring-yellow-300"
                      autoComplete="username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="associate-password" className="font-general uppercase text-xs tracking-wider text-gray-400">Access Key</Label>
                    <Input 
                      id="associate-password" 
                      type="password" 
                      placeholder="••••••••"
                      required 
                      value={associatePassword}
                      onChange={(e) => setAssociatePassword(e.target.value)}
                      className="bg-black border-zinc-800 text-white placeholder:text-zinc-700 h-12 focus-visible:ring-yellow-300" 
                      autoComplete="current-password"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12 bg-yellow-300 text-black font-general uppercase text-sm hover:bg-yellow-400 transition-all font-bold tracking-wider" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Access Portal"
                    )}
                  </Button>
                </form>

                {/* Switcher for Associate Tab */}
                 <div className="pt-4 border-t border-zinc-800 text-center">
                    <p className="text-gray-500 text-sm font-circular-web">
                        Are you an Admin?{" "}
                        <button onClick={() => setActiveTab("admin")} className="text-yellow-300 hover:underline font-semibold ml-1">
                            Login here
                        </button>
                    </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="flex-1 w-full min-h-screen bg-black flex items-center justify-center">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
