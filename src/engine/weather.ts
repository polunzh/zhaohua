import { seasons } from "../data/seasons";

// Simple seeded random (same mulberry32 as events.ts)
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function determineWeather(season: string, seed: number): string {
  const config = seasons[season];
  if (!config) return "sunny";

  const random = mulberry32(seed)();
  const weights = config.weatherWeights;
  const entries = Object.entries(weights);

  let cumulative = 0;
  for (const [weather, weight] of entries) {
    cumulative += weight;
    if (random < cumulative) return weather;
  }
  return entries[entries.length - 1][0];
}
