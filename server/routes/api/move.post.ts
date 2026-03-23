import { getDb } from "../../db/connection";
import { handleMove } from "../../handlers/move.post";

export default eventHandler(async (event) => {
  const body = await readBody(event);
  const db = getDb();
  return handleMove(db, body.targetLocationId);
});
