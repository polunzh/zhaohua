import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import {
  saveWorldState,
  savePlayerChoice,
  saveNpcState,
  getNpcState,
  getRecentEvents,
} from "../../server/db/queries";
import { processConsequences } from "../../server/engine/consequences";

describe("Consequences", () => {
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
    saveNpcState(db, {
      npcId: "student-tiezhu",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });
  });
  afterEach(() => db.close());

  it("generates positive consequence after encouraging NPC", () => {
    savePlayerChoice(db, {
      gameDate: "1994-09-10",
      gameTime: "09:00",
      choiceType: "npc-interaction",
      choiceValue: "encourage",
      context: "student-tiezhu",
    });
    const results = processConsequences(db, "1994-09-15");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).toBe("positive");
    expect(results[0].npcId).toBe("student-tiezhu");
  });

  it("generates negative consequence after criticizing NPC", () => {
    savePlayerChoice(db, {
      gameDate: "1994-09-10",
      gameTime: "09:00",
      choiceType: "npc-interaction",
      choiceValue: "criticize",
      context: "student-tiezhu",
    });
    const results = processConsequences(db, "1994-09-15");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].type).toBe("negative");
  });

  it("does not trigger before 3 days", () => {
    savePlayerChoice(db, {
      gameDate: "1994-09-14",
      gameTime: "09:00",
      choiceType: "npc-interaction",
      choiceValue: "encourage",
      context: "student-tiezhu",
    });
    const results = processConsequences(db, "1994-09-15"); // only 1 day later
    expect(results).toHaveLength(0);
  });

  it("does not trigger after 7 days", () => {
    savePlayerChoice(db, {
      gameDate: "1994-09-01",
      gameTime: "09:00",
      choiceType: "npc-interaction",
      choiceValue: "encourage",
      context: "student-tiezhu",
    });
    const results = processConsequences(db, "1994-09-15"); // 14 days later
    expect(results).toHaveLength(0);
  });

  it("updates NPC affinity on positive consequence", () => {
    savePlayerChoice(db, {
      gameDate: "1994-09-10",
      gameTime: "09:00",
      choiceType: "npc-interaction",
      choiceValue: "encourage",
      context: "student-tiezhu",
    });
    processConsequences(db, "1994-09-15");
    const state = getNpcState(db, "student-tiezhu");
    expect(state!.affinity).toBeGreaterThan(50);
  });

  it("logs consequence as event", () => {
    savePlayerChoice(db, {
      gameDate: "1994-09-10",
      gameTime: "09:00",
      choiceType: "npc-interaction",
      choiceValue: "encourage",
      context: "student-tiezhu",
    });
    processConsequences(db, "1994-09-15");
    const events = getRecentEvents(db, 10);
    const conseq = events.filter((e) => e.type === "consequence");
    expect(conseq.length).toBeGreaterThan(0);
  });

  it("does not re-process same choice", () => {
    savePlayerChoice(db, {
      gameDate: "1994-09-10",
      gameTime: "09:00",
      choiceType: "npc-interaction",
      choiceValue: "encourage",
      context: "student-tiezhu",
    });
    processConsequences(db, "1994-09-15");
    const results2 = processConsequences(db, "1994-09-16");
    // Should not generate again for the same choice
    expect(results2).toHaveLength(0);
  });
});
