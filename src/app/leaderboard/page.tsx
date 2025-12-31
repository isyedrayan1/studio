import { LeaderboardTable } from "@/components/public/leaderboard-table";
import { Crown } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="container py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <Crown className="w-16 h-16 text-primary drop-shadow-[0_2px_4px_hsl(var(--primary)/0.5)]" />
        <h1 className="text-6xl md:text-7xl font-bold tracking-wider mt-4">
          Overall Standings
        </h1>
        <p className="text-xl text-muted-foreground mt-2 tracking-widest">
          Who will claim victory? Rankings update live after each match.
        </p>
      </div>
      <LeaderboardTable />
    </div>
  );
}
