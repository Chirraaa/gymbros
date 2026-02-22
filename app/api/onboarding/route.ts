import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { username, height, weight, email, imageUrl } = await req.json();

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing && existing.id !== userId) {
    return new NextResponse("Username taken", { status: 409 });
  }

  await prisma.user.upsert({
    where: { id: userId },
    update: { username, height, weight },
    create: {
      id: userId,
      username,
      email,
      imageUrl,
      height,
      weight,
    },
  });

  return NextResponse.json({ ok: true });
}