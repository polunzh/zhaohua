import type Database from "better-sqlite3";
import { getWorldState, saveWorldState } from "../db/queries";

export function handleSwitch(db: Database.Database, character: "teacher" | "postman") {
  const worldState = getWorldState(db);
  if (!worldState) throw new Error("No world state");

  // Set default location for the character
  const defaultLocations = { teacher: "classroom", postman: "post-office" };

  saveWorldState(db, {
    ...worldState,
    activeCharacter: character,
    location: defaultLocations[character],
  });
  return { ok: true, character, location: defaultLocations[character] };
}
