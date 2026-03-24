import type Database from "better-sqlite3";
import { completeTodo } from "../db/queries";

export function handleTodoComplete(db: Database.Database, todoId: number) {
  completeTodo(db, todoId);
  return { ok: true };
}
