import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import FriendsClient from "@/components/friends-client";

export default async function FriendsPage() {
  const { userId } = await auth();

  const [friendsAsA, friendsAsB, pendingReceived, pendingSent] = await Promise.all([
    prisma.friendship.findMany({
      where: { userAId: userId! },
      include: { userB: true },
    }),
    prisma.friendship.findMany({
      where: { userBId: userId! },
      include: { userA: true },
    }),
    prisma.friendRequest.findMany({
      where: { receiverId: userId!, status: "pending" },
      include: { sender: true },
    }),
    prisma.friendRequest.findMany({
      where: { senderId: userId!, status: "pending" },
      include: { receiver: true },
    }),
  ]);

  const friends = [
    ...friendsAsA.map((f) => f.userB),
    ...friendsAsB.map((f) => f.userA),
  ];

  return (
    <FriendsClient
      friends={friends}
      pendingReceived={pendingReceived.map((r) => r.sender)}
      pendingSent={pendingSent.map((r) => r.receiver)}
      pendingRequestIds={pendingReceived.map((r) => r.id)}
    />
  );
}