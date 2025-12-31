import { mockMatches } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarDays, Swords } from "lucide-react";

export default function SchedulePage() {
  const matchesByDay = mockMatches.reduce((acc, match) => {
    (acc[match.day] = acc[match.day] || []).push(match);
    return acc;
  }, {} as Record<number, typeof mockMatches>);

  return (
    <div className="container py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <CalendarDays className="w-16 h-16 text-primary drop-shadow-[0_2px_4px_hsl(var(--primary)/0.5)]" />
        <h1 className="text-6xl md:text-7xl font-bold tracking-wider mt-4">
          Match Schedule
        </h1>
        <p className="text-xl text-muted-foreground mt-2 tracking-widest">
          All the action, all the dates. Don't miss a single match.
        </p>
      </div>

      <div className="space-y-12">
        {Object.entries(matchesByDay).map(([day, matches]) => (
          <div key={day}>
            <h2 className="text-5xl font-bold tracking-wider text-accent mb-6">
              Day {day}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <Card key={match.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-3xl tracking-wider flex items-center gap-3">
                        <Swords className="h-7 w-7 text-primary" />
                        Match {match.matchInDay}
                      </CardTitle>
                      <Badge
                        variant={
                          match.status === "live"
                            ? "destructive"
                            : match.status === "finished"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-md tracking-wider"
                      >
                        {match.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow flex items-center justify-center">
                    {match.status === "upcoming" ? (
                      <p className="text-muted-foreground text-lg">
                        Teams to be announced.
                      </p>
                    ) : match.status === "live" ? (
                      <p className="text-primary text-lg animate-pulse">
                        Match is currently live!
                      </p>
                    ) : (
                      <p className="text-muted-foreground text-lg">
                        View results on the leaderboard.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
