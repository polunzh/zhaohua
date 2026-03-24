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

  it("allows move to any valid location (direct travel)", () => {
    const result = handleMove(db, "post-office");
    expect(result.ok).toBe(true);
    expect(getWorldState(db)!.location).toBe("post-office");
  });

  it("allows move to student home", () => {
    const result = handleMove(db, "home-zhang");
    expect(result.ok).toBe(true);
    expect(getWorldState(db)!.location).toBe("home-zhang");
  });

  it("rejects move to nonexistent location", () => {
    expect(() => handleMove(db, "nowhere")).toThrow();
  });
});
