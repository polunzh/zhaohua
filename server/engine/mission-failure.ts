import type Database from "better-sqlite3";
import {
  getNpcState,
  saveNpcState,
  updateNpcAffinity,
  addEventLog,
  type DailyMission,
} from "../db/queries";
import { createLogger } from "../utils/logger";

const log = createLogger("engine:mission");

/**
 * Process penalties for a failed (not completed) mission.
 * Called during briefing when yesterday's mission was not done.
 */
export function processMissionFailure(
  db: Database.Database,
  mission: DailyMission,
  gameDate: string,
): void {
  if (mission.status === "done") return;

  if (mission.targetNpc) {
    // Ensure NPC state exists before penalizing
    const npcState = getNpcState(db, mission.targetNpc);
    if (!npcState) {
      saveNpcState(db, {
        npcId: mission.targetNpc,
        location: "classroom",
        mood: "neutral",
        affinity: 50,
      });
    }
    updateNpcAffinity(db, mission.targetNpc, -3);
  }

  log.info(`mission failed: ${mission.id}, penalty applied to ${mission.targetNpc || "none"}`);
  addEventLog(db, {
    eventId: "mission-failed-" + mission.id,
    gameDate,
    gameTime: "08:00",
    type: "consequence",
    involvedNpcs: mission.targetNpc || "",
    description: "昨天的任务没完成，心里有点不安。",
  });
}
