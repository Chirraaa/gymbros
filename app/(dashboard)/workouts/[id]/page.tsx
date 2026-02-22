import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Flame, Trophy } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import HypeButton from "@/components/hype-button";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const { id } = await params;

  const workout = await prisma.workout.findUnique({
    where: { id },
    include: {
      user: true,
      exercises: {
        orderBy: { orderIndex: "asc" },
        include: {
          exercise: true,
          sets: { orderBy: { setNumber: "asc" } },
        },
      },
      hypes: true,
    },
  });

  if (!workout) notFound();

  const isOwner = workout.userId === userId;
  const totalVolume = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0),
    0
  );
  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const hasPR = workout.exercises.some((ex) => ex.sets.some((s) => s.isPersonalRecord));
  const alreadyHyped = workout.hypes.some((h) => h.giverId === userId);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/workouts"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-black truncate">{workout.name}</h1>
            {hasPR && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                <Trophy className="w-3 h-3 mr-1" /> PR
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span>{format(new Date(workout.date), "EEEE, MMM d yyyy")}</span>
            {workout.duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> {workout.duration} min
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-black text-primary">{workout.exercises.length}</p>
            <p className="text-xs text-muted-foreground">Exercises</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-black text-primary">{totalSets}</p>
            <p className="text-xs text-muted-foreground">Sets</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-2xl font-black text-primary">{totalVolume.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">kg volume</p>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {workout.notes && (
        <Card className="border-border/50">
          <CardContent className="py-3 px-4">
            <p className="text-sm text-muted-foreground italic">"{workout.notes}"</p>
          </CardContent>
        </Card>
      )}

      {/* Exercises */}
      <div className="space-y-4">
        {workout.exercises.map((ex) => {
          const exVolume = ex.sets.reduce((s, set) => s + set.reps * set.weight, 0);
          return (
            <Card key={ex.id} className="border-border/50">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">{ex.exercise.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                        {ex.exercise.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{exVolume.toFixed(0)} kg</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground mb-2 px-1">
                  <span className="col-span-2">Set</span>
                  <span className="col-span-4">Weight</span>
                  <span className="col-span-4">Reps</span>
                  <span className="col-span-2">Vol.</span>
                </div>
                {ex.sets.map((set) => (
                  <div key={set.id} className="grid grid-cols-12 gap-2 items-center py-1.5 border-t border-border/30">
                    <span className="col-span-2 text-xs text-muted-foreground">{set.setNumber}</span>
                    <span className="col-span-4 text-sm font-medium">{set.weight} kg</span>
                    <span className="col-span-4 text-sm font-medium">{set.reps} reps</span>
                    <div className="col-span-2 flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">{(set.reps * set.weight).toFixed(0)}</span>
                      {set.isPersonalRecord && <Trophy className="w-3 h-3 text-yellow-400" />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Hype */}
      {!isOwner && (
        <HypeButton
          workoutId={workout.id}
          initialHyped={alreadyHyped}
          initialCount={workout.hypes.length}
        />
      )}

      {isOwner && workout.hypes.length > 0 && (
        <div className="flex items-center justify-center gap-2 text-orange-400 text-sm">
          <Flame className="w-4 h-4" />
          <span>{workout.hypes.length} {workout.hypes.length === 1 ? "bro hyped" : "bros hyped"} this</span>
        </div>
      )}
    </div>
  );
}