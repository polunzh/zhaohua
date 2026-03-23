import type Database from "better-sqlite3";
import { EventEngine } from "../../src/engine/events";
import { determineWeather } from "../../src/engine/weather";
import { getTriggeredEventIds, addEventLog } from "../db/queries";
import type { EventTemplate } from "../../src/data/event-pool";

interface GameTimeInput {
  date: string;
  hour: number;
  minute: number;
  season: string;
  period: string;
}

interface TickResult {
  event: EventTemplate | null;
  weather: string;
}

export function tick(db: Database.Database, gameTime: GameTimeInput, seed: number): TickResult {
  const weather = determineWeather(gameTime.season, seed);
  const triggeredIds = getTriggeredEventIds(db);
  const engine = new EventEngine(seed);
  const event = engine.selectEvent(gameTime as any, triggeredIds, weather);

  if (event) {
    addEventLog(db, {
      eventId: event.id,
      gameDate: gameTime.date,
      gameTime: `${String(gameTime.hour).padStart(2, "0")}:${String(gameTime.minute).padStart(2, "0")}`,
      type: event.type,
      involvedNpcs: "",
      description: event.description,
    });
  }

  return { event, weather };
}
