import { getDb } from "../../db/connection";
import { handleSkip } from "../../handlers/skip.post";

export default eventHandler(async (event) => {
  const body = await readBody(event);
  const db = getDb();
  return handleSkip(db, body.type);
});
