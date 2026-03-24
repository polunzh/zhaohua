import type Database from "better-sqlite3";
import { getWorldState, getPendingTodos, getRecentEvents, expireTodos } from "../db/queries";
import { generateTodos } from "../engine/todos";
import { processConsequences } from "../engine/consequences";
import { performCatchUp } from "../engine/catch-up";
import { generateDailyMission } from "../engine/daily-mission";

function getSeason(dateStr: string): string {
  const month = parseInt(dateStr.slice(5, 7), 10);
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

export function handleGetBriefing(db: Database.Database) {
  const worldState = getWorldState(db);
  if (!worldState) {
    return { offlineHours: 0, offlineText: "欢迎", events: [], todos: [], consequences: [] };
  }

  const now = new Date();
  const lastVisit = new Date(worldState.lastVisit);
  const offlineMs = now.getTime() - lastVisit.getTime();
  const offlineHours = Math.round((offlineMs / 3600000) * 10) / 10;

  // Human-readable offline text
  let offlineText: string;
  if (offlineHours < 1) offlineText = `你离开了 ${Math.round(offlineMs / 60000)} 分钟`;
  else if (offlineHours < 24) offlineText = `你离开了 ${Math.round(offlineHours)} 小时`;
  else offlineText = `你离开了 ${Math.round(offlineHours / 24)} 天`;

  // Perform catch-up (processes world state)
  performCatchUp(db, now);

  // Expire overdue todos
  expireTodos(db, worldState.gameDate);

  // Generate new todos based on offline duration
  generateTodos(db, worldState.gameDate, worldState.activeCharacter, offlineHours);

  // Process consequences from past choices
  const consequences = processConsequences(db, worldState.gameDate);

  // Get current state after catch-up
  const worldStateAfter = getWorldState(db)!;
  const todos = getPendingTodos(db);
  const events = getRecentEvents(db, 10);

  // Generate daily mission
  const season = getSeason(worldStateAfter.gameDate);
  const mission = generateDailyMission(
    db,
    worldStateAfter.gameDate,
    worldStateAfter.activeCharacter,
    season,
    worldStateAfter.weather,
  );

  return {
    offlineHours,
    offlineText,
    events: events.map((e) => ({ id: e.eventId, description: e.description, type: e.type })),
    todos: todos.map((t) => ({
      id: t.id,
      type: t.type,
      title: t.title,
      description: t.description,
      priority: t.priority,
    })),
    consequences: consequences.map((c) => ({
      type: c.type,
      npcId: c.npcId,
      description: c.description,
    })),
    mission: mission
      ? {
          id: mission.id,
          title: mission.title,
          description: mission.description,
          targetLocation: mission.targetLocation,
          targetNpc: mission.targetNpc,
          targetAction: mission.targetAction,
          status: mission.status,
          completionText: mission.completionText,
        }
      : null,
  };
}
