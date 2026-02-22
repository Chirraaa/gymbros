import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { getRank, getLevel, calculateWeeklyScore } from "@/lib/xp";
import { cn } from "@/lib/utils";

export default async function LeaderboardPage() {
  const { userId } = await auth();

  // Get friends + self
  const [friendsAsA, friendsAsB] = await Promise.all([
    prisma.friendship.findMany({ where: { userAId: userId! }, select: { userBId: true } }),
    prisma.friendship.findMany({ where: { userBId: userId! }, select: { userAId: true } }),
  ]);

  const friendIds = [
    userId!,
    ...friendsAsA.map((f) => f.userBId),
    ...friendsAsB.map((f) => f.userAId),
  ];

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const users = await prisma.user.findMany({
    where: { id: { in: friendIds } },
    include: {
      workouts: {
        where: { date: { gte: weekStart, lte: weekEnd } },
        include: { exercises: { include: { sets: true } } },
      },
    },
  });

  const ranked = users
    .map((user) => {
      const weeklyVolume = user.workouts.reduce((acc, w) =>
        acc + w.exercises.reduce((ea, ex) =>
          ea + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0), 0
        ), 0
      );
      const score = calculateWeeklyScore(user.workouts.length, weeklyVolume, user.streak);
      return { ...user, weeklyVolume, weeklyWorkouts: user.workouts.length, score };
    })
    .sort((a, b) => b.score - a.score);

  const MEDALS = ["🥇", "🥈", "🥉"];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-7 h-7 text-yellow-400" />
        <div>
          <h1 className="text-2xl font-black">GymWars</h1>
          <p className="text-xs text-muted-foreground">Weekly leaderboard · Resets Monday</p>
        </div>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-card to-accent/10">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm text-muted-foreground">Score formula</CardTitle>
        </CardHeader>
        <CardContent className="pb-4 text-xs text-muted-foreground space-y-1">
          <p>🏋️ Workouts × 20pts</p>
          <p>📦 Volume (kg) ÷ 100pts</p>
          <p>🔥 Streak × 5pts</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {ranked.map((user, index) => {
          const rank = getRank(user.xp);
          const level = getLevel(user.xp);
          const isMe = user.id === userId;
          return (
            <Card
              key={user.id}
              className={cn(
                "border-border/50 transition-all",
                isMe && "border-primary/50 bg-accent/10",
                index === 0 && "border-yellow-500/30"
              )}
            >
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <span className="text-xl w-8 text-center">{MEDALS[index] ?? `#${index + 1}`}</span>
                <Avatar className="w-9 h-9">
                  <AvatarImage src={user.imageUrl ?? ""} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{user.username}</p>
                    {isMe && <Badge className="bg-primary/20 text-primary text-[10px] h-4 border-0">You</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {rank.icon} {rank.name} · Lv.{level} · {user.weeklyWorkouts} workouts
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-primary">{user.score.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">pts</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}