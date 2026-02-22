import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { XP_REWARDS, getLevel } from "@/lib/xp";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const workouts = await prisma.workout.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    include: { exercises: { include: { sets: true, exercise: true } } },
  });
  return NextResponse.json(workouts);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { name, duration, notes, exercises } = await req.json();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  // Create workout
  const workout = await prisma.workout.create({
    data: {
      userId,
      name,
      duration,
      notes,
      exercises: {
        create: exercises.map((ex: any, i: number) => ({
          exerciseId: ex.exerciseId,
          orderIndex: i,
          sets: {
            create: ex.sets.map((set: any) => ({
              setNumber: set.setNumber,
              reps: set.reps,
              weight: set.weight,
            })),
          },
        })),
      },
    },
  });

  // XP & streak logic
  let xpGained = XP_REWARDS.COMPLETE_WORKOUT;
  let reason = "Completed workout";
  
  const lastWorkout = user.lastWorkout;
  const now = new Date();
  const diffDays = lastWorkout
    ? Math.floor((now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  let newStreak = user.streak;
  if (diffDays === null || diffDays >= 2) {
    newStreak = 1;
  } else if (diffDays === 1) {
    newStreak = user.streak + 1;
    if (newStreak === 3) xpGained += XP_REWARDS.STREAK_3;
    if (newStreak === 7) xpGained += XP_REWARDS.STREAK_7;
    if (newStreak === 30) xpGained += XP_REWARDS.STREAK_30;
  }

  const newXp = user.xp + xpGained;
  const oldLevel = getLevel(user.xp);
  const newLevel = getLevel(newXp);

  await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: newLevel,
      streak: newStreak,
      lastWorkout: now,
    },
  });

  await prisma.xPLog.create({ data: { userId, amount: xpGained, reason } });

  return NextResponse.json({ workout, xpGained, levelUp: newLevel > oldLevel, newLevel });
}