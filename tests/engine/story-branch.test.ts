import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import {
  saveWorldState,
  getStoryProgress,
  saveNpcState,
  savePlayerChoice,
} from "../../server/db/queries";
import { processStories } from "../../server/engine/story";

describe("Story Branch — choice-count condition", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
    saveWorldState(db, {
      gameDate: "1994-09-20",
      weather: "sunny",
      season: "autumn",
      lastVisit: new Date().toISOString(),
      calendarOffset: 0,
      randomSeed: 42,
      anchorRealDate: new Date().toISOString(),
      location: "classroom",
      activeCharacter: "teacher",
    });
    // Ensure NPC state exists
    saveNpcState(db, {
      npcId: "student-zhu-peng",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });
  });
  afterEach(() => db.close());

  it("takes stage-3a when player encouraged Zhu Peng at least 3 times", () => {
    // Start story
    processStories(db, "1994-09-20", "09:00");
    expect(getStoryProgress(db, "love-learning")!.currentStage).toBe("stage-1");

    // Advance to stage-2
    processStories(db, "1994-09-28", "09:00");
    expect(getStoryProgress(db, "love-learning")!.currentStage).toBe("stage-2");

    // Save 3 encourage choices for student-zhu-peng
    for (let i = 0; i < 3; i++) {
      savePlayerChoice(db, {
        gameDate: `1994-09-2${i}`,
        gameTime: "10:00",
        choiceType: "npc-interaction",
        choiceValue: "encourage",
        context: "student-zhu-peng",
      });
    }

    // Advance from stage-2 (7+ days later)
    processStories(db, "1994-10-12", "09:00");
    const progress = getStoryProgress(db, "love-learning");
    expect(progress!.currentStage).toBe("stage-3a");
  });

  it("takes stage-3b when player encouraged fewer than 3 times", () => {
    processStories(db, "1994-09-20", "09:00");
    processStories(db, "1994-09-28", "09:00");

    // Only 1 encourage
    savePlayerChoice(db, {
      gameDate: "1994-09-25",
      gameTime: "10:00",
      choiceType: "npc-interaction",
      choiceValue: "encourage",
      context: "student-zhu-peng",
    });

    processStories(db, "1994-10-12", "09:00");
    const progress = getStoryProgress(db, "love-learning");
    expect(progress!.currentStage).toBe("stage-3b");
  });

  it("takes stage-3b when player never encouraged", () => {
    processStories(db, "1994-09-20", "09:00");
    processStories(db, "1994-09-28", "09:00");

    processStories(db, "1994-10-12", "09:00");
    const progress = getStoryProgress(db, "love-learning");
    expect(progress!.currentStage).toBe("stage-3b");
  });
});
