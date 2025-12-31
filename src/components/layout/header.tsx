"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../icons/logo";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/schedule", label: "Schedule" },
  { href: "/leaderboard", label: "Overall Leaderboard" },
  { href: "/day1/leaderboard", label: "Day 1 Qualifiers" },
];

export function Header() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="hidden text-2xl tracking-wider sm:inline-block">
            Arena Ace
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-lg tracking-wider">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-1 items-center justify-end">
          <Button asChild variant="outline" className="border-accent text-accent hover:bg-accent hover:text-accent-foreground tracking-wider">
            <Link href="/login">Admin Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
