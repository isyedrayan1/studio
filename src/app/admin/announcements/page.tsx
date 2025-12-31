import { AnnouncementForm } from "@/components/admin/announcement-form";
import { Megaphone } from "lucide-react";

export default function AnnouncementsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Megaphone className="h-12 w-12 text-primary" />
                <div>
                    <h1 className="text-5xl font-bold tracking-wider">Announcements</h1>
                    <p className="text-muted-foreground text-xl tracking-widest mt-1">Post updates and notifications to the public pages.</p>
                </div>
            </div>
            <AnnouncementForm />
        </div>
    )
}
