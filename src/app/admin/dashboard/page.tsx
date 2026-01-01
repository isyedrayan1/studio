import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, LayoutDashboard, Megaphone, Settings, Swords, Users } from "lucide-react";
import Link from "next/link";

// TODO: These will be fetched from Firebase
const quickStats = [
    { title: "Total Teams", value: 0, icon: Users, color: "text-blue-400" },
    { title: "Matches Played", value: 0, icon: Swords, color: "text-green-400" },
    { title: "Live Matches", value: 0, icon: Swords, color: "text-red-400" },
    { title: "Days Created", value: 0, icon: Calendar, color: "text-yellow-400" },
]

const quickActions = [
    { href: "/admin/teams", label: "Manage Teams", icon: Users, description: "Add, edit, delete teams" },
    { href: "/admin/days", label: "Manage Days", icon: Calendar, description: "Create tournament days" },
    { href: "/admin/groups", label: "Manage Groups", icon: LayoutDashboard, description: "Create groups & assign teams" },
    { href: "/admin/matches", label: "Manage Matches", icon: Swords, description: "Create matches & enter scores" },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone, description: "Post live updates" },
    { href: "/admin/settings", label: "Settings", icon: Settings, description: "Scoring rules & config" },
]

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-5xl font-bold tracking-wider">Admin Dashboard</h1>
                <p className="text-muted-foreground text-xl tracking-widest mt-1">
                    Welcome back, Admin. Set up your tournament below.
                </p>
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

            <Card>
                <CardHeader>
                    <CardTitle className="text-3xl tracking-wider">Quick Actions</CardTitle>
                    <CardDescription className="text-lg">Set up and manage your tournament.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map(action => (
                    <Button asChild key={action.href} variant="secondary" className="h-20 justify-between text-xl tracking-wider flex-col items-start p-4" >
                        <Link href={action.href}>
                            <div className="flex items-center gap-3 w-full">
                                <action.icon className="h-6 w-6 text-primary" />
                                <span>{action.label}</span>
                            </div>
                            <span className="text-sm text-muted-foreground font-normal">{action.description}</span>
                        </Link>
                    </Button>
                    ))}
                </CardContent>
            </Card>

            <Card className="border-dashed border-2 border-muted-foreground/30">
                <CardHeader>
                    <CardTitle className="text-2xl tracking-wider text-muted-foreground">Getting Started</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-lg tracking-wider text-muted-foreground">
                    <p>1. Add your teams in <strong>Manage Teams</strong></p>
                    <p>2. Create tournament days in <strong>Manage Days</strong></p>
                    <p>3. Create groups and assign teams in <strong>Manage Groups</strong></p>
                    <p>4. Create matches by combining groups in <strong>Manage Matches</strong></p>
                    <p>5. Enter scores during the event to update the leaderboard</p>
                </CardContent>
            </Card>
        </div>
    )
}
