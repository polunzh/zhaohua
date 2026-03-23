import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import { saveWorldState, getWorldState } from "../../server/db/queries";
import { handleMove } from "../../server/handlers/move.post";

describe("handleMove", () => {
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
      location: "classroom",
      activeCharacter: "teacher",
    });
  });

  afterEach(() => {
    db.close();
  });

  it("moves to connected location", () => {
    const result = handleMove(db, "playground");
    expect(result.ok).toBe(true);
    expect(result.location).toBe("playground");
    expect(getWorldState(db)!.location).toBe("playground");
  });

  it("rejects move to unconnected location", () => {
    expect(() => handleMove(db, "post-office")).toThrow();
  });

  it("allows chained moves through connected locations", () => {
    handleMove(db, "playground");
    handleMove(db, "village-road");
    expect(getWorldState(db)!.location).toBe("village-road");
  });

  it("rejects move to nonexistent location", () => {
    expect(() => handleMove(db, "nowhere")).toThrow();
  });
});
