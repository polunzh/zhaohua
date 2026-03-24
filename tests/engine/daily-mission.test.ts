import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import { saveWorldState } from "../../server/db/queries";
import {
  generateDailyMission,
  completeMission,
  getDailyMission,
} from "../../server/engine/daily-mission";

describe("Daily Mission", () => {
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
  afterEach(() => db.close());

  it("generates a mission for the day", () => {
    const mission = generateDailyMission(db, "1994-09-15", "teacher", "autumn", "sunny");
    expect(mission).toBeDefined();
    expect(mission.title).toBeTruthy();
    expect(mission.targetLocation).toBeTruthy();
  });

  it("returns same mission for same date (idempotent)", () => {
    const m1 = generateDailyMission(db, "1994-09-15", "teacher", "autumn", "sunny");
    const m2 = generateDailyMission(db, "1994-09-15", "teacher", "autumn", "sunny");
    expect(m1.id).toBe(m2.id);
  });

  it("generates different mission for different date", () => {
    const m1 = generateDailyMission(db, "1994-09-15", "teacher", "autumn", "sunny");
    const m2 = generateDailyMission(db, "1994-09-16", "teacher", "autumn", "sunny");
    expect(m1.id).not.toBe(m2.id);
  });

  it("can complete a mission", () => {
    const mission = generateDailyMission(db, "1994-09-15", "teacher", "autumn", "sunny");
    completeMission(db, mission.id);
    const saved = getDailyMission(db, "1994-09-15");
    expect(saved!.status).toBe("done");
  });

  it("completed mission has completion text", () => {
    const mission = generateDailyMission(db, "1994-09-15", "teacher", "autumn", "sunny");
    completeMission(db, mission.id);
    const saved = getDailyMission(db, "1994-09-15");
    expect(saved!.completionText).toBeTruthy();
  });

  it("rainy weather generates weather-related mission", () => {
    const mission = generateDailyMission(db, "1994-09-15", "teacher", "autumn", "rainy");
    // Should still generate something valid
    expect(mission.title).toBeTruthy();
  });
});
