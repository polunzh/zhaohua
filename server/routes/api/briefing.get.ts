import { getDb } from "../../db/connection";
import { handleGetBriefing } from "../../handlers/briefing.get";

export default eventHandler(() => {
  const db = getDb();
  return handleGetBriefing(db);
});
