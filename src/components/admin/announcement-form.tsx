"use client";

import { useState } from "react";
import { mockAnnouncements } from "@/lib/data";
import type { Announcement } from "@/lib/definitions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { BellRing, Trash2 } from "lucide-react";

export function AnnouncementForm() {
    const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
    const [newAnnouncement, setNewAnnouncement] = useState("");
    const { toast } = useToast();

    const handlePostAnnouncement = () => {
        if(newAnnouncement.trim() === "") {
            toast({ title: "Error", description: "Announcement content cannot be empty.", variant: "destructive" });
            return;
        }

        const newEntry: Announcement = {
            id: `A${announcements.length + 1}`,
            content: newAnnouncement,
            date: new Date().toISOString(),
        };

        setAnnouncements([newEntry, ...announcements]);
        setNewAnnouncement("");
        toast({ title: "Announcement Posted", description: "Your announcement is now live." });
    }

    const handleDelete = (id: string) => {
        setAnnouncements(announcements.filter(a => a.id !== id));
        toast({ title: "Announcement Deleted", variant: "destructive"});
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl tracking-wider">Post a New Announcement</CardTitle>
                    <CardDescription>This will be displayed prominently on the public pages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea 
                        placeholder="Type your announcement here..." 
                        className="min-h-[150px] text-lg"
                        value={newAnnouncement}
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                    />
                    <Button onClick={handlePostAnnouncement} className="w-full text-lg tracking-wider gap-2 py-6">
                        <BellRing /> Post Announcement
                    </Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="text-3xl tracking-wider">Recent Announcements</CardTitle>
                    <CardDescription>A log of all posted announcements.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    {announcements.map(announcement => (
                        <div key={announcement.id} className="flex items-start justify-between gap-4 p-3 rounded-md bg-secondary">
                           <div>
                                <p className="text-lg">{announcement.content}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {formatDistanceToNow(new Date(announcement.date), { addSuffix: true })}
                                </p>
                           </div>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive shrink-0" onClick={() => handleDelete(announcement.id)}>
                                <Trash2 className="h-5 w-5" />
                           </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
