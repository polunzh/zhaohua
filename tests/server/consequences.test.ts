import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import {
  saveNpcState,
  getNpcState,
  savePlayerChoice,
  getNpcLocationOverride,
} from "../../server/db/queries";
import { processConsequences } from "../../server/engine/consequences";

describe("Consequence chain — visible consequences", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
  });

  afterEach(() => db.close());

  it("negative consequence on student sets location override (skip school)", () => {
    // Setup: student exists
    saveNpcState(db, {
      npcId: "student-zhang-wei",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });

    // A criticism choice 5 days ago
    savePlayerChoice(db, {
      gameDate: "1994-09-10",
      gameTime: "10:00",
      choiceType: "npc-interaction",
      choiceValue: "criticize",
      context: "student-zhang-wei",
    });

    const results = processConsequences(db, "1994-09-15");
    expect(results.length).toBeGreaterThan(0);

    const neg = results.find((r) => r.type === "negative" && r.npcId === "student-zhang-wei");
    expect(neg).toBeDefined();

    // Student should have a location override (skipping school)
    const override = getNpcLocationOverride(db, "student-zhang-wei");
    expect(override).not.toBeNull();
    expect(override!.locationOverride).toMatch(/^home-/);
  });

  it("positive consequence on student adds progress event", () => {
    saveNpcState(db, {
      npcId: "student-wang-fang",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });

    savePlayerChoice(db, {
      gameDate: "1994-09-10",
      gameTime: "10:00",
      choiceType: "npc-interaction",
      choiceValue: "encourage",
      context: "student-wang-fang",
    });

    const results = processConsequences(db, "1994-09-15");
    const pos = results.find((r) => r.type === "positive" && r.npcId === "student-wang-fang");
    expect(pos).toBeDefined();

    // Check event log has a progress event
    const events = db.prepare("SELECT * FROM event_log WHERE type = 'consequence'").all() as any[];
    const progressEvent = events.find(
      (e: any) => e.involved_npcs === "student-wang-fang" && e.description?.includes("进步"),
    );
    expect(progressEvent).toBeDefined();
  });
});
