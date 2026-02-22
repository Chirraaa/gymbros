"use client";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Dumbbell, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getRank, getLevel } from "@/lib/xp";
import Link from "next/link";

interface Props {
  user: { xp: number; username: string; streak: number };
}

export default function TopBar({ user }: Props) {
  const rank = getRank(user.xp);
  const level = getLevel(user.xp);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40 px-4 h-16 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Dumbbell className="w-5 h-5 text-primary" />
        <span className="font-black text-lg">GymBros</span>
      </Link>

      <div className="flex items-center gap-3">
        {user.streak > 0 && (
          <Badge variant="outline" className="border-orange-500/50 text-orange-400 text-xs">
            🔥 {user.streak}
          </Badge>
        )}
        <Badge variant="outline" className="border-primary/50 text-primary text-xs">
          {rank.icon} Lv.{level}
        </Badge>
        <UserButton appearance={{ baseTheme: dark }} />
      </div>
    </header>
  );
}