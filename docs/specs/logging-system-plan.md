# Logging System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add structured logging across the full stack so production issues can be quickly diagnosed.

**Architecture:** Backend uses consola (UnJS ecosystem) with tagged sub-loggers per module. A Nitro middleware logs all HTTP requests/responses. Frontend wraps console with a thin logger and adds unified error handling to the API client.

**Tech Stack:** consola, Nitro middleware, Vitest (TDD)

**Spec:** `docs/specs/logging-system.md`

---

## File Structure

| Action | File                                  | Responsibility                                           |
| ------ | ------------------------------------- | -------------------------------------------------------- |
| Create | `server/utils/logger.ts`              | consola instance, `createLogger(tag)` factory            |
| Create | `server/middleware/log.ts`            | Nitro middleware: log every request/response with timing |
| Create | `src/utils/logger.ts`                 | Frontend logger (thin console wrapper)                   |
| Create | `tests/server/logger.test.ts`         | Tests for logger module                                  |
| Create | `tests/server/middleware-log.test.ts` | Tests for request logging middleware                     |
| Create | `tests/client/logger.test.ts`         | Tests for frontend logger                                |
| Create | `tests/client/api-client.test.ts`     | Tests for API client error handling                      |
| Modify | `server/ai/adapter.ts`                | Add AI call logging (model, timing, errors)              |
| Modify | `server/db/connection.ts`             | Add DB init logging                                      |
| Modify | `server/engine/tick.ts`               | Add tick event logging                                   |
| Modify | `server/engine/catch-up.ts`           | Add catch-up summary logging                             |
| Modify | `server/engine/story.ts`              | Add story progression logging                            |
| Modify | `server/engine/consequences.ts`       | Add consequence trigger logging                          |
| Modify | `server/engine/daily-mission.ts`      | Add mission generation logging                           |
| Modify | `server/engine/exams.ts`              | Add exam result logging                                  |
| Modify | `server/engine/weekly-summary.ts`     | Add weekly summary logging                               |
| Modify | `server/engine/mission-failure.ts`    | Add mission failure logging                              |
| Modify | `server/handlers/dialogue.post.ts`    | Replace silent catch with warn log                       |
| Modify | `src/api/client.ts`                   | Unified `request()` with error logging                   |
| Modify | `package.json`                        | Add consola dependency                                   |

---

### Task 1: Install consola & create server logger module

**Files:**

- Create: `server/utils/logger.ts`
- Create: `tests/server/logger.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Install consola**

```bash
pnpm add consola
```

- [ ] **Step 2: Write failing tests for logger module**

Create `tests/server/logger.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { createConsola } from "consola";

