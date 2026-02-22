import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const DEFAULT_EXERCISES = [
  { name: "Bench Press",       category: "Chest",     muscleGroup: "Pectorals" },
  { name: "Incline Bench",     category: "Chest",     muscleGroup: "Upper Chest" },
  { name: "Cable Fly",         category: "Chest",     muscleGroup: "Pectorals" },
  { name: "Pull-up",           category: "Back",      muscleGroup: "Lats" },
  { name: "Deadlift",          category: "Back",      muscleGroup: "Lower Back" },
  { name: "Barbell Row",       category: "Back",      muscleGroup: "Lats" },
  { name: "Lat Pulldown",      category: "Back",      muscleGroup: "Lats" },
  { name: "Squat",             category: "Legs",      muscleGroup: "Quads" },
  { name: "Leg Press",         category: "Legs",      muscleGroup: "Quads" },
  { name: "Romanian Deadlift", category: "Legs",      muscleGroup: "Hamstrings" },
  { name: "Leg Curl",          category: "Legs",      muscleGroup: "Hamstrings" },
  { name: "Calf Raise",        category: "Legs",      muscleGroup: "Calves" },
  { name: "Overhead Press",    category: "Shoulders", muscleGroup: "Deltoids" },
  { name: "Lateral Raise",     category: "Shoulders", muscleGroup: "Side Delts" },
  { name: "Face Pull",         category: "Shoulders", muscleGroup: "Rear Delts" },
  { name: "Bicep Curl",        category: "Arms",      muscleGroup: "Biceps" },
  { name: "Hammer Curl",       category: "Arms",      muscleGroup: "Biceps" },
  { name: "Tricep Pushdown",   category: "Arms",      muscleGroup: "Triceps" },
  { name: "Skull Crusher",     category: "Arms",      muscleGroup: "Triceps" },
  { name: "Plank",             category: "Core",      muscleGroup: "Core" },
  { name: "Ab Crunch",         category: "Core",      muscleGroup: "Abs" },
  { name: "Running",           category: "Cardio",    muscleGroup: "Full Body" },
];

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  // Seed if empty
  const count = await prisma.exercise.count();
  if (count === 0) {
    await prisma.exercise.createMany({ data: DEFAULT_EXERCISES });
  }

  const exercises = await prisma.exercise.findMany({ orderBy: { category: "asc" } });
  return NextResponse.json(exercises);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { name, category, muscleGroup } = await req.json();
  const exercise = await prisma.exercise.create({ data: { name, category, muscleGroup } });
  return NextResponse.json(exercise);
}