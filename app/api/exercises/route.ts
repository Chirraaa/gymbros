import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const DEFAULT_EXERCISES = [
  // Chest
  { name: "Bench Press",              category: "Chest",     muscleGroup: "Pectorals" },
  { name: "Incline Bench Press",      category: "Chest",     muscleGroup: "Upper Chest" },
  { name: "Decline Bench Press",      category: "Chest",     muscleGroup: "Lower Chest" },
  { name: "Dumbbell Fly",             category: "Chest",     muscleGroup: "Pectorals" },
  { name: "Incline Dumbbell Fly",     category: "Chest",     muscleGroup: "Upper Chest" },
  { name: "Cable Fly",                category: "Chest",     muscleGroup: "Pectorals" },
  { name: "Low Cable Fly",            category: "Chest",     muscleGroup: "Upper Chest" },
  { name: "High Cable Fly",           category: "Chest",     muscleGroup: "Lower Chest" },
  { name: "Chest Dip",                category: "Chest",     muscleGroup: "Lower Chest" },
  { name: "Push-up",                  category: "Chest",     muscleGroup: "Pectorals" },
  { name: "Dumbbell Press",           category: "Chest",     muscleGroup: "Pectorals" },
  { name: "Incline Dumbbell Press",   category: "Chest",     muscleGroup: "Upper Chest" },
  { name: "Pec Deck",                 category: "Chest",     muscleGroup: "Pectorals" },
  { name: "Landmine Press",           category: "Chest",     muscleGroup: "Upper Chest" },

  // Back
  { name: "Deadlift",                 category: "Back",      muscleGroup: "Lower Back" },
  { name: "Pull-up",                  category: "Back",      muscleGroup: "Lats" },
  { name: "Chin-up",                  category: "Back",      muscleGroup: "Lats" },
  { name: "Barbell Row",              category: "Back",      muscleGroup: "Lats" },
  { name: "Pendlay Row",              category: "Back",      muscleGroup: "Lats" },
  { name: "Dumbbell Row",             category: "Back",      muscleGroup: "Lats" },
  { name: "Lat Pulldown",             category: "Back",      muscleGroup: "Lats" },
  { name: "Close Grip Lat Pulldown",  category: "Back",      muscleGroup: "Lats" },
  { name: "Seated Cable Row",         category: "Back",      muscleGroup: "Mid Back" },
  { name: "T-Bar Row",                category: "Back",      muscleGroup: "Mid Back" },
  { name: "Chest Supported Row",      category: "Back",      muscleGroup: "Mid Back" },
  { name: "Single Arm Cable Row",     category: "Back",      muscleGroup: "Lats" },
  { name: "Straight Arm Pulldown",    category: "Back",      muscleGroup: "Lats" },
  { name: "Back Extension",           category: "Back",      muscleGroup: "Lower Back" },
  { name: "Good Morning",             category: "Back",      muscleGroup: "Lower Back" },
  { name: "Shrug",                    category: "Back",      muscleGroup: "Traps" },
  { name: "Rack Pull",                category: "Back",      muscleGroup: "Lower Back" },
  { name: "Meadows Row",              category: "Back",      muscleGroup: "Lats" },

  // Legs
  { name: "Squat",                    category: "Legs",      muscleGroup: "Quads" },
  { name: "Front Squat",              category: "Legs",      muscleGroup: "Quads" },
  { name: "Hack Squat",               category: "Legs",      muscleGroup: "Quads" },
  { name: "Leg Press",                category: "Legs",      muscleGroup: "Quads" },
  { name: "Romanian Deadlift",        category: "Legs",      muscleGroup: "Hamstrings" },
  { name: "Stiff Leg Deadlift",       category: "Legs",      muscleGroup: "Hamstrings" },
  { name: "Leg Curl",                 category: "Legs",      muscleGroup: "Hamstrings" },
  { name: "Seated Leg Curl",          category: "Legs",      muscleGroup: "Hamstrings" },
  { name: "Leg Extension",            category: "Legs",      muscleGroup: "Quads" },
  { name: "Calf Raise",               category: "Legs",      muscleGroup: "Calves" },
  { name: "Seated Calf Raise",        category: "Legs",      muscleGroup: "Calves" },
  { name: "Bulgarian Split Squat",    category: "Legs",      muscleGroup: "Quads" },
  { name: "Walking Lunge",            category: "Legs",      muscleGroup: "Quads" },
  { name: "Reverse Lunge",            category: "Legs",      muscleGroup: "Quads" },
  { name: "Step Up",                  category: "Legs",      muscleGroup: "Quads" },
  { name: "Glute Bridge",             category: "Legs",      muscleGroup: "Glutes" },
  { name: "Hip Thrust",               category: "Legs",      muscleGroup: "Glutes" },
  { name: "Sumo Deadlift",            category: "Legs",      muscleGroup: "Glutes" },
  { name: "Adductor Machine",         category: "Legs",      muscleGroup: "Adductors" },
  { name: "Abductor Machine",         category: "Legs",      muscleGroup: "Abductors" },
  { name: "Goblet Squat",             category: "Legs",      muscleGroup: "Quads" },
  { name: "Box Squat",                category: "Legs",      muscleGroup: "Quads" },
  { name: "Leg Press Calf Raise",     category: "Legs",      muscleGroup: "Calves" },

  // Shoulders
  { name: "Overhead Press",           category: "Shoulders", muscleGroup: "Deltoids" },
  { name: "Seated DB Shoulder Press", category: "Shoulders", muscleGroup: "Deltoids" },
  { name: "Arnold Press",             category: "Shoulders", muscleGroup: "Deltoids" },
  { name: "Lateral Raise",            category: "Shoulders", muscleGroup: "Side Delts" },
  { name: "Cable Lateral Raise",      category: "Shoulders", muscleGroup: "Side Delts" },
  { name: "Front Raise",              category: "Shoulders", muscleGroup: "Front Delts" },
  { name: "Face Pull",                category: "Shoulders", muscleGroup: "Rear Delts" },
  { name: "Reverse Fly",              category: "Shoulders", muscleGroup: "Rear Delts" },
  { name: "Rear Delt Machine",        category: "Shoulders", muscleGroup: "Rear Delts" },
  { name: "Upright Row",              category: "Shoulders", muscleGroup: "Deltoids" },
  { name: "Cable Front Raise",        category: "Shoulders", muscleGroup: "Front Delts" },
  { name: "Machine Shoulder Press",   category: "Shoulders", muscleGroup: "Deltoids" },

  // Arms
  { name: "Bicep Curl",               category: "Arms",      muscleGroup: "Biceps" },
  { name: "Hammer Curl",              category: "Arms",      muscleGroup: "Biceps" },
  { name: "Incline Dumbbell Curl",    category: "Arms",      muscleGroup: "Biceps" },
  { name: "Preacher Curl",            category: "Arms",      muscleGroup: "Biceps" },
  { name: "Concentration Curl",       category: "Arms",      muscleGroup: "Biceps" },
  { name: "Cable Curl",               category: "Arms",      muscleGroup: "Biceps" },
  { name: "Barbell Curl",             category: "Arms",      muscleGroup: "Biceps" },
  { name: "EZ Bar Curl",              category: "Arms",      muscleGroup: "Biceps" },
  { name: "Spider Curl",              category: "Arms",      muscleGroup: "Biceps" },
  { name: "Reverse Curl",             category: "Arms",      muscleGroup: "Forearms" },
  { name: "Wrist Curl",               category: "Arms",      muscleGroup: "Forearms" },
  { name: "Tricep Pushdown",          category: "Arms",      muscleGroup: "Triceps" },
  { name: "Rope Pushdown",            category: "Arms",      muscleGroup: "Triceps" },
  { name: "Skull Crusher",            category: "Arms",      muscleGroup: "Triceps" },
  { name: "Overhead Tricep Extension",category: "Arms",      muscleGroup: "Triceps" },
  { name: "Close Grip Bench Press",   category: "Arms",      muscleGroup: "Triceps" },
  { name: "Tricep Dip",               category: "Arms",      muscleGroup: "Triceps" },
  { name: "Tricep Kickback",          category: "Arms",      muscleGroup: "Triceps" },
  { name: "JM Press",                 category: "Arms",      muscleGroup: "Triceps" },

  // Core
  { name: "Plank",                    category: "Core",      muscleGroup: "Core" },
  { name: "Side Plank",               category: "Core",      muscleGroup: "Obliques" },
  { name: "Ab Crunch",                category: "Core",      muscleGroup: "Abs" },
  { name: "Cable Crunch",             category: "Core",      muscleGroup: "Abs" },
  { name: "Hanging Leg Raise",        category: "Core",      muscleGroup: "Abs" },
  { name: "Hanging Knee Raise",       category: "Core",      muscleGroup: "Abs" },
  { name: "Russian Twist",            category: "Core",      muscleGroup: "Obliques" },
  { name: "Ab Wheel Rollout",         category: "Core",      muscleGroup: "Abs" },
  { name: "Decline Crunch",           category: "Core",      muscleGroup: "Abs" },
  { name: "Bicycle Crunch",           category: "Core",      muscleGroup: "Obliques" },
  { name: "Leg Raise",                category: "Core",      muscleGroup: "Abs" },
  { name: "V-Up",                     category: "Core",      muscleGroup: "Abs" },
  { name: "Pallof Press",             category: "Core",      muscleGroup: "Core" },
  { name: "Dead Bug",                 category: "Core",      muscleGroup: "Core" },
  { name: "Toe Touch",                category: "Core",      muscleGroup: "Abs" },

  // Cardio
  { name: "Running",                  category: "Cardio",    muscleGroup: "Full Body" },
  { name: "Treadmill",                category: "Cardio",    muscleGroup: "Full Body" },
  { name: "Cycling",                  category: "Cardio",    muscleGroup: "Legs" },
  { name: "Stationary Bike",          category: "Cardio",    muscleGroup: "Legs" },
  { name: "Rowing Machine",           category: "Cardio",    muscleGroup: "Full Body" },
  { name: "Jump Rope",                category: "Cardio",    muscleGroup: "Full Body" },
  { name: "Stairmaster",              category: "Cardio",    muscleGroup: "Legs" },
  { name: "Elliptical",               category: "Cardio",    muscleGroup: "Full Body" },
  { name: "Battle Ropes",             category: "Cardio",    muscleGroup: "Full Body" },
  { name: "Burpee",                   category: "Cardio",    muscleGroup: "Full Body" },
  { name: "Box Jump",                 category: "Cardio",    muscleGroup: "Legs" },
  { name: "Sled Push",                category: "Cardio",    muscleGroup: "Full Body" },
  { name: "Assault Bike",             category: "Cardio",    muscleGroup: "Full Body" },

  // Olympic / Power
  { name: "Power Clean",              category: "Olympic",   muscleGroup: "Full Body" },
  { name: "Hang Clean",               category: "Olympic",   muscleGroup: "Full Body" },
  { name: "Clean and Jerk",           category: "Olympic",   muscleGroup: "Full Body" },
  { name: "Snatch",                   category: "Olympic",   muscleGroup: "Full Body" },
  { name: "Push Press",               category: "Olympic",   muscleGroup: "Shoulders" },
  { name: "Push Jerk",                category: "Olympic",   muscleGroup: "Shoulders" },
  { name: "Hang Snatch",              category: "Olympic",   muscleGroup: "Full Body" },
  { name: "Trap Bar Deadlift",        category: "Olympic",   muscleGroup: "Full Body" },
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