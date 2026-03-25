import { eventPool, type EventTemplate } from "../data/event-pool";
import { getRelationshipBoost, type RelationshipInfo } from "./relationship-events";

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

  selectEvent(
    gameTime: GameTime,
    triggeredEventIds: string[],
    weather?: string,
    location?: string,
    character?: string,
    affinity?: number,
    relationships?: RelationshipInfo[],
    presentNpcIds?: string[],
  ): EventTemplate | null {
    const mmdd = gameTime.date.slice(5); // "YYYY-MM-DD" -> "MM-DD"

    // Check seasonal events first
    const seasonalMatch = eventPool.find(
      (e) => e.type === "seasonal" && e.triggerDate === mmdd && !triggeredEventIds.includes(e.id),
    );
    if (seasonalMatch) {
      return seasonalMatch;
    }

    // Filter eligible daily events by period, season, weather, location, character, and affinity
    const eligible = eventPool.filter(
      (e) =>
        e.type === "daily" &&
        !triggeredEventIds.includes(e.id) &&
        (!e.periods || e.periods.includes(gameTime.period)) &&
        (!e.seasons || e.seasons.includes(gameTime.season)) &&
        (!e.weather || (weather != null && e.weather.includes(weather))) &&
        (!e.location || e.location === location) &&
        (!e.character || e.character === character) &&
        (e.minAffinity == null || (affinity != null && affinity >= e.minAffinity)) &&
        (e.maxAffinity == null || (affinity != null && affinity <= e.maxAffinity)),
    );

    if (eligible.length === 0) {
      return null;
    }

    // Apply relationship weighting
    const weighted = eligible.map((e) => ({
      event: e,
      weight: getRelationshipBoost(e, relationships || [], presentNpcIds || []),
    }));

    // Weighted random selection
    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    if (totalWeight === 0) return null;
    let roll = this.rng() * totalWeight;
    for (const w of weighted) {
      roll -= w.weight;
      if (roll <= 0) return w.event;
    }
    return weighted[weighted.length - 1].event;
  }
}
