import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import {
  saveWorldState,
  addEventLog,
  savePlayerChoice,
  saveDailyMission,
} from "../../server/db/queries";
import { generateWeeklySummary } from "../../server/engine/weekly-summary";

describe("Weekly Summary — R11", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
    saveWorldState(db, {
      gameDate: "1994-09-08",
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

  it("returns null on non-summary day (day 1)", () => {
    // Sep 2 is day 1 — not a 7-day boundary
    const result = generateWeeklySummary(db, "1994-09-02");
    expect(result).toBeNull();
  });

  it("returns null on day 0 (game start)", () => {
    const result = generateWeeklySummary(db, "1994-09-01");
    expect(result).toBeNull();
  });

  it("returns summary on day 7", () => {
    // Sep 8 is day 7 from Sep 1
    const result = generateWeeklySummary(db, "1994-09-08");
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
  });

  it("returns summary on day 14", () => {
    const result = generateWeeklySummary(db, "1994-09-15");
    expect(result).not.toBeNull();
  });

  it("summary counts events from the past week", () => {
    // Add some events in the past week
    addEventLog(db, {
      eventId: "e1",
      gameDate: "1994-09-05",
      gameTime: "09:00",
      type: "daily",
      involvedNpcs: "",
      description: "event 1",
    });
    addEventLog(db, {
      eventId: "e2",
      gameDate: "1994-09-06",
      gameTime: "10:00",
      type: "daily",
      involvedNpcs: "",
      description: "event 2",
    });
    const result = generateWeeklySummary(db, "1994-09-08");
    expect(result).not.toBeNull();
    expect(result).toContain("2");
  });

  it("summary counts choices from the past week", () => {
    savePlayerChoice(db, {
      gameDate: "1994-09-04",
      gameTime: "09:00",
      choiceType: "npc-interaction",
      choiceValue: "encourage",
      context: "student-zhang-wei",
    });
    savePlayerChoice(db, {
      gameDate: "1994-09-06",
      gameTime: "10:00",
      choiceType: "npc-interaction",
      choiceValue: "chat",
      context: "student-wang-fang",
    });
    const result = generateWeeklySummary(db, "1994-09-08");
    expect(result).not.toBeNull();
    expect(result).toContain("2");
  });

  it("summary counts completed missions", () => {
    saveDailyMission(db, {
      id: "1994-09-05-visit",
      gameDate: "1994-09-05",
      title: "test",
      description: "test",
      targetLocation: "classroom",
      targetAction: null,
      targetNpc: null,
      completionText: "done",
      status: "done",
    });
    const result = generateWeeklySummary(db, "1994-09-08");
    expect(result).not.toBeNull();
    expect(result).toContain("1");
  });

  it("does not count events outside the week", () => {
    addEventLog(db, {
      eventId: "old",
      gameDate: "1994-08-25",
      gameTime: "09:00",
      type: "daily",
      involvedNpcs: "",
      description: "old event",
    });
    const result = generateWeeklySummary(db, "1994-09-08");
    expect(result).not.toBeNull();
    // Should show 0 events
    expect(result).toContain("0件事");
  });
});
