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
  activeCharacter: string;
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
  active_character: string;
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
    activeCharacter: row.active_character,
  };
}

export function saveWorldState(db: Database.Database, state: WorldState): void {
  db.prepare(`
    INSERT INTO world_state (id, game_date, weather, season, last_visit, calendar_offset, random_seed, anchor_real_date, location, active_character)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      game_date = excluded.game_date,
      weather = excluded.weather,
      season = excluded.season,
      last_visit = excluded.last_visit,
      calendar_offset = excluded.calendar_offset,
      random_seed = excluded.random_seed,
      anchor_real_date = excluded.anchor_real_date,
      location = excluded.location,
      active_character = excluded.active_character
  `).run(
    state.gameDate,
    state.weather,
    state.season,
    state.lastVisit,
    state.calendarOffset,
    state.randomSeed,
    state.anchorRealDate,
    state.location,
    state.activeCharacter,
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

export function getAllNpcStates(db: Database.Database): NpcStateRow[] {
  const rows = db.prepare("SELECT * FROM npc_state").all() as NpcStateDbRow[];
  return rows.map((row) => ({
    npcId: row.npc_id,
    location: row.location,
    mood: row.mood,
    affinity: row.affinity,
  }));
}

export function updateNpcAffinity(db: Database.Database, npcId: string, delta: number): void {
  db.prepare("UPDATE npc_state SET affinity = affinity + ? WHERE npc_id = ?").run(delta, npcId);
}

export function updateNpcMood(db: Database.Database, npcId: string, mood: string): void {
  db.prepare("UPDATE npc_state SET mood = ? WHERE npc_id = ?").run(mood, npcId);
}

// --- Story Progress ---

export interface StoryProgressRow {
  storyId: string;
  currentStage: string;
  startedDate: string;
  data: string;
}

interface StoryProgressDbRow {
  story_id: string;
  current_stage: string;
  started_date: string;
  data: string;
}

export function getStoryProgress(db: Database.Database, storyId: string): StoryProgressRow | null {
  const row = db.prepare("SELECT * FROM story_progress WHERE story_id = ?").get(storyId) as
    | StoryProgressDbRow
    | undefined;
  if (!row) return null;
  return {
    storyId: row.story_id,
    currentStage: row.current_stage,
    startedDate: row.started_date,
    data: row.data,
  };
}

export function saveStoryProgress(
  db: Database.Database,
  progress: { storyId: string; currentStage: string; startedDate: string; data: string },
): void {
  db.prepare(`
    INSERT INTO story_progress (story_id, current_stage, started_date, data)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(story_id) DO UPDATE SET
      current_stage = excluded.current_stage,
      started_date = excluded.started_date,
      data = excluded.data
  `).run(progress.storyId, progress.currentStage, progress.startedDate, progress.data);
}

export function getAllActiveStories(db: Database.Database): StoryProgressRow[] {
  const rows = db.prepare("SELECT * FROM story_progress").all() as StoryProgressDbRow[];
  return rows.map((row) => ({
    storyId: row.story_id,
    currentStage: row.current_stage,
    startedDate: row.started_date,
    data: row.data,
  }));
}

export function getStoryEvent(db: Database.Database, storyId: string): EventLogEntry | null {
  const row = db
    .prepare(
      "SELECT * FROM event_log WHERE type = 'story' AND event_id LIKE ? ORDER BY id DESC LIMIT 1",
    )
    .get(`story-${storyId}-%`) as EventLogDbRow | undefined;
  if (!row) return null;
  return {
    eventId: row.event_id,
    gameDate: row.game_date,
    gameTime: row.game_time,
    type: row.type,
    involvedNpcs: row.involved_npcs,
    description: row.description,
  };
}

// --- Relationships ---

export interface RelationshipRow {
  npcA: string;
  npcB: string;
  type: string;
  strength: number;
}

interface RelationshipDbRow {
  npc_a: string;
  npc_b: string;
  type: string;
  strength: number;
}

export function getRelationship(
  db: Database.Database,
  npcA: string,
  npcB: string,
): { type: string; strength: number } | null {
  const row = db
    .prepare("SELECT type, strength FROM relationships WHERE npc_a = ? AND npc_b = ?")
    .get(npcA, npcB) as { type: string; strength: number } | undefined;
  return row ?? null;
}

export function saveRelationship(
  db: Database.Database,
  rel: { npcA: string; npcB: string; type: string; strength: number },
): void {
  db.prepare(`
    INSERT INTO relationships (npc_a, npc_b, type, strength)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(npc_a, npc_b) DO UPDATE SET
      type = excluded.type,
      strength = excluded.strength
  `).run(rel.npcA, rel.npcB, rel.type, rel.strength);
}

export function getRelationships(db: Database.Database, npcId: string): RelationshipRow[] {
  const rows = db
    .prepare("SELECT npc_a, npc_b, type, strength FROM relationships WHERE npc_a = ? OR npc_b = ?")
    .all(npcId, npcId) as RelationshipDbRow[];
  return rows.map((row) => ({
    npcA: row.npc_a,
    npcB: row.npc_b,
    type: row.type,
    strength: row.strength,
  }));
}

// --- Todos ---

export interface TodoRow {
  id: number;
  type: string;
  title: string;
  description: string;
  npcId: string | null;
  priority: string;
  status: string;
  createdDate: string;
  deadlineDate: string | null;
  location: string;
  actionType: string;
}

export interface TodoInput {
  type: string;
  title: string;
  description: string;
  npcId: string | null;
  priority: string;
  createdDate: string;
  deadlineDate: string | null;
  location: string;
  actionType: string;
}

interface TodoDbRow {
  id: number;
  type: string;
  title: string;
  description: string;
  npc_id: string | null;
  priority: string;
  status: string;
  created_date: string;
  deadline_date: string | null;
  completed_date: string | null;
  location: string;
  action_type: string;
  created_at: string;
}

function mapTodoRow(row: TodoDbRow): TodoRow {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    npcId: row.npc_id,
    priority: row.priority,
    status: row.status,
    createdDate: row.created_date,
    deadlineDate: row.deadline_date,
    location: row.location,
    actionType: row.action_type,
  };
}

export function addTodo(db: Database.Database, input: TodoInput): void {
  db.prepare(`
    INSERT INTO todos (type, title, description, npc_id, priority, created_date, deadline_date, location, action_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    input.type,
    input.title,
    input.description,
    input.npcId,
    input.priority,
    input.createdDate,
    input.deadlineDate,
    input.location,
    input.actionType,
  );
}

export function getMatchingTodo(
  db: Database.Database,
  location: string,
  actionType: string,
): TodoRow | null {
  const row = db
    .prepare(
      "SELECT * FROM todos WHERE status = 'pending' AND location = ? AND action_type = ? LIMIT 1",
    )
    .get(location, actionType) as any;
  return row ? mapTodoRow(row) : null;
}

export function getTodos(db: Database.Database): TodoRow[] {
  const rows = db.prepare("SELECT * FROM todos ORDER BY id DESC").all() as TodoDbRow[];
  return rows.map(mapTodoRow);
}

export function getPendingTodos(db: Database.Database): TodoRow[] {
  const rows = db
    .prepare("SELECT * FROM todos WHERE status = 'pending' ORDER BY id DESC")
    .all() as TodoDbRow[];
  return rows.map(mapTodoRow);
}

export function completeTodo(db: Database.Database, id: number): void {
  db.prepare("UPDATE todos SET status = 'done', completed_date = datetime('now') WHERE id = ?").run(
    id,
  );
}

export function expireTodos(db: Database.Database, currentDate: string): void {
  db.prepare(
    "UPDATE todos SET status = 'expired' WHERE status = 'pending' AND deadline_date < ?",
  ).run(currentDate);
}

// --- Mail ---

export interface MailRow {
  id: number;
  type: string;
  sender: string;
  recipientNpc: string;
  origin: string;
  destination: string;
  status: string;
  content: string | null;
  pickupDate: string | null;
  deliveryDate: string | null;
}

interface MailDbRow {
  id: number;
  type: string;
  sender: string;
  recipient_npc: string;
  origin: string;
  destination: string;
  status: string;
  content: string | null;
  pickup_date: string | null;
  delivery_date: string | null;
}

function toMailRow(row: MailDbRow): MailRow {
  return {
    id: row.id,
    type: row.type,
    sender: row.sender,
    recipientNpc: row.recipient_npc,
    origin: row.origin,
    destination: row.destination,
    status: row.status,
    content: row.content,
    pickupDate: row.pickup_date,
    deliveryDate: row.delivery_date,
  };
}

export function addMail(
  db: Database.Database,
  mail: {
    type: string;
    sender: string;
    recipientNpc: string;
    origin: string;
    destination: string;
    content?: string;
  },
): void {
  db.prepare(`
    INSERT INTO mail (type, sender, recipient_npc, origin, destination, content)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    mail.type,
    mail.sender,
    mail.recipientNpc,
    mail.origin,
    mail.destination,
    mail.content ?? null,
  );
}

export function getPendingMail(db: Database.Database): MailRow[] {
  const rows = db.prepare("SELECT * FROM mail WHERE status = 'pending'").all() as MailDbRow[];
  return rows.map(toMailRow);
}

export function getMailInTransit(db: Database.Database): MailRow[] {
  const rows = db.prepare("SELECT * FROM mail WHERE status = 'in-transit'").all() as MailDbRow[];
  return rows.map(toMailRow);
}

export function getRecentChoices(db: Database.Database, fromDate: string, toDate: string) {
  return db
    .prepare(
      "SELECT * FROM player_choices WHERE game_date >= ? AND game_date <= ? AND choice_type = 'npc-interaction' ORDER BY id",
    )
    .all(fromDate, toDate)
    .map((row: any) => ({
      id: row.id as number,
      gameDate: row.game_date as string,
      gameTime: row.game_time as string,
      choiceType: row.choice_type as string,
      choiceValue: row.choice_value as string,
      context: row.context as string | null,
    }));
}

export function updateMailStatus(
  db: Database.Database,
  mailId: number,
  status: string,
  date?: string,
): void {
  if (date) {
    db.prepare("UPDATE mail SET status = ?, delivery_date = ? WHERE id = ?").run(
      status,
      date,
      mailId,
    );
  } else {
    db.prepare("UPDATE mail SET status = ? WHERE id = ?").run(status, mailId);
  }
}
