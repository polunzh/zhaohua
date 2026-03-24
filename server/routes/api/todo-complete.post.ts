import { getDb } from "../../db/connection";
import { handleTodoComplete } from "../../handlers/todo-complete.post";

export default eventHandler(async (event) => {
  const body = await readBody(event);
  const db = getDb();
  return handleTodoComplete(db, body.todoId);
});
