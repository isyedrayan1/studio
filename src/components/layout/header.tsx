"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../icons/logo";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "../ui/sidebar";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/schedule", label: "Schedule" },
];

export function Header() {
  const pathname = usePathname();

  // Hide header on admin, associate, and login pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/associate") || pathname === "/login") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
        <Link href="/" className="mr-8 flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <div className="hidden sm:block">
            <div className="font-display text-2xl leading-tight text-primary">
              FFSAL
            </div>
            <div className="text-[10px] font-normal text-muted-foreground -mt-1 tracking-normal">
              Free Fire Students League
            </div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-primary",
                pathname === item.href ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end">
          <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground text-sm font-medium">
            <Link href="/login">Admin Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
