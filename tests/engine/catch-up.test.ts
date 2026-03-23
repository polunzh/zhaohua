import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import { saveWorldState, getWorldState } from "../../server/db/queries";
import { performCatchUp } from "../../server/engine/catch-up";
import { tick } from "../../server/engine/tick";

describe("tick", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
  });
  afterEach(() => db.close());

  it("advances world state by one 15-min step", () => {
    saveWorldState(db, {
      gameDate: "1994-09-15",
      weather: "sunny",
      season: "autumn",
      lastVisit: "2026-03-23T08:00:00Z",
      calendarOffset: 0,
      randomSeed: 42,
      anchorRealDate: "2026-03-23T00:00:00Z",
      location: "classroom",
    });
    const result = tick(
      db,
      { hour: 9, minute: 0, date: "1994-09-15", season: "autumn", period: "morning" },
      42,
    );
    expect(result.event).toBeDefined();
  });
});

describe("performCatchUp", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
    saveWorldState(db, {
      gameDate: "1994-09-15",
      weather: "sunny",
      season: "autumn",
      lastVisit: "2026-03-23T08:00:00Z",
      calendarOffset: 0,
      randomSeed: 42,
      anchorRealDate: "2026-03-23T00:00:00Z",
      location: "classroom",
    });
  });
  afterEach(() => db.close());

  it("processes correct number of ticks for short absence", () => {
    const result = performCatchUp(db, new Date("2026-03-23T09:00:00Z"));
    expect(result.ticksProcessed).toBe(4);
    expect(result.events.length).toBeLessThanOrEqual(4);
  });

  it("uses coarse mode for long absence", () => {
    saveWorldState(db, {
      gameDate: "1994-09-15",
      weather: "sunny",
      season: "autumn",
      lastVisit: "2026-03-01T08:00:00Z",
      calendarOffset: 0,
      randomSeed: 42,
      anchorRealDate: "2026-03-23T00:00:00Z",
      location: "classroom",
    });
    const result = performCatchUp(db, new Date("2026-03-23T08:00:00Z"));
    expect(result.coarseMode).toBe(true);
    expect(result.ticksProcessed).toBe(22);
  });

  it("caps summary at 20 events", () => {
    saveWorldState(db, {
      gameDate: "1994-09-15",
      weather: "sunny",
      season: "autumn",
      lastVisit: "2026-03-01T08:00:00Z",
      calendarOffset: 0,
      randomSeed: 42,
      anchorRealDate: "2026-03-23T00:00:00Z",
      location: "classroom",
    });
    const result = performCatchUp(db, new Date("2026-03-23T08:00:00Z"));
    expect(result.summary.length).toBeLessThanOrEqual(20);
  });
});
