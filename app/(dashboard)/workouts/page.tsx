import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Dumbbell } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function WorkoutsPage() {
  const { userId } = await auth();
  const workouts = await prisma.workout.findMany({
    where: { userId: userId! },
    orderBy: { date: "desc" },
    include: {
      exercises: {
        include: {
          exercise: true,
          sets: true,
        },
      },
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Workouts</h1>
        <Button asChild size="sm" className="gap-1">
          <Link href="/workouts/new"><Plus className="w-4 h-4" /> New</Link>
        </Button>
      </div>

      {workouts.length === 0 ? (
        <Card className="border-dashed border-border/50">
          <CardContent className="py-12 text-center">
            <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No workouts logged yet.</p>
            <Button className="mt-4" asChild>
              <Link href="/workouts/new">Log your first workout</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {workouts.map((workout) => {
            const totalSets = workout.exercises.reduce(
              (acc, ex) => acc + ex.sets.length, 0
            );
            const totalVolume = workout.exercises.reduce(
              (acc, ex) => acc + ex.sets.reduce(
                (s, set) => s + set.reps * set.weight, 0
              ), 0
            );
            const hasPR = workout.exercises.some((ex) =>
              ex.sets.some((s) => s.isPersonalRecord)
            );
            const exerciseNames = workout.exercises.map((ex) => ex.exercise.name);

            return (
              <Link href={`/workouts/${workout.id}`} key={workout.id}>
                <Card className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="py-4 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold truncate">{workout.name}</p>
                          {hasPR && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] h-4 px-1.5">
                              PR
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(workout.date), "EEE, MMM d yyyy")}
                          {workout.duration && ` · ${workout.duration} min`}
                        </p>
                        {exerciseNames.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1.5 truncate">
                            {exerciseNames.slice(0, 4).join(" · ")}
                            {exerciseNames.length > 4 && ` +${exerciseNames.length - 4}`}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-primary">
                          {totalVolume > 0 ? `${totalVolume.toFixed(0)} kg` : "BW"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {totalSets} {totalSets === 1 ? "set" : "sets"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}