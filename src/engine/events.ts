import { eventPool, type EventTemplate } from "../data/event-pool";

interface GameTime {
  date: string;
  hour: number;
  minute: number;
  season: string;
  period: string;
}

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class EventEngine {
  private rng: () => number;

  constructor(seed: number) {
    this.rng = mulberry32(seed);
  }

  selectEvent(gameTime: GameTime, triggeredEventIds: string[]): EventTemplate | null {
    if (gameTime.period === "night") {
      return null;
    }

    const mmdd = gameTime.date.slice(5); // "YYYY-MM-DD" -> "MM-DD"

    // Check seasonal events first
    const seasonalMatch = eventPool.find(
      (e) => e.type === "seasonal" && e.triggerDate === mmdd && !triggeredEventIds.includes(e.id),
    );
    if (seasonalMatch) {
      return seasonalMatch;
    }

    // Filter eligible daily events by period
    const eligible = eventPool.filter(
      (e) =>
        e.type === "daily" &&
        !triggeredEventIds.includes(e.id) &&
        (!e.periods || e.periods.includes(gameTime.period)),
    );

    if (eligible.length === 0) {
      return null;
    }

    const index = Math.floor(this.rng() * eligible.length);
    return eligible[index];
  }
}
