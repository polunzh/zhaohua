import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import {
  getWorldState,
  saveWorldState,
  getNpcState,
  saveNpcState,
  addEventLog,
  getRecentEvents,
} from "../../server/db/queries";

describe("Database", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
  });

  afterEach(() => {
    db.close();
  });

  it("initializes schema without error", () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as {
      name: string;
    }[];
    const names = tables.map((t) => t.name);
    expect(names).toContain("world_state");
    expect(names).toContain("npc_state");
    expect(names).toContain("event_log");
    expect(names).toContain("player_choices");
  });

  it("saves and reads world state", () => {
    saveWorldState(db, {
      gameDate: "1994-09-15",
      weather: "sunny",
      season: "autumn",
      lastVisit: "2026-03-23T08:00:00Z",
      calendarOffset: 0,
      randomSeed: 42,
      anchorRealDate: "2026-03-23T00:00:00Z",
      location: "classroom",
      activeCharacter: "teacher",
    });
    const state = getWorldState(db);
    expect(state).toBeDefined();
    expect(state!.gameDate).toBe("1994-09-15");
    expect(state!.weather).toBe("sunny");
    expect(state!.calendarOffset).toBe(0);
    expect(state!.anchorRealDate).toBe("2026-03-23T00:00:00Z");
  });

  it("saves and reads NPC state", () => {
    saveNpcState(db, {
      npcId: "student-zhang-wei",
      location: "classroom",
      mood: "happy",
      affinity: 50,
    });
    const state = getNpcState(db, "student-zhang-wei");
    expect(state!.mood).toBe("happy");
    expect(state!.affinity).toBe(50);
  });

  it("logs events and retrieves recent ones", () => {
    addEventLog(db, {
      eventId: "student-late",
      gameDate: "1994-09-15",
      gameTime: "08:15",
      type: "daily",
      involvedNpcs: "student-zhang-wei",
      description: "张伟迟到了",
    });
    addEventLog(db, {
      eventId: "homework-missing",
      gameDate: "1994-09-15",
      gameTime: "09:00",
      type: "daily",
      involvedNpcs: "student-wang-fang",
      description: "王芳没交作业",
    });
    const recent = getRecentEvents(db, 20);
    expect(recent).toHaveLength(2);
    expect(recent[0].eventId).toBe("homework-missing");
  });
});
