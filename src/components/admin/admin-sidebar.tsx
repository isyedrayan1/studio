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
  GanttChartSquare,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Shield,
  Swords,
  Users,
} from "lucide-react";
import { Logo } from "../icons/logo";
import { Button } from "../ui/button";

const menuItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/teams",
    label: "Teams",
    icon: Users,
  },
  {
    href: "/admin/matches",
    label: "Matches",
    icon: Swords,
  },
  {
    href: "/admin/announcements",
    label: "Announcements",
    icon: Megaphone,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                onClick={() => router.push(item.href)}
                isActive={pathname === item.href}
                className="text-lg tracking-wider"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
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
