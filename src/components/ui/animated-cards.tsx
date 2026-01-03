"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

// ============================================
// Glowing Card
// ============================================

interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "primary" | "accent" | "gold";
  hoverScale?: number;
}

export function GlowingCard({ 
  children, 
  className, 
  glowColor = "primary",
  hoverScale = 1.02
}: GlowingCardProps) {
  const glowColors = {
    primary: "hover:shadow-[0_0_40px_rgba(255,70,70,0.3)]",
    accent: "hover:shadow-[0_0_40px_rgba(41,171,226,0.3)]",
    gold: "hover:shadow-[0_0_40px_rgba(234,179,8,0.3)]",
  };

  const borderColors = {
    primary: "hover:border-primary/50",
    accent: "hover:border-accent/50",
    gold: "hover:border-yellow-500/50",
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 transition-all duration-300",
        glowColors[glowColor],
        borderColors[glowColor],
        className
      )}
      whileHover={{ scale: hoverScale }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Feature Card
// ============================================

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: "primary" | "accent" | "gold" | "emerald";
  delay?: number;
}

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color = "primary",
  delay = 0
}: FeatureCardProps) {
  const colorStyles = {
    primary: {
      iconBg: "bg-primary/20",
      iconColor: "text-primary",
      borderHover: "group-hover:border-primary/50",
      glow: "group-hover:shadow-[0_0_30px_rgba(255,70,70,0.2)]",
    },
    accent: {
      iconBg: "bg-accent/20",
      iconColor: "text-accent",
      borderHover: "group-hover:border-accent/50",
      glow: "group-hover:shadow-[0_0_30px_rgba(41,171,226,0.2)]",
    },
    gold: {
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-500",
      borderHover: "group-hover:border-yellow-500/50",
      glow: "group-hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]",
    },
    emerald: {
      iconBg: "bg-emerald-500/20",
      iconColor: "text-emerald-500",
      borderHover: "group-hover:border-emerald-500/50",
      glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
    },
  };

  const styles = colorStyles[color];

  return (
    <motion.div
      className={cn(
        "group relative rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all duration-300",
        styles.borderHover,
        styles.glow
      )}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
    >
      {/* Icon */}
      <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-4", styles.iconBg)}>
        <Icon className={cn("h-7 w-7", styles.iconColor)} />
      </div>

      {/* Content */}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>

      {/* Decorative corner */}
      <div className={cn(
        "absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity",
        "border-t-2 border-r-2 rounded-tr-xl",
        color === "primary" && "border-primary/50",
        color === "accent" && "border-accent/50",
        color === "gold" && "border-yellow-500/50",
        color === "emerald" && "border-emerald-500/50"
      )} />
    </motion.div>
  );
}

// ============================================
// Stats Card - Live Data Aware
// ============================================

interface StatsCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color?: "primary" | "accent" | "gold" | "white";
  delay?: number;
  loading?: boolean;
}

