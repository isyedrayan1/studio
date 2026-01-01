"use client";

import { useState } from "react";
import type { LeaderboardEntry } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus, Trophy } from "lucide-react";

// Custom skull icon for kills
const SkullIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2c-3.31 0-6 2.69-6 6 0 1.95.93 3.69 2.38 4.78C6.67 13.56 6 14.7 6 16v2c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-2c0-1.3-.67-2.44-1.38-3.22C17.07 11.69 18 10.03 18 8c0-3.31-2.69-6-6-6z" />
    <path d="M9 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
    <path d="M15 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
    <path d="M12 17c-1.66 0-3 1.34-3 3h6c0-1.66-1.34-3-3-3z" />
  </svg>
);

interface LeaderboardTableProps {
  leaderboard?: LeaderboardEntry[];
  qualificationCutoff?: number;
}

export function LeaderboardTable({ 
  leaderboard = [], 
  qualificationCutoff = 12 
}: LeaderboardTableProps) {
  
  // Empty state
  if (leaderboard.length === 0) {
    return (
      <div className="rounded-lg border bg-card/50 backdrop-blur-sm p-12 text-center">
        <Trophy className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-2xl tracking-wider text-muted-foreground">No Rankings Yet</h3>
        <p className="text-lg text-muted-foreground/70 mt-2">
          Leaderboard will appear once matches are completed.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card/50 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="text-lg tracking-wider hover:bg-transparent border-b-accent">
            <TableHead className="w-[80px] text-center">Rank</TableHead>
            <TableHead>Team</TableHead>
            <TableHead className="text-center">Matches</TableHead>
            <TableHead className="text-center">Kills</TableHead>
            <TableHead className="text-right text-primary">Total Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaderboard.map((entry, index) => (
            <TableRow 
              key={entry.teamId} 
              className={cn(
                "transition-all duration-500 ease-in-out text-xl tracking-wider",
                entry.isQualified ? "bg-accent/10 hover:bg-accent/20" : "hover:bg-muted/10 opacity-60",
                index === qualificationCutoff - 1 && "border-b-2 border-accent/30",
              )}
            >
              <TableCell className="text-center font-bold text-2xl">
                {entry.rank}
              </TableCell>
              <TableCell className="font-semibold text-2xl">
                {entry.teamName}
                {entry.groupName && (
                  <span className="ml-2 text-sm text-muted-foreground">({entry.groupName})</span>
                )}
              </TableCell>
              <TableCell className="text-center text-muted-foreground">
                {entry.matchesPlayed}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <SkullIcon className="h-5 w-5" />
                  {entry.totalKills}
                </div>
              </TableCell>
              <TableCell className="text-right font-bold text-2xl text-primary">
                {entry.totalPoints}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
