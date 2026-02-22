import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        <div className="space-y-3">
          {workouts.map((workout) => {
            const totalVolume = workout.exercises.reduce((acc, ex) =>
              acc + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0), 0
            );
            const hasPR = workout.exercises.some((ex) => ex.sets.some((s) => s.isPersonalRecord));

            return (
              <Link href={`/workouts/${workout.id}`} key={workout.id}>
                <Card className="border-border/50 hover:border-primary/30 transition-colors">
                  <CardContent className="py-4 px-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{workout.name}</p>
                          {hasPR && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">PR 🎯</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(workout.date), "EEE, MMM d yyyy")}
                          {workout.duration && ` · ${workout.duration} min`}
                        </p>
                        <div className="flex gap-3 mt-2">
                          {workout.exercises.slice(0, 3).map((ex) => (
                            <span key={ex.id} className="text-xs text-muted-foreground">
                              {ex.exercise.name}
                            </span>
                          ))}
                          {workout.exercises.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{workout.exercises.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-semibold text-primary">{totalVolume.toFixed(0)} kg</p>
                        <p className="text-xs text-muted-foreground">volume</p>
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