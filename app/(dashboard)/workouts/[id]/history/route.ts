import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;

  const sets = await prisma.exerciseSet.findMany({
    where: {
      workoutExercise: {
        exerciseId: id,
        workout: { userId },
      },
    },
    include: {
      workoutExercise: {
        include: {
          workout: { select: { date: true, name: true, id: true } },
          exercise: { select: { name: true, category: true } },
        },
      },
    },
    orderBy: {
      workoutExercise: { workout: { date: "asc" } },
    },
  });

  // Group by workout session
  const sessionsMap = new Map<string, {
    date: string;
    workoutName: string;
    workoutId: string;
    sets: { reps: number; weight: number; isPersonalRecord: boolean }[];
    maxWeight: number;
    totalVolume: number;
    bestSet: { reps: number; weight: number };
  }>();

  for (const set of sets) {
    const workoutId = set.workoutExercise.workout.id;
    if (!sessionsMap.has(workoutId)) {
      sessionsMap.set(workoutId, {
        date: set.workoutExercise.workout.date.toISOString(),
        workoutName: set.workoutExercise.workout.name,
        workoutId,
        sets: [],
        maxWeight: 0,
        totalVolume: 0,
        bestSet: { reps: 0, weight: 0 },
      });
    }
    const session = sessionsMap.get(workoutId)!;
    session.sets.push({
      reps: set.reps,
      weight: set.weight,
      isPersonalRecord: set.isPersonalRecord,
    });
    session.totalVolume += set.reps * set.weight;
    if (set.weight > session.maxWeight) {
      session.maxWeight = set.weight;
      session.bestSet = { reps: set.reps, weight: set.weight };
    }
  }

  const sessions = Array.from(sessionsMap.values());
  const exerciseName = sets[0]?.workoutExercise.exercise.name ?? "";
  const exerciseCategory = sets[0]?.workoutExercise.exercise.category ?? "";

  const allTimeMaxWeight = Math.max(...sessions.map((s) => s.maxWeight), 0);
  const allTimeBestSet = sessions.reduce((best, s) =>
    s.maxWeight > best.weight ? { reps: s.bestSet.reps, weight: s.maxWeight } : best,
    { reps: 0, weight: 0 }
  );

  return NextResponse.json({
    exerciseName,
    exerciseCategory,
    sessions,
    allTimeMaxWeight,
    allTimeBestSet,
    totalSessions: sessions.length,
  });
}