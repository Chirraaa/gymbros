import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const users = await prisma.user.findMany({
    where: {
      username: { contains: q, mode: "insensitive" },
      id: { not: userId },
    },
    take: 10,
    select: { id: true, username: true, imageUrl: true, xp: true },
  });

  return NextResponse.json({ users });
}