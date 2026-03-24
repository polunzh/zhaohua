import { getDb } from "../../db/connection";
import { handleConflictResolve } from "../../handlers/conflict-resolve.post";

export default eventHandler(async (event) => {
  const body = await readBody(event);
  const db = getDb();
  return handleConflictResolve(db, body);
});
