import { getDb } from "../../db/connection";
import { getEnergy } from "../../db/queries";

export default eventHandler(() => {
  const db = getDb();
  return getEnergy(db);
});
