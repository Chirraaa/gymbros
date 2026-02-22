import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { XP_REWARDS } from "@/lib/xp";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;

  const workout = await prisma.workout.findUnique({ where: { id } });
  if (!workout) return new NextResponse("Not found", { status: 404 });
  if (workout.userId === userId) return new NextResponse("Can't hype your own workout", { status: 400 });

  const existing = await prisma.hype.findUnique({
    where: { workoutId_giverId: { workoutId: id, giverId: userId } },
  });

  if (existing) {
    await prisma.hype.delete({ where: { id: existing.id } });
    return NextResponse.json({ hyped: false });
  }

  await prisma.hype.create({
    data: { workoutId: id, giverId: userId, receiverId: workout.userId },
  });

  await prisma.user.update({
    where: { id: workout.userId },
    data: { xp: { increment: XP_REWARDS.RECEIVE_HYPE } },
  });

  await prisma.xPLog.create({
    data: { userId: workout.userId, amount: XP_REWARDS.RECEIVE_HYPE, reason: "Received hype on workout" },
  });

  return NextResponse.json({ hyped: true });
}