import { getDb } from "../../db/connection";
import { handleChoice } from "../../handlers/choice.post";

export default eventHandler(async (event) => {
  const body = await readBody(event);
  const db = getDb();
  return handleChoice(db, body);
});
