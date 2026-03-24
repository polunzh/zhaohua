import type Database from "better-sqlite3";
import { getWorldState, saveWorldState } from "../db/queries";
import { getLocation } from "../../src/data/locations";

export function handleMove(db: Database.Database, targetLocationId: string) {
  const worldState = getWorldState(db);
  if (!worldState) throw new Error("No world state");

  // Validate target location exists
  const targetLoc = getLocation(targetLocationId);
  if (!targetLoc) throw new Error(`Unknown location: ${targetLocationId}`);

  saveWorldState(db, { ...worldState, location: targetLocationId });
  return { ok: true, location: targetLocationId };
}
