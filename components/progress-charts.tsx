"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBMICategory } from "@/lib/xp";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts";
import { TrendingUp, Activity } from "lucide-react";

interface ChartDataPoint {
  date: string;
  volume: number;
  sets: number;
}

interface Props {
  chartData: ChartDataPoint[];
  bmi: number | null;
  height: number | null;
  weight: number | null;
}

export default function ProgressCharts({ chartData, bmi, height, weight }: Props) {
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  return (
    <div className="space-y-6">
      {/* BMI Card */}
      {bmi && bmiCategory && (
        <Card className="border-primary/20 bg-gradient-to-br from-card to-accent/10">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Body Mass Index
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex items-end gap-4">
              <div>
                <p className={`text-5xl font-black ${bmiCategory.color}`}>{bmi.toFixed(1)}</p>
                <p className={`text-sm font-semibold ${bmiCategory.color} mt-1`}>{bmiCategory.label}</p>
              </div>
              <div className="text-muted-foreground text-sm mb-1 space-y-0.5">
                <p>{height} cm</p>
                <p>{weight} kg</p>
              </div>
            </div>
            <div className="mt-4 relative h-3 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-500">
              <div
                className="absolute top-0 w-3 h-3 bg-white rounded-full shadow border-2 border-gray-800 -translate-x-1/2"
                style={{ left: `${Math.min(((bmi - 15) / 25) * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Volume Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Total Volume Per Workout (kg)
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {chartData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Area type="monotone" dataKey="volume" stroke="#9333ea" fill="url(#volumeGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Sets Chart */}
      <Card className="border-border/50">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Sets Per Workout
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          {chartData.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", fontSize: "12px" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="sets" fill="#9333ea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}