import type Database from "better-sqlite3";
import { getWorldState, saveWorldState, getNpcState } from "../db/queries";
import { TimeEngine } from "../../src/engine/time";
import { performCatchUp } from "../engine/catch-up";
import { getScheduleEntry } from "../../src/engine/schedule";
import { npcs } from "../../src/data/npcs";

const GAME_START_DATE = "1994-09-01";

export function handleGetWorld(db: Database.Database) {
  const now = new Date();

  // Initialize world state if first launch
  let worldState = getWorldState(db);
  if (!worldState) {
    saveWorldState(db, {
      gameDate: GAME_START_DATE,
      weather: "sunny",
      season: "autumn",
      lastVisit: now.toISOString(),
      calendarOffset: 0,
      randomSeed: 42,
      anchorRealDate: now.toISOString(),
      location: "classroom",
    });
  }

  const catchUpResult = performCatchUp(db, now);
  worldState = getWorldState(db)!;

  const timeEngine = new TimeEngine({
    calendarOffset: worldState.calendarOffset,
    gameStartDate: GAME_START_DATE,
    anchorRealDate: worldState.anchorRealDate!,
  });
  const gameTime = timeEngine.getGameTime(now);
  const dayOfWeek = new Date(gameTime.date).getDay();
  const dayType = dayOfWeek === 0 || dayOfWeek === 6 ? ("weekend" as const) : ("weekday" as const);

  const npcStates = npcs.map((npc) => {
    const schedule = getScheduleEntry(
      npc,
      gameTime.hour,
      gameTime.minute,
      dayType,
      gameTime.season,
    );
    const dbState = getNpcState(db, npc.id);
    return {
      ...npc,
      ...schedule,
      mood: dbState?.mood ?? "neutral",
      affinity: dbState?.affinity ?? 50,
    };
  });

  return {
    gameTime,
    weather: worldState.weather,
    location: worldState.location,
    npcs: npcStates,
    events: catchUpResult.summary,
    coarseMode: catchUpResult.coarseMode,
  };
}
