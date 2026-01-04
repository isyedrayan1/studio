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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Calendar,
  Layers,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Swords,
  Trophy,
  Users,
  GitBranch,
  ChevronDown,
  Settings,
  UserCog,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "../icons/logo";
import { Button } from "../ui/button";
import { useTournament, useAuth } from "@/contexts";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { days, matches } = useTournament();
  const { signOut } = useAuth();

  // Sort days by number
  const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
  
  // Helper to get match type for a day
  const getDayMatchType = (dayId: string): string | null => {
    const dayMatches = matches.filter(m => m.dayId === dayId);
    if (dayMatches.length === 0) return null;
    // Return the first match type found for this day
    return dayMatches[0].type;
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

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
          {/* Dashboard */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/admin/dashboard")}
              isActive={pathname === "/admin/dashboard"}
              className="text-lg tracking-wider"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Teams */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/admin/teams")}
              isActive={pathname === "/admin/teams"}
              className="text-lg tracking-wider"
            >
              <Users className="h-5 w-5" />
              <span>Teams</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Days Dropdown */}
          <SidebarMenuItem>
            <Collapsible defaultOpen className="group/collapsible">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  isActive={pathname.includes("/admin/days") || pathname.includes("/admin/bracket")}
                  className="text-lg tracking-wider justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    <span>Days</span>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-4 mt-1 space-y-1 border-l border-border pl-4">
                  {/* Manage Days */}
                  <SidebarMenuButton
                    onClick={() => router.push("/admin/days")}
                    isActive={pathname === "/admin/days"}
                    className="text-base tracking-wider h-9"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Manage Days</span>
                  </SidebarMenuButton>
                  
                  {/* Dynamic Day Links */}
                  {sortedDays.map(day => {
                    const matchType = getDayMatchType(day.id);
                    return (
                      <SidebarMenuButton
                        key={day.id}
                        onClick={() => {
                          if (matchType === "cs-bracket") {
                            router.push(`/admin/bracket?dayId=${day.id}`);
                          } else if (matchType === "br-shortlist") {
                            router.push(`/admin/groups?dayId=${day.id}`);
                          } else {
                            router.push(`/admin/matches?dayId=${day.id}`);
                          }
                        }}
                        isActive={
                          (matchType === "cs-bracket" && pathname === "/admin/bracket") ||
                          (matchType !== "cs-bracket" && pathname.includes("/admin/matches") && pathname.includes(day.id))
                        }
                        className="text-base tracking-wider h-9"
                      >
                        {matchType === "cs-bracket" ? (
                          <GitBranch className="h-4 w-4" />
                        ) : matchType === "br-shortlist" ? (
                          <Layers className="h-4 w-4" />
                        ) : (
                          <Swords className="h-4 w-4" />
                        )}
                        <span>Day {day.dayNumber}: {day.name}</span>
                      </SidebarMenuButton>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>

          {/* Groups */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/admin/groups")}
              isActive={pathname === "/admin/groups"}
              className="text-lg tracking-wider"
            >
              <Layers className="h-5 w-5" />
              <span>Groups</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Matches */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/admin/matches")}
              isActive={pathname === "/admin/matches"}
              className="text-lg tracking-wider"
            >
              <Swords className="h-5 w-5" />
              <span>Matches</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Scores */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/admin/scores")}
              isActive={pathname === "/admin/scores"}
              className="text-lg tracking-wider"
            >
              <Trophy className="h-5 w-5" />
              <span>Scores</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Score Verification */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/admin/verification")}
              isActive={pathname === "/admin/verification"}
              className="text-lg tracking-wider"
            >
              <ShieldCheck className="h-5 w-5" />
              <span>Verification</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Leaderboard */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/admin/leaderboard")}
              isActive={pathname === "/admin/leaderboard"}
              className="text-lg tracking-wider"
            >
              <Trophy className="h-5 w-5" />
              <span>Leaderboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Associates */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/admin/associates")}
              isActive={pathname === "/admin/associates"}
              className="text-lg tracking-wider"
            >
              <UserCog className="h-5 w-5" />
              <span>Associates</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Admins */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/admin/admins")}
              isActive={pathname === "/admin/admins"}
              className="text-lg tracking-wider"
            >
              <Shield className="h-5 w-5" />
              <span>Admins</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Announcements */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => router.push("/admin/announcements")}
              isActive={pathname === "/admin/announcements"}
              className="text-lg tracking-wider"
            >
              <Megaphone className="h-5 w-5" />
              <span>Announcements</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={handleSignOut} variant="outline" className="w-full justify-start gap-2 tracking-wider text-lg">
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
