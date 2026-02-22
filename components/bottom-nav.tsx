"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, TrendingUp, Users, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",    icon: Home,       label: "Home"      },
  { href: "/workouts",     icon: Dumbbell,   label: "Workouts"  },
  { href: "/progress",     icon: TrendingUp, label: "Progress"  },
  { href: "/friends",      icon: Users,      label: "Friends"   },
  { href: "/leaderboard",  icon: Trophy,     label: "Wars"      },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t border-border/40 safe-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", active && "animate-pulse-purple")} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}