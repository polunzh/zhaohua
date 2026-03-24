import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import { saveWorldState, getPendingTodos } from "../../server/db/queries";
import { generateTodos } from "../../server/engine/todos";

describe("Todo Generator", () => {
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
  });
  afterEach(() => db.close());

  it("generates 1-2 todos for short offline (1-3 hours)", () => {
    generateTodos(db, "1994-09-15", "teacher", 2); // 2 hours
    const todos = getPendingTodos(db);
    expect(todos.length).toBeGreaterThanOrEqual(1);
    expect(todos.length).toBeLessThanOrEqual(2);
  });

  it("generates 2-4 todos for medium offline (3-12 hours)", () => {
    generateTodos(db, "1994-09-15", "teacher", 6);
    const todos = getPendingTodos(db);
    expect(todos.length).toBeGreaterThanOrEqual(2);
    expect(todos.length).toBeLessThanOrEqual(4);
  });

  it("generates 4-6 todos for long offline (12-48 hours)", () => {
    generateTodos(db, "1994-09-15", "teacher", 24);
    const todos = getPendingTodos(db);
    expect(todos.length).toBeGreaterThanOrEqual(4);
    expect(todos.length).toBeLessThanOrEqual(6);
  });

  it("caps at 8 todos for very long offline", () => {
    generateTodos(db, "1994-09-15", "teacher", 72);
    const todos = getPendingTodos(db);
    expect(todos.length).toBeLessThanOrEqual(8);
  });

  it("generates teacher-specific todos", () => {
    generateTodos(db, "1994-09-15", "teacher", 6);
    const todos = getPendingTodos(db);
    const types = todos.map((t) => t.type);
    const teacherTypes = [
      "grade-homework",
      "prep-class",
      "student-issue",
      "parent-meeting",
      "write-comments",
    ];
    expect(types.every((t) => teacherTypes.includes(t))).toBe(true);
  });

  it("generates postman-specific todos", () => {
    generateTodos(db, "1994-09-15", "postman", 6);
    const todos = getPendingTodos(db);
    const types = todos.map((t) => t.type);
    const postmanTypes = ["deliver-mail", "deliver-newspaper", "problem-mail"];
    expect(types.every((t) => postmanTypes.includes(t))).toBe(true);
  });

  it("does not duplicate existing pending todos of same type", () => {
    generateTodos(db, "1994-09-15", "teacher", 6);
    const count1 = getPendingTodos(db).length;
    generateTodos(db, "1994-09-15", "teacher", 6);
    const count2 = getPendingTodos(db).length;
    // Should not double up — skips types already pending
    expect(count2).toBeLessThanOrEqual(count1 + 2);
  });
});
