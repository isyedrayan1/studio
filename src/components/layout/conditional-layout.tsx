"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Navbar from "@/components/zodius/Navbar";
import ZodiusFooter from "@/components/zodius/Footer";
import { usePathname } from "next/navigation";

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Use old Header/Footer only for admin, associate, and login pages
  const isAdminPage = pathname.startsWith("/admin") || pathname.startsWith("/associate") || pathname === "/login";
  
  if (isAdminPage) {
    return (
      <div className="relative flex min-h-screen w-full flex-col">
        <Header />
        <div className="flex flex-1">
          {children}
        </div>
        <Footer />
      </div>
    );
  }
  
  // Use Zodius navbar/footer for all public pages (home, leaderboard, schedule, bracket, etc.)
  return (
    <div className="relative min-h-screen w-full">
      <Navbar />
      <div className="w-full">
        {children}
      </div>
      <ZodiusFooter />
    </div>
  );
}
