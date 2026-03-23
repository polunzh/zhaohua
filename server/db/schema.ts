import type Database from "better-sqlite3";

export function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS world_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      game_date TEXT NOT NULL,
      weather TEXT NOT NULL DEFAULT 'sunny',
      season TEXT NOT NULL DEFAULT 'autumn',
      last_visit TEXT NOT NULL,
      calendar_offset INTEGER NOT NULL DEFAULT 0,
      random_seed INTEGER NOT NULL DEFAULT 42,
      anchor_real_date TEXT,
      location TEXT NOT NULL DEFAULT 'classroom'
    );
    CREATE TABLE IF NOT EXISTS npc_state (
      npc_id TEXT PRIMARY KEY,
      location TEXT NOT NULL DEFAULT 'home',
      mood TEXT NOT NULL DEFAULT 'neutral',
      affinity INTEGER NOT NULL DEFAULT 50
    );
    CREATE TABLE IF NOT EXISTS event_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL,
      game_date TEXT NOT NULL,
      game_time TEXT NOT NULL,
      type TEXT NOT NULL,
      involved_npcs TEXT,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS player_choices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_date TEXT NOT NULL,
      game_time TEXT NOT NULL,
      choice_type TEXT NOT NULL,
      choice_value TEXT NOT NULL,
      context TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
