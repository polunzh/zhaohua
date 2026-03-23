import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import {
  saveWorldState,
  getStoryProgress,
  saveNpcState,
  getRecentEvents,
} from "../../server/db/queries";
import { processStories } from "../../server/engine/story";

describe("Story System", () => {
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
  });
  afterEach(() => db.close());

  it("starts a story when conditions are met", () => {
    processStories(db, "1994-09-20", "09:00");
    const progress = getStoryProgress(db, "love-learning");
    expect(progress).toBeDefined();
    expect(progress!.currentStage).toBe("stage-1");
  });

  it("does not start story before afterGameDate", () => {
    processStories(db, "1994-09-10", "09:00");
    expect(getStoryProgress(db, "love-learning")).toBeNull();
  });

  it("advances story after enough days", () => {
    processStories(db, "1994-09-20", "09:00");
    // Advance 7+ days later
    processStories(db, "1994-09-28", "09:00");
    const progress = getStoryProgress(db, "love-learning");
    expect(progress!.currentStage).toBe("stage-2");
  });

  it("takes branch when affinity condition met", () => {
    processStories(db, "1994-09-20", "09:00");
    processStories(db, "1994-09-28", "09:00"); // advance to stage-2
    // Set high affinity for tiezhu
    saveNpcState(db, {
      npcId: "student-tiezhu",
      location: "classroom",
      mood: "neutral",
      affinity: 70,
    });
    processStories(db, "1994-10-12", "09:00"); // advance from stage-2
    const progress = getStoryProgress(db, "love-learning");
    expect(progress!.currentStage).toBe("stage-3a"); // took the branch
  });

  it("logs story events", () => {
    processStories(db, "1994-09-20", "09:00");
    const events = getRecentEvents(db, 10);
    const storyEvents = events.filter((e) => e.type === "story");
    expect(storyEvents.length).toBeGreaterThan(0);
  });
});
