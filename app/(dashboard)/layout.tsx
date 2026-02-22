import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BottomNav from "@/components/bottom-nav";
import TopBar from "@/components/top-bar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/onboarding");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar user={user} />
      <main className="flex-1 pb-24 pt-16">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}