export function StatsCard({ 
  icon: Icon, 
  value, 
  label, 
  color = "primary",
  delay = 0,
  loading = false
}: StatsCardProps) {
  const [prevValue, setPrevValue] = React.useState(value);
  const [hasChanged, setHasChanged] = React.useState(false);

  // Detect value changes for live update indicator
  React.useEffect(() => {
    if (prevValue !== value && prevValue !== 0 && prevValue !== "—") {
      setHasChanged(true);
      const timer = setTimeout(() => setHasChanged(false), 1000);
      return () => clearTimeout(timer);
    }
    setPrevValue(value);
  }, [value, prevValue]);

  const colorStyles = {
    primary: "text-primary",
    accent: "text-accent",
    gold: "text-yellow-500",
    white: "text-white",
  };

  const glowStyles = {
    primary: "shadow-[0_0_20px_rgba(255,70,70,0.5)]",
    accent: "shadow-[0_0_20px_rgba(41,171,226,0.5)]",
    gold: "shadow-[0_0_20px_rgba(234,179,8,0.5)]",
    white: "shadow-[0_0_20px_rgba(255,255,255,0.3)]",
  };

  return (
    <motion.div
      className={cn(
        "relative text-center p-6 bg-card/30 backdrop-blur-sm rounded-xl border border-border/30 hover:border-border/50 transition-all",
        hasChanged && glowStyles[color]
      )}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05 }}
      animate={hasChanged ? { scale: [1, 1.05, 1] } : {}}
    >
      {/* Live update indicator */}
      {hasChanged && (
        <motion.div
          className={cn(
            "absolute top-2 right-2 w-2 h-2 rounded-full",
            color === "primary" && "bg-primary",
            color === "accent" && "bg-accent",
            color === "gold" && "bg-yellow-500",
            color === "white" && "bg-white"
          )}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
          transition={{ duration: 1 }}
        />
      )}
      
      <div className="flex justify-center mb-3">
        <motion.div
          animate={hasChanged ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5 }}
        >
          <Icon className={cn("h-8 w-8", colorStyles[color])} />
        </motion.div>
      </div>
      <motion.div 
        className={cn("text-4xl md:text-5xl font-bold mb-1", colorStyles[color])}
        key={String(value)} // Force re-render on value change
        initial={hasChanged ? { opacity: 0, y: -10 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {loading ? "—" : value}
      </motion.div>
      <div className="text-sm text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}

// ============================================
// Rank Card (For Leaderboard) - Live Data Aware
// ============================================

interface RankCardProps {
  rank: number;
  teamName: string;
  teamTag?: string;
  points: number;
  className?: string;
}

export function RankCard({ rank, teamName, teamTag, points, className }: RankCardProps) {
  const [prevPoints, setPrevPoints] = React.useState(points);
  const [hasChanged, setHasChanged] = React.useState(false);
  const [pointsDiff, setPointsDiff] = React.useState(0);

  // Detect points changes for live update indicator
  React.useEffect(() => {
    if (prevPoints !== points && prevPoints !== 0) {
      setHasChanged(true);
      setPointsDiff(points - prevPoints);
      const timer = setTimeout(() => {
        setHasChanged(false);
        setPointsDiff(0);
      }, 2000);
      return () => clearTimeout(timer);
    }
    setPrevPoints(points);
  }, [points, prevPoints]);

  const rankStyles = {
    1: {
      gradient: "from-yellow-500/30 via-yellow-600/20 to-transparent",
      border: "border-yellow-500",
      textColor: "text-yellow-400",
      glow: "shadow-[0_0_40px_rgba(234,179,8,0.3)]",
      glowIntense: "shadow-[0_0_60px_rgba(234,179,8,0.6)]",
      icon: "🏆",
    },
    2: {
      gradient: "from-gray-400/30 via-gray-500/20 to-transparent",
      border: "border-gray-400",
      textColor: "text-gray-300",
      glow: "shadow-[0_0_30px_rgba(156,163,175,0.3)]",
      glowIntense: "shadow-[0_0_50px_rgba(156,163,175,0.6)]",
      icon: "🥈",
    },
    3: {
      gradient: "from-amber-600/30 via-amber-700/20 to-transparent",
      border: "border-amber-600",
      textColor: "text-amber-500",
      glow: "shadow-[0_0_30px_rgba(217,119,6,0.3)]",
      glowIntense: "shadow-[0_0_50px_rgba(217,119,6,0.6)]",
      icon: "🥉",
    },
  };

  const style = rankStyles[rank as keyof typeof rankStyles] || {
    gradient: "from-muted/30 to-transparent",
    border: "border-border",
    textColor: "text-foreground",
    glow: "",
    glowIntense: "",
    icon: `#${rank}`,
  };

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 bg-gradient-to-br p-8",
        style.gradient,
        style.border,
        hasChanged ? style.glowIntense : style.glow,
        rank === 1 && "md:scale-110 md:-translate-y-6",
        className
      )}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: (rank - 1) * 0.1 }}
      whileHover={{ scale: 1.02 }}
      animate={hasChanged ? { scale: [1, 1.05, 1] } : {}}
    >
      {/* Live update indicator */}
      {hasChanged && pointsDiff !== 0 && (
        <motion.div
          className={cn(
            "absolute top-4 left-4 px-2 py-1 rounded-full text-sm font-bold",
            pointsDiff > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          )}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {pointsDiff > 0 ? `+${pointsDiff}` : pointsDiff}
        </motion.div>
      )}

      {/* Rank Icon */}
      <motion.div 
        className="absolute top-4 right-4 text-4xl"
        animate={hasChanged ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        {rank <= 3 ? style.icon : `#${rank}`}
      </motion.div>

      {/* Rank Number */}
      <div className={cn("text-8xl font-bold mb-4 opacity-30", style.textColor)}>
        #{rank}
      </div>

      {/* Team Info */}
      <motion.h3 
        className="text-3xl font-bold mb-1"
        key={teamName}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {teamName}
      </motion.h3>
      {teamTag && (
        <span className="inline-block px-3 py-1 rounded-full bg-muted/50 text-sm mb-4">
          {teamTag}
        </span>
      )}

      {/* Points */}
      <motion.div 
        className={cn("text-5xl font-bold mt-4", style.textColor)}
        key={points}
        initial={hasChanged ? { scale: 1.2, color: "#10B981" } : false}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {points}
        <span className="text-xl text-muted-foreground ml-2">pts</span>
      </motion.div>

      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />
    </motion.div>
  );
}

