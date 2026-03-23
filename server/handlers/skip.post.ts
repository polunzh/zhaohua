import type Database from "better-sqlite3";
import { getWorldState, saveWorldState } from "../db/queries";

export function handleSkip(db: Database.Database, type: "day" | "week" | "semester") {
  const worldState = getWorldState(db);
  if (!worldState) throw new Error("No world state");

  const skipDays = type === "day" ? 1 : type === "week" ? 7 : 120;
  const now = new Date();
  saveWorldState(db, {
    ...worldState,
    calendarOffset: worldState.calendarOffset + skipDays,
    lastVisit: now.toISOString(),
    anchorRealDate: now.toISOString(),
  });
  return { ok: true, skippedDays: skipDays };
}
