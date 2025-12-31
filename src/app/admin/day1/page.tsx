import { TeamManagementDay1 } from "@/components/admin/day1/team-management-day1";
import { MatchManagementDay1 } from "@/components/admin/day1/match-management-day1";
import { Flame } from "lucide-react";

export default function Day1AdminPage() {
  return (
    <div className="space-y-8">
        <div className="flex items-center gap-4">
            <Flame className="h-12 w-12 text-primary" />
            <div>
                <h1 className="text-5xl font-bold tracking-wider">Day 1 Control Center</h1>
                <p className="text-muted-foreground text-xl tracking-widest mt-1">Manage teams and enter scores for the qualifier stage.</p>
            </div>
        </div>
        
        <TeamManagementDay1 />
        
        <MatchManagementDay1 />
    </div>
  );
}
