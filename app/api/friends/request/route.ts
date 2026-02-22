import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { receiverId } = await req.json();
  if (receiverId === userId) return new NextResponse("Can't add yourself", { status: 400 });

  await prisma.friendRequest.upsert({
    where: { senderId_receiverId: { senderId: userId, receiverId } },
    update: { status: "pending" },
    create: { senderId: userId, receiverId },
  });

  return NextResponse.json({ ok: true });
}