"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AnnouncementsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Megaphone className="h-12 w-12 text-primary" />
        <div>
          <h1 className="text-5xl font-bold tracking-wider">Announcements</h1>
          <p className="text-muted-foreground text-xl tracking-widest mt-1">
            Post updates and notifications to public pages.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Link href="/admin/dashboard">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <Button className="gap-2" disabled>
          <Plus className="h-4 w-4" />
          Add Announcement
        </Button>
      </div>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Megaphone className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-xl text-muted-foreground">No announcements found</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Announcements will appear here once created.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
