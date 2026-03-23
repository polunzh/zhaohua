# 朝花夕拾 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP of 朝花夕拾 — a real-time life simulation web app set in 1990s rural China, playable in a browser.

**Architecture:** Vue 3 frontend with Canvas-based scene rendering, Nitro backend for world state management and AI text generation, SQLite for persistence. Time engine calculates world state on-demand when user opens the page.

**Tech Stack:** VitePlus (toolchain), Vue 3, Canvas API, Nitro (backend), better-sqlite3, AI adapter layer (multi-model)

**Development approach:** TDD — write failing tests first, then implement.

---

## MVP 范围

MVP 只做以下内容，其余全部推后：

- **一条线：老师线**（邮递员线后续加）
- **一个核心场景：教室**（花池、水塔、土路等后续加）
- **3 个 NPC：** 2 个学生 + 1 个校长
- **一个 AI 模型适配器：** DeepSeek（最便宜，适合开发调试）
- **基础时间引擎：** 实时同步 + calendar_offset 跳时
- **基础事件系统：** 日常琐事 + 季节事件（无长线故事）
- **静态场景底图 + 旧时光滤镜**（无动态图层动画）
- **无音效**

---

## File Structure

```
zhaohua/
├── package.json
├── vite.config.ts
├── vitest.config.ts
├── .env                          # AI model config
├── src/
│   ├── App.vue                   # Root component
│   ├── main.ts                   # Entry point
│   ├── components/
│   │   ├── GameCanvas.vue        # Canvas scene renderer
│   │   ├── DialogBox.vue         # NPC dialogue overlay
│   │   ├── ChoicePanel.vue       # Action choices overlay
│   │   ├── EventSummary.vue      # Missed events sidebar
│   │   └── TimeControls.vue      # Skip day/week/semester buttons
│   ├── engine/
│   │   ├── time.ts               # Time engine: calendar_offset, tick, catch-up
│   │   ├── schedule.ts           # NPC daily schedules
│   │   ├── events.ts             # Event pool, trigger conditions, selection
│   │   └── world.ts              # World state manager (orchestrates time + events + NPCs)
│   ├── scene/
│   │   ├── renderer.ts           # Canvas rendering: draw scene, NPCs, clickable areas
│   │   ├── scenes.ts             # Scene definitions (locations × season × time-of-day)
│   │   └── filter.ts             # Nostalgic visual filter (sepia, grain, vignette)
│   ├── data/
│   │   ├── npcs.ts               # NPC definitions (name, personality, schedule)
│   │   ├── event-pool.ts         # Event templates with trigger conditions
│   │   └── seasons.ts            # Season config (date ranges, weather probabilities)
│   └── api/
│       └── client.ts             # Frontend API client (calls Nitro endpoints)
├── server/
│   ├── api/
│   │   ├── world.get.ts          # GET /api/world — return current world state + scene
│   │   ├── action.post.ts        # POST /api/action — player action (click, choice)
│   │   ├── skip.post.ts          # POST /api/skip — skip to next day/week/semester
│   │   └── dialogue.post.ts      # POST /api/dialogue — generate NPC dialogue via AI
│   ├── db/
│   │   ├── schema.ts             # SQLite schema definition
│   │   ├── connection.ts         # DB connection singleton
│   │   └── queries.ts            # Prepared query functions
│   ├── ai/
│   │   ├── adapter.ts            # AI adapter interface
│   │   ├── deepseek.ts           # DeepSeek adapter
│   │   └── prompts.ts            # Prompt templates for dialogue, event description, summary
│   └── engine/
│       ├── catch-up.ts           # Server-side catch-up computation
│       └── tick.ts               # Single tick: advance world state by 15 min
└── tests/
    ├── engine/
    │   ├── time.test.ts          # Time engine tests
    │   ├── schedule.test.ts      # NPC schedule tests
    │   ├── events.test.ts        # Event system tests
    │   └── catch-up.test.ts      # Catch-up computation tests
    ├── server/
    │   ├── db.test.ts            # DB schema and query tests
    │   ├── api.test.ts           # API endpoint tests
    │   └── ai.test.ts            # AI adapter tests
    └── scene/
        └── filter.test.ts        # Visual filter tests
```

---

## Task 1: Project Scaffolding

**Files:**

- Create: `package.json`, `vite.config.ts`, `vitest.config.ts`, `.env`, `.gitignore`, `src/main.ts`, `src/App.vue`

- [ ] **Step 1: Scaffold Vue project with VitePlus**

```bash
cd /Users/zhenqiang/Documents/code
vp create vue -- --ts zhaohua-app
```

Then move contents into zhaohua/ or scaffold in-place. If vp create doesn't work cleanly with existing dir, use `create-vue` directly.

- [ ] **Step 2: Install core dependencies**

```bash
pnpm add better-sqlite3
pnpm add -D @types/better-sqlite3 vitest @vitejs/plugin-vue nitro
```

- [ ] **Step 3: Configure vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "node",
  },
});
```

- [ ] **Step 4: Create .env with AI config**

```env
AI_MODEL=deepseek
AI_API_KEY=your-key-here
AI_BASE_URL=https://api.deepseek.com
```

- [ ] **Step 5: Create .gitignore**

```
node_modules/
dist/
.env
*.db
```

- [ ] **Step 6: Verify setup**

Run: `pnpm vitest run`
Expected: 0 tests, no errors

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold project with VitePlus, Vue 3, Vitest, Nitro"
```

---

## Task 2: Time Engine

**Files:**

- Create: `src/engine/time.ts`
- Test: `tests/engine/time.test.ts`

- [ ] **Step 1: Write failing tests for time engine**

```ts
// tests/engine/time.test.ts
import { describe, it, expect } from "vitest";
import { TimeEngine } from "../../src/engine/time";

describe("TimeEngine", () => {
  it("returns game time matching real time when offset is 0", () => {
    const engine = new TimeEngine({ calendarOffset: 0, gameStartDate: "1994-09-01" });
    const now = new Date("2026-03-23T08:00:00");
    const gameTime = engine.getGameTime(now);
    expect(gameTime.hour).toBe(8);
    expect(gameTime.minute).toBe(0);
    // Game date = gameStartDate + calendarOffset + days-since-anchor
    // With offset 0 and anchor at creation, game date tracks from 1994-09-01
  });

  it("applies calendar offset for skip-day", () => {
    const engine = new TimeEngine({ calendarOffset: 0, gameStartDate: "1994-09-01" });
    engine.skipDays(1);
    expect(engine.calendarOffset).toBe(1);
  });

  it("applies calendar offset for skip-week", () => {
    const engine = new TimeEngine({ calendarOffset: 0, gameStartDate: "1994-09-01" });
    engine.skipDays(7);
    expect(engine.calendarOffset).toBe(7);
  });

  it("calculates ticks needed for catch-up", () => {
    const engine = new TimeEngine({ calendarOffset: 0, gameStartDate: "1994-09-01" });
    const lastVisit = new Date("2026-03-23T08:00:00");
    const now = new Date("2026-03-23T10:30:00");
    const ticks = engine.getTickCount(lastVisit, now);
    expect(ticks).toBe(10); // 2.5 hours = 10 × 15min ticks
  });

  it("caps ticks at coarse granularity for long absence (>7 days)", () => {
    const engine = new TimeEngine({ calendarOffset: 0, gameStartDate: "1994-09-01" });
    const lastVisit = new Date("2026-03-01T08:00:00");
    const now = new Date("2026-03-23T08:00:00"); // 22 days
    const ticks = engine.getTickCount(lastVisit, now);
    // Should use day-level ticks: 22 days = 22 ticks (not 22*96=2112)
    expect(ticks).toBe(22);
    expect(engine.isCoarseMode(lastVisit, now)).toBe(true);
  });

  it("determines season from game date", () => {
    const engine = new TimeEngine({ calendarOffset: 0, gameStartDate: "1994-09-01" });
    // Game date Sept 1 = autumn
    expect(engine.getSeason("1994-09-01")).toBe("autumn");
    expect(engine.getSeason("1994-12-15")).toBe("winter");
    expect(engine.getSeason("1995-03-20")).toBe("spring");
    expect(engine.getSeason("1995-07-10")).toBe("summer");
  });

  it("determines time-of-day period", () => {
    expect(TimeEngine.getPeriod(7)).toBe("morning");
    expect(TimeEngine.getPeriod(10)).toBe("morning");
    expect(TimeEngine.getPeriod(12)).toBe("afternoon");
    expect(TimeEngine.getPeriod(18)).toBe("evening");
    expect(TimeEngine.getPeriod(22)).toBe("night");
    expect(TimeEngine.getPeriod(2)).toBe("night");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/engine/time.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement TimeEngine**

```ts
// src/engine/time.ts
export type Season = "spring" | "summer" | "autumn" | "winter";
export type Period = "morning" | "afternoon" | "evening" | "night";

