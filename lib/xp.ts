export const RANKS = [
  { name: "Rookie",   min: 0,     icon: "🥉", color: "text-stone-400" },
  { name: "Iron",     min: 100,   icon: "⚙️",  color: "text-slate-400" },
  { name: "Bronze",   min: 300,   icon: "🥈", color: "text-amber-600" },
  { name: "Silver",   min: 700,   icon: "🥈", color: "text-slate-300" },
  { name: "Gold",     min: 1500,  icon: "🥇", color: "text-yellow-400" },
  { name: "Platinum", min: 3000,  icon: "💎", color: "text-cyan-400" },
  { name: "Diamond",  min: 6000,  icon: "💠", color: "text-blue-400" },
  { name: "Legend",   min: 10000, icon: "👑", color: "text-purple-400" },
] as const;

export const XP_REWARDS = {
  COMPLETE_WORKOUT: 50,
  PERSONAL_RECORD: 100,
  STREAK_3: 30,
  STREAK_7: 75,
  STREAK_30: 200,
  RECEIVE_HYPE: 5,
  CHALLENGE_WIN: 150,
  FIRST_WORKOUT: 100,
} as const;

export function getRank(xp: number) {
  return [...RANKS].reverse().find((r) => xp >= r.min) ?? RANKS[0];
}

export function getLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function getXPForNextLevel(level: number) {
  return Math.pow(level, 2) * 50;
}

export function getLevelProgress(xp: number) {
  const level = getLevel(xp);
  const currentLevelXP = Math.pow(level - 1, 2) * 50;
  const nextLevelXP = getXPForNextLevel(level);
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

export function calculateBMI(weightKg: number, heightCm: number) {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function getBMICategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-400" };
  if (bmi < 25) return { label: "Normal", color: "text-green-400" };
  if (bmi < 30) return { label: "Overweight", color: "text-yellow-400" };
  return { label: "Obese", color: "text-red-400" };
}

export function calculateWeeklyScore(workoutCount: number, totalVolume: number, streak: number) {
  return workoutCount * 20 + totalVolume / 100 + streak * 5;
}