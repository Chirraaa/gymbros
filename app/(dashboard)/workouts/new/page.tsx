"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Exercise {
  id: string;
  name: string;
  category: string;
}

interface SetEntry {
  reps: string;
  weight: string;
}

interface ExerciseEntry {
  exercise: Exercise;
  sets: SetEntry[];
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const [name, setName] = useState("Morning Workout");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/exercises").then((r) => r.json()).then(setAllExercises);
  }, []);

  function addExercise(exercise: Exercise) {
    setExercises((prev) => [...prev, { exercise, sets: [{ reps: "", weight: "" }] }]);
    setOpen(false);
  }

  function addSet(exIndex: number) {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exIndex].sets.push({ reps: "", weight: "" });
      return updated;
    });
  }

  function removeSet(exIndex: number, setIndex: number) {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exIndex].sets.splice(setIndex, 1);
      return updated;
    });
  }

  function removeExercise(exIndex: number) {
    setExercises((prev) => prev.filter((_, i) => i !== exIndex));
  }

  function updateSet(exIndex: number, setIndex: number, field: "reps" | "weight", value: string) {
    setExercises((prev) => {
      const updated = [...prev];
      updated[exIndex].sets[setIndex][field] = value;
      return updated;
    });
  }

  async function handleSave() {
    if (!name.trim() || exercises.length === 0) {
      toast.error("Fill in workout name and add at least one exercise");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          duration: duration ? parseInt(duration) : null,
          notes,
          exercises: exercises.map((ex) => ({
            exerciseId: ex.exercise.id,
            sets: ex.sets
              .filter((s) => s.reps && s.weight)
              .map((s, i) => ({
                setNumber: i + 1,
                reps: parseInt(s.reps),
                weight: parseFloat(s.weight),
              })),
          })),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const { workout } = await res.json();
      toast.success("Workout logged! 💪", { description: "+50 XP earned" });
      router.push(`/workouts/${workout.id}`);
    } catch {
      toast.error("Failed to save workout");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-32">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">New Workout</h1>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Check className="w-4 h-4" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Workout name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Push Day" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Duration (min)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="60" />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Felt great..." />
          </div>
        </div>
      </div>

      {exercises.map((entry, exIndex) => (
        <Card key={exIndex} className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">{entry.exercise.name}</CardTitle>
                <Badge variant="outline" className="text-xs mt-1 border-primary/30 text-primary">
                  {entry.exercise.category}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeExercise(exIndex)} className="text-destructive hover:text-destructive h-8 w-8">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1 mb-1">
              <span className="col-span-1">#</span>
              <span className="col-span-5">Weight (kg)</span>
              <span className="col-span-5">Reps</span>
              <span className="col-span-1"></span>
            </div>
            {entry.sets.map((set, setIndex) => (
              <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                <span className="col-span-1 text-xs text-muted-foreground text-center">{setIndex + 1}</span>
                <Input
                  className="col-span-5 h-9 text-center"
                  type="number"
                  placeholder="0"
                  value={set.weight}
                  onChange={(e) => updateSet(exIndex, setIndex, "weight", e.target.value)}
                />
                <Input
                  className="col-span-5 h-9 text-center"
                  type="number"
                  placeholder="0"
                  value={set.reps}
                  onChange={(e) => updateSet(exIndex, setIndex, "reps", e.target.value)}
                />
                <Button variant="ghost" size="icon" className="col-span-1 h-8 w-8 text-muted-foreground" onClick={() => removeSet(exIndex, setIndex)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" className="w-full text-primary mt-1 h-8" onClick={() => addSet(exIndex)}>
              <Plus className="w-3 h-3 mr-1" /> Add set
            </Button>
          </CardContent>
        </Card>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full gap-2 border-dashed border-primary/30 text-primary">
            <Plus className="w-4 h-4" /> Add Exercise
            <ChevronDown className="w-4 h-4 ml-auto" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search exercises..." />
            <CommandEmpty>No exercises found.</CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
              {allExercises.map((ex) => (
                <CommandItem key={ex.id} onSelect={() => addExercise(ex)} className="cursor-pointer">
                  <div>
                    <p className="text-sm">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.category}</p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}