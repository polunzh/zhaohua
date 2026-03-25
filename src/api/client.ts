import { logger } from "../utils/logger";

const BASE_URL = "/api";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const start = performance.now();
  const method = options?.method || "GET";

  const res = await fetch(url, options);
  const elapsed = Math.round(performance.now() - start);

  if (!res.ok) {
    const text = await res.text();
    logger.error(`${method} ${url} → ${res.status} (${elapsed}ms)`, text);
    throw new Error(`API error ${res.status}: ${text}`);
  }

  logger.debug(`${method} ${url} → ${res.status} (${elapsed}ms)`);
  return res.json();
}

function post<T>(url: string, body: unknown): Promise<T> {
  return request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function fetchWorldState() {
  return request(`${BASE_URL}/world`);
}

export function skipTime(type: "day" | "week" | "semester") {
  return post(`${BASE_URL}/skip`, { type });
}

export function generateDialogue(params: {
  npcName: string;
  npcId?: string;
  npcPersonality: string;
  situation: string;
  season: string;
  gameDate: string;
  weather?: string;
  mood?: string;
  affinity?: number;
  recentEvent?: string;
  mission?: string;
}) {
  return post(`${BASE_URL}/dialogue`, params);
}

export function moveToLocation(targetLocationId: string) {
  return post(`${BASE_URL}/move`, { targetLocationId });
}

export function submitChoice(params: {
  npcId: string;
  choiceId: string;
  gameDate: string;
  gameTime: string;
  npcRole?: string;
  location?: string;
}) {
  return post(`${BASE_URL}/choice`, params);
}

export function switchCharacter(character: "teacher" | "postman") {
  return post(`${BASE_URL}/switch`, { character });
}

export function fetchBriefing() {
  return request(`${BASE_URL}/briefing`);
}

export function completeTodo(todoId: number) {
  return post(`${BASE_URL}/todo-complete`, { todoId });
}

export function completeMission(missionId: string) {
  return post(`${BASE_URL}/mission-complete`, { missionId });
}

export function fetchEnergy(): Promise<{ remaining: number; max: number }> {
  return request(`${BASE_URL}/energy`);
}

export function resolveConflict(conflictId: string, choiceId: string, gameDate: string) {
  return post(`${BASE_URL}/conflict-resolve`, { conflictId, choiceId, gameDate });
}
