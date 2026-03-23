import type Database from "better-sqlite3";
import { EventEngine } from "../../src/engine/events";
import { determineWeather } from "../../src/engine/weather";
import { calculateMoodShift } from "../../src/engine/mood";
import { getTriggeredEventIds, addEventLog, getAllNpcStates, saveNpcState } from "../db/queries";
import { processStories } from "./story";
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

export function tick(
  db: Database.Database,
  gameTime: GameTimeInput,
  seed: number,
  character?: string,
): TickResult {
  const weather = determineWeather(gameTime.season, seed);
  const triggeredIds = getTriggeredEventIds(db);
  const engine = new EventEngine(seed);
  const event = engine.selectEvent(gameTime as any, triggeredIds, weather, undefined, character);

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

  // Apply mood shifts to all NPCs based on weather and time period
  const allNpcs = getAllNpcStates(db);
  for (const npc of allNpcs) {
    const newMood = calculateMoodShift({
      weather,
      period: gameTime.period,
      currentMood: npc.mood,
    });
    if (newMood !== npc.mood) {
      saveNpcState(db, { ...npc, mood: newMood });
    }
  }

  // Process long-form story arcs
  const timeStr = `${String(gameTime.hour).padStart(2, "0")}:${String(gameTime.minute).padStart(2, "0")}`;
  processStories(db, gameTime.date, timeStr);

  return { event, weather };
}
