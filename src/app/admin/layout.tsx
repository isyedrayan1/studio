"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isAssociate, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (isAssociate && !isAdmin) {
        // Associates should use the associate panel
        router.push("/associate/scores");
      }
    }
  }, [isAuthenticated, isAdmin, isAssociate, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </main>
    );
  }

  // Not authenticated or not admin - redirect handled by useEffect
  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  return (
    <>
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
    </>
  );
}
