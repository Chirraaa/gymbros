import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getRank, getLevel, getLevelProgress, getXPForNextLevel, calculateBMI, getBMICategory } from "@/lib/xp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Flame, Zap, TrendingUp, Plus, Users } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await prisma.user.findUnique({
    where: { id: userId! },
    include: {
      workouts: {
        orderBy: { date: "desc" },
        take: 3,
        include: {
          exercises: { include: { sets: true, exercise: true } },
          hypes: true,
        },
      },
      _count: { select: { friendsAsA: true, friendsAsB: true } },
    },
  });

  if (!user) return null;

  const rank = getRank(user.xp);
  const level = getLevel(user.xp);
  const levelProgress = getLevelProgress(user.xp);
  const nextLevelXP = getXPForNextLevel(level);

  const bmi = user.height && user.weight
    ? calculateBMI(user.weight, user.height)
    : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const friendCount = user._count.friendsAsA + user._count.friendsAsB;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* XP Card */}
      <Card className="border-primary/20 bg-gradient-to-br from-card to-accent/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-muted-foreground text-sm">Welcome back,</p>
              <h2 className="text-2xl font-black">{user.username}</h2>
            </div>
            <div className="text-right">
              <p className="text-3xl">{rank.icon}</p>
              <Badge variant="outline" className="border-primary/50 text-primary text-xs mt-1">
                {rank.name}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Level {level}</span>
              <span className="text-primary font-semibold">{user.xp} XP</span>
            </div>
            <Progress value={levelProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {nextLevelXP - user.xp} XP to Level {level + 1}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4 text-center">
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-2xl font-black">{user.streak}</p>
            <p className="text-xs text-muted-foreground">Day streak</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4 text-center">
            <Dumbbell className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-black">{user.workouts.length}</p>
            <p className="text-xs text-muted-foreground">Workouts</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4 text-center">
            <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-2xl font-black">{friendCount}</p>
            <p className="text-xs text-muted-foreground">Bros</p>
          </CardContent>
        </Card>
      </div>

      {/* BMI Card */}
      {bmi && bmiCategory && (
        <Card className="border-border/50">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Body Mass Index
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-3xl font-black ${bmiCategory.color}`}>{bmi.toFixed(1)}</p>
                <p className={`text-sm font-medium ${bmiCategory.color}`}>{bmiCategory.label}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{user.height} cm</p>
                <p>{user.weight} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick action */}
      <Button className="w-full h-12 text-base gap-2" asChild>
        <Link href="/workouts/new">
          <Plus className="w-5 h-5" />
          Log Workout
        </Link>
      </Button>

      {/* Recent workouts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Recent Workouts</h3>
          <Link href="/workouts" className="text-primary text-sm">See all</Link>
        </div>
        {user.workouts.length === 0 ? (
          <Card className="border-dashed border-border/50">
            <CardContent className="py-8 text-center">
              <Dumbbell className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No workouts yet. Time to grind! 💪</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {user.workouts.map((workout) => {
              const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
              const totalVolume = workout.exercises.reduce((acc, ex) =>
                acc + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0), 0
              );
              return (
                <Link href={`/workouts/${workout.id}`} key={workout.id}>
                  <Card className="border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm">{workout.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(workout.date), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{totalSets} sets</p>
                          <p className="text-xs text-primary">{totalVolume.toFixed(0)} kg vol.</p>
                          {workout.hypes.length > 0 && (
                            <p className="text-xs text-orange-400">🔥 {workout.hypes.length}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}