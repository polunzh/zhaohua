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

// --- Daily Missions ---

export interface DailyMission {
  id: string;
  gameDate: string;
  title: string;
  description: string;
  targetLocation: string;
  targetAction: string | null;
  targetNpc: string | null;
  completionText: string;
  status: string;
}

interface DailyMissionDbRow {
  id: string;
  game_date: string;
  title: string;
  description: string;
  target_location: string;
  target_action: string | null;
  target_npc: string | null;
  completion_text: string;
  status: string;
}

export function getDailyMission(db: Database.Database, gameDate: string): DailyMission | null {
  const row = db.prepare("SELECT * FROM daily_missions WHERE game_date = ?").get(gameDate) as
    | DailyMissionDbRow
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    gameDate: row.game_date,
    title: row.title,
    description: row.description,
    targetLocation: row.target_location,
    targetAction: row.target_action,
    targetNpc: row.target_npc,
    completionText: row.completion_text,
    status: row.status,
  };
}

export function saveDailyMission(db: Database.Database, mission: DailyMission): void {
  db.prepare(
    `INSERT OR REPLACE INTO daily_missions (id, game_date, title, description, target_location, target_action, target_npc, completion_text, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    mission.id,
    mission.gameDate,
    mission.title,
    mission.description,
    mission.targetLocation,
    mission.targetAction,
    mission.targetNpc,
    mission.completionText,
    mission.status,
  );
}

export function completeDailyMission(
  db: Database.Database,
  missionId: string,
  completionText: string,
): void {
  db.prepare("UPDATE daily_missions SET status = 'done', completion_text = ? WHERE id = ?").run(
    completionText,
    missionId,
  );
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

export function getLastChoiceForNpc(
  db: Database.Database,
  npcId: string,
): { choiceValue: string; gameDate: string } | null {
  const row = db
    .prepare(
      "SELECT choice_value, game_date FROM player_choices WHERE context = ? AND choice_type = 'npc-interaction' ORDER BY id DESC LIMIT 1",
    )
    .get(npcId) as any;
  if (!row) return null;
  return { choiceValue: row.choice_value, gameDate: row.game_date };
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

// --- Player Stats ---

export interface PlayerStats {
  streakDays: number;
  longestStreak: number;
  totalDaysPlayed: number;
  lastPlayDate: string | null;
  missionsCompleted: number;
  npcsTalked: number;
  energyRemaining: number;
  lastEnergyDate: string | null;
}

interface PlayerStatsDbRow {
  streak_days: number;
  longest_streak: number;
  total_days_played: number;
  last_play_date: string | null;
  missions_completed: number;
  npcs_talked: number;
  energy_remaining: number;
  last_energy_date: string | null;
}

function ensurePlayerStats(db: Database.Database): void {
  db.prepare(
    "INSERT OR IGNORE INTO player_stats (id, streak_days, longest_streak, total_days_played, last_play_date, missions_completed, npcs_talked, energy_remaining, last_energy_date) VALUES (1, 0, 0, 0, NULL, 0, 0, 5, NULL)",
  ).run();
}

export function getPlayerStats(db: Database.Database): PlayerStats {
  ensurePlayerStats(db);
  const row = db.prepare("SELECT * FROM player_stats WHERE id = 1").get() as PlayerStatsDbRow;
  return {
    streakDays: row.streak_days,
    longestStreak: row.longest_streak,
    totalDaysPlayed: row.total_days_played,
    lastPlayDate: row.last_play_date,
    missionsCompleted: row.missions_completed,
    npcsTalked: row.npcs_talked,
    energyRemaining: row.energy_remaining,
    lastEnergyDate: row.last_energy_date,
  };
}

function addDaysToDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function updateStreak(db: Database.Database, gameDate: string): PlayerStats {
  ensurePlayerStats(db);
  const current = getPlayerStats(db);

  if (current.lastPlayDate === gameDate) {
    // Same day — no change
    return current;
  }

  let newStreak: number;
  if (current.lastPlayDate && addDaysToDate(current.lastPlayDate, 1) === gameDate) {
    // Consecutive day
    newStreak = current.streakDays + 1;
  } else {
    // First day or gap
    newStreak = 1;
  }

  const newLongest = Math.max(current.longestStreak, newStreak);
  const newTotal = current.totalDaysPlayed + 1;

  db.prepare(
    "UPDATE player_stats SET streak_days = ?, longest_streak = ?, total_days_played = ?, last_play_date = ? WHERE id = 1",
  ).run(newStreak, newLongest, newTotal, gameDate);

  return {
    streakDays: newStreak,
    longestStreak: newLongest,
    totalDaysPlayed: newTotal,
    lastPlayDate: gameDate,
    missionsCompleted: current.missionsCompleted,
    npcsTalked: current.npcsTalked,
    energyRemaining: current.energyRemaining,
    lastEnergyDate: current.lastEnergyDate,
  };
}

export function incrementStat(
  db: Database.Database,
  stat: "missions_completed" | "npcs_talked",
): void {
  ensurePlayerStats(db);
  db.prepare(`UPDATE player_stats SET ${stat} = ${stat} + 1 WHERE id = 1`).run();
}

// --- Gifts ---

export interface Gift {
  id: number;
  npcId: string;
  giftName: string;
  giftDescription: string;
  gameDate: string;
}

interface GiftDbRow {
  id: number;
  npc_id: string;
  gift_name: string;
  gift_description: string;
  game_date: string;
}

export function addGift(db: Database.Database, gift: Omit<Gift, "id">): void {
  db.prepare(`
    INSERT INTO gifts (npc_id, gift_name, gift_description, game_date)
    VALUES (?, ?, ?, ?)
  `).run(gift.npcId, gift.giftName, gift.giftDescription, gift.gameDate);
}

export function getGifts(db: Database.Database): Gift[] {
  const rows = db.prepare("SELECT * FROM gifts ORDER BY id DESC").all() as GiftDbRow[];
  return rows.map((row) => ({
    id: row.id,
    npcId: row.npc_id,
    giftName: row.gift_name,
    giftDescription: row.gift_description,
    gameDate: row.game_date,
  }));
}

export function getGiftCount(db: Database.Database): number {
  const row = db.prepare("SELECT COUNT(*) as count FROM gifts").get() as { count: number };
  return row.count;
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

// --- Energy System ---

const MAX_ENERGY = 5;

export function getEnergy(db: Database.Database): { remaining: number; max: number } {
  ensurePlayerStats(db);
  const row = db
    .prepare("SELECT energy_remaining, last_energy_date FROM player_stats WHERE id = 1")
    .get() as { energy_remaining: number; last_energy_date: string | null };
  return { remaining: row.energy_remaining, max: MAX_ENERGY };
}

export function useEnergy(db: Database.Database, gameDate: string): boolean {
  ensurePlayerStats(db);
  const row = db
    .prepare("SELECT energy_remaining, last_energy_date FROM player_stats WHERE id = 1")
    .get() as { energy_remaining: number; last_energy_date: string | null };

  let remaining = row.energy_remaining;

  // Reset energy on new day
  if (row.last_energy_date !== gameDate) {
    remaining = MAX_ENERGY;
  }

  if (remaining <= 0) {
    // Update the date even if empty, so we don't keep resetting
    db.prepare(
      "UPDATE player_stats SET energy_remaining = 0, last_energy_date = ? WHERE id = 1",
    ).run(gameDate);
    return false;
  }

  remaining -= 1;
  db.prepare("UPDATE player_stats SET energy_remaining = ?, last_energy_date = ? WHERE id = 1").run(
    remaining,
    gameDate,
  );
  return true;
}

// --- NPC Location Override ---

export interface NpcLocationOverride {
  locationOverride: string;
  overrideUntil: string;
}

export function getNpcLocationOverride(
  db: Database.Database,
  npcId: string,
): NpcLocationOverride | null {
  const row = db
    .prepare("SELECT location_override, override_until FROM npc_state WHERE npc_id = ?")
    .get(npcId) as { location_override: string | null; override_until: string | null } | undefined;
  if (!row || !row.location_override || !row.override_until) return null;
  return {
    locationOverride: row.location_override,
    overrideUntil: row.override_until,
  };
}

export function setNpcLocationOverride(
  db: Database.Database,
  npcId: string,
  locationOverride: string,
  overrideUntil: string,
): void {
  db.prepare("UPDATE npc_state SET location_override = ?, override_until = ? WHERE npc_id = ?").run(
    locationOverride,
    overrideUntil,
    npcId,
  );
}

// --- Items ---

export function addItem(
  db: Database.Database,
  itemType: string,
  quantity: number,
  date: string,
): void {
  db.prepare(`
    INSERT INTO items (item_type, quantity, obtained_date)
    VALUES (?, ?, ?)
    ON CONFLICT(item_type) DO UPDATE SET
      quantity = quantity + excluded.quantity,
      obtained_date = excluded.obtained_date
  `).run(itemType, quantity, date);
}

export function getItemCount(db: Database.Database, itemType: string): number {
  const row = db.prepare("SELECT quantity FROM items WHERE item_type = ?").get(itemType) as
    | { quantity: number }
    | undefined;
  return row?.quantity ?? 0;
}

export function useItem(db: Database.Database, itemType: string): boolean {
  const current = getItemCount(db, itemType);
  if (current <= 0) return false;
  db.prepare("UPDATE items SET quantity = quantity - 1 WHERE item_type = ?").run(itemType);
  return true;
}

export function getInventory(db: Database.Database): { itemType: string; quantity: number }[] {
  const rows = db.prepare("SELECT item_type, quantity FROM items").all() as {
    item_type: string;
    quantity: number;
  }[];
  return rows.map((r) => ({ itemType: r.item_type, quantity: r.quantity }));
}
