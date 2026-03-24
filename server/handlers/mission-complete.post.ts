import type Database from "better-sqlite3";
import { completeMission } from "../engine/daily-mission";
import { incrementStat } from "../db/queries";

export function handleMissionComplete(db: Database.Database, missionId: string) {
  completeMission(db, missionId);
  incrementStat(db, "missions_completed");
  return { ok: true };
}
