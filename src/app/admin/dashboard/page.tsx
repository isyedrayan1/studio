import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { initialLeaderboard, mockMatches, mockTeams } from "@/lib/data";
import { ArrowRight, LayoutDashboard, Megaphone, Swords, Users } from "lucide-react";
import Link from "next/link";

const quickStats = [
    { title: "Total Teams", value: mockTeams.length, icon: Users, color: "text-blue-400" },
    { title: "Matches Played", value: mockMatches.filter(m => m.status === 'finished').length, icon: Swords, color: "text-green-400" },
    { title: "Live Matches", value: mockMatches.filter(m => m.status === 'live').length, icon: Swords, color: "text-red-400 animate-pulse" },
    { title: "Top Team", value: initialLeaderboard[0].teamName, icon: LayoutDashboard, color: "text-yellow-400" },
]

const quickActions = [
    { href: "/admin/teams", label: "Manage Teams", icon: Users },
    { href: "/admin/matches", label: "Update Scores", icon: Swords },
    { href: "/admin/announcements", label: "Post Announcement", icon: Megaphone },
]

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-5xl font-bold tracking-wider">Admin Dashboard</h1>
                <p className="text-muted-foreground text-xl tracking-widest mt-1">Welcome back, Admin. Let&apos;s get ready to rumble.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {quickStats.map(stat => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl tracking-wider font-medium">{stat.title}</CardTitle>
                             <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold tracking-wider">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-3xl tracking-wider">Quick Actions</CardTitle>
                        <CardDescription>Jump right into managing the event.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quickActions.map(action => (
                        <Button asChild key={action.href} variant="secondary" className="h-16 justify-between text-xl tracking-wider" >
                            <Link href={action.href}>
                                <div className="flex items-center gap-3">
                                <action.icon className="h-6 w-6" />
                                <span>{action.label}</span>
                                </div>
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </Button>
                        ))}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl tracking-wider">Event Status</CardTitle>
                        <CardDescription>A quick glance at the tournament progress.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-lg tracking-wider">
                       <div className="flex justify-between"><span>Current Day:</span> <span className="font-bold text-primary">Day 1</span></div>
                       <div className="flex justify-between"><span>Next Match:</span> <span className="font-bold text-primary">Match 4</span></div>
                       <div className="flex justify-between"><span>Leaderboard:</span> <span className="font-bold text-green-400">Active</span></div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
