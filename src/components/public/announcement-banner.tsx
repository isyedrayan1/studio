"use client";

import { mockAnnouncements } from "@/lib/data";
import { Megaphone } from "lucide-react";
import { useEffect, useState } from "react";

export function AnnouncementBanner() {
  const [latestAnnouncement, setLatestAnnouncement] = useState(mockAnnouncements[0]);

  // Simulate real-time updates for announcements
  useEffect(() => {
    const interval = setInterval(() => {
      // This would be replaced by a fetch call in a real app
      setLatestAnnouncement(prev => {
        const currentIndex = mockAnnouncements.findIndex(a => a.id === prev.id);
        const nextIndex = (currentIndex + 1) % mockAnnouncements.length;
        return mockAnnouncements[nextIndex];
      });
    }, 20000); // Cycle announcements every 20 seconds

    return () => clearInterval(interval);
  }, []);

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
