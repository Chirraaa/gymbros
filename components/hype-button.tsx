"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface HypeButtonProps {
  workoutId: string;
  initialHyped: boolean;
  initialCount: number;
}

export default function HypeButton({
  workoutId,
  initialHyped,
  initialCount,
}: HypeButtonProps) {
  const [hyped, setHyped] = useState(initialHyped);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/workouts/${workoutId}/hype`, {
        method: "POST",
      });
      const data = await res.json();
      setHyped(data.hyped);
      setCount((c) => c + (data.hyped ? 1 : -1));
      if (data.hyped) toast.success("Hype sent! 🔥");
    } catch {
      toast.error("Failed to hype");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={toggle}
      disabled={loading}
      variant="outline"
      className={cn(
        "w-full gap-2 h-12 text-base transition-all",
        hyped
          ? "border-orange-500/50 text-orange-400 bg-orange-500/10"
          : "border-border/50 text-muted-foreground hover:border-orange-500/30 hover:text-orange-400"
      )}
    >
      <Flame className={cn("w-5 h-5", hyped && "fill-orange-400")} />
      {hyped ? "Hyped!" : "Hype this workout"}
      {count > 0 && <span className="ml-1 text-sm">· {count}</span>}
    </Button>
  );
}