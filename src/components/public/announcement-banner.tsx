"use client";

import type { Announcement } from "@/lib/types";
import { Megaphone } from "lucide-react";

interface AnnouncementBannerProps {
  announcements?: Announcement[];
}

export function AnnouncementBanner({ announcements = [] }: AnnouncementBannerProps) {
  // Get the latest active announcement
  const latestAnnouncement = announcements.find(a => a.active);

  if (!latestAnnouncement) {
    return null;
  }

  return (
    <div className="w-full bg-accent text-accent-foreground py-2 text-center text-lg tracking-wider">
      <div className="container flex items-center justify-center gap-4">
        <Megaphone className="h-6 w-6" />
        <p>{latestAnnouncement.content}</p>
      </div>
    </div>
  );
}
