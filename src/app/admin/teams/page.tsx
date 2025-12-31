import { TeamManagement } from "@/components/admin/team-management";
import { Users } from "lucide-react";

export default function TeamsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Users className="h-12 w-12 text-primary" />
                <div>
                    <h1 className="text-5xl font-bold tracking-wider">Team Management</h1>
                    <p className="text-muted-foreground text-xl tracking-widest mt-1">Add, edit, and manage all competing teams.</p>
                </div>
            </div>
            <TeamManagement />
        </div>
    );
}
