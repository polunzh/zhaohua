import { getDb } from "../../db/connection";
import { handleSwitch } from "../../handlers/switch.post";

export default eventHandler(async (event) => {
  const body = await readBody(event);
  const db = getDb();
  return handleSwitch(db, body.character);
});
