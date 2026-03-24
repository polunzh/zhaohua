import type Database from "better-sqlite3";
import { completeMission } from "../engine/daily-mission";

export function handleMissionComplete(db: Database.Database, missionId: string) {
  completeMission(db, missionId);
  return { ok: true };
}
