import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import { getPlayerStats, updateStreak, incrementStat } from "../../server/db/queries";

describe("Player Stats", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
  });
  afterEach(() => db.close());

  it("initializes with zero stats", () => {
    const stats = getPlayerStats(db);
    expect(stats.streakDays).toBe(0);
    expect(stats.totalDaysPlayed).toBe(0);
  });

  it("first day starts streak at 1", () => {
    const stats = updateStreak(db, "1994-09-01");
    expect(stats.streakDays).toBe(1);
    expect(stats.totalDaysPlayed).toBe(1);
  });

  it("consecutive days increase streak", () => {
    updateStreak(db, "1994-09-01");
    const stats = updateStreak(db, "1994-09-02");
    expect(stats.streakDays).toBe(2);
  });

  it("same day does not increase streak", () => {
    updateStreak(db, "1994-09-01");
    const stats = updateStreak(db, "1994-09-01");
    expect(stats.streakDays).toBe(1);
    expect(stats.totalDaysPlayed).toBe(1);
  });

  it("gap resets streak to 1", () => {
    updateStreak(db, "1994-09-01");
    updateStreak(db, "1994-09-02");
    const stats = updateStreak(db, "1994-09-05"); // 3 day gap
    expect(stats.streakDays).toBe(1);
  });

  it("tracks longest streak", () => {
    updateStreak(db, "1994-09-01");
    updateStreak(db, "1994-09-02");
    updateStreak(db, "1994-09-03");
    // Reset
    updateStreak(db, "1994-09-10");
    const stats = getPlayerStats(db);
    expect(stats.longestStreak).toBe(3);
  });

  it("increments individual stats", () => {
    updateStreak(db, "1994-09-01");
    incrementStat(db, "missions_completed");
    incrementStat(db, "missions_completed");
    incrementStat(db, "npcs_talked");
    const stats = getPlayerStats(db);
    expect(stats.missionsCompleted).toBe(2);
    expect(stats.npcsTalked).toBe(1);
  });
});
