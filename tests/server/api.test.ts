import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import { saveWorldState } from "../../server/db/queries";
import { handleGetWorld } from "../../server/handlers/world.get";

describe("GET /api/world handler", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
    saveWorldState(db, {
      gameDate: "1994-09-15",
      weather: "sunny",
      season: "autumn",
      lastVisit: new Date().toISOString(),
      calendarOffset: 0,
      randomSeed: 42,
      anchorRealDate: new Date().toISOString(),
    });
  });

  afterEach(() => db.close());

  it("returns world state with current scene", () => {
    const result = handleGetWorld(db);
    expect(result.gameTime).toBeDefined();
    expect(result.npcs).toBeDefined();
    expect(result.events).toBeDefined();
  });
});
