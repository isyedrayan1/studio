import { Button } from "@/components/ui/button";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import Link from "next/link";
import { Flame, GanttChartSquare, Trophy } from "lucide-react";
import { AnnouncementBanner } from "@/components/public/announcement-banner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const heroImage = PlaceHolderImages.find((img) => img.id === "hero-1");

const features = [
  {
    icon: <Trophy className="h-10 w-10 text-primary" />,
    title: "Live Leaderboards",
    description: "Follow your favorite teams and watch them climb the ranks in real-time.",
  },
  {
    icon: <GanttChartSquare className="h-10 w-10 text-primary" />,
    title: "Full Schedule",
    description: "Never miss a match. Get up-to-date schedules for every game day.",
  },
  {
    icon: <Flame className="h-10 w-10 text-primary" />,
    title: "Intense Action",
    description: "Experience the thrill of competitive Free Fire at the highest level.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <AnnouncementBanner />
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="relative z-10 flex flex-col items-center gap-6 px-4">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-wider text-primary drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            ARENA ACE
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl tracking-widest text-foreground drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            THE ULTIMATE FREE FIRE SHOWDOWN
          </p>
          <div className="flex gap-4 mt-4">
            <Button asChild size="lg" className="text-lg tracking-widest">
              <Link href="/leaderboard">View Leaderboard</Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="text-lg tracking-widest"
            >
              <Link href="/schedule">Match Schedule</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="w-full max-w-7xl px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="bg-card/80 backdrop-blur-sm border-accent/20 hover:border-accent/50 transition-colors duration-300"
            >
              <CardHeader className="items-center">
                {feature.icon}
                <CardTitle className="mt-4 text-3xl tracking-wider text-accent">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
