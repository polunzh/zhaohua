import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import {
  saveWorldState,
  addTodo,
  addEventLog,
  savePlayerChoice,
  saveNpcState,
} from "../../server/db/queries";
import { handleGetBriefing } from "../../server/handlers/briefing.get";

describe("Briefing API", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
    saveWorldState(db, {
      gameDate: "1994-09-15",
      weather: "sunny",
      season: "autumn",
      lastVisit: new Date(Date.now() - 3 * 3600000).toISOString(), // 3 hours ago
      calendarOffset: 0,
      randomSeed: 42,
      anchorRealDate: new Date().toISOString(),
      location: "classroom",
      activeCharacter: "teacher",
    });
  });
  afterEach(() => db.close());

  it("returns briefing with offline duration", () => {
    const briefing = handleGetBriefing(db);
    expect(briefing.offlineHours).toBeGreaterThan(0);
    expect(briefing.offlineText).toBeDefined();
  });

  it("includes pending todos", () => {
    addTodo(db, {
      type: "grade-homework",
      title: "批改作业",
      description: "",
      npcId: null,
      priority: "normal",
      createdDate: "1994-09-15",
      deadlineDate: "1994-09-16",
    });
    const briefing = handleGetBriefing(db);
    expect(briefing.todos.length).toBeGreaterThanOrEqual(1);
  });

  it("includes recent events", () => {
    addEventLog(db, {
      eventId: "test-1",
      gameDate: "1994-09-15",
      gameTime: "09:00",
      type: "daily",
      involvedNpcs: "",
      description: "测试事件",
    });
    const briefing = handleGetBriefing(db);
    expect(briefing.events.length).toBeGreaterThan(0);
  });

  it("includes consequences", () => {
    saveNpcState(db, {
      npcId: "student-tiezhu",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });
    savePlayerChoice(db, {
      gameDate: "1994-09-10",
      gameTime: "09:00",
      choiceType: "npc-interaction",
      choiceValue: "encourage",
      context: "student-tiezhu",
    });
    const briefing = handleGetBriefing(db);
    expect(briefing.consequences).toBeDefined();
  });

  it("generates todos based on offline duration", () => {
    const briefing = handleGetBriefing(db);
    // 3 hours offline → should generate 1-2 todos
    expect(briefing.todos.length).toBeGreaterThanOrEqual(1);
  });
});
