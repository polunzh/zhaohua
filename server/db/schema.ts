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
      location TEXT NOT NULL DEFAULT 'classroom',
      active_character TEXT NOT NULL DEFAULT 'teacher'
    );
    CREATE TABLE IF NOT EXISTS npc_state (
      npc_id TEXT PRIMARY KEY,
      location TEXT NOT NULL DEFAULT 'home',
      mood TEXT NOT NULL DEFAULT 'neutral',
      affinity INTEGER NOT NULL DEFAULT 50,
      location_override TEXT,
      override_until TEXT
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
    CREATE TABLE IF NOT EXISTS relationships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      npc_a TEXT NOT NULL,
      npc_b TEXT NOT NULL,
      type TEXT NOT NULL,
      strength INTEGER NOT NULL DEFAULT 50,
      UNIQUE(npc_a, npc_b)
    );
    CREATE TABLE IF NOT EXISTS story_progress (
      story_id TEXT PRIMARY KEY,
      current_stage TEXT NOT NULL,
      started_date TEXT NOT NULL,
      data TEXT DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      npc_id TEXT,
      priority TEXT NOT NULL DEFAULT 'normal',
      status TEXT NOT NULL DEFAULT 'pending',
      created_date TEXT NOT NULL,
      deadline_date TEXT,
      completed_date TEXT,
      location TEXT DEFAULT '',
      action_type TEXT DEFAULT 'auto',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS daily_missions (
      id TEXT PRIMARY KEY,
      game_date TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      target_location TEXT NOT NULL,
      target_action TEXT,
      target_npc TEXT,
      completion_text TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS player_stats (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      streak_days INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      total_days_played INTEGER NOT NULL DEFAULT 0,
      last_play_date TEXT,
      missions_completed INTEGER NOT NULL DEFAULT 0,
      npcs_talked INTEGER NOT NULL DEFAULT 0,
      energy_remaining INTEGER NOT NULL DEFAULT 5,
      last_energy_date TEXT
    );
    CREATE TABLE IF NOT EXISTS gifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      npc_id TEXT NOT NULL,
      gift_name TEXT NOT NULL,
      gift_description TEXT NOT NULL,
      game_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS mail (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      sender TEXT NOT NULL,
      recipient_npc TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      content TEXT,
      pickup_date TEXT,
      delivery_date TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}
