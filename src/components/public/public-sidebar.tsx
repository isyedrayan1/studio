"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  Calendar,
  Trophy,
} from "lucide-react";
import { Logo } from "../icons/logo";
import { Button } from "../ui/button";

export function PublicSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide sidebar on admin, associate, and login pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/associate") || pathname === "/login") {
    return null;
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-2xl tracking-wider">Arena Ace</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* Home */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/")}
              isActive={pathname === "/"}
              className="text-lg tracking-wider"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Tournament */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/leaderboard")}
              isActive={pathname === "/leaderboard"}
              className="text-lg tracking-wider"
            >
              <Trophy className="h-5 w-5" />
              <span>Tournament</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Schedule */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/schedule")}
              isActive={pathname === "/schedule"}
              className="text-lg tracking-wider"
            >
              <Calendar className="h-5 w-5" />
              <span>Schedule</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={() => router.push('/login')} variant="ghost" className="w-full justify-start gap-2 tracking-wider text-lg">
          <span>Admin Login</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
