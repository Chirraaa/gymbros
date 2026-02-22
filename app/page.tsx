import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Zap, Users, Trophy, TrendingUp, Flame } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border/40 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">GymBros</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" asChild><Link href="/sign-in">Sign in</Link></Button>
            <Button asChild><Link href="/sign-up">Get started</Link></Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <Badge variant="outline" className="mb-6 border-primary/50 text-primary">
          🔥 Built for gym addicts
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent leading-tight">
          Train harder.<br />
          <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Beat your bros.
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mb-10">
          Track workouts, earn XP, climb ranks, and compete with friends. The gym just got way more fun.
        </p>
        <Button size="lg" className="text-base px-8" asChild>
          <Link href="/sign-up">Start →</Link>
        </Button>

        {/* Features grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-20 max-w-3xl w-full">
          {[
            { icon: Dumbbell, title: "Workout Tracking",  desc: "Log sets, reps & weight"    },
            { icon: Zap,      title: "XP & Levels",       desc: "Rank up as you grind"       },
            { icon: Trophy,   title: "GymWars",           desc: "Weekly friend leaderboard"  },
            { icon: Flame,    title: "Hype System",       desc: "React to friend workouts"   },
            { icon: Users,    title: "Friend Challenges", desc: "1v1 exercise duels"         },
            { icon: TrendingUp, title: "Progress Charts", desc: "BMI, volume & PRs"         },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-border/50 bg-card/50 p-4 text-left">
              <Icon className="w-5 h-5 text-primary mb-2" />
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}