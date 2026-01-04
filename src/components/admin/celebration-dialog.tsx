"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Crown, Share2, Sparkles } from "lucide-react";
import { Day, LeaderboardEntry } from "@/lib/types";

interface CelebrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: Day;
  qualifiedTeams: LeaderboardEntry[];
}

export function CelebrationDialog({
  open,
  onOpenChange,
  day,
  qualifiedTeams,
}: CelebrationDialogProps) {
  const [hasPlayedConfetti, setHasPlayedConfetti] = useState(false);

  // Determine celebration content based on day type
  const getCelebrationContent = () => {
    const dayNumber = day.name.includes("1") || day.name.includes("Day 1")
      ? 1
      : day.name.includes("2") || day.name.includes("Day 2")
      ? 2
      : 3;

    switch (dayNumber) {
      case 1:
        return {
          title: "🎉 Day 1 Complete!",
          subtitle: "Battle Royale Shortlist Round",
          description: `${qualifiedTeams.length} teams have qualified for Day 2!`,
          icon: <Trophy className="h-16 w-16 text-primary" />,
          buttonText: "Proceed to Day 2 Setup",
          qualifyingCount: day.qualifyCount || 12,
        };
      case 2:
        return {
          title: "🔥 Day 2 Complete!",
          subtitle: "BR Championship",
          description: `${qualifiedTeams.length} elite teams advance to finals!`,
          icon: <Sparkles className="h-16 w-16 text-accent" />,
          buttonText: "Proceed to Bracket Setup",
          qualifyingCount: day.qualifyCount || 8,
        };
      case 3:
        return {
          title: "👑 Tournament Complete!",
          subtitle: "Arena Ace Champion Crowned",
          description: qualifiedTeams.length > 0 ? `Congratulations to ${qualifiedTeams[0].teamName}!` : "Champion determined!",
          icon: <Crown className="h-16 w-16 text-yellow-500" />,
          buttonText: "View Final Results",
          qualifyingCount: 1,
        };
      default:
        return {
          title: "🎊 Day Complete!",
          subtitle: day.name,
          description: `${qualifiedTeams.length} teams qualified!`,
          icon: <Trophy className="h-16 w-16 text-primary" />,
          buttonText: "Continue",
          qualifyingCount: day.qualifyCount || 0,
        };
    }
  };

  const content = getCelebrationContent();

  // Play confetti when dialog opens
  useEffect(() => {
    if (open && !hasPlayedConfetti) {
      playConfetti();
      setHasPlayedConfetti(true);
    }
    if (!open) {
      setHasPlayedConfetti(false);
    }
  }, [open, hasPlayedConfetti]);

  const playConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  };

  const handleShare = () => {
    // This will be enhanced with image export in next step
    const text = `${content.title}\n${content.description}\n\nQualified Teams:\n${qualifiedTeams
      .map((entry, idx) => `${idx + 1}. ${entry.teamName} - ${entry.totalPoints} pts`)
      .join("\n")}`;

    if (navigator.share) {
      navigator
        .share({
          title: content.title,
          text: text,
        })
        .catch((err) => console.log("Share failed:", err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert("Results copied to clipboard!");
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-2xl">🥇</span>;
      case 2:
        return <span className="text-2xl">🥈</span>;
      case 3:
        return <span className="text-2xl">🥉</span>;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4">
          <div className="flex justify-center">{content.icon}</div>
          <DialogTitle className="text-4xl font-bold tracking-tight">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-lg">
            {content.subtitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Qualified Teams List */}
          <Card className="bg-muted/50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  {content.qualifyingCount === 1
                    ? "Champion"
                    : `Top ${content.qualifyingCount} Qualified Teams`}
                </h3>
                <Badge variant="default" className="text-lg px-4 py-1">
                  {qualifiedTeams.length} Teams
                </Badge>
              </div>

              <div className="grid gap-3">
                {qualifiedTeams.map((entry, idx) => (
                  <div
                    key={entry.teamId}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      idx === 0
                        ? "bg-yellow-500/20 border-2 border-yellow-500"
                        : idx === 1
                        ? "bg-slate-400/20 border-2 border-slate-400"
                        : idx === 2
                        ? "bg-amber-600/20 border-2 border-amber-600"
                        : "bg-background border border-border"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 text-center">{getRankIcon(idx + 1)}</div>
                      <div>
                        <p className="font-bold text-lg">{entry.teamName}</p>
                        <p className="text-sm text-muted-foreground">
                          Rank #{idx + 1}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {entry.totalPoints}
                      </div>
                      <div className="text-xs text-muted-foreground">points</div>
                      {entry.hasBooyah && (
                        <Badge variant="secondary" className="mt-1">
                          🏆 Booyah
                        </Badge>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Statistics Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">
                  {qualifiedTeams.reduce((sum, t) => sum + t.totalKills, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Kills</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">
                  {qualifiedTeams.filter(t => t.hasBooyah).length}
                </div>
                <div className="text-sm text-muted-foreground">Booyahs</div>
              </CardContent>
            </Card>

          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleShare} variant="outline" className="flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              Share Results
            </Button>
            <Button onClick={() => onOpenChange(false)} className="flex-1">
              {content.buttonText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
