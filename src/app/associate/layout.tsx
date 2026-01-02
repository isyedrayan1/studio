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
  const { isAuthenticated, isAssociate, isAdmin, loading, signOut, associateAccount } = useAuth();

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
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm h-16">
          <div className="container flex items-center h-full px-4">
            <Logo className="h-6 w-6 md:h-8 md:w-8 text-primary/50" />
          </div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </main>
      </div>
    );
  }

  // Not authenticated or not associate - redirect handled by useEffect
  if (!isAuthenticated || !isAssociate) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple header for associates */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4 gap-2">
          <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
            <Logo className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0" />
            <div className="flex flex-col md:flex-row md:items-center md:gap-2 overflow-hidden">
              <span className="text-lg md:text-2xl font-bold tracking-tight md:tracking-wider truncate">Arena Ace</span>
              <span className="hidden md:inline text-sm text-muted-foreground uppercase tracking-widest whitespace-nowrap">| Score Entry</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 ml-auto">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-primary uppercase tracking-tighter">Associate</span>
              <span className="text-sm font-medium truncate max-w-[150px]">
                {associateAccount?.loginId} | {associateAccount?.teamName || "No Team"}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 h-9 px-2 md:px-3">
              <LogOut className="h-4 w-4" />
              <span className="hidden xs:inline">Sign Out</span>
            </Button>
          </div>
        </div>
        {/* Mobile identity bar - use fixed height to prevent shift */}
        <div className="sm:hidden border-t border-border/40 px-4 py-1.5 bg-muted/30 flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground min-h-[28px]">
          {associateAccount ? (
            <>
              <span className="truncate mr-2">ID: {associateAccount.loginId}</span>
              <span className="truncate">Team: {associateAccount.teamName || "N/A"}</span>
            </>
          ) : (
            <span className="opacity-0">Loading...</span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
