"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Calendar,
  Trophy,
  Megaphone,
  Swords,
  Users,
  Play,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Activity,
  AlertCircle,
  Zap,
  Crown,
  Medal,
  Flame,
  BarChart3,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { useTournament } from "@/contexts";

export default function DashboardPage() {
  const { teams, days, matches, scores, groups, announcements, loading } = useTournament();

  // Calculate live stats
  const stats = useMemo(() => {
    const activeDay = days.find(d => d.status === "active");
    const liveMatches = matches.filter(m => m.status === "live");
    const completedMatches = matches.filter(m => m.status === "finished");
    const totalScores = scores.length;
    const upcomingMatches = matches.filter(m => m.status === "upcoming");

    // Calculate top team
    const teamStats = teams.map(team => {
      const teamScores = scores.filter(s => s.teamId === team.id);
      const totalPoints = teamScores.reduce((sum, s) => sum + (s.totalPoints || 0), 0);
      return { team, totalPoints };
    }).sort((a, b) => b.totalPoints - a.totalPoints);

    const topTeam = teamStats[0];

    // Calculate Booyahs
    const booyahCount = scores.filter(s => s.isBooyah).length;

    return {
      totalTeams: teams.length,
      totalDays: days.length,
      activeDays: days.filter(d => d.status === "active").length,
      completedDays: days.filter(d => d.status === "completed").length,
      totalMatches: matches.length,
      liveMatches: liveMatches.length,
      completedMatches: completedMatches.length,
      upcomingMatches: upcomingMatches.length,
      totalScores,
      totalGroups: groups.length,
      activeAnnouncements: announcements.filter(a => a.active).length,
      booyahCount,
      topTeam,
      activeDay,
      completionRate: matches.length > 0 ? Math.round((completedMatches.length / matches.length) * 100) : 0,
    };
  }, [teams, days, matches, scores, groups, announcements]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const activities: Array<{ type: string; message: string; time: string; icon: any; color: string }> = [];

    // Recent scores
    const recentScores = [...scores]
      .sort((a, b) => new Date(b.lastUpdatedAt || 0).getTime() - new Date(a.lastUpdatedAt || 0).getTime())
      .slice(0, 3);

    recentScores.forEach(score => {
      const team = teams.find(t => t.id === score.teamId);
      const match = matches.find(m => m.id === score.matchId);
      if (team && match) {
        activities.push({
          type: 'score',
          message: `${team.name} scored ${score.totalPoints || 0} points in Match ${match.matchNumber}`,
          time: score.lastUpdatedAt || '',
          icon: Trophy,
          color: 'text-primary',
        });
      }
    });

    // Recent matches
    const liveMatches = matches.filter(m => m.status === "live");
    liveMatches.slice(0, 2).forEach(match => {
      const day = days.find(d => d.id === match.dayId);
      activities.push({
        type: 'live',
        message: `Match ${match.matchNumber} is now LIVE${day ? ` (Day ${day.dayNumber})` : ''}`,
        time: new Date().toISOString(),
        icon: Play,
        color: 'text-red-500',
      });
    });

    return activities.slice(0, 5);
  }, [scores, teams, matches, days]);

  const quickActions = [
    { 
      href: "/admin/teams", 
      label: "Teams", 
      icon: Users, 
      description: "Add & manage teams",
      count: stats.totalTeams,
      color: "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
    },
    { 
      href: "/admin/days", 
      label: "Days", 
      icon: Calendar, 
      description: "Tournament schedule",
      count: stats.totalDays,
      color: "bg-accent/20 text-accent border-accent/30 hover:bg-accent/30"
    },
    { 
      href: "/admin/matches", 
      label: "Matches", 
      icon: Swords, 
      description: "Manage all matches",
      count: stats.totalMatches,
      color: "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
    },
    { 
      href: "/admin/scores", 
      label: "Scores", 
      icon: Target, 
      description: "Enter match scores",
      count: stats.totalScores,
      color: "bg-accent/20 text-accent border-accent/30 hover:bg-accent/30"
    },
    { 
      href: "/admin/leaderboard", 
      label: "Leaderboard", 
      icon: BarChart3, 
      description: "View standings",
      count: stats.completedMatches,
      color: "bg-primary/20 text-primary border-primary/30 hover:bg-primary/30"
    },
    { 
      href: "/admin/announcements", 
      label: "Announcements", 
      icon: Megaphone, 
      description: "Post updates",
      count: stats.activeAnnouncements,
      color: "bg-accent/20 text-accent border-accent/30 hover:bg-accent/30"
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-5xl font-bold">FFSAL Admin Dashboard</h1>
        <p className="text-muted-foreground text-xl mt-1">
          Real-time tournament management & control center
        </p>
      </div>

      {/* Active Day Alert */}
      {stats.activeDay && (
        <Card className="border-2 border-primary bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                <div>
                  <CardTitle className="text-2xl">Day {stats.activeDay.dayNumber} - {stats.activeDay.name}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {stats.liveMatches > 0 ? `${stats.liveMatches} match(es) currently live` : 'No live matches'}
                  </CardDescription>
                </div>
              </div>
              <Button asChild>
                <Link href="/admin/matches">
                  <Play className="h-4 w-4 mr-2" />
                  Manage Matches
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wider">Total Teams</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-wider">{stats.totalTeams}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered for tournament
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wider">Matches</CardTitle>
            <Swords className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-wider">
              {stats.completedMatches}/{stats.totalMatches}
            </div>
            <Progress value={stats.completionRate} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completionRate}% completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wider">Live Now</CardTitle>
            <Play className="h-5 w-5 text-red-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-wider">{stats.liveMatches}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.upcomingMatches} upcoming
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wider">Tournament Days</CardTitle>
            <Calendar className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-wider">
              {stats.completedDays}/{stats.totalDays}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeDays > 0 ? `${stats.activeDays} active` : 'None active'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Highlights & Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Tournament Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Tournament Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Top Team */}
            {stats.topTeam && stats.topTeam.totalPoints > 0 ? (
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <Crown className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Leading Team</p>
                    <p className="text-xl font-bold">{stats.topTeam.team.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{stats.topTeam.totalPoints}</p>
                  <p className="text-xs text-muted-foreground">points</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 rounded-lg bg-muted/50 border border-dashed">
                <div className="text-center">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No scores yet</p>
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                <p className="text-2xl font-bold">{stats.booyahCount}</p>
                <p className="text-xs text-muted-foreground">Booyahs</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Target className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="text-2xl font-bold">{stats.totalScores}</p>
                <p className="text-xs text-muted-foreground">Total Scores</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <activity.icon className={`h-5 w-5 ${activity.color} mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time ? new Date(activity.time).toLocaleTimeString() : 'Just now'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center p-8 rounded-lg bg-muted/50 border border-dashed">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
          <CardDescription>Jump to any section of the admin panel</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map(action => (
            <Button
              asChild
              key={action.href}
              variant="outline"
              className={`h-auto p-4 hover:scale-105 transition-transform border-2 ${action.color}`}
            >
              <Link href={action.href}>
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <action.icon className="h-6 w-6" />
                    <Badge variant="secondary">{action.count}</Badge>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-lg">{action.label}</p>
                    <p className="text-xs opacity-70">{action.description}</p>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Setup Guide (only show if tournament not started) */}
      {stats.totalMatches === 0 && (
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Getting Started Guide
            </CardTitle>
            <CardDescription>Follow these steps to set up your tournament</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${stats.totalTeams > 0 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {stats.totalTeams > 0 ? <CheckCircle className="h-5 w-5" /> : '1'}
              </div>
              <div>
                <p className="font-semibold">Add Teams</p>
                <p className="text-sm text-muted-foreground">Upload or manually add participating teams</p>
                {stats.totalTeams === 0 && (
                  <Button asChild variant="link" className="h-auto p-0 mt-1">
                    <Link href="/admin/teams">Go to Teams <ArrowRight className="h-3 w-3 ml-1" /></Link>
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${stats.totalDays > 0 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {stats.totalDays > 0 ? <CheckCircle className="h-5 w-5" /> : '2'}
              </div>
              <div>
                <p className="font-semibold">Create Days</p>
                <p className="text-sm text-muted-foreground">Set up tournament days (Day 1, Day 2, etc.)</p>
                {stats.totalDays === 0 && (
                  <Button asChild variant="link" className="h-auto p-0 mt-1">
                    <Link href="/admin/days">Go to Days <ArrowRight className="h-3 w-3 ml-1" /></Link>
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${stats.totalGroups > 0 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {stats.totalGroups > 0 ? <CheckCircle className="h-5 w-5" /> : '3'}
              </div>
              <div>
                <p className="font-semibold">Organize Groups</p>
                <p className="text-sm text-muted-foreground">Assign teams to groups for matches</p>
                {stats.totalGroups === 0 && (
                  <Button asChild variant="link" className="h-auto p-0 mt-1">
                    <Link href="/admin/groups">Go to Groups <ArrowRight className="h-3 w-3 ml-1" /></Link>
                  </Button>
                )}
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${stats.totalMatches > 0 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {stats.totalMatches > 0 ? <CheckCircle className="h-5 w-5" /> : '4'}
              </div>
              <div>
                <p className="font-semibold">Create Matches</p>
                <p className="text-sm text-muted-foreground">Schedule matches and start the tournament!</p>
                {stats.totalMatches === 0 && (
                  <Button asChild variant="link" className="h-auto p-0 mt-1">
                    <Link href="/admin/matches">Go to Matches <ArrowRight className="h-3 w-3 ml-1" /></Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
