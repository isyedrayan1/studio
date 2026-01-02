"use client";

import { useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  ArrowLeft,
  Loader2,
  Crown,
  Swords,
  ChevronRight,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { useTournament } from "@/contexts";
import type { BracketMatch } from "@/lib/types";

const ROUND_NAMES: Record<number, string> = {
  1: "Quarterfinals",
  2: "Semifinals",
  3: "Finals",
};

const STATUS_CONFIG = {
  upcoming: { label: "Upcoming", color: "bg-slate-500" },
  live: { label: "LIVE", color: "bg-red-500 animate-pulse" },
  finished: { label: "Finished", color: "bg-blue-500" },
};

function BracketPageContent() {
  const searchParams = useSearchParams();
  const dayIdParam = searchParams.get("dayId");

  const { days, bracketMatches, loading, getTeamById } = useTournament();

  // Find the CS Ranked day - either from URL param or first cs-bracket type
  const csDay = useMemo(() => {
    if (dayIdParam) {
      const dayFromParam = days.find(d => d.id === dayIdParam && d.type === "cs-bracket");
      if (dayFromParam) return dayFromParam;
    }
    return days.find(d => d.type === "cs-bracket");
  }, [days, dayIdParam]);

  const dayBracket = bracketMatches.filter(m => m.dayId === csDay?.id);
  const hasBracket = dayBracket.length > 0;

  // Find champion
  const champion = useMemo(() => {
    const finals = dayBracket.find(m => m.round === 3);
    return finals?.winnerId ? getTeamById(finals.winnerId) : null;
  }, [dayBracket, getTeamById]);

  // Check if any match is live
  const hasLiveMatch = dayBracket.some(m => m.status === "live");

  const renderMatchCard = (match: BracketMatch) => {
    const team1 = match.team1Id ? getTeamById(match.team1Id) : null;
    const team2 = match.team2Id ? getTeamById(match.team2Id) : null;
    const isLive = match.status === "live";
    const isFinished = match.status === "finished";

    return (
      <Card
        key={match.id}
        className={`${isFinished ? "opacity-75" : ""} ${match.round === 3 ? "border-primary border-2" : ""} ${isLive ? "ring-2 ring-red-500" : ""}`}
      >
        <CardHeader className="py-2 px-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {ROUND_NAMES[match.round]} - Match {match.matchInRound}
            </span>
            <Badge className={`${STATUS_CONFIG[match.status].color} text-white text-xs gap-1`}>
              {isLive && <Radio className="h-3 w-3" />}
              {STATUS_CONFIG[match.status].label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="py-2 px-4 space-y-2">
          {/* Team 1 */}
          <div className={`flex items-center justify-between p-3 rounded-md transition-colors ${match.winnerId === match.team1Id
              ? "bg-green-500/20 border border-green-500"
              : match.winnerId && match.winnerId !== match.team1Id
                ? "bg-red-500/10 opacity-50"
                : "bg-muted/50"
            }`}>
            <div className="flex items-center gap-2">
              {match.winnerId === match.team1Id && <Crown className="h-4 w-4 text-yellow-500" />}
              <span className={`font-medium ${match.winnerId === match.team1Id ? "text-green-600" : ""}`}>
                {team1?.name || "TBD"}
              </span>
              {team1?.tag && <Badge variant="outline" className="text-xs">{team1.tag}</Badge>}
            </div>
          </div>

          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <span>VS</span>
          </div>

          {/* Team 2 */}
          <div className={`flex items-center justify-between p-3 rounded-md transition-colors ${match.winnerId === match.team2Id
              ? "bg-green-500/20 border border-green-500"
              : match.winnerId && match.winnerId !== match.team2Id
                ? "bg-red-500/10 opacity-50"
                : "bg-muted/50"
            }`}>
            <div className="flex items-center gap-2">
              {match.winnerId === match.team2Id && <Crown className="h-4 w-4 text-yellow-500" />}
              <span className={`font-medium ${match.winnerId === match.team2Id ? "text-green-600" : ""}`}>
                {team2?.name || "TBD"}
              </span>
              {team2?.tag && <Badge variant="outline" className="text-xs">{team2.tag}</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <main className="flex-1 w-full">
      <div className="container py-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <Trophy className="w-16 h-16 text-primary drop-shadow-[0_2px_4px_hsl(var(--primary)/0.5)]" />
          <h1 className="text-6xl md:text-7xl font-bold font-display mt-4">
            {csDay ? `DAY ${csDay.dayNumber}: ${csDay.name.toUpperCase()}` : "CS RANKED"}
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Knockout Bracket — 8 Teams → 1 Champion
          </p>
          {hasLiveMatch && (
            <Badge className="mt-4 bg-red-500 text-white gap-1 text-lg px-4 py-2 animate-pulse">
              <Radio className="h-4 w-4" />
              LIVE MATCH IN PROGRESS
            </Badge>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Link href="/leaderboard">
            <Button variant="outline" className="gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </Button>
          </Link>
        </div>

        {/* Champion Banner */}
        {champion && (
          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500 mb-8">
            <CardContent className="flex items-center justify-center gap-4 py-8">
              <Crown className="h-12 w-12 text-yellow-500" />
              <div className="text-center">
                <p className="text-sm text-muted-foreground uppercase">🏆 CHAMPION 🏆</p>
                <h2 className="text-5xl font-bold">{champion.name}</h2>
                {champion.tag && <Badge className="mt-2 text-lg">{champion.tag}</Badge>}
              </div>
              <Crown className="h-12 w-12 text-yellow-500" />
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {loading ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-16 w-16 text-muted-foreground/50 mb-4 animate-spin" />
              <p className="text-xl text-muted-foreground">Loading bracket...</p>
            </CardContent>
          </Card>
        ) : !hasBracket ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Swords className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-xl text-muted-foreground">Bracket not ready yet</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                The Day 3 bracket will appear here once it&apos;s initialized.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8">
            {/* Bracket Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Quarterfinals */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 justify-center md:justify-start">
                  <Swords className="h-5 w-5" />
                  Quarterfinals
                </h3>
                <div className="space-y-4">
                  {dayBracket.filter(m => m.round === 1).map(renderMatchCard)}
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <ChevronRight className="h-12 w-12 text-muted-foreground" />
              </div>

              {/* Semifinals */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2 justify-center md:justify-start">
                  <Swords className="h-5 w-5" />
                  Semifinals
                </h3>
                <div className="space-y-4">
                  {dayBracket.filter(m => m.round === 2).map(renderMatchCard)}
                </div>
              </div>
            </div>

            <Separator />

            {/* Finals */}
            <div className="flex flex-col items-center">
              <h3 className="text-3xl font-bold flex items-center gap-2 mb-6">
                <Trophy className="h-8 w-8 text-primary" />
                Grand Finals
              </h3>
              <div className="w-full max-w-lg">
                {dayBracket.filter(m => m.round === 3).map(renderMatchCard)}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function BracketPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <BracketPageContent />
    </Suspense>
  );
}
