import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { calculateBMI, getBMICategory } from "@/lib/xp";
import ProgressCharts from "@/components/progress-charts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function ProgressPage() {
  const { userId } = await auth();

  const user = await prisma.user.findUnique({
    where: { id: userId! },
    select: { height: true, weight: true, xp: true, streak: true },
  });

  const workouts = await prisma.workout.findMany({
    where: { userId: userId! },
    orderBy: { date: "asc" },
    include: {
      exercises: {
        include: { sets: true, exercise: true },
      },
    },
  });

  // Build per-exercise summary
  const exerciseMap = new Map<string, {
    id: string;
    name: string;
    category: string;
    sessions: number;
    maxWeight: number;
    lastWeight: number;
  }>();

  for (const workout of workouts) {
    for (const ex of workout.exercises) {
      const maxW = Math.max(...ex.sets.map((s) => s.weight), 0);
      if (!exerciseMap.has(ex.exerciseId)) {
        exerciseMap.set(ex.exerciseId, {
          id: ex.exerciseId,
          name: ex.exercise.name,
          category: ex.exercise.category,
          sessions: 0,
          maxWeight: 0,
          lastWeight: 0,
        });
      }
      const entry = exerciseMap.get(ex.exerciseId)!;
      entry.sessions += 1;
      entry.lastWeight = maxW;
      if (maxW > entry.maxWeight) entry.maxWeight = maxW;
    }
  }

  const exercises = Array.from(exerciseMap.values())
    .filter((e) => e.sessions > 0)
    .sort((a, b) => b.sessions - a.sessions);

  const bmi = user?.height && user?.weight
    ? calculateBMI(user.weight, user.height)
    : null;

  const chartData = workouts.map((w) => ({
    date: w.date.toISOString().split("T")[0],
    volume: w.exercises.reduce((acc, ex) =>
      acc + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0), 0
    ),
    sets: w.exercises.reduce((acc, ex) => acc + ex.sets.length, 0),
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-black">Progress</h1>

      <ProgressCharts
        chartData={chartData}
        bmi={bmi}
        height={user?.height ?? null}
        weight={user?.weight ?? null}
      />

      {/* Exercise tracker */}
      {exercises.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Exercise Progress</h2>
          </div>
          <div className="space-y-2">
            {exercises.map((ex) => (
              <Link href={`/progress/exercise/${ex.id}`} key={ex.id}>
                <Card className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="py-3 px-4 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{ex.name}</p>
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary shrink-0">
                          {ex.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ex.sessions} {ex.sessions === 1 ? "session" : "sessions"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">
                          {ex.maxWeight > 0 ? `${ex.maxWeight} kg` : "BW"}
                        </p>
                        <p className="text-xs text-muted-foreground">best</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}