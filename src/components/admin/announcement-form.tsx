"use client";

import { useState } from "react";
import type { Announcement } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { BellRing, Megaphone, Trash2 } from "lucide-react";

interface AnnouncementFormProps {
    announcements?: Announcement[];
    onAddAnnouncement?: (content: string, priority: 'normal' | 'urgent') => Promise<void>;
    onDeleteAnnouncement?: (id: string) => Promise<void>;
}

export function AnnouncementForm({ 
    announcements = [], 
    onAddAnnouncement, 
    onDeleteAnnouncement 
}: AnnouncementFormProps) {
    const [newAnnouncement, setNewAnnouncement] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handlePostAnnouncement = async () => {
        if(newAnnouncement.trim() === "") {
            toast({ title: "Error", description: "Announcement content cannot be empty.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            await onAddAnnouncement?.(newAnnouncement.trim(), 'normal');
            setNewAnnouncement("");
            toast({ title: "Announcement Posted", description: "Your announcement is now live." });
        } catch (error) {
            toast({ title: "Error", description: "Failed to post announcement.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await onDeleteAnnouncement?.(id);
            toast({ title: "Announcement Deleted", variant: "destructive"});
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete announcement.", variant: "destructive" });
        }
    };

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
                    <Button 
                        onClick={handlePostAnnouncement} 
                        className="w-full text-lg tracking-wider gap-2 py-6"
                        disabled={isLoading}
                    >
                        <BellRing /> {isLoading ? "Posting..." : "Post Announcement"}
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl tracking-wider">Recent Announcements</CardTitle>
                    <CardDescription>A log of all posted announcements.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    {announcements.length === 0 ? (
                        <div className="text-center py-8">
                            <Megaphone className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                            <p className="text-muted-foreground">No announcements yet.</p>
                        </div>
                    ) : (
                        announcements.map(announcement => (
                            <div key={announcement.id} className="flex items-start justify-between gap-4 p-3 rounded-md bg-secondary">
                               <div>
                                    <p className="text-lg">{announcement.content}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                                    </p>
                               </div>
                               <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive shrink-0" onClick={() => handleDelete(announcement.id)}>
                                    <Trash2 className="h-5 w-5" />
                               </Button>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
