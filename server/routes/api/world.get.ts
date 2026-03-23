import { getDb } from "../../db/connection";
import { handleGetWorld } from "../../handlers/world.get";

export default eventHandler(() => {
  const db = getDb();
  return handleGetWorld(db);
});
