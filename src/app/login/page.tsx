"use client";

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
import { Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    // In a real app, you'd validate credentials here.
    // For this scaffold, we'll just simulate a successful login.
    toast({
      title: "Login Successful",
      description: "Redirecting to the admin dashboard...",
    });
    router.push("/admin/dashboard");
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-sm border-primary/50 shadow-lg shadow-primary/10">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/20 p-3 rounded-full border border-primary/50 mb-4">
              <Shield className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-4xl tracking-wider">Admin Access</CardTitle>
            <CardDescription className="tracking-widest">
              Enter credentials to manage Arena Ace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="tracking-wider text-lg">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@arenaace.com"
                required
                defaultValue="admin@arenaace.com"
                className="text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="tracking-wider text-lg">Password</Label>
              <Input id="password" type="password" required defaultValue="password" className="text-lg" />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-xl tracking-widest py-6">
              Log In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
