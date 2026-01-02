"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "../icons/logo";
import { Flame } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // Hide footer on admin, associate, and login pages
  if (pathname.startsWith("/admin") || pathname.startsWith("/associate") || pathname === "/login") {
    return null;
  }

  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-sm">
      <div className="container py-12">
        <div className="flex flex-col items-center gap-8">
          {/* Logo and title */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <Logo className="h-10 w-10 text-primary" />
              <div className="text-center">
                <div className="font-display text-4xl text-primary leading-tight">
                  FFSAL
                </div>
                <div className="text-sm text-muted-foreground font-normal">
                  Free Fire Students Association League
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground max-w-2xl leading-relaxed flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary shrink-0" />
              Three-day esports tournament showcasing the best Free Fire talent
              <Flame className="h-4 w-4 text-primary shrink-0" />
            </p>
          </div>

          {/* Organizer Information */}
          <div className="bg-muted/30 border border-border/40 rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-center font-semibold text-lg mb-3">Organized By</h3>
            <div className="text-center space-y-2">
              <p className="font-medium text-primary">Thinkbotz Association</p>
              <p className="text-sm text-muted-foreground">
                AIML Department
              </p>
              <p className="text-sm text-muted-foreground">
                Annamacharya Institute of Technology and Sciences
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Kadapa - Chennur
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors">
              Tournament
            </Link>
            <Link href="/schedule" className="text-muted-foreground hover:text-primary transition-colors">
              Schedule
            </Link>
            <Link href="/leaderboard" className="text-muted-foreground hover:text-primary transition-colors">
              Leaderboard
            </Link>
          </nav>

          {/* Copyright */}
          <div className="border-t border-border/40 pt-6 w-full text-center">
            <p className="text-xs text-muted-foreground">
              © {year ?? 2026} FFSAL - Free Fire Students Association League. All Rights Reserved.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Powered by Thinkbotz Association
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