// ============================================
// Timeline Card - Live Data Aware
// ============================================

interface TimelineCardProps {
  dayNumber: number;
  title: string;
  description: string;
  status: "completed" | "active" | "upcoming";
  matchCount: number;
  completedMatches: number;
  qualifyCount?: number;
  delay?: number;
}

export function TimelineCard({
  dayNumber,
  title,
  description,
  status,
  matchCount,
  completedMatches,
  qualifyCount,
  delay = 0,
}: TimelineCardProps) {
  const [prevCompleted, setPrevCompleted] = React.useState(completedMatches);
  const [hasChanged, setHasChanged] = React.useState(false);
  
  const progress = matchCount > 0 ? (completedMatches / matchCount) * 100 : 0;

  // Detect progress changes
  React.useEffect(() => {
    if (prevCompleted !== completedMatches && prevCompleted !== 0) {
      setHasChanged(true);
      const timer = setTimeout(() => setHasChanged(false), 1500);
      return () => clearTimeout(timer);
    }
    setPrevCompleted(completedMatches);
  }, [completedMatches, prevCompleted]);

  return (
    <motion.div
      className={cn(
        "relative rounded-xl border bg-card/50 backdrop-blur-sm p-6 transition-all duration-300",
        status === "active" && "border-primary ring-2 ring-primary/20 shadow-[0_0_30px_rgba(255,70,70,0.2)]",
        status === "completed" && "border-emerald-500/50 bg-emerald-500/5",
        status === "upcoming" && "border-border/50 opacity-80",
        hasChanged && "ring-2 ring-emerald-500/50"
      )}
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ x: 10 }}
      animate={hasChanged ? { scale: [1, 1.02, 1] } : {}}
    >
      {/* Status indicator */}
      {status === "active" && (
        <motion.div
          className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-t-xl"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Live update notification */}
      {hasChanged && (
        <motion.div
          className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          +1 Match
        </motion.div>
      )}

      <div className="flex items-start gap-4">
        {/* Day number */}
        <motion.div 
          className={cn(
            "flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-bold",
            status === "active" && "bg-primary/20 text-primary",
            status === "completed" && "bg-emerald-500/20 text-emerald-500",
            status === "upcoming" && "bg-muted text-muted-foreground"
          )}
          animate={hasChanged ? { rotate: [0, -5, 5, 0] } : {}}
        >
          {dayNumber.toString().padStart(2, "0")}
        </motion.div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-2xl font-bold">{title}</h3>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold uppercase",
              status === "active" && "bg-primary/20 text-primary animate-pulse",
              status === "completed" && "bg-emerald-500/20 text-emerald-500",
              status === "upcoming" && "bg-muted text-muted-foreground"
            )}>
              {status === "active" ? "🔥 LIVE" : status}
            </span>
          </div>
          <p className="text-muted-foreground mb-4">{description}</p>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <motion.span 
                className="font-mono"
                key={completedMatches}
                initial={hasChanged ? { color: "#10B981" } : false}
                animate={{ color: "inherit" }}
                transition={{ duration: 1 }}
              >
                {completedMatches}/{matchCount} matches
              </motion.span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  "h-full",
                  status === "active" && "bg-primary",
                  status === "completed" && "bg-emerald-500",
                  status === "upcoming" && "bg-muted-foreground"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            {qualifyCount && (
              <p className="text-sm text-accent">Top {qualifyCount} teams qualify</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// Hover Card with 3D Effect
// ============================================

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

export function TiltCard({ children, className }: TiltCardProps) {
  const [rotateX, setRotateX] = React.useState(0);
  const [rotateY, setRotateY] = React.useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setRotateX((y - centerY) / 10);
    setRotateY((centerX - x) / 10);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      className={cn("relative", className)}
      style={{
        transformStyle: "preserve-3d",
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
