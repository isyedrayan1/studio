"use client";

import { useState, useEffect } from 'react';
import { initialDay1Leaderboard, mockDay1Teams } from '@/lib/data';
import type { Day1LeaderboardEntry } from '@/lib/definitions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Crown, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Day1LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<Day1LeaderboardEntry[]>(initialDay1Leaderboard);

  // Future logic for live updates can be placed in a useEffect hook.

  return (
    <div className="container py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <Crown className="w-16 h-16 text-primary drop-shadow-[0_2px_4px_hsl(var(--primary)/0.5)]" />
        <h1 className="text-6xl md:text-7xl font-bold tracking-wider mt-4">
          Day 1 Qualifiers
        </h1>
        <p className="text-xl text-muted-foreground mt-2 tracking-widest">
          The top 12 teams advance to Day 2. Rankings update live.
        </p>
      </div>
      
      <div className="rounded-lg border shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="w-[80px] text-center text-xl tracking-wider">Rank</TableHead>
              <TableHead className="text-xl tracking-wider">Team</TableHead>
              <TableHead className="text-center text-xl tracking-wider">Group</TableHead>
              <TableHead className="text-center text-xl tracking-wider">Matches</TableHead>
              <TableHead className="text-center text-xl tracking-wider">Total Kills</TableHead>
              <TableHead className="text-center text-xl tracking-wider">Avg. Kills</TableHead>
              <TableHead className="text-right text-xl tracking-wider">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry, index) => {
              const isQualified = entry.rank <= 12;
              return (
                <TableRow
                  key={entry.teamId}
                  className={cn(
                    'text-lg tracking-wider transition-all duration-500',
                    !isQualified ? 'bg-red-900/20 text-muted-foreground' : 'bg-card'
                  )}
                >
                  <TableCell className="text-center text-2xl font-bold">{entry.rank}</TableCell>
                  <TableCell className="font-medium text-xl">{entry.teamName}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-lg">Group {entry.group}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{entry.matchesPlayed}</TableCell>
                  <TableCell className="text-center font-bold text-primary">{entry.totalKills}</TableCell>
                  <TableCell className="text-center">{(entry.totalKills / entry.matchesPlayed || 0).toFixed(1)}</TableCell>
                  <TableCell className="text-right">
                    {isQualified ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-base">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Qualified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-base">Eliminated</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
