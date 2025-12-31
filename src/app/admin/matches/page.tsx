import { MatchManagement } from "@/components/admin/match-management";
import { Swords } from "lucide-react";

export default function MatchesPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Swords className="h-12 w-12 text-primary" />
                <div>
                    <h1 className="text-5xl font-bold tracking-wider">Match & Score Management</h1>
                    <p className="text-muted-foreground text-xl tracking-widest mt-1">Create matches, enter scores, and lock results.</p>
                </div>
            </div>
            <MatchManagement />
        </div>
    )
}
