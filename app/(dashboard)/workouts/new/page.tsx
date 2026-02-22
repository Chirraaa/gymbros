"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Check, Search, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

const CATEGORIES = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio", "Olympic"];

export default function NewWorkoutPage() {
  const router = useRouter();
  const [name, setName] = useState("Morning Workout");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [exercises, setExercises] = useState<ExerciseEntry[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Chest");
  const [customName, setCustomName] = useState("");

  useEffect(() => {
    fetch("/api/exercises").then((r) => r.json()).then(setAllExercises);
  }, []);

  const filtered = allExercises.filter((ex) => {
    if (search.trim()) {
      return ex.name.toLowerCase().includes(search.toLowerCase());
    }
    return ex.category === activeCategory;
  });

  function addExercise(exercise: Exercise) {
    if (exercises.find((e) => e.exercise.id === exercise.id)) {
      toast.error("Already added");
      return;
    }
    setExercises((prev) => [...prev, { exercise, sets: [{ reps: "", weight: "" }] }]);
    setOpen(false);
    setSearch("");
  }

  async function addCustomExercise() {
    if (!customName.trim()) return;
    const res = await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: customName,
        category: activeCategory,
        muscleGroup: activeCategory,
      }),
    });
    const ex = await res.json();
    setAllExercises((prev) => [...prev, ex]);
    addExercise(ex);
    setCustomName("");
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

  function updateSet(
    exIndex: number,
    setIndex: number,
    field: "reps" | "weight",
    value: string
  ) {
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
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Push Day"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Duration (min)</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="60"
            />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Felt great..."
            />
          </div>
        </div>
      </div>

      {exercises.map((entry, exIndex) => (
        <Card key={exIndex} className="border-border/50">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  {entry.exercise.name}
                </CardTitle>
                <Badge
                  variant="outline"
                  className="text-xs mt-1 border-primary/30 text-primary"
                >
                  {entry.exercise.category}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeExercise(exIndex)}
                className="text-destructive hover:text-destructive h-8 w-8"
              >
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
                <span className="col-span-1 text-xs text-muted-foreground text-center">
                  {setIndex + 1}
                </span>
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="col-span-1 h-8 w-8 text-muted-foreground"
                  onClick={() => removeSet(exIndex, setIndex)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-primary mt-1 h-8"
              onClick={() => addSet(exIndex)}
            >
              <Plus className="w-3 h-3 mr-1" /> Add set
            </Button>
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outline"
        className="w-full gap-2 border-dashed border-primary/30 text-primary"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4" /> Add Exercise
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md p-0 gap-0 flex flex-col w-[95vw] max-h-[80dvh] overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2 shrink-0 border-b border-border/40">
            <DialogTitle>Add Exercise</DialogTitle>
          </DialogHeader>

          {/* Search */}
          <div className="px-4 py-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search exercises..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category tabs */}
          {!search && (
            <div className="pb-2 shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-2 touch-pan-x select-none px-4 category-scroll">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeCategory === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
                {/* spacer so last item isn't flush against edge */}
                <div className="shrink-0 w-4" />
              </div>
            </div>
          )}

          {/* Exercise list */}
          <div className="flex-1 overflow-y-auto px-4 min-h-0">
            <div className="space-y-1 py-2">
              {filtered.length === 0 && !search && (
                <p className="text-center text-muted-foreground text-sm py-8">
                  No exercises in this category
                </p>
              )}
              {filtered.length === 0 && search && (
                <p className="text-center text-muted-foreground text-sm py-6">
                  No results for &quot;{search}&quot;
                </p>
              )}
              {filtered.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => addExercise(ex)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors text-left"
                >
                  <span className="text-sm font-medium">{ex.name}</span>
                  <Plus className="w-4 h-4 text-primary shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Custom exercise */}
          <div className="px-4 py-3 border-t border-border/50 shrink-0 bg-background">
            <p className="text-xs text-muted-foreground mb-2">
              Not in the list? Add a custom exercise:
            </p>
            <div className="flex gap-2">
              <Input
                placeholder={`Custom ${activeCategory} exercise...`}
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustomExercise()}
                className="h-9 text-sm"
              />
              <Button
                size="sm"
                onClick={addCustomExercise}
                disabled={!customName.trim()}
                className="shrink-0"
              >
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}