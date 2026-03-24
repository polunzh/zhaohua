import type Database from "better-sqlite3";

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function generateWeeklySummary(db: Database.Database, gameDate: string): string | null {
  const startDate = "1994-09-01";
  const dayNum = Math.floor(
    (new Date(gameDate + "T00:00:00").getTime() - new Date(startDate + "T00:00:00").getTime()) /
      86400000,
  );
  if (dayNum % 7 !== 0 || dayNum === 0) return null;

  const weekAgo = addDays(gameDate, -7);

  const events = db
    .prepare("SELECT COUNT(*) as cnt FROM event_log WHERE game_date >= ?")
    .get(weekAgo) as any;
  const choices = db
    .prepare("SELECT COUNT(*) as cnt FROM player_choices WHERE game_date >= ?")
    .get(weekAgo) as any;
  const missions = db
    .prepare("SELECT COUNT(*) as cnt FROM daily_missions WHERE game_date >= ? AND status = 'done'")
    .get(weekAgo) as any;

  const eventCount = events?.cnt || 0;
  const choiceCount = choices?.cnt || 0;
  const missionCount = missions?.cnt || 0;

  return `这周发生了${eventCount}件事，和${choiceCount}个人聊了天，完成了${missionCount}个任务。`;
}