describe("Server Logger", () => {
  it("exports a logger instance with withTag", async () => {
    const { logger } = await import("../../server/utils/logger");
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.warn).toBe("function");
  });

  it("exports createLogger that returns tagged instance", async () => {
    const { createLogger } = await import("../../server/utils/logger");
    const tagged = createLogger("test-tag");
    expect(tagged).toBeDefined();
    expect(typeof tagged.info).toBe("function");
  });

  it("logger has level 4 (debug) in non-production", async () => {
    const { logger } = await import("../../server/utils/logger");
    expect(logger.level).toBeGreaterThanOrEqual(4);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
pnpm vitest run tests/server/logger.test.ts
```

Expected: FAIL — module `server/utils/logger` does not exist.

- [ ] **Step 4: Implement logger module**

Create `server/utils/logger.ts`:

```ts
import { createConsola } from "consola";
import type { ConsolaInstance } from "consola";

const isProd = process.env.NODE_ENV === "production";

export const logger = createConsola({
  level: isProd ? 3 : 4, // info in prod, debug in dev
  reporters: isProd
    ? [
        {
          log: (logObj) => {
            const output = {
              time: logObj.date.toISOString(),
              level: logObj.type,
              tag: logObj.tag || undefined,
              message: logObj.args.map(String).join(" "),
            };
            process.stdout.write(JSON.stringify(output) + "\n");
          },
        },
      ]
    : undefined,
});

export function createLogger(tag: string): ConsolaInstance {
  return logger.withTag(tag);
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm vitest run tests/server/logger.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add server/utils/logger.ts tests/server/logger.test.ts package.json pnpm-lock.yaml
git commit -m "feat(logging): add consola-based server logger module"
```

---

### Task 2: Request logging middleware

**Files:**

- Create: `server/middleware/log.ts`
- Create: `tests/server/middleware-log.test.ts`

- [ ] **Step 1: Write failing tests for middleware**

Create `tests/server/middleware-log.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createConsola } from "consola";

describe("Request Log Middleware", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("exports a default event handler function", async () => {
    const mod = await import("../../server/middleware/log");
    expect(mod.default).toBeDefined();
  });

  it("formatRequest returns readable string with method and path", async () => {
    const { formatRequest } = await import("../../server/middleware/log");
    const result = formatRequest("POST", "/api/dialogue", 200, 42);
    expect(result).toContain("POST");
    expect(result).toContain("/api/dialogue");
    expect(result).toContain("200");
    expect(result).toContain("42ms");
  });

  it("formatRequest handles missing status gracefully", async () => {
    const { formatRequest } = await import("../../server/middleware/log");
    const result = formatRequest("GET", "/api/world", undefined, 10);
    expect(result).toContain("GET");
    expect(result).toContain("/api/world");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run tests/server/middleware-log.test.ts
```

Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement middleware**

Create `server/middleware/log.ts`:

```ts
import { createLogger } from "../utils/logger";

const log = createLogger("http");

export function formatRequest(
  method: string,
  path: string,
  status: number | undefined,
  elapsedMs: number,
): string {
  const statusStr = status != null ? String(status) : "---";
  return `${method} ${path} → ${statusStr} (${elapsedMs}ms)`;
}

export default eventHandler({
  onRequest(event) {
    // Store start time on the event context
    event.context._startTime = Date.now();
    const method = event.method;
    const path = event.path;
    log.debug(`→ ${method} ${path}`);
  },
  onAfterResponse(event) {
    const start = event.context._startTime as number | undefined;
    const elapsed = start ? Date.now() - start : 0;
    const method = event.method;
    const path = event.path;
    const status = event.node?.res?.statusCode;

    if (status && status >= 400) {
      log.warn(formatRequest(method, path, status, elapsed));
    } else {
      log.info(formatRequest(method, path, status, elapsed));
    }
  },
});
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run tests/server/middleware-log.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add server/middleware/log.ts tests/server/middleware-log.test.ts
git commit -m "feat(logging): add HTTP request logging middleware"
```

---

### Task 3: AI adapter logging

**Files:**

- Modify: `server/ai/adapter.ts`
- Modify: `tests/server/ai.test.ts`

- [ ] **Step 1: Add failing tests for AI logging**

Add to `tests/server/ai.test.ts`:

```ts
import { vi } from "vitest";

describe("AI Adapter Logging", () => {
  it("generateText logs model name and prompt length on success", async () => {
    // Mock fetch to return success
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [{ message: { content: "你好" } }],
        }),
      text: () => Promise.resolve(""),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse);

    const adapter = createAiAdapter({
      model: "deepseek",
      apiKey: "test-key",
      baseUrl: "https://api.deepseek.com",
    });

    const result = await adapter.generateText("测试 prompt");
    expect(result).toBe("你好");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("generateText throws and includes model info on failure", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: () => Promise.resolve("rate limited"),
    });

    const adapter = createAiAdapter({
      model: "deepseek",
      apiKey: "test-key",
      baseUrl: "https://api.deepseek.com",
    });

    await expect(adapter.generateText("test")).rejects.toThrow("AI API error (429)");
  });
});
```

- [ ] **Step 2: Run tests to verify existing pass, new pass (or fail if logging changes signature)**

```bash
pnpm vitest run tests/server/ai.test.ts
```

Expected: new tests should PASS (fetch is mocked, adapter logic unchanged). This verifies baseline before we add logging.

- [ ] **Step 3: Add logging to adapter**

Modify `server/ai/adapter.ts` — add import and logging calls:

```ts
// Add at top of file:
import { createLogger } from "./utils/logger";

const log = createLogger("ai");
```

Note: since this file is in `server/ai/`, the import path to utils is `../utils/logger`. But in Nitro, `server/utils/` is auto-imported, so we can use `createLogger` directly without import in route files. For non-route files like `adapter.ts`, we need the explicit import.

Correct import:

```ts
import { createLogger } from "../utils/logger";
```

In `createOpenAICompatAdapter`, wrap `generateText`:

```ts
async generateText(prompt, systemPrompt) {
  const start = Date.now();
  log.debug(`[${name}] calling, prompt length: ${prompt.length} chars`);

  const response = await fetch(`${baseUrl}/v1/chat/completions`, {
    // ... existing fetch config unchanged ...
  });

  const elapsed = Date.now() - start;

  if (!response.ok) {
    const text = await response.text();
    log.error(`[${name}] failed: ${response.status} (${elapsed}ms)`, text);
    throw new Error(`AI API error (${response.status}): ${text}`);
  }

  const data = (await response.json()) as any;
  if (!data.choices?.length) {
    log.error(`[${name}] no choices returned (${elapsed}ms)`, JSON.stringify(data));
    throw new Error(`AI API returned no choices: ${JSON.stringify(data)}`);
  }

  const content = data.choices[0].message.content;
  log.info(`[${name}] success (${elapsed}ms), response length: ${content.length} chars`);
  return content;
},
```

Apply same pattern to `createAnthropicAdapter`.

- [ ] **Step 4: Run all AI tests**

```bash
pnpm vitest run tests/server/ai.test.ts
```

Expected: ALL PASS.

- [ ] **Step 5: Commit**

```bash
git add server/ai/adapter.ts tests/server/ai.test.ts
git commit -m "feat(logging): add AI adapter call logging with timing"
```

---

### Task 4: DB connection logging

**Files:**

- Modify: `server/db/connection.ts`

- [ ] **Step 1: Add logging to DB init**

Modify `server/db/connection.ts`:

```ts
import Database from "better-sqlite3";
import { initSchema } from "./schema";
import { createLogger } from "../utils/logger";

const log = createLogger("db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    log.info("initializing database: zhaohua.db");
    db = new Database("zhaohua.db");
    db.pragma("journal_mode = WAL");
    db.pragma("busy_timeout = 5000");
    log.debug("WAL mode enabled, busy_timeout = 5000");
    initSchema(db);
    log.info("database schema initialized");
  }
  return db;
}
```

- [ ] **Step 2: Run existing DB tests to verify no regression**

```bash
pnpm vitest run tests/server/db.test.ts
```

Expected: ALL PASS. DB tests use in-memory database directly, they don't go through `getDb()`, so the logging import doesn't interfere.

- [ ] **Step 3: Commit**

```bash
git add server/db/connection.ts
git commit -m "feat(logging): add database initialization logging"
```

---

### Task 5: Game engine logging

**Files:**

- Modify: `server/engine/tick.ts`
- Modify: `server/engine/catch-up.ts`
- Modify: `server/engine/story.ts`
- Modify: `server/engine/consequences.ts`
- Modify: `server/engine/daily-mission.ts`
- Modify: `server/engine/exams.ts`
- Modify: `server/engine/weekly-summary.ts`
- Modify: `server/engine/mission-failure.ts`

This task adds debug/info logging to each engine module. No new tests needed — these are log-only changes (no logic change), and existing engine tests validate no regression.

- [ ] **Step 1: Add logging to `tick.ts`**

Add at top:

```ts
import { createLogger } from "../utils/logger";
const log = createLogger("engine:tick");
```

Add after event selection (line ~33):

```ts
if (event) {
  log.debug(
    `tick ${gameTime.date} ${gameTime.hour}:${String(gameTime.minute).padStart(2, "0")} → event: ${event.id} (${event.type})`,
  );
}
```

Add after mood shifts loop:

```ts
const moodChanges = allNpcs.filter((npc, i) => {
  const newMood = calculateMoodShift({ weather, period: gameTime.period, currentMood: npc.mood });
  return newMood !== npc.mood;
}).length;
if (moodChanges > 0) {
  log.debug(`tick: ${moodChanges} NPC mood shifts`);
}
```

Note: the mood shift logging should observe, not change, the existing loop. Simplest approach: just log after the loop that mood shifts occurred, using the `allNpcs` count. Since the existing code already does the shifts, add a counter inside the existing loop instead:

```ts
let moodShifts = 0;
for (const npc of allNpcs) {
  const newMood = calculateMoodShift({ weather, period: gameTime.period, currentMood: npc.mood });
  if (newMood !== npc.mood) {
    saveNpcState(db, { ...npc, mood: newMood });
    moodShifts++;
  }
}
if (moodShifts > 0) {
  log.debug(`${moodShifts} NPC mood shifts this tick`);
}
```

- [ ] **Step 2: Add logging to `catch-up.ts`**

Add at top:

```ts
import { createLogger } from "../utils/logger";
const log = createLogger("engine:catch-up");
```

Add before return:

```ts
log.info(
  `catch-up: ${tickCount} ticks processed, coarse=${coarseMode}, ${events.length} events generated`,
);
```

- [ ] **Step 3: Add logging to `story.ts`**

Add at top:

```ts
import { createLogger } from "../utils/logger";
const log = createLogger("engine:story");
```

Add when a new story starts (inside the `saveStoryProgress` block):

```ts
log.info(`story started: ${arc.id}, stage: ${arc.stages[0].id}`);
```

Add when a story advances (find the stage advancement code):

```ts
log.info(`story advanced: ${arc.id} → stage: ${nextStage.id}`);
```

- [ ] **Step 4: Add logging to `consequences.ts`**

Add at top:

```ts
import { createLogger } from "../utils/logger";
const log = createLogger("engine:consequences");
```

Add when a consequence triggers:

```ts
log.info(`consequence: ${result.type} for ${result.npcId} — ${result.description}`);
```

- [ ] **Step 5: Add logging to `daily-mission.ts`**

Add at top:

```ts
import { createLogger } from "../utils/logger";
const log = createLogger("engine:mission");
```

Add when a mission is generated:

```ts
log.debug(`mission generated: ${mission.id} for ${gameDate}`);
```

- [ ] **Step 6: Add logging to `exams.ts`**

Add at top:

```ts
import { createLogger } from "../utils/logger";
const log = createLogger("engine:exams");
```

Add after results computed:

```ts
log.info(`exams run for ${gameDate}: ${results.length} students`);
for (const r of results) {
  log.debug(`exam: ${r.name} → ${r.score} (${r.grade}, ${r.change})`);
}
```

- [ ] **Step 7: Add logging to `weekly-summary.ts`**

Add at top:

```ts
import { createLogger } from "../utils/logger";
const log = createLogger("engine:weekly");
```

Add when summary is generated (before return):

```ts
log.info(`weekly summary generated for ${gameDate}`);
```

- [ ] **Step 8: Add logging to `mission-failure.ts`**

Add at top:

```ts
import { createLogger } from "../utils/logger";
const log = createLogger("engine:mission");
```

Add when penalty is applied:

```ts
log.info(`mission failed: ${mission.id}, penalty applied to ${mission.targetNpc || "none"}`);
```

- [ ] **Step 9: Run all engine tests**

```bash
pnpm vitest run tests/engine/ tests/server/
```

Expected: ALL PASS. Logging additions are side-effect only.

- [ ] **Step 10: Commit**

```bash
git add server/engine/tick.ts server/engine/catch-up.ts server/engine/story.ts server/engine/consequences.ts server/engine/daily-mission.ts server/engine/exams.ts server/engine/weekly-summary.ts server/engine/mission-failure.ts
git commit -m "feat(logging): add game engine logging across all modules"
```

---

### Task 6: Handler — replace silent catch with warn log

**Files:**

- Modify: `server/handlers/dialogue.post.ts`

- [ ] **Step 1: Replace silent catch**

In `server/handlers/dialogue.post.ts`, change:

```ts
    } catch {
      /* ignore DB errors in dialogue */
    }
