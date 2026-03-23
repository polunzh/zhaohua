import type Database from "better-sqlite3";

export interface WorldState {
  gameDate: string;
  weather: string;
  season: string;
  lastVisit: string;
  calendarOffset: number;
  randomSeed: number;
  anchorRealDate: string | null;
  location: string;
}

export interface NpcStateRow {
  npcId: string;
  location: string;
  mood: string;
  affinity: number;
}

export interface EventLogEntry {
  eventId: string;
  gameDate: string;
  gameTime: string;
  type: string;
  involvedNpcs: string | null;
  description: string | null;
}

interface WorldStateRow {
  game_date: string;
  weather: string;
  season: string;
  last_visit: string;
  calendar_offset: number;
  random_seed: number;
  anchor_real_date: string | null;
  location: string;
}

interface NpcStateDbRow {
  npc_id: string;
  location: string;
  mood: string;
  affinity: number;
}

interface EventLogDbRow {
  id: number;
  event_id: string;
  game_date: string;
  game_time: string;
  type: string;
  involved_npcs: string | null;
  description: string | null;
  created_at: string;
}

export function getWorldState(db: Database.Database): WorldState | undefined {
  const row = db.prepare("SELECT * FROM world_state WHERE id = 1").get() as
    | WorldStateRow
    | undefined;
  if (!row) return undefined;
  return {
    gameDate: row.game_date,
    weather: row.weather,
    season: row.season,
    lastVisit: row.last_visit,
    calendarOffset: row.calendar_offset,
    randomSeed: row.random_seed,
    anchorRealDate: row.anchor_real_date,
    location: row.location,
  };
}

export function saveWorldState(db: Database.Database, state: WorldState): void {
  db.prepare(`
    INSERT INTO world_state (id, game_date, weather, season, last_visit, calendar_offset, random_seed, anchor_real_date, location)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      game_date = excluded.game_date,
      weather = excluded.weather,
      season = excluded.season,
      last_visit = excluded.last_visit,
      calendar_offset = excluded.calendar_offset,
      random_seed = excluded.random_seed,
      anchor_real_date = excluded.anchor_real_date,
      location = excluded.location
  `).run(
    state.gameDate,
    state.weather,
    state.season,
    state.lastVisit,
    state.calendarOffset,
    state.randomSeed,
    state.anchorRealDate,
    state.location,
  );
}

export function getNpcState(db: Database.Database, npcId: string): NpcStateRow | undefined {
  const row = db.prepare("SELECT * FROM npc_state WHERE npc_id = ?").get(npcId) as
    | NpcStateDbRow
    | undefined;
  if (!row) return undefined;
  return {
    npcId: row.npc_id,
    location: row.location,
    mood: row.mood,
    affinity: row.affinity,
  };
}

export function saveNpcState(db: Database.Database, state: NpcStateRow): void {
  db.prepare(`
    INSERT INTO npc_state (npc_id, location, mood, affinity)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(npc_id) DO UPDATE SET
      location = excluded.location,
      mood = excluded.mood,
      affinity = excluded.affinity
  `).run(state.npcId, state.location, state.mood, state.affinity);
}

export function addEventLog(db: Database.Database, entry: EventLogEntry): void {
  db.prepare(`
    INSERT INTO event_log (event_id, game_date, game_time, type, involved_npcs, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    entry.eventId,
    entry.gameDate,
    entry.gameTime,
    entry.type,
    entry.involvedNpcs,
    entry.description,
  );
}

export function getRecentEvents(db: Database.Database, limit: number): EventLogEntry[] {
  const rows = db
    .prepare("SELECT * FROM event_log ORDER BY id DESC LIMIT ?")
    .all(limit) as EventLogDbRow[];
  return rows.map((row) => ({
    eventId: row.event_id,
    gameDate: row.game_date,
    gameTime: row.game_time,
    type: row.type,
    involvedNpcs: row.involved_npcs,
    description: row.description,
  }));
}

export function getTriggeredEventIds(db: Database.Database): string[] {
  const rows = db.prepare("SELECT DISTINCT event_id FROM event_log").all() as {
    event_id: string;
  }[];
  return rows.map((row) => row.event_id);
}

export interface PlayerChoiceEntry {
  gameDate: string;
  gameTime: string;
  choiceType: string;
  choiceValue: string;
  context?: string;
}

export function savePlayerChoice(db: Database.Database, entry: PlayerChoiceEntry): void {
  db.prepare(`
    INSERT INTO player_choices (game_date, game_time, choice_type, choice_value, context)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    entry.gameDate,
    entry.gameTime,
    entry.choiceType,
    entry.choiceValue,
    entry.context ?? null,
  );
}

export function updateNpcAffinity(db: Database.Database, npcId: string, delta: number): void {
  db.prepare("UPDATE npc_state SET affinity = affinity + ? WHERE npc_id = ?").run(delta, npcId);
}

export function updateNpcMood(db: Database.Database, npcId: string, mood: string): void {
  db.prepare("UPDATE npc_state SET mood = ? WHERE npc_id = ?").run(mood, npcId);
}
