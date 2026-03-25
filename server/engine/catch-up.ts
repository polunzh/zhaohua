import type Database from "better-sqlite3";
import { TimeEngine } from "../../src/engine/time";
import { getWorldState, saveWorldState } from "../db/queries";
import { tick } from "./tick";
import type { EventTemplate } from "../../src/data/event-pool";
import { createLogger } from "../utils/logger";

const log = createLogger("engine:catch-up");

const GAME_START_DATE = "1994-09-01";
const TICK_MINUTES = 15;

interface CatchUpResult {
  ticksProcessed: number;
  coarseMode: boolean;
  events: EventTemplate[];
  summary: EventTemplate[];
}

export function performCatchUp(
  db: Database.Database,
  now: Date,
  character?: string,
): CatchUpResult {
  const worldState = getWorldState(db);
  if (!worldState) {
    throw new Error("No world state found");
  }

  const lastVisit = new Date(worldState.lastVisit);
  const anchorRealDate = worldState.anchorRealDate ?? now.toISOString();

  const timeEngine = new TimeEngine({
    gameStartDate: GAME_START_DATE,
    calendarOffset: worldState.calendarOffset,
    anchorRealDate,
  });

  const tickCount = timeEngine.getTickCount(lastVisit, now);
  const coarseMode = timeEngine.isCoarseMode(lastVisit, now);

  const events: EventTemplate[] = [];
  let latestWeather = worldState.weather ?? "sunny";

  // Run everything in a transaction for atomicity
  const runCatchUp = db.transaction(() => {
    for (let i = 0; i < tickCount; i++) {
      // Simulate a point in time for this tick
      let simulatedTime: Date;
      if (coarseMode) {
        // One tick per day
        simulatedTime = new Date(lastVisit.getTime() + (i + 1) * 86_400_000);
      } else {
        // One tick per 15 minutes
        simulatedTime = new Date(lastVisit.getTime() + (i + 1) * TICK_MINUTES * 60_000);
      }

      const gameTime = timeEngine.getGameTime(simulatedTime);
      const seed = worldState.randomSeed + i;
      const result = tick(db, gameTime, seed, character);
      latestWeather = result.weather;

      if (result.event) {
        events.push(result.event);
      }
    }

    // Update world state
    const finalGameTime = timeEngine.getGameTime(now);
    saveWorldState(db, {
      ...worldState,
      gameDate: finalGameTime.date,
      season: finalGameTime.season,
      weather: latestWeather,
      lastVisit: now.toISOString(),
      anchorRealDate: anchorRealDate,
    });
  });

  runCatchUp();

  const summary = events.slice(-20);

  log.info(
    `catch-up: ${tickCount} ticks processed, coarse=${coarseMode}, ${events.length} events generated`,
  );

  return {
    ticksProcessed: tickCount,
    coarseMode,
    events,
    summary,
  };
}