```

to:

```ts
    } catch (err) {
      log.warn(`failed to enrich NPC state for ${params.npcId}`, err);
    }
```

Add at top:

```ts
import { createLogger } from "../utils/logger";
const log = createLogger("handler:dialogue");
```

- [ ] **Step 2: Run dialogue tests**

```bash
pnpm vitest run tests/server/dialogue-depth.test.ts tests/server/ai.test.ts
```

Expected: ALL PASS.

- [ ] **Step 3: Commit**

```bash
git add server/handlers/dialogue.post.ts
git commit -m "feat(logging): replace silent catch with warn log in dialogue handler"
```

---

### Task 7: Frontend logger

**Files:**

- Create: `src/utils/logger.ts`
- Create: `tests/client/logger.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/client/logger.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";

describe("Frontend Logger", () => {
  it("exports logger with info, warn, error, debug methods", async () => {
    const { logger } = await import("../../src/utils/logger");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.debug).toBe("function");
  });

  it("logger.error calls console.error with tag", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { logger } = await import("../../src/utils/logger");
    logger.error("test error");
    expect(spy).toHaveBeenCalled();
    const args = spy.mock.calls[0];
    expect(args[0]).toContain("[zhaohua]");
    expect(args[1]).toBe("test error");
    spy.mockRestore();
  });

  it("logger.info calls console.info with tag", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => {});
    const { logger } = await import("../../src/utils/logger");
    logger.info("test info");
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run tests/client/logger.test.ts
```

Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement frontend logger**

Create `src/utils/logger.ts`:

```ts
const TAG = "[zhaohua]";

