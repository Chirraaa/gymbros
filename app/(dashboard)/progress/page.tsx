import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { calculateBMI, getBMICategory } from "@/lib/xp";
import ProgressCharts from "@/components/progress-charts";

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
    <ProgressCharts
      chartData={chartData}
      bmi={bmi}
      height={user?.height ?? null}
      weight={user?.weight ?? null}
    />
  );
}