export type Mood = "happy" | "neutral" | "upset" | "excited" | "tired";

interface MoodContext {
  weather: string;
  period: string;
  currentMood: string;
}

export function calculateMoodShift(ctx: MoodContext): Mood {
  // Time effects take priority
  if (ctx.period === "night") return "tired";

  // Weather effects
  if (ctx.weather === "sunny" && ctx.currentMood !== "happy") return "happy";
  if (ctx.weather === "rainy" && ctx.currentMood === "happy") return "neutral";
  if (ctx.weather === "snowy") return "excited";

  // Default: keep current
  return ctx.currentMood as Mood;
}
