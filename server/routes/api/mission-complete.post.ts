import { getDb } from "../../db/connection";
import { handleMissionComplete } from "../../handlers/mission-complete.post";

export default eventHandler(async (event) => {
  const body = await readBody(event);
  const db = getDb();
  return handleMissionComplete(db, body.missionId);
});
