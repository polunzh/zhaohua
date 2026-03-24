import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import {
  addTodo,
  getTodos,
  completeTodo,
  expireTodos,
  getPendingTodos,
} from "../../server/db/queries";

describe("Todos", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
  });
  afterEach(() => db.close());

  it("adds and retrieves a todo", () => {
    addTodo(db, {
      type: "grade-homework",
      title: "批改作业",
      description: "今天的语文作业需要批改",
      npcId: null,
      priority: "normal",
      createdDate: "1994-09-15",
      deadlineDate: "1994-09-16",
    });
    const todos = getTodos(db);
    expect(todos).toHaveLength(1);
    expect(todos[0].title).toBe("批改作业");
    expect(todos[0].status).toBe("pending");
  });

  it("gets only pending todos", () => {
    addTodo(db, {
      type: "grade-homework",
      title: "批改作业",
      description: "",
      npcId: null,
      priority: "normal",
      createdDate: "1994-09-15",
      deadlineDate: "1994-09-16",
    });
    addTodo(db, {
      type: "prep-class",
      title: "备课",
      description: "",
      npcId: null,
      priority: "normal",
      createdDate: "1994-09-15",
      deadlineDate: "1994-09-16",
    });
    const pending = getPendingTodos(db);
    expect(pending).toHaveLength(2);
  });

  it("completes a todo", () => {
    addTodo(db, {
      type: "grade-homework",
      title: "批改作业",
      description: "",
      npcId: null,
      priority: "normal",
      createdDate: "1994-09-15",
      deadlineDate: "1994-09-16",
    });
    const todos = getTodos(db);
    completeTodo(db, todos[0].id);
    const after = getPendingTodos(db);
    expect(after).toHaveLength(0);
  });

  it("expires overdue todos", () => {
    addTodo(db, {
      type: "grade-homework",
      title: "过期任务",
      description: "",
      npcId: null,
      priority: "normal",
      createdDate: "1994-09-10",
      deadlineDate: "1994-09-12",
    });
    expireTodos(db, "1994-09-15");
    const todos = getTodos(db);
    expect(todos[0].status).toBe("expired");
  });

  it("expired todos not in pending", () => {
    addTodo(db, {
      type: "grade-homework",
      title: "过期",
      description: "",
      npcId: null,
      priority: "normal",
      createdDate: "1994-09-10",
      deadlineDate: "1994-09-12",
    });
    expireTodos(db, "1994-09-15");
    expect(getPendingTodos(db)).toHaveLength(0);
  });
});
