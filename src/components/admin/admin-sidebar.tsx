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
} from "lucide-react";
import { Logo } from "../icons/logo";
import { Button } from "../ui/button";
import { useTournament } from "@/contexts";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { days } = useTournament();

  // Sort days by number
  const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
  
  // Find CS Ranked days for showing bracket links
  const csDays = sortedDays.filter(d => d.type === "cs-bracket");

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
                  {sortedDays.map(day => (
                    <SidebarMenuButton
                      key={day.id}
                      onClick={() => {
                        if (day.type === "cs-bracket") {
                          router.push(`/admin/bracket?dayId=${day.id}`);
                        } else if (day.type === "br-shortlist") {
                          router.push(`/admin/groups?dayId=${day.id}`);
                        } else {
                          router.push(`/admin/matches?dayId=${day.id}`);
                        }
                      }}
                      isActive={
                        (day.type === "cs-bracket" && pathname === "/admin/bracket") ||
                        (day.type !== "cs-bracket" && pathname.includes("/admin/matches") && pathname.includes(day.id))
                      }
                      className="text-base tracking-wider h-9"
                    >
                      {day.type === "cs-bracket" ? (
                        <GitBranch className="h-4 w-4" />
                      ) : day.type === "br-shortlist" ? (
                        <Layers className="h-4 w-4" />
                      ) : (
                        <Swords className="h-4 w-4" />
                      )}
                      <span>Day {day.dayNumber}: {day.name}</span>
                    </SidebarMenuButton>
                  ))}
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
        <Button onClick={() => router.push('/')} variant="outline" className="w-full justify-start gap-2 tracking-wider text-lg">
          <LogOut className="h-5 w-5" />
          <span>Exit Admin</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
