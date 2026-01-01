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
          {/* Logo and tagline */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <Logo className="h-10 w-10 text-primary" />
              <span className="text-3xl tracking-wider font-bold">Arena Ace</span>
            </div>
            <p className="text-center text-muted-foreground tracking-wider flex items-center gap-2">
              <Flame className="h-4 w-4 text-primary" />
              Built for the ultimate Free Fire showdown
              <Flame className="h-4 w-4 text-primary" />
            </p>
          </div>

          {/* Quick Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-lg tracking-wider">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/tournament" className="text-muted-foreground hover:text-primary transition-colors">
              Tournament
            </Link>
            <Link href="/schedule" className="text-muted-foreground hover:text-primary transition-colors">
              Schedule
            </Link>
          </nav>

          {/* Copyright */}
          <div className="border-t border-border/40 pt-6 w-full text-center">
            <p className="text-sm text-muted-foreground">
              © {year ?? 2025} Arena Ace. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
