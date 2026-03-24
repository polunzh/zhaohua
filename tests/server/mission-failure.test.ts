import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import { saveNpcState, getNpcState, saveDailyMission } from "../../server/db/queries";
import { processMissionFailure } from "../../server/engine/mission-failure";

describe("Mission failure consequences", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
  });

  afterEach(() => db.close());

  it("penalizes NPC affinity when yesterday mission not completed", () => {
    saveDailyMission(db, {
      id: "mission-1994-09-15",
      gameDate: "1994-09-15",
      title: "找张志强谈谈",
      description: "去教室找张志强聊聊",
      targetLocation: "classroom",
      targetAction: null,
      targetNpc: "student-zhang-wei",
      completionText: "",
      status: "active",
    });

    saveNpcState(db, {
      npcId: "student-zhang-wei",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });

    processMissionFailure(
      db,
      {
        id: "mission-1994-09-15",
        gameDate: "1994-09-15",
        title: "找张志强谈谈",
        description: "去教室找张志强聊聊",
        targetLocation: "classroom",
        targetAction: null,
        targetNpc: "student-zhang-wei",
        completionText: "",
        status: "active",
      },
      "1994-09-16",
    );

    const state = getNpcState(db, "student-zhang-wei");
    expect(state!.affinity).toBe(47); // -3 penalty
  });

  it("does NOT penalize when yesterday mission was completed", () => {
    saveNpcState(db, {
      npcId: "student-zhang-wei",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });

    processMissionFailure(
      db,
      {
        id: "mission-1994-09-15",
        gameDate: "1994-09-15",
        title: "找张志强谈谈",
        description: "去教室找张志强聊聊",
        targetLocation: "classroom",
        targetAction: null,
        targetNpc: "student-zhang-wei",
        completionText: "聊得不错。",
        status: "done",
      },
      "1994-09-16",
    );

    const state = getNpcState(db, "student-zhang-wei");
    expect(state!.affinity).toBe(50); // no change
  });

  it("logs a failure event when mission not completed", () => {
    processMissionFailure(
      db,
      {
        id: "mission-1994-09-15",
        gameDate: "1994-09-15",
        title: "去操场看看",
        description: "去操场",
        targetLocation: "playground",
        targetAction: null,
        targetNpc: null,
        completionText: "",
        status: "active",
      },
      "1994-09-16",
    );

    const events = db
      .prepare(
        "SELECT * FROM event_log WHERE type = 'consequence' AND event_id LIKE 'mission-failed-%'",
      )
      .all() as any[];
    expect(events.length).toBe(1);
    expect(events[0].description).toContain("没完成");
  });
});