export interface GameTime {
  date: string; // YYYY-MM-DD in game calendar
  hour: number;
  minute: number;
  season: Season;
  period: Period;
}

interface TimeEngineConfig {
  calendarOffset: number; // days offset from real calendar
  gameStartDate: string; // '1994-09-01'
  anchorRealDate?: string; // when offset was last set
}

const COARSE_THRESHOLD_DAYS = 7;
const TICK_MINUTES = 15;

export class TimeEngine {
  calendarOffset: number;
  private gameStartDate: string;
  private anchorRealDate: Date;

  constructor(config: TimeEngineConfig) {
    this.calendarOffset = config.calendarOffset;
    this.gameStartDate = config.gameStartDate;
    this.anchorRealDate = config.anchorRealDate ? new Date(config.anchorRealDate) : new Date();
  }

  getGameTime(realNow: Date): GameTime {
    const gameDate = this.calculateGameDate(realNow);
    const hour = realNow.getHours();
    const minute = realNow.getMinutes();
    return {
      date: gameDate,
      hour,
      minute,
      season: this.getSeason(gameDate),
      period: TimeEngine.getPeriod(hour),
    };
  }

  private calculateGameDate(realNow: Date): string {
    const start = new Date(this.gameStartDate);
    const daysSinceAnchor = Math.floor(
      (realNow.getTime() - this.anchorRealDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const totalGameDays = this.calendarOffset + daysSinceAnchor;
    const gameDate = new Date(start);
    gameDate.setDate(gameDate.getDate() + totalGameDays);
    return gameDate.toISOString().slice(0, 10);
  }

  skipDays(days: number): void {
    this.calendarOffset += days;
    this.anchorRealDate = new Date();
  }

  getTickCount(lastVisit: Date, now: Date): number {
    const diffMs = now.getTime() - lastVisit.getTime();
    const diffMinutes = diffMs / (1000 * 60);

    if (this.isCoarseMode(lastVisit, now)) {
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }
    return Math.floor(diffMinutes / TICK_MINUTES);
  }

  isCoarseMode(lastVisit: Date, now: Date): boolean {
    const diffDays = (now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > COARSE_THRESHOLD_DAYS;
  }

  getSeason(dateStr: string): Season {
    const month = parseInt(dateStr.slice(5, 7), 10);
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    if (month >= 9 && month <= 11) return "autumn";
    return "winter";
  }

  static getPeriod(hour: number): Period {
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run tests/engine/time.test.ts`
Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/time.ts tests/engine/time.test.ts
git commit -m "feat: implement time engine with calendar offset and catch-up"
```

---

## Task 3: NPC Schedule System

**Files:**

- Create: `src/engine/schedule.ts`, `src/data/npcs.ts`
- Test: `tests/engine/schedule.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/engine/schedule.test.ts
import { describe, it, expect } from "vitest";
import { getScheduleEntry } from "../../src/engine/schedule";
import { npcs } from "../../src/data/npcs";

describe("NPC Schedule", () => {
  it("student is at home before school", () => {
    const entry = getScheduleEntry(npcs[0], 6, 30, "weekday");
    expect(entry.location).toBe("home");
    expect(entry.activity).toBe("preparing");
  });

  it("student is on road to school at 7:15", () => {
    const entry = getScheduleEntry(npcs[0], 7, 15, "weekday");
    expect(entry.location).toBe("road");
    expect(entry.activity).toBe("walking-to-school");
  });

  it("student is in classroom during class", () => {
    const entry = getScheduleEntry(npcs[0], 9, 0, "weekday");
    expect(entry.location).toBe("classroom");
    expect(entry.activity).toBe("in-class");
  });

  it("student is at water tower during break in summer", () => {
    const entry = getScheduleEntry(npcs[0], 10, 0, "weekday", "summer");
    expect(entry.location).toBe("water-tower");
    expect(entry.activity).toBe("drinking-water");
  });

  it("principal is in office during school hours", () => {
    const principal = npcs.find((n) => n.role === "principal")!;
    const entry = getScheduleEntry(principal, 9, 0, "weekday");
    expect(entry.location).toBe("office");
  });

  it("everyone is at home at night", () => {
    for (const npc of npcs) {
      const entry = getScheduleEntry(npc, 22, 0, "weekday");
      expect(entry.location).toBe("home");
    }
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/engine/schedule.test.ts`
Expected: FAIL

- [ ] **Step 3: Define NPC data**

```ts
// src/data/npcs.ts
export interface NPC {
  id: string;
  name: string;
  role: "student" | "principal";
  personality: string;
  age: number;
}

export const npcs: NPC[] = [
  {
    id: "student-xiaoming",
    name: "小明",
    role: "student",
    personality: "调皮好动，成绩一般，但很讲义气",
    age: 10,
  },
  {
    id: "student-xiaohua",
    name: "小花",
    role: "student",
    personality: "安静内向，成绩很好，字写得漂亮",
    age: 9,
  },
  {
    id: "principal-zhang",
    name: "张校长",
    role: "principal",
    personality: "严肃但关心学生，一个人撑起整个学校",
    age: 55,
  },
];
```

- [ ] **Step 4: Implement schedule system**

```ts
// src/engine/schedule.ts
import type { NPC } from "../data/npcs";
import type { Season } from "./time";

export interface ScheduleEntry {
  location: string;
  activity: string;
}

type DayType = "weekday" | "weekend";

interface TimeSlot {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  location: string;
  activity: string;
  season?: Season;
}

const studentWeekday: TimeSlot[] = [
  {
    startHour: 0,
    startMinute: 0,
    endHour: 6,
    endMinute: 59,
    location: "home",
    activity: "sleeping",
  },
  {
    startHour: 7,
    startMinute: 0,
    endHour: 7,
    endMinute: 29,
    location: "road",
    activity: "walking-to-school",
  },
  {
    startHour: 7,
    startMinute: 30,
    endHour: 7,
    endMinute: 59,
    location: "classroom",
    activity: "morning-reading",
  },
  {
    startHour: 8,
    startMinute: 0,
    endHour: 9,
    endMinute: 44,
    location: "classroom",
    activity: "in-class",
  },
  {
    startHour: 9,
    startMinute: 45,
    endHour: 10,
    endMinute: 14,
    location: "flower-garden",
    activity: "break",
  },
  {
    startHour: 9,
    startMinute: 45,
    endHour: 10,
    endMinute: 14,
    location: "water-tower",
    activity: "drinking-water",
    season: "summer",
  },
  {
    startHour: 10,
    startMinute: 15,
    endHour: 11,
    endMinute: 59,
    location: "classroom",
    activity: "in-class",
  },
  {
    startHour: 12,
    startMinute: 0,
    endHour: 13,
    endMinute: 59,
    location: "home",
    activity: "lunch-break",
  },
  {
    startHour: 14,
    startMinute: 0,
    endHour: 15,
    endMinute: 44,
    location: "classroom",
    activity: "in-class",
  },
  {
    startHour: 15,
    startMinute: 45,
    endHour: 16,
    endMinute: 14,
    location: "playground",
    activity: "break",
  },
  {
    startHour: 16,
    startMinute: 15,
    endHour: 17,
    endMinute: 0,
    location: "classroom",
    activity: "in-class",
  },
  {
    startHour: 17,
    startMinute: 1,
    endHour: 17,
    endMinute: 30,
    location: "road",
    activity: "walking-home",
  },
  {
    startHour: 17,
    startMinute: 31,
    endHour: 23,
    endMinute: 59,
    location: "home",
    activity: "evening",
  },
];

const principalWeekday: TimeSlot[] = [
  {
    startHour: 0,
    startMinute: 0,
    endHour: 6,
    endMinute: 59,
    location: "home",
    activity: "sleeping",
  },
  {
    startHour: 7,
    startMinute: 0,
    endHour: 7,
    endMinute: 29,
    location: "playground",
    activity: "flag-ceremony",
  },
  {
    startHour: 7,
    startMinute: 30,
    endHour: 11,
    endMinute: 59,
    location: "office",
    activity: "working",
  },
  {
    startHour: 12,
    startMinute: 0,
    endHour: 13,
    endMinute: 59,
    location: "home",
    activity: "lunch-break",
  },
  {
    startHour: 14,
    startMinute: 0,
    endHour: 17,
    endMinute: 0,
    location: "office",
    activity: "working",
  },
  {
    startHour: 17,
    startMinute: 1,
    endHour: 23,
    endMinute: 59,
    location: "home",
    activity: "evening",
  },
];

function getDefaultEntry(): ScheduleEntry {
  return { location: "home", activity: "preparing" };
}

export function getScheduleEntry(
  npc: NPC,
  hour: number,
  minute: number,
  dayType: DayType,
  season?: Season,
): ScheduleEntry {
  if (dayType === "weekend") {
    return { location: "home", activity: "resting" };
  }

  const schedule = npc.role === "principal" ? principalWeekday : studentWeekday;
  const timeValue = hour * 60 + minute;

  // Check season-specific slots first
  if (season) {
    const seasonSlot = schedule.find(
      (slot) =>
        slot.season === season &&
        timeValue >= slot.startHour * 60 + slot.startMinute &&
        timeValue <= slot.endHour * 60 + slot.endMinute,
    );
    if (seasonSlot) {
      return { location: seasonSlot.location, activity: seasonSlot.activity };
    }
  }

  // Then check generic slots
  const slot = schedule.find(
    (slot) =>
      !slot.season &&
      timeValue >= slot.startHour * 60 + slot.startMinute &&
      timeValue <= slot.endHour * 60 + slot.endMinute,
  );

  return slot ? { location: slot.location, activity: slot.activity } : getDefaultEntry();
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run tests/engine/schedule.test.ts`
Expected: All PASS

- [ ] **Step 6: Commit**

```bash
git add src/engine/schedule.ts src/data/npcs.ts tests/engine/schedule.test.ts
git commit -m "feat: implement NPC schedule system with time-of-day and season support"
```

---

## Task 4: Event System

**Files:**

- Create: `src/engine/events.ts`, `src/data/event-pool.ts`, `src/data/seasons.ts`
- Test: `tests/engine/events.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/engine/events.test.ts
import { describe, it, expect } from "vitest";
import { EventEngine } from "../../src/engine/events";
import type { GameTime } from "../../src/engine/time";

describe("EventEngine", () => {
  const makeGameTime = (overrides: Partial<GameTime> = {}): GameTime => ({
    date: "1994-09-15",
    hour: 9,
    minute: 0,
    season: "autumn",
    period: "morning",
    ...overrides,
  });

  it("selects a daily event for a school morning", () => {
    const engine = new EventEngine(42); // fixed seed
    const event = engine.selectEvent(makeGameTime(), []);
    expect(event).toBeDefined();
    expect(event!.type).toBe("daily");
  });

  it("returns null for night time (no events at 2am)", () => {
    const engine = new EventEngine(42);
    const event = engine.selectEvent(makeGameTime({ hour: 2, period: "night" }), []);
    expect(event).toBeNull();
  });

  it("triggers season event on matching date", () => {
    const engine = new EventEngine(42);
    const event = engine.selectEvent(
      makeGameTime({ date: "1994-09-01" }), // 开学日
      [],
    );
    expect(event).toBeDefined();
    expect(event!.type).toBe("seasonal");
    expect(event!.id).toBe("school-start");
  });

  it("does not repeat already-triggered events", () => {
    const engine = new EventEngine(42);
    const triggered = ["school-start"];
    const event = engine.selectEvent(makeGameTime({ date: "1994-09-01" }), triggered);
    // Should get a daily event instead
    if (event) {
      expect(event.id).not.toBe("school-start");
    }
  });

  it("produces deterministic results with same seed", () => {
    const engine1 = new EventEngine(123);
    const engine2 = new EventEngine(123);
    const gt = makeGameTime();
    const event1 = engine1.selectEvent(gt, []);
    const event2 = engine2.selectEvent(gt, []);
    expect(event1?.id).toBe(event2?.id);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/engine/events.test.ts`
Expected: FAIL

- [ ] **Step 3: Create season config and event pool data**

```ts
// src/data/seasons.ts
export interface SeasonConfig {
  name: string;
  months: number[];
  weatherWeights: Record<string, number>;
}

export const seasons: Record<string, SeasonConfig> = {
  spring: {
    name: "春",
    months: [3, 4, 5],
    weatherWeights: { sunny: 0.5, cloudy: 0.3, rainy: 0.2 },
  },
  summer: {
    name: "夏",
    months: [6, 7, 8],
    weatherWeights: { sunny: 0.6, cloudy: 0.2, rainy: 0.2 },
  },
  autumn: {
    name: "秋",
    months: [9, 10, 11],
    weatherWeights: { sunny: 0.5, cloudy: 0.3, rainy: 0.15, windy: 0.05 },
  },
  winter: {
    name: "冬",
    months: [12, 1, 2],
    weatherWeights: { sunny: 0.3, cloudy: 0.3, snowy: 0.2, windy: 0.2 },
  },
};
```

```ts
// src/data/event-pool.ts
export interface EventTemplate {
  id: string;
  type: "daily" | "seasonal";
  triggerDate?: string; // MM-DD for seasonal
  seasons?: string[]; // which seasons this can trigger
  periods?: string[]; // which time periods
  description: string; // template for AI to expand
}

export const eventPool: EventTemplate[] = [
  // Seasonal events
  {
    id: "school-start",
    type: "seasonal",
    triggerDate: "09-01",
    description: "开学第一天，学生们背着新书包来到学校",
  },
  {
    id: "midterm-exam",
    type: "seasonal",
    triggerDate: "10-20",
    description: "期中考试，教室里安安静静",
  },
  {
    id: "winter-stove",
    type: "seasonal",
    triggerDate: "11-15",
    description: "教室里生起了煤炉，第一次点火总是冒烟",
  },
  {
    id: "new-year-prep",
    type: "seasonal",
    triggerDate: "12-25",
    description: "快过年了，学生们开始写寒假作业清单",
  },
  {
    id: "spring-term",
    type: "seasonal",
    triggerDate: "02-20",
    description: "春季开学，有些学生晒黑了，有些长高了",
  },
  {
    id: "final-exam",
    type: "seasonal",
    triggerDate: "06-25",
    description: "期末考试，天热得坐不住",
  },

  // Daily events — morning
  {
    id: "student-late",
    type: "daily",
    periods: ["morning"],
    description: "有学生迟到了，气喘吁吁跑进教室",
  },
  {
    id: "homework-missing",
    type: "daily",
    periods: ["morning"],
    description: "收作业时发现有人没写完",
  },
  {
    id: "morning-reading",
    type: "daily",
    periods: ["morning"],
    description: "早读时间，教室里书声琅琅",
  },

  // Daily events — afternoon
  {
    id: "student-fight",
    type: "daily",
    periods: ["afternoon"],
    description: "课间两个学生吵起来了",
  },
  {
    id: "parent-visit",
    type: "daily",
    periods: ["afternoon"],
    description: "有家长来学校找老师问孩子的情况",
  },
  {
    id: "nap-in-class",
    type: "daily",
    periods: ["afternoon"],
    description: "下午第一节课，有学生趴在桌上打瞌睡",
  },

  // Daily events — evening
  {
    id: "grading-papers",
    type: "daily",
    periods: ["evening"],
    description: "在办公室批改作业，窗外天渐渐黑了",
  },
  {
    id: "colleague-chat",
    type: "daily",
    periods: ["evening"],
    description: "和同事聊了几句明天的课",
  },
];
```

- [ ] **Step 4: Implement event engine**

```ts
// src/engine/events.ts
import { eventPool, type EventTemplate } from "../data/event-pool";
import type { GameTime } from "./time";

// Simple seeded PRNG (mulberry32)
function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class EventEngine {
  private random: () => number;

  constructor(seed: number) {
    this.random = mulberry32(seed);
  }

  selectEvent(gameTime: GameTime, triggeredEventIds: string[]): EventTemplate | null {
    // No events at night
    if (gameTime.period === "night") {
      return null;
    }

    const mmdd = gameTime.date.slice(5); // 'MM-DD'

    // Check seasonal events first
    const seasonalEvent = eventPool.find(
      (e) => e.type === "seasonal" && e.triggerDate === mmdd && !triggeredEventIds.includes(e.id),
    );
    if (seasonalEvent) {
      return seasonalEvent;
    }

    // Filter eligible daily events
    const eligible = eventPool.filter(
      (e) =>
        e.type === "daily" &&
        (!e.periods || e.periods.includes(gameTime.period)) &&
        (!e.seasons || e.seasons.includes(gameTime.season)) &&
        !triggeredEventIds.includes(e.id),
    );

    if (eligible.length === 0) return null;

    // Pick one using seeded random
    const index = Math.floor(this.random() * eligible.length);
    return eligible[index];
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run tests/engine/events.test.ts`
Expected: All PASS

- [ ] **Step 6: Commit**

```bash
git add src/engine/events.ts src/data/event-pool.ts src/data/seasons.ts tests/engine/events.test.ts
git commit -m "feat: implement event system with seeded PRNG and seasonal triggers"
```

---

## Task 5: SQLite Schema and Queries

**Files:**

- Create: `server/db/schema.ts`, `server/db/connection.ts`, `server/db/queries.ts`
- Test: `tests/server/db.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/server/db.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import {
  getWorldState,
  saveWorldState,
  getNpcState,
  saveNpcState,
  addEventLog,
  getRecentEvents,
} from "../../server/db/queries";

describe("Database", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
  });

  afterEach(() => {
    db.close();
  });

  it("initializes schema without error", () => {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as {
      name: string;
    }[];
    const names = tables.map((t) => t.name);
    expect(names).toContain("world_state");
    expect(names).toContain("npc_state");
    expect(names).toContain("event_log");
    expect(names).toContain("player_choices");
  });

  it("saves and reads world state", () => {
    saveWorldState(db, {
      gameDate: "1994-09-15",
      weather: "sunny",
      season: "autumn",
      lastVisit: "2026-03-23T08:00:00Z",
      calendarOffset: 0,
      randomSeed: 42,
    });
    const state = getWorldState(db);
    expect(state).toBeDefined();
    expect(state!.gameDate).toBe("1994-09-15");
    expect(state!.weather).toBe("sunny");
    expect(state!.calendarOffset).toBe(0);
  });

  it("saves and reads NPC state", () => {
    saveNpcState(db, {
      npcId: "student-xiaoming",
      location: "classroom",
      mood: "happy",
      affinity: 50,
    });
    const state = getNpcState(db, "student-xiaoming");
    expect(state!.mood).toBe("happy");
    expect(state!.affinity).toBe(50);
  });

  it("logs events and retrieves recent ones", () => {
    addEventLog(db, {
      eventId: "student-late",
      gameDate: "1994-09-15",
      gameTime: "08:15",
      type: "daily",
      involvedNpcs: "student-xiaoming",
      description: "小明迟到了",
    });
    addEventLog(db, {
      eventId: "homework-missing",
      gameDate: "1994-09-15",
      gameTime: "09:00",
      type: "daily",
      involvedNpcs: "student-xiaohua",
      description: "小花没交作业",
    });
    const recent = getRecentEvents(db, 20);
    expect(recent).toHaveLength(2);
    expect(recent[0].eventId).toBe("homework-missing"); // most recent first
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/server/db.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement schema**

```ts
// server/db/schema.ts
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
      anchor_real_date TEXT
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
```

- [ ] **Step 4: Implement connection**

```ts
// server/db/connection.ts
import Database from "better-sqlite3";
import { initSchema } from "./schema";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database("zhaohua.db");
    db.pragma("journal_mode = WAL");
    db.pragma("busy_timeout = 5000");
    initSchema(db);
  }
  return db;
}
```

- [ ] **Step 5: Implement queries**

```ts
// server/db/queries.ts
import type Database from "better-sqlite3";

export interface WorldState {
  gameDate: string;
  weather: string;
  season: string;
  lastVisit: string;
  calendarOffset: number;
  randomSeed: number;
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
  involvedNpcs: string;
  description: string;
}

export function getWorldState(db: Database.Database): WorldState | null {
  const row = db.prepare("SELECT * FROM world_state WHERE id = 1").get() as any;
  if (!row) return null;
  return {
    gameDate: row.game_date,
    weather: row.weather,
    season: row.season,
    lastVisit: row.last_visit,
    calendarOffset: row.calendar_offset,
    randomSeed: row.random_seed,
  };
}

export function saveWorldState(db: Database.Database, state: WorldState): void {
  db.prepare(
    `
    INSERT INTO world_state (id, game_date, weather, season, last_visit, calendar_offset, random_seed)
    VALUES (1, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      game_date = excluded.game_date,
      weather = excluded.weather,
      season = excluded.season,
      last_visit = excluded.last_visit,
      calendar_offset = excluded.calendar_offset,
      random_seed = excluded.random_seed
  `,
  ).run(
    state.gameDate,
    state.weather,
    state.season,
    state.lastVisit,
    state.calendarOffset,
    state.randomSeed,
  );
}

export function getNpcState(db: Database.Database, npcId: string): NpcStateRow | null {
  const row = db.prepare("SELECT * FROM npc_state WHERE npc_id = ?").get(npcId) as any;
  if (!row) return null;
  return {
    npcId: row.npc_id,
    location: row.location,
    mood: row.mood,
    affinity: row.affinity,
  };
}

export function saveNpcState(db: Database.Database, state: NpcStateRow): void {
  db.prepare(
    `
    INSERT INTO npc_state (npc_id, location, mood, affinity)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(npc_id) DO UPDATE SET
      location = excluded.location,
      mood = excluded.mood,
      affinity = excluded.affinity
  `,
  ).run(state.npcId, state.location, state.mood, state.affinity);
}

export function addEventLog(db: Database.Database, entry: EventLogEntry): void {
  db.prepare(
    `
    INSERT INTO event_log (event_id, game_date, game_time, type, involved_npcs, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `,
  ).run(
    entry.eventId,
    entry.gameDate,
    entry.gameTime,
    entry.type,
    entry.involvedNpcs,
    entry.description,
  );
}

export function getRecentEvents(db: Database.Database, limit: number): EventLogEntry[] {
  return db
    .prepare(
      `
    SELECT event_id, game_date, game_time, type, involved_npcs, description
    FROM event_log ORDER BY id DESC LIMIT ?
  `,
    )
    .all(limit) as any[];
}

export function getTriggeredEventIds(db: Database.Database): string[] {
  const rows = db.prepare("SELECT DISTINCT event_id FROM event_log").all() as any[];
  return rows.map((r) => r.event_id);
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm vitest run tests/server/db.test.ts`
Expected: All PASS

- [ ] **Step 7: Commit**

```bash
git add server/db/ tests/server/db.test.ts
git commit -m "feat: implement SQLite schema and query layer"
```

---

## Task 6: AI Adapter Layer

**Files:**

- Create: `server/ai/adapter.ts`, `server/ai/deepseek.ts`, `server/ai/prompts.ts`
- Test: `tests/server/ai.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/server/ai.test.ts
import { describe, it, expect } from "vitest";
import { createAiAdapter, type AiAdapter } from "../../server/ai/adapter";
import { buildDialoguePrompt, buildEventDescriptionPrompt } from "../../server/ai/prompts";

describe("AI Adapter", () => {
  it("creates adapter from config", () => {
    const adapter = createAiAdapter({
      model: "deepseek",
      apiKey: "test",
      baseUrl: "https://api.deepseek.com",
    });
    expect(adapter).toBeDefined();
    expect(adapter.name).toBe("deepseek");
  });

  it("throws for unknown model", () => {
    expect(() => createAiAdapter({ model: "unknown", apiKey: "test", baseUrl: "" })).toThrow(
      "Unknown AI model: unknown",
    );
  });
});

describe("Prompts", () => {
  it("builds dialogue prompt with NPC context", () => {
    const prompt = buildDialoguePrompt({
      npcName: "小明",
      npcPersonality: "调皮好动",
      situation: "上课迟到被老师叫住",
      season: "autumn",
      gameDate: "1994-09-15",
    });
    expect(prompt).toContain("小明");
    expect(prompt).toContain("调皮好动");
    expect(prompt).toContain("1994");
    expect(prompt).toContain("不要使用现代网络用语");
  });

  it("builds event description prompt", () => {
    const prompt = buildEventDescriptionPrompt({
      eventDescription: "有学生迟到了",
      season: "winter",
      weather: "snowy",
      gameDate: "1994-12-15",
    });
    expect(prompt).toContain("迟到");
    expect(prompt).toContain("冬");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/server/ai.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement adapter interface and DeepSeek adapter**

```ts
// server/ai/adapter.ts
export interface AiAdapter {
  name: string;
  generateText(prompt: string, systemPrompt?: string): Promise<string>;
}

interface AiConfig {
  model: string;
  apiKey: string;
  baseUrl: string;
}

export function createAiAdapter(config: AiConfig): AiAdapter {
  switch (config.model) {
    case "deepseek":
      return createDeepSeekAdapter(config);
    default:
      throw new Error(`Unknown AI model: ${config.model}`);
  }
}

function createDeepSeekAdapter(config: AiConfig): AiAdapter {
  return {
    name: "deepseek",
    async generateText(prompt: string, systemPrompt?: string): Promise<string> {
      const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: prompt },
          ],
          max_tokens: 300,
          temperature: 0.8,
        }),
      });
      const data = (await response.json()) as any;
      return data.choices[0].message.content;
    },
  };
}
```

- [ ] **Step 4: Implement prompt templates**

```ts
// server/ai/prompts.ts
interface DialogueContext {
  npcName: string;
  npcPersonality: string;
  situation: string;
  season: string;
  gameDate: string;
}

interface EventDescContext {
  eventDescription: string;
  season: string;
  weather: string;
  gameDate: string;
}

const SYSTEM_PROMPT = `你是一个 1990 年代中国北方农村生活模拟器的文本生成器。
你生成的文字要符合那个年代的农村语境：朴实、直接、口语化。
不要使用现代网络用语、流行语或英文。
保持简短——每段对话不超过两三句话。`;

export function buildDialoguePrompt(ctx: DialogueContext): string {
  const seasonName =
    { spring: "春天", summer: "夏天", autumn: "秋天", winter: "冬天" }[ctx.season] || ctx.season;
  return `时间：${ctx.gameDate}，${seasonName}。
角色：${ctx.npcName}，性格：${ctx.npcPersonality}。
场景：${ctx.situation}。
不要使用现代网络用语。

请用${ctx.npcName}的口吻说一两句话。只输出对话内容，不要加引号或角色名前缀。`;
}

export function buildEventDescriptionPrompt(ctx: EventDescContext): string {
  const seasonName =
    { spring: "春", summer: "夏", autumn: "秋", winter: "冬" }[ctx.season] || ctx.season;
  return `时间：${ctx.gameDate}，${seasonName}天，天气${ctx.weather}。
事件：${ctx.eventDescription}。
不要使用现代网络用语。

用一两句话描述这个场景，要有画面感，像在写一篇短日记。只输出描述，不加标题。`;
}

export { SYSTEM_PROMPT };
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run tests/server/ai.test.ts`
Expected: All PASS

- [ ] **Step 6: Commit**

```bash
git add server/ai/ tests/server/ai.test.ts
git commit -m "feat: implement AI adapter layer with DeepSeek and prompt templates"
```

---

## Task 7: Server-Side Catch-Up Engine

**Files:**

- Create: `server/engine/tick.ts`, `server/engine/catch-up.ts`
- Test: `tests/engine/catch-up.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/engine/catch-up.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import { saveWorldState, getWorldState, getRecentEvents } from "../../server/db/queries";
import { performCatchUp } from "../../server/engine/catch-up";
import { tick } from "../../server/engine/tick";

describe("tick", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
  });

  afterEach(() => db.close());

  it("advances world state by one 15-min step", () => {
    saveWorldState(db, {
      gameDate: "1994-09-15",
      weather: "sunny",
      season: "autumn",
      lastVisit: "2026-03-23T08:00:00Z",
      calendarOffset: 0,
      randomSeed: 42,
    });
    const result = tick(db, {
      hour: 9,
      minute: 0,
      date: "1994-09-15",
      season: "autumn",
      period: "morning",
    });
    expect(result.event).toBeDefined();
  });
});

describe("performCatchUp", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
    saveWorldState(db, {
      gameDate: "1994-09-15",
      weather: "sunny",
      season: "autumn",
      lastVisit: "2026-03-23T08:00:00Z",
      calendarOffset: 0,
      randomSeed: 42,
    });
  });

  afterEach(() => db.close());

  it("processes correct number of ticks for short absence", () => {
    const result = performCatchUp(db, new Date("2026-03-23T09:00:00Z"));
    // 1 hour = 4 ticks
    expect(result.ticksProcessed).toBe(4);
    expect(result.events.length).toBeLessThanOrEqual(4);
  });

  it("uses coarse mode for long absence", () => {
    saveWorldState(db, {
      gameDate: "1994-09-15",
      weather: "sunny",
      season: "autumn",
      lastVisit: "2026-03-01T08:00:00Z",
      calendarOffset: 0,
      randomSeed: 42,
    });
    const result = performCatchUp(db, new Date("2026-03-23T08:00:00Z"));
    expect(result.coarseMode).toBe(true);
    expect(result.ticksProcessed).toBe(22); // 22 days
  });

  it("caps summary at 20 events", () => {
    saveWorldState(db, {
      gameDate: "1994-09-15",
      weather: "sunny",
      season: "autumn",
      lastVisit: "2026-03-01T08:00:00Z",
      calendarOffset: 0,
      randomSeed: 42,
    });
    const result = performCatchUp(db, new Date("2026-03-23T08:00:00Z"));
    expect(result.summary.length).toBeLessThanOrEqual(20);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/engine/catch-up.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement tick**

```ts
// server/engine/tick.ts
import type Database from "better-sqlite3";
import type { GameTime } from "../../src/engine/time";
import { EventEngine } from "../../src/engine/events";
import { getTriggeredEventIds, addEventLog } from "../db/queries";
import type { EventTemplate } from "../../src/data/event-pool";

interface TickResult {
  event: EventTemplate | null;
}

export function tick(db: Database.Database, gameTime: GameTime, seed?: number): TickResult {
  const triggeredIds = getTriggeredEventIds(db);
  const engine = new EventEngine(seed ?? Date.now());
  const event = engine.selectEvent(gameTime, triggeredIds);

  if (event) {
    addEventLog(db, {
      eventId: event.id,
      gameDate: gameTime.date,
      gameTime: `${String(gameTime.hour).padStart(2, "0")}:${String(gameTime.minute).padStart(2, "0")}`,
      type: event.type,
      involvedNpcs: "",
      description: event.description,
    });
  }

  return { event };
}
```

- [ ] **Step 4: Implement catch-up**

```ts
// server/engine/catch-up.ts
import type Database from "better-sqlite3";
import { TimeEngine } from "../../src/engine/time";
import { getWorldState, saveWorldState, getRecentEvents } from "../db/queries";
import { tick } from "./tick";

interface CatchUpResult {
  ticksProcessed: number;
  coarseMode: boolean;
  events: { id: string; description: string }[];
  summary: { id: string; description: string }[];
}

export function performCatchUp(db: Database.Database, now: Date): CatchUpResult {
  const worldState = getWorldState(db);
  if (!worldState) throw new Error("No world state found");

  const lastVisit = new Date(worldState.lastVisit);
  const timeEngine = new TimeEngine({
    calendarOffset: worldState.calendarOffset,
    gameStartDate: worldState.gameDate,
  });

  const coarseMode = timeEngine.isCoarseMode(lastVisit, now);
  const tickCount = timeEngine.getTickCount(lastVisit, now);
  const events: { id: string; description: string }[] = [];

  const catchUpTransaction = db.transaction(() => {
    let seed = worldState.randomSeed;

    for (let i = 0; i < tickCount; i++) {
      // Calculate game time for this tick
      const tickOffset = coarseMode
        ? i * 24 * 60 // day-level: 1 day per tick
        : i * 15; // 15-min per tick
      const tickTime = new Date(lastVisit.getTime() + tickOffset * 60 * 1000);
      const gameTime = timeEngine.getGameTime(tickTime);

      seed = (seed + i * 31) | 0; // deterministic seed progression
      const result = tick(db, gameTime, seed);

      if (result.event) {
        events.push({ id: result.event.id, description: result.event.description });
      }
    }

    // Update world state
    const finalGameTime = timeEngine.getGameTime(now);
    saveWorldState(db, {
      gameDate: finalGameTime.date,
      weather: worldState.weather, // TODO: weather changes
      season: finalGameTime.season,
      lastVisit: now.toISOString(),
      calendarOffset: worldState.calendarOffset,
      randomSeed: seed,
    });
  });

  catchUpTransaction();

  const summary = events.slice(-20);

  return {
    ticksProcessed: tickCount,
    coarseMode,
    events,
    summary,
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run tests/engine/catch-up.test.ts`
Expected: All PASS

- [ ] **Step 6: Commit**

```bash
git add server/engine/ tests/engine/catch-up.test.ts
git commit -m "feat: implement server-side catch-up engine with coarse mode"
```

---

## Task 8: Nitro API Endpoints

**Files:**

- Create: `server/api/world.get.ts`, `server/api/action.post.ts`, `server/api/skip.post.ts`, `server/api/dialogue.post.ts`
- Test: `tests/server/api.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/server/api.test.ts
import { describe, it, expect } from "vitest";

// API tests — these will be integration tests run against the Nitro dev server.
// For now, test the handler logic directly.
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import { saveWorldState } from "../../server/db/queries";
import { handleGetWorld } from "../../server/api/world.get";

describe("GET /api/world handler", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
    saveWorldState(db, {
      gameDate: "1994-09-15",
      weather: "sunny",
      season: "autumn",
      lastVisit: new Date().toISOString(),
      calendarOffset: 0,
      randomSeed: 42,
    });
  });

  afterEach(() => db.close());

  it("returns world state with current scene", () => {
    const result = handleGetWorld(db);
    expect(result.gameTime).toBeDefined();
    expect(result.gameTime.season).toBe("autumn");
    expect(result.npcs).toBeDefined();
    expect(result.events).toBeDefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/server/api.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement world.get handler**

```ts
// server/api/world.get.ts
import type Database from "better-sqlite3";
import { getDb } from "../db/connection";
import { getWorldState, getNpcState, getRecentEvents } from "../db/queries";
import { TimeEngine } from "../../src/engine/time";
import { performCatchUp } from "../engine/catch-up";
import { getScheduleEntry } from "../../src/engine/schedule";
import { npcs } from "../../src/data/npcs";

export function handleGetWorld(db: Database.Database) {
  const now = new Date();
  const catchUpResult = performCatchUp(db, now);
  const worldState = getWorldState(db)!;

  const timeEngine = new TimeEngine({
    calendarOffset: worldState.calendarOffset,
    gameStartDate: "1994-09-01",
  });
  const gameTime = timeEngine.getGameTime(now);
  const dayOfWeek = new Date(gameTime.date).getDay();
  const dayType = dayOfWeek === 0 || dayOfWeek === 6 ? "weekend" : "weekday";

  const npcStates = npcs.map((npc) => {
    const schedule = getScheduleEntry(
      npc,
      gameTime.hour,
      gameTime.minute,
      dayType as any,
      gameTime.season,
    );
    const dbState = getNpcState(db, npc.id);
    return {
      ...npc,
      ...schedule,
      mood: dbState?.mood ?? "neutral",
      affinity: dbState?.affinity ?? 50,
    };
  });

  return {
    gameTime,
    weather: worldState.weather,
    npcs: npcStates,
    events: catchUpResult.summary,
    coarseMode: catchUpResult.coarseMode,
  };
}

// Nitro event handler
export default defineEventHandler(() => {
  const db = getDb();
  return handleGetWorld(db);
});
```

- [ ] **Step 4: Implement skip.post and dialogue.post**

```ts
// server/api/skip.post.ts
import { getDb } from "../db/connection";
import { getWorldState, saveWorldState } from "../db/queries";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { type } = body; // 'day' | 'week' | 'semester'
  const db = getDb();
  const worldState = getWorldState(db);
  if (!worldState) throw createError({ statusCode: 500, message: "No world state" });

  const skipDays = type === "day" ? 1 : type === "week" ? 7 : 120;
  saveWorldState(db, {
    ...worldState,
    calendarOffset: worldState.calendarOffset + skipDays,
    lastVisit: new Date().toISOString(),
  });
  return { ok: true, skippedDays: skipDays };
});
```

```ts
// server/api/dialogue.post.ts
import { getDb } from "../db/connection";
import { createAiAdapter } from "../ai/adapter";
import { buildDialoguePrompt, SYSTEM_PROMPT } from "../ai/prompts";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { npcName, npcPersonality, situation, season, gameDate } = body;

  const adapter = createAiAdapter({
    model: process.env.AI_MODEL || "deepseek",
    apiKey: process.env.AI_API_KEY || "",
    baseUrl: process.env.AI_BASE_URL || "",
  });

  const prompt = buildDialoguePrompt({ npcName, npcPersonality, situation, season, gameDate });
  const dialogue = await adapter.generateText(prompt, SYSTEM_PROMPT);
  return { dialogue };
});
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `pnpm vitest run tests/server/api.test.ts`
Expected: All PASS

- [ ] **Step 6: Commit**

```bash
git add server/api/ tests/server/api.test.ts
git commit -m "feat: implement Nitro API endpoints for world state, skip, and dialogue"
```

---

## Task 9: Scene Renderer and Nostalgic Filter

**Files:**

- Create: `src/scene/renderer.ts`, `src/scene/scenes.ts`, `src/scene/filter.ts`
- Test: `tests/scene/filter.test.ts`

- [ ] **Step 1: Write failing tests for filter**

```ts
// tests/scene/filter.test.ts
import { describe, it, expect } from "vitest";
import { getNostalgiaFilterCSS, applyColorGrading } from "../../src/scene/filter";

describe("Nostalgic Filter", () => {
  it("returns CSS filter string", () => {
    const css = getNostalgiaFilterCSS();
    expect(css).toContain("sepia");
    expect(css).toContain("saturate");
  });

  it("applies color grading to pixel data", () => {
    // Create a small test image data
    const data = new Uint8ClampedArray([
      255,
      255,
      255,
      255, // white pixel
      0,
      0,
      0,
      255, // black pixel
    ]);
    applyColorGrading(data);
    // White should shift toward warm/yellow
    expect(data[0]).toBeGreaterThan(data[2]); // R > B after warm shift
    // Black should be lifted (not pure black)
    expect(data[4]).toBeGreaterThan(0); // R lifted
    expect(data[5]).toBeGreaterThan(0); // G lifted
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run tests/scene/filter.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement nostalgic filter**

```ts
// src/scene/filter.ts
export function getNostalgiaFilterCSS(): string {
  return "sepia(15%) saturate(65%) brightness(1.05) contrast(0.88) hue-rotate(-3deg)";
}

export function getVignetteGradient(): string {
  return "radial-gradient(ellipse at center, transparent 50%, rgba(58, 46, 34, 0.25) 100%)";
}

export function applyColorGrading(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i],
      g = data[i + 1],
      b = data[i + 2];

    // Lift blacks
    r = r * 0.85 + 48;
    g = g * 0.85 + 42;
    b = b * 0.85 + 38;

    // Desaturate
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const satMix = 0.6;
    r = lum + (r - lum) * satMix;
    g = lum + (g - lum) * satMix;
    b = lum + (b - lum) * satMix;

    // Warm shift highlights
    if (lum > 160) {
      r = Math.min(255, r + 8);
      g = Math.min(255, g + 4);
      b = Math.max(0, b - 3);
    }

    // Cool shift shadows
    if (lum < 80) {
      r = Math.max(0, r - 5);
      g = g + 2;
      b = b + 4;
    }

    data[i] = Math.min(255, Math.max(0, r));
    data[i + 1] = Math.min(255, Math.max(0, g));
    data[i + 2] = Math.min(255, Math.max(0, b));
  }
}
```

- [ ] **Step 4: Implement scene definitions**

```ts
// src/scene/scenes.ts
import type { Season, Period } from "../engine/time";

export interface ClickableArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type: "npc" | "object" | "exit";
}

export interface SceneDefinition {
  id: string;
  name: string;
  backgroundKey: string; // key to look up the correct bg image
  clickableAreas: ClickableArea[];
}

// MVP: only classroom scene
export const scenes: Record<string, SceneDefinition> = {
  classroom: {
    id: "classroom",
    name: "教室",
    backgroundKey: "classroom", // will resolve to classroom-{season}-{period}.png
    clickableAreas: [
      {
        id: "desk-xiaoming",
        x: 100,
        y: 200,
        width: 80,
        height: 60,
        label: "小明的座位",
        type: "npc",
      },
      {
        id: "desk-xiaohua",
        x: 200,
        y: 200,
        width: 80,
        height: 60,
        label: "小花的座位",
        type: "npc",
      },
      { id: "blackboard", x: 150, y: 50, width: 200, height: 100, label: "黑板", type: "object" },
      { id: "door", x: 0, y: 100, width: 40, height: 150, label: "门", type: "exit" },
      { id: "stove", x: 350, y: 180, width: 50, height: 50, label: "煤炉", type: "object" },
    ],
  },
};

export function getBackgroundKey(sceneId: string, season: Season, period: Period): string {
  return `${sceneId}-${season}-${period}`;
}
```

- [ ] **Step 5: Implement renderer**

```ts
// src/scene/renderer.ts
import type { ClickableArea, SceneDefinition } from "./scenes";
import { getNostalgiaFilterCSS, getVignetteGradient, applyColorGrading } from "./filter";

export class SceneRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentScene: SceneDefinition | null = null;
  private onAreaClick: ((area: ClickableArea) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.canvas.addEventListener("click", this.handleClick.bind(this));
  }

  setClickHandler(handler: (area: ClickableArea) => void): void {
    this.onAreaClick = handler;
  }

  async renderScene(scene: SceneDefinition, backgroundUrl: string): Promise<void> {
    this.currentScene = scene;
    const ctx = this.ctx;

    // Draw background placeholder (solid color for MVP)
    ctx.fillStyle = "#F5E6C8"; // aged paper background
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Try to load background image
    try {
      const img = await this.loadImage(backgroundUrl);
      ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
      // Apply nostalgic color grading
      const imageData = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      applyColorGrading(imageData.data);
      ctx.putImageData(imageData, 0, 0);
    } catch {
      // Fallback: draw simple scene with shapes
      this.drawPlaceholderScene(scene);
    }

    // Draw clickable area hints
    this.drawClickableAreas(scene.clickableAreas);
  }

  private drawPlaceholderScene(scene: SceneDefinition): void {
    const ctx = this.ctx;
    // Simple classroom placeholder
    ctx.fillStyle = "#D4C08E";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.fillStyle = "#6B5B4E";
    ctx.font = '24px "Source Han Serif SC", serif';
    ctx.textAlign = "center";
    ctx.fillText(scene.name, this.canvas.width / 2, 30);
  }

  private drawClickableAreas(areas: ClickableArea[]): void {
    const ctx = this.ctx;
    for (const area of areas) {
      ctx.strokeStyle = "rgba(196, 112, 106, 0.3)"; // faded red hint
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(area.x, area.y, area.width, area.height);

      ctx.fillStyle = "#5C6B7A";
      ctx.font = '11px "Source Han Serif SC", serif';
      ctx.textAlign = "center";
      ctx.fillText(area.label, area.x + area.width / 2, area.y + area.height + 14);
    }
    ctx.setLineDash([]);
  }

  private handleClick(e: MouseEvent): void {
    if (!this.currentScene || !this.onAreaClick) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const area of this.currentScene.clickableAreas) {
      if (x >= area.x && x <= area.x + area.width && y >= area.y && y <= area.y + area.height) {
        this.onAreaClick(area);
        return;
      }
    }
  }

  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  destroy(): void {
    this.canvas.removeEventListener("click", this.handleClick.bind(this));
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm vitest run tests/scene/filter.test.ts`
Expected: All PASS

- [ ] **Step 7: Commit**

```bash
git add src/scene/ tests/scene/
git commit -m "feat: implement scene renderer with nostalgic filter and clickable areas"
```

---

## Task 10: Vue Frontend Components

**Files:**

- Create: `src/components/GameCanvas.vue`, `src/components/DialogBox.vue`, `src/components/ChoicePanel.vue`, `src/components/EventSummary.vue`, `src/components/TimeControls.vue`
- Modify: `src/App.vue`
- Create: `src/api/client.ts`

- [ ] **Step 1: Implement API client**

```ts
// src/api/client.ts
const BASE_URL = "/api";

export async function fetchWorldState() {
  const res = await fetch(`${BASE_URL}/world`);
  return res.json();
}

export async function skipTime(type: "day" | "week" | "semester") {
  const res = await fetch(`${BASE_URL}/skip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });
  return res.json();
}

export async function generateDialogue(params: {
  npcName: string;
  npcPersonality: string;
  situation: string;
  season: string;
  gameDate: string;
}) {
  const res = await fetch(`${BASE_URL}/dialogue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}
```

- [ ] **Step 2: Implement GameCanvas.vue**

```vue
<!-- src/components/GameCanvas.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { SceneRenderer } from "../scene/renderer";
import { scenes, getBackgroundKey } from "../scene/scenes";
import type { ClickableArea } from "../scene/scenes";
import type { GameTime } from "../engine/time";

const props = defineProps<{
  gameTime: GameTime | null;
}>();

const emit = defineEmits<{
  areaClick: [area: ClickableArea];
}>();

const canvasRef = ref<HTMLCanvasElement>();
let renderer: SceneRenderer | null = null;

onMounted(() => {
  if (canvasRef.value) {
    renderer = new SceneRenderer(canvasRef.value);
    renderer.setClickHandler((area) => emit("areaClick", area));
    if (props.gameTime) renderCurrentScene();
  }
});

watch(
  () => props.gameTime,
  () => {
    if (props.gameTime) renderCurrentScene();
  },
);

function renderCurrentScene() {
  if (!renderer || !props.gameTime) return;
  const scene = scenes.classroom; // MVP: only classroom
  const bgKey = getBackgroundKey("classroom", props.gameTime.season, props.gameTime.period);
  renderer.renderScene(scene, `/assets/scenes/${bgKey}.png`);
}

onUnmounted(() => renderer?.destroy());
</script>

<template>
  <canvas ref="canvasRef" width="800" height="500" class="game-canvas" />
</template>

<style scoped>
.game-canvas {
  border: 2px solid #6b5b4e;
  border-radius: 4px;
  cursor: pointer;
  filter: v-bind("`${getNostalgiaFilterCSS()}`");
}
</style>
```

- [ ] **Step 3: Implement DialogBox.vue**

```vue
<!-- src/components/DialogBox.vue -->
<script setup lang="ts">
defineProps<{
  npcName: string;
  text: string;
  loading: boolean;
}>();

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div v-if="text || loading" class="dialog-box" @click="emit('close')">
    <div class="dialog-name">{{ npcName }}</div>
    <div class="dialog-text">
      <template v-if="loading">……</template>
      <template v-else>{{ text }}</template>
    </div>
    <div class="dialog-hint">点击关闭</div>
  </div>
</template>

<style scoped>
.dialog-box {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #f5e6c8;
  border: 2px solid #6b5b4e;
  border-radius: 6px;
  padding: 16px 24px;
  max-width: 600px;
  min-width: 300px;
  font-family: "Source Han Serif SC", serif;
  color: #3a3530;
  cursor: pointer;
}
.dialog-name {
  font-weight: bold;
  color: #c4706a;
  margin-bottom: 8px;
  font-size: 14px;
}
.dialog-text {
  font-size: 16px;
  line-height: 1.6;
}
.dialog-hint {
  font-size: 11px;
  color: #a8b8b0;
  text-align: right;
  margin-top: 8px;
}
</style>
```

- [ ] **Step 4: Implement ChoicePanel, EventSummary, TimeControls**

```vue
<!-- src/components/ChoicePanel.vue -->
<script setup lang="ts">
defineProps<{
  choices: { id: string; label: string }[];
}>();
const emit = defineEmits<{ choose: [id: string] }>();
</script>

<template>
  <div v-if="choices.length" class="choice-panel">
    <button v-for="c in choices" :key="c.id" class="choice-btn" @click="emit('choose', c.id)">
      {{ c.label }}
    </button>
  </div>
</template>

<style scoped>
.choice-panel {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
}
.choice-btn {
  background: #f5e6c8;
  border: 1px solid #6b5b4e;
  border-radius: 4px;
  padding: 8px 20px;
  font-family: "Source Han Serif SC", serif;
  font-size: 14px;
  color: #3a3530;
  cursor: pointer;
}
.choice-btn:hover {
  background: #d4c08e;
}
</style>
```

```vue
<!-- src/components/EventSummary.vue -->
<script setup lang="ts">
defineProps<{
  events: { id: string; description: string }[];
}>();
</script>

<template>
  <div v-if="events.length" class="event-summary">
    <h3>你不在的时候……</h3>
    <ul>
      <li v-for="e in events" :key="e.id">{{ e.description }}</li>
    </ul>
  </div>
</template>

<style scoped>
.event-summary {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(245, 230, 200, 0.92);
  border: 1px solid #6b5b4e;
  border-radius: 6px;
  padding: 12px 16px;
  max-width: 240px;
  max-height: 400px;
  overflow-y: auto;
  font-family: "Source Han Serif SC", serif;
  color: #3a3530;
  font-size: 13px;
}
h3 {
  font-size: 14px;
  margin: 0 0 8px;
  color: #c4706a;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  margin-bottom: 6px;
  line-height: 1.4;
}
li::before {
  content: "· ";
  color: #a8b8b0;
}
</style>
```

```vue
<!-- src/components/TimeControls.vue -->
<script setup lang="ts">
import type { GameTime } from "../engine/time";

defineProps<{ gameTime: GameTime | null }>();
const emit = defineEmits<{ skip: [type: "day" | "week" | "semester"] }>();

const seasonNames: Record<string, string> = {
  spring: "春",
  summer: "夏",
  autumn: "秋",
  winter: "冬",
};
</script>

<template>
  <div v-if="gameTime" class="time-controls">
    <div class="time-display">
      {{ gameTime.date }} {{ seasonNames[gameTime.season] }}
      {{ String(gameTime.hour).padStart(2, "0") }}:{{ String(gameTime.minute).padStart(2, "0") }}
    </div>
    <div class="skip-buttons">
      <button @click="emit('skip', 'day')">跳到明天</button>
      <button @click="emit('skip', 'week')">跳到下周</button>
      <button @click="emit('skip', 'semester')">跳到下学期</button>
    </div>
  </div>
</template>

<style scoped>
.time-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  text-align: right;
  font-family: "Source Han Serif SC", serif;
}
.time-display {
  color: #3a3530;
  font-size: 16px;
  margin-bottom: 8px;
}
.skip-buttons {
  display: flex;
  gap: 6px;
}
.skip-buttons button {
  background: rgba(245, 230, 200, 0.85);
  border: 1px solid #6b5b4e;
  border-radius: 3px;
  padding: 4px 10px;
  font-family: "Source Han Serif SC", serif;
  font-size: 12px;
  color: #5c6b7a;
  cursor: pointer;
}
.skip-buttons button:hover {
  background: #d4c08e;
}
</style>
```

- [ ] **Step 5: Wire up App.vue**

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import GameCanvas from "./components/GameCanvas.vue";
import DialogBox from "./components/DialogBox.vue";
import ChoicePanel from "./components/ChoicePanel.vue";
import EventSummary from "./components/EventSummary.vue";
import TimeControls from "./components/TimeControls.vue";
import { fetchWorldState, skipTime, generateDialogue } from "./api/client";
import type { GameTime } from "./engine/time";
import type { ClickableArea } from "./scene/scenes";
import { npcs } from "./data/npcs";

const gameTime = ref<GameTime | null>(null);
const events = ref<{ id: string; description: string }[]>([]);
const dialogNpc = ref("");
const dialogText = ref("");
const dialogLoading = ref(false);
const choices = ref<{ id: string; label: string }[]>([]);

async function loadWorld() {
  const data = await fetchWorldState();
  gameTime.value = data.gameTime;
  events.value = data.events || [];
}

async function handleAreaClick(area: ClickableArea) {
  if (area.type === "npc") {
    const npc = npcs.find((n) => area.id.includes(n.id.split("-")[1]));
    if (!npc || !gameTime.value) return;
    dialogNpc.value = npc.name;
    dialogLoading.value = true;
    dialogText.value = "";
    try {
      const { dialogue } = await generateDialogue({
        npcName: npc.name,
        npcPersonality: npc.personality,
        situation: `在教室里，当前是${gameTime.value.period === "morning" ? "上午" : "下午"}`,
        season: gameTime.value.season,
        gameDate: gameTime.value.date,
      });
      dialogText.value = dialogue;
    } catch {
      dialogText.value = "（沉默）";
    }
    dialogLoading.value = false;
  }
}

async function handleSkip(type: "day" | "week" | "semester") {
  await skipTime(type);
  await loadWorld();
}

onMounted(loadWorld);
</script>

<template>
  <div class="game-container">
    <GameCanvas :game-time="gameTime" @area-click="handleAreaClick" />
    <EventSummary :events="events" />
    <TimeControls :game-time="gameTime" @skip="handleSkip" />
    <ChoicePanel :choices="choices" />
    <DialogBox
      :npc-name="dialogNpc"
      :text="dialogText"
      :loading="dialogLoading"
      @close="
        dialogText = '';
        dialogNpc = '';
      "
    />
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap");

body {
  margin: 0;
  background: #3a3530;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.game-container {
  position: relative;
  width: 800px;
  height: 500px;
}
</style>
```

- [ ] **Step 6: Commit**

```bash
git add src/
git commit -m "feat: implement Vue frontend with game canvas, dialogue, events, and time controls"
```

---

## Task 11: Integration and First Run

- [ ] **Step 1: Initialize world state on first launch**

Add to `server/api/world.get.ts` — if no world state exists, create initial state:

```ts
// Add at top of handleGetWorld, before performCatchUp:
let worldState = getWorldState(db);
if (!worldState) {
  saveWorldState(db, {
    gameDate: "1994-09-01",
    weather: "sunny",
    season: "autumn",
    lastVisit: new Date().toISOString(),
    calendarOffset: 0,
    randomSeed: 42,
  });
}
```

- [ ] **Step 2: Configure Nitro in vite.config.ts**

```ts
// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

- [ ] **Step 3: Add dev scripts to package.json**

```json
{
  "scripts": {
    "dev": "vp dev",
    "dev:server": "nitro dev --port 3001",
    "build": "vp build",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Run all tests**

Run: `pnpm test`
Expected: All tests PASS

- [ ] **Step 5: Start dev server and verify manually**

Run: `pnpm dev` (in one terminal) and `pnpm dev:server` (in another)
Open: `http://localhost:5173`
Expected: See classroom scene with time display, clickable areas, event summary

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: wire up full stack — first playable MVP"
```

- [ ] **Step 7: Push to GitHub**

```bash
git push origin master
```
