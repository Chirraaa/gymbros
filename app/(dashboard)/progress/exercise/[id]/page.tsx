import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import ExerciseProgressClient from "@/components/exercise-progress-client";

export default async function ExerciseProgressPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) return null;

  const { id } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/exercises/${id}/history`,
    {
      headers: { Cookie: "" },
      cache: "no-store",
    }
  );

  if (!res.ok) notFound();
  const data = await res.json();

  if (data.sessions.length === 0) notFound();

  return <ExerciseProgressClient data={data} exerciseId={id} />;
}