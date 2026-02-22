"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
  BarChart, Bar,
} from "recharts";

interface Session {
  date: string;
  workoutName: string;
  workoutId: string;
  sets: { reps: number; weight: number; isPersonalRecord: boolean }[];
  maxWeight: number;
  totalVolume: number;
  bestSet: { reps: number; weight: number };
}

interface Props {
  data: {
    exerciseName: string;
    exerciseCategory: string;
    sessions: Session[];
    allTimeMaxWeight: number;
    allTimeBestSet: { reps: number; weight: number };
    totalSessions: number;
  };
  exerciseId: string;
}

const TOOLTIP_STYLE = {
  backgroundColor: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#e2e8f0",
};

export default function ExerciseProgressClient({ data }: Props) {
  const { exerciseName, exerciseCategory, sessions, allTimeMaxWeight, allTimeBestSet, totalSessions } = data;

  const chartData = sessions.map((s) => ({
    date: format(new Date(s.date), "MMM d"),
    weight: s.maxWeight,
    volume: Math.round(s.totalVolume),
    reps: s.bestSet.reps,
  }));

  const firstWeight = sessions[0]?.maxWeight ?? 0;
  const lastWeight = sessions[sessions.length - 1]?.maxWeight ?? 0;
  const improvement = firstWeight > 0
    ? (((lastWeight - firstWeight) / firstWeight) * 100).toFixed(1)
    : null;
  const isImproving = lastWeight >= firstWeight;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/progress"><ArrowLeft className="w-4 h-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-black">{exerciseName}</h1>
          <Badge variant="outline" className="border-primary/30 text-primary text-xs mt-1">
            {exerciseCategory}
          </Badge>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4 text-center">
            <Trophy className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <p className="text-xl font-black">{allTimeMaxWeight} kg</p>
            <p className="text-xs text-muted-foreground">Best weight</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4 text-center">
            <Zap className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="text-xl font-black">{allTimeBestSet.reps}</p>
            <p className="text-xs text-muted-foreground">Reps at PR</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4 text-center">
            <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-black">{totalSessions}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Improvement banner */}
      {improvement && totalSessions > 1 && (
        <Card className={`border-0 ${isImproving ? "bg-green-500/10" : "bg-red-500/10"}`}>
          <CardContent className="py-3 px-4">
            <p className={`text-sm font-semibold ${isImproving ? "text-green-400" : "text-red-400"}`}>
              {isImproving ? "▲" : "▼"} {Math.abs(Number(improvement))}% weight change since first session
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {firstWeight} kg → {lastWeight} kg
            </p>
          </CardContent>
        </Card>
      )}

      {/* Weight over time */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Max Weight Per Session (kg)
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#9333ea" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} unit=" kg" />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} kg`, "Weight"]} />
              <ReferenceLine y={allTimeMaxWeight} stroke="#9333ea" strokeDasharray="4 4" strokeOpacity={0.5} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="url(#lineGlow)"
                strokeWidth={2.5}
                dot={{ fill: "#9333ea", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#c084fc" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Volume over time */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Volume Per Session (kg)
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} kg`, "Volume"]} />
              <Bar dataKey="volume" fill="#9333ea" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Session history */}
      <div>
        <h3 className="font-semibold mb-3">Session History</h3>
        <div className="space-y-3">
          {[...sessions].reverse().map((session, i) => (
            <Link href={`/workouts/${session.workoutId}`} key={session.workoutId}>
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{session.workoutName}</p>
                        {i === 0 && (
                          <Badge className="bg-primary/20 text-primary border-0 text-[10px] h-4 px-1.5">Latest</Badge>
                        )}
                        {session.sets.some((s) => s.isPersonalRecord) && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-[10px] h-4 px-1.5">PR</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(session.date), "EEE, MMM d yyyy")}
                      </p>
                      <div className="flex gap-3 mt-2 flex-wrap">
                        {session.sets.map((set, si) => (
                          <span
                            key={si}
                            className={`text-xs px-2 py-0.5 rounded-md ${
                              set.isPersonalRecord
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {set.weight > 0 ? `${set.weight}kg` : "BW"} × {set.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary">{session.maxWeight} kg</p>
                      <p className="text-xs text-muted-foreground">max</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}