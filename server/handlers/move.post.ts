import type Database from "better-sqlite3";
import { getWorldState, saveWorldState } from "../db/queries";
import { getLocation } from "../../src/data/locations";

export function handleMove(db: Database.Database, targetLocationId: string) {
  const worldState = getWorldState(db);
  if (!worldState) throw new Error("No world state");

  const currentLoc = getLocation(worldState.location || "classroom");
  if (!currentLoc) throw new Error("Invalid current location");

  if (!currentLoc.connections.includes(targetLocationId)) {
    throw new Error(`Cannot move from ${currentLoc.id} to ${targetLocationId}`);
  }

  saveWorldState(db, { ...worldState, location: targetLocationId });
  return { ok: true, location: targetLocationId };
}
