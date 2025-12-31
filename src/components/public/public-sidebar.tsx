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
  Flame,
  Shield,
} from "lucide-react";
import { Logo } from "../icons/logo";
import { Button } from "../ui/button";

const menuItems = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: Calendar,
  },
  {
    href: "/leaderboard",
    label: "Overall Leaderboard",
    icon: Trophy,
  },
  {
    href: "/day1/leaderboard",
    label: "Day 1 Qualifiers",
    icon: Flame,
  },
];

export function PublicSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname.startsWith("/admin") || pathname === "/login") {
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
        <Button onClick={() => router.push('/login')} variant="outline" className="w-full justify-start gap-2 tracking-wider text-lg">
          <Shield className="h-5 w-5" />
          <span>Admin Login</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
