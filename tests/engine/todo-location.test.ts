import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import { addTodo, getPendingTodos, getMatchingTodo } from "../../server/db/queries";

describe("Todo Location Matching", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
  });
  afterEach(() => db.close());

  it("getMatchingTodo finds todo matching location and action", () => {
    addTodo(db, {
      type: "grade-homework",
      title: "批改作业",
      description: "",
      npcId: null,
      priority: "normal",
      createdDate: "1994-09-15",
      deadlineDate: "1994-09-16",
      location: "office",
      actionType: "click-object",
    });
    const todo = getMatchingTodo(db, "office", "click-object");
    expect(todo).toBeDefined();
    expect(todo!.type).toBe("grade-homework");
  });

  it("getMatchingTodo returns null for wrong location", () => {
    addTodo(db, {
      type: "grade-homework",
      title: "批改作业",
      description: "",
      npcId: null,
      priority: "normal",
      createdDate: "1994-09-15",
      deadlineDate: "1994-09-16",
      location: "office",
      actionType: "click-object",
    });
    expect(getMatchingTodo(db, "classroom", "click-object")).toBeNull();
  });

  it("getMatchingTodo returns null for wrong action", () => {
    addTodo(db, {
      type: "grade-homework",
      title: "批改作业",
      description: "",
      npcId: null,
      priority: "normal",
      createdDate: "1994-09-15",
      deadlineDate: "1994-09-16",
      location: "office",
      actionType: "click-object",
    });
    expect(getMatchingTodo(db, "office", "click-npc")).toBeNull();
  });

  it("todos show location in data", () => {
    addTodo(db, {
      type: "grade-homework",
      title: "批改作业",
      description: "",
      npcId: null,
      priority: "normal",
      createdDate: "1994-09-15",
      deadlineDate: "1994-09-16",
      location: "office",
      actionType: "click-object",
    });
    const todos = getPendingTodos(db);
    expect(todos[0].location).toBe("office");
    expect(todos[0].actionType).toBe("click-object");
  });
});
