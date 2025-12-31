"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "../icons/logo";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-border/40">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Logo className="h-8 w-8 text-primary" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for the ultimate Free Fire showdown.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Arena Ace. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