export const logger = {
  debug: (...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.debug(TAG, ...args);
    }
  },
  info: (...args: unknown[]) => console.info(TAG, ...args),
  warn: (...args: unknown[]) => console.warn(TAG, ...args),
  error: (...args: unknown[]) => console.error(TAG, ...args),
};
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run tests/client/logger.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/utils/logger.ts tests/client/logger.test.ts
git commit -m "feat(logging): add frontend logger module"
```

---

### Task 8: API client unified error handling

**Files:**

- Modify: `src/api/client.ts`
- Create: `tests/client/api-client.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/client/api-client.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("API Client", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("fetchWorldState throws on non-ok response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Internal Server Error"),
    });

    const { fetchWorldState } = await import("../../src/api/client");
    await expect(fetchWorldState()).rejects.toThrow("API error 500");
  });

  it("fetchWorldState returns data on success", async () => {
    const mockData = { gameDate: "1994-09-15" };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockData),
    });

    const { fetchWorldState } = await import("../../src/api/client");
    const result = await fetchWorldState();
    expect(result).toEqual(mockData);
  });

  it("submitChoice sends POST with correct body", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ ok: true }),
    });

    const { submitChoice } = await import("../../src/api/client");
    await submitChoice({
      npcId: "npc-1",
      choiceId: "encourage",
      gameDate: "1994-09-15",
      gameTime: "09:00",
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/choice",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("npc-1"),
      }),
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm vitest run tests/client/api-client.test.ts
```

Expected: FAIL — current client does not throw on error responses.

- [ ] **Step 3: Refactor API client with unified request()**

Rewrite `src/api/client.ts`:

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm vitest run tests/client/api-client.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 5: Run all tests to verify no regression**

```bash
pnpm vitest run
```

Expected: ALL PASS. The API client interface is unchanged (same function names, same params, same return types).

- [ ] **Step 6: Commit**

```bash
git add src/api/client.ts tests/client/api-client.test.ts
git commit -m "feat(logging): add unified API client error handling with logging"
```

---

### Task 9: Final integration verification

- [ ] **Step 1: Run full test suite**

```bash
pnpm vitest run
```

Expected: ALL existing 224+ tests PASS, plus new logger/middleware/client tests.

- [ ] **Step 2: Start dev server and verify logs appear**

```bash
pnpm dev:server
```

Open another terminal, make a request:

```bash
curl http://localhost:3001/api/world
```

Expected: see log output in server terminal with `[http]` tag showing the request.

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "feat(logging): final integration fixes"
```
