import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { requesterId, accept } = await req.json();

  const request = await prisma.friendRequest.findFirst({
    where: { senderId: requesterId, receiverId: userId, status: "pending" },
  });

  if (!request) return new NextResponse("Request not found", { status: 404 });

  await prisma.friendRequest.update({
    where: { id: request.id },
    data: { status: accept ? "accepted" : "rejected" },
  });

  if (accept) {
    await prisma.friendship.upsert({
      where: { userAId_userBId: { userAId: requesterId, userBId: userId } },
      update: {},
      create: { userAId: requesterId, userBId: userId },
    });
  }

  return NextResponse.json({ ok: true });
}