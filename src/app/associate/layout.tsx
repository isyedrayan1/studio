"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts";
import { Button } from "@/components/ui/button";
import { Trophy, LogOut, Loader2 } from "lucide-react";
import { Logo } from "@/components/icons/logo";

export default function AssociateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isAssociate, isAdmin, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (isAdmin) {
        // Admins should use the admin panel
        router.push("/admin/dashboard");
      } else if (!isAssociate) {
        // Unknown role
        router.push("/login");
      }
    }
  }, [isAuthenticated, isAssociate, isAdmin, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  // Show loading while checking auth
  if (loading || !isAssociate) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </main>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple header for associates */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl tracking-wider">Arena Ace</span>
            <span className="text-sm text-muted-foreground tracking-wider">| Score Entry</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
