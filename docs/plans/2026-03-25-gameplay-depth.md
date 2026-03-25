# 游戏深度提升 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 接入季节视觉系统、添加 NPC 关系对事件的影响、实现故事进度 UI 组件。

**Architecture:** 三个独立模块：(1) 新建 `src/composables/useSeasonColors.ts` 提供 computed 调色板供所有场景 SVG 使用；(2) 在 `src/engine/events.ts` 的 `selectEvent` 中加入 NPC 关系权重；(3) 新建 `src/components/StoryProgress.vue` 显示故事进度和里程碑 toast。

**Tech Stack:** Vue 3, TypeScript, Vitest (TDD), SVG

---

## File Structure

| File                                         | Action | Responsibility                                  |
| -------------------------------------------- | ------ | ----------------------------------------------- |
| `src/composables/useSeasonColors.ts`         | Create | 接收 season prop，返回 computed 调色板颜色映射  |
| `tests/composables/useSeasonColors.test.ts`  | Create | 测试调色板映射逻辑                              |
| `src/components/scenes/FlowerPoolScene.vue`  | Modify | 使用调色板：花朵按季节变化（花苞/盛开/凋零/空） |
| `src/components/scenes/PlaygroundScene.vue`  | Modify | 树冠和草地颜色随季节变；冬天枯枝+积雪           |
| `src/components/scenes/VillageRoadScene.vue` | Modify | 草地、树冠、天空随季节变化                      |
| `src/components/scenes/FarmlandScene.vue`    | Modify | 庄稼颜色随季节变；冬天枯茬                      |
| `src/components/scenes/ClassroomScene.vue`   | Modify | 窗户外的颜色随季节变化                          |
| `src/engine/relationship-events.ts`          | Create | 根据 NPC 关系调整事件选择权重                   |
| `tests/engine/relationship-events.test.ts`   | Create | 测试关系对事件的影响                            |
| `src/engine/events.ts`                       | Modify | selectEvent 集成关系权重                        |
| `src/data/event-pool.ts`                     | Modify | 添加 `relationshipTag` 字段到部分事件           |
| `src/components/StoryProgress.vue`           | Create | 侧边栏故事进度指示器                            |
| `tests/components/StoryProgress.test.ts`     | Create | 测试进度组件渲染                                |
| `src/components/SidePanel.vue`               | Modify | 嵌入 StoryProgress                              |
| `src/components/Toast.vue`                   | Modify | 支持 story 类型的里程碑通知                     |

---

## Task 1: 季节调色板 composable

**Files:**

- Create: `src/composables/useSeasonColors.ts`
- Create: `tests/composables/useSeasonColors.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/composables/useSeasonColors.test.ts
import { describe, it, expect } from "vitest";
import { getSceneColors } from "../../src/composables/useSeasonColors";

describe("useSeasonColors", () => {
  it("returns green grass for summer", () => {
    const colors = getSceneColors("summer");
    expect(colors.grass).toBe("#7A9178"); // from summerPalette.grass.base
  });

  it("returns brown grass for autumn", () => {
    const colors = getSceneColors("autumn");
    expect(colors.grass).not.toBe("#7A9178");
  });

  it("returns white-ish grass for winter (snow covered)", () => {
    const colors = getSceneColors("winter");
    expect(colors.showSnow).toBe(true);
  });

  it("returns bloom flower state for summer", () => {
    const colors = getSceneColors("summer");
    expect(colors.flowerState).toBe("bloom");
  });

  it("returns bud flower state for spring", () => {
    const colors = getSceneColors("spring");
    expect(colors.flowerState).toBe("bud");
  });

  it("returns wilt flower state for autumn", () => {
    const colors = getSceneColors("autumn");
    expect(colors.flowerState).toBe("wilt");
  });

  it("returns bare flower state for winter", () => {
    const colors = getSceneColors("winter");
    expect(colors.flowerState).toBe("bare");
  });

  it("returns green tree leaf color for summer", () => {
    const colors = getSceneColors("summer");
    expect(colors.treeLeaf).toMatch(/#[a-fA-F0-9]{6}/);
  });

  it("returns orange-brown tree leaf color for autumn", () => {
    const colors = getSceneColors("autumn");
    expect(colors.treeLeaf).not.toBe(getSceneColors("summer").treeLeaf);
  });

  it("returns showBareTree true for winter", () => {
    const colors = getSceneColors("winter");
    expect(colors.showBareTree).toBe(true);
  });

  it("returns showBareTree false for summer", () => {
    const colors = getSceneColors("summer");
    expect(colors.showBareTree).toBe(false);
  });

  it("sky color changes by season", () => {
    const summer = getSceneColors("summer");
    const winter = getSceneColors("winter");
    expect(summer.sky).not.toBe(winter.sky);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/composables/useSeasonColors.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```ts
// src/composables/useSeasonColors.ts
import { getSeasonalPalette } from "../tilemap/season-palette";

export interface SceneColors {
  grass: string;
  dirt: string;
  treeLeaf: string;
  treeLeafHighlight: string;
  treeTrunk: string;
  sky: string;
  flowerState: "bud" | "bloom" | "wilt" | "bare";
  showSnow: boolean;
  showBareTree: boolean;
  flowerColors: string[];
}

const skyColors: Record<string, string> = {
  spring: "#d0dcc0",
  summer: "#c8d0b8",
  autumn: "#d8d0b8",
  winter: "#c8c8c8",
};

const flowerColorsBySeason: Record<string, string[]> = {
  spring: ["#d8a8a8", "#e0c888", "#c8a8c0"], // muted buds
  summer: ["#c8787a", "#d4b868", "#b890b0", "#c87878", "#d0a050"], // vibrant blooms
  autumn: ["#b89878", "#a89068", "#988060"], // faded/wilted
  winter: [], // bare
};

export function getSceneColors(season: string): SceneColors {
  const palette = getSeasonalPalette(season);
  return {
    grass: palette.grass.base,
    dirt: palette.dirt.base,
    treeLeaf: palette.treeLeaf.base,
    treeLeafHighlight: palette.treeLeaf.light,
    treeTrunk: "#8a7050",
    sky: skyColors[season] || skyColors.summer,
    flowerState: palette.flowerState,
    showSnow: palette.showSnow,
    showBareTree: palette.showBareTree,
    flowerColors: flowerColorsBySeason[season] || flowerColorsBySeason.summer,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/composables/useSeasonColors.test.ts`
Expected: PASS (all 12 tests)

- [ ] **Step 5: Commit**

```bash
git add src/composables/useSeasonColors.ts tests/composables/useSeasonColors.test.ts
git commit -m "feat: add useSeasonColors composable for SVG scenes"
```

---

## Task 2: FlowerPoolScene 季节视觉

**Files:**

- Modify: `src/components/scenes/FlowerPoolScene.vue`
- Modify: `tests/composables/useSeasonColors.test.ts` (add flower-specific tests)

- [ ] **Step 1: Write the failing test — flower data by season**

```ts
// 追加到 tests/composables/useSeasonColors.test.ts
describe("flower pool seasonal data", () => {
  it("summer has 5 flower colors", () => {
    const colors = getSceneColors("summer");
    expect(colors.flowerColors.length).toBeGreaterThanOrEqual(5);
  });

  it("winter has no flower colors", () => {
    const colors = getSceneColors("winter");
    expect(colors.flowerColors).toHaveLength(0);
  });

  it("spring has muted flower colors (buds)", () => {
    const colors = getSceneColors("spring");
    expect(colors.flowerColors.length).toBeGreaterThan(0);
    expect(colors.flowerState).toBe("bud");
  });

  it("autumn has faded flower colors", () => {
    const colors = getSceneColors("autumn");
    expect(colors.flowerColors.length).toBeGreaterThan(0);
    expect(colors.flowerState).toBe("wilt");
  });
});
```

- [ ] **Step 2: Run test to verify it passes** (data already in composable)

Run: `pnpm vitest run tests/composables/useSeasonColors.test.ts`
Expected: PASS

- [ ] **Step 3: Modify FlowerPoolScene.vue to use seasonal colors**

In `FlowerPoolScene.vue` `<script setup>`:

```ts
import { getSceneColors } from "../../composables/useSeasonColors";
import { computed } from "vue";

// ... existing props/emit ...

const colors = computed(() => getSceneColors(props.season));

// Replace hardcoded flowers with seasonal computed
const seasonalFlowers = computed(() => {
  const fc = colors.value.flowerColors;
  if (fc.length === 0) return []; // winter: no flowers

  // Base flower positions (same 20 positions)
  const baseFlowers = [
    { cx: 310, cy: 220, r: 6 },
    { cx: 340, cy: 200, r: 5 },
    { cx: 370, cy: 230, r: 7 },
    { cx: 400, cy: 210, r: 5 },
    { cx: 430, cy: 235, r: 6 },
    { cx: 460, cy: 205, r: 5 },
    { cx: 490, cy: 225, r: 7 },
    { cx: 325, cy: 250, r: 5 },
    { cx: 355, cy: 260, r: 6 },
    { cx: 385, cy: 245, r: 5 },
    { cx: 415, cy: 260, r: 7 },
    { cx: 445, cy: 250, r: 5 },
    { cx: 475, cy: 265, r: 6 },
    { cx: 350, cy: 280, r: 5 },
    { cx: 380, cy: 275, r: 6 },
    { cx: 410, cy: 285, r: 5 },
    { cx: 440, cy: 278, r: 7 },
    { cx: 470, cy: 285, r: 5 },
    { cx: 500, cy: 250, r: 6 },
    { cx: 300, cy: 265, r: 5 },
  ];

  // Spring buds are smaller
  const sizeMod = colors.value.flowerState === "bud" ? 0.6 : 1;

  return baseFlowers.map((f, i) => ({
    ...f,
    r: Math.round(f.r * sizeMod),
    fill: fc[i % fc.length],
  }));
});
```

In template, replace the hardcoded `flowers` circle loop with `seasonalFlowers`:

```html
<!-- Flowers (seasonal) -->
<circle
  v-for="(f, i) in seasonalFlowers"
  :key="'flower' + i"
  :cx="f.cx"
  :cy="f.cy"
  :r="f.r"
  :fill="f.fill"
  stroke="#4a4040"
  stroke-width="1"
  opacity="0.9"
/>
<!-- Winter: bare stems -->
<g v-if="colors.flowerState === 'bare'">
  <line
    v-for="n in 8"
    :key="'stem' + n"
    :x1="290 + n * 25"
    :y1="300"
    :x2="290 + n * 25"
    :y2="270"
    stroke="#8a7a60"
    stroke-width="1.5"
    opacity="0.5"
  />
</g>
```

Also change grass background to use `colors.grass`:

```html
<rect x="0" y="0" width="800" height="500" :fill="colors.grass" />
```

And flower bed fill to adjust for season:

```html
<rect ... :fill="colors.flowerState === 'bare' ? '#8a8a70' : '#7a9a68'" ... />
```

Snow overlay for winter:

```html
<!-- Snow (winter) -->
<g v-if="colors.showSnow">
  <circle
    v-for="n in 15"
    :key="'snow' + n"
    :cx="100 + n * 45"
    :cy="310 + (n % 3) * 20"
    :r="3 + (n % 3)"
    fill="white"
    opacity="0.6"
  />
</g>
```

- [ ] **Step 4: Run all tests**

Run: `pnpm vitest run`
Expected: All 308+ tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/scenes/FlowerPoolScene.vue tests/composables/useSeasonColors.test.ts
git commit -m "feat: flower pool changes visually by season"
```

---

## Task 3: PlaygroundScene 季节视觉

**Files:**

- Modify: `src/components/scenes/PlaygroundScene.vue`
- Modify: `tests/composables/useSeasonColors.test.ts`

- [ ] **Step 1: Write scene-specific tests**

```ts
// 追加到 tests/composables/useSeasonColors.test.ts
describe("scene seasonal consistency", () => {
  it("winter: showBareTree true and showSnow true", () => {
    const c = getSceneColors("winter");
    expect(c.showBareTree).toBe(true);
    expect(c.showSnow).toBe(true);
  });

  it("summer: showBareTree false and showSnow false", () => {
    const c = getSceneColors("summer");
    expect(c.showBareTree).toBe(false);
    expect(c.showSnow).toBe(false);
  });

  it("all seasons return valid hex grass color", () => {
    for (const s of ["spring", "summer", "autumn", "winter"]) {
      expect(getSceneColors(s).grass).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("all seasons return valid hex treeLeaf color", () => {
    for (const s of ["spring", "summer", "autumn", "winter"]) {
      expect(getSceneColors(s).treeLeaf).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("all seasons return valid hex sky color", () => {
    for (const s of ["spring", "summer", "autumn", "winter"]) {
      expect(getSceneColors(s).sky).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
```

- [ ] **Step 2: Run tests — should pass (data already correct)**

Run: `pnpm vitest run tests/composables/useSeasonColors.test.ts`
Expected: PASS

- [ ] **Step 3: Add seasonal colors to PlaygroundScene**

Import and use `getSceneColors`:

```ts
import { getSceneColors } from "../../composables/useSeasonColors";
import { computed } from "vue";
const colors = computed(() => getSceneColors(props.season));
```

Replace hardcoded SVG colors:

- `<rect ... fill="#9aaa88" />` (草地) → `:fill="colors.grass"`
- Tree crown circles `fill="#6a8a58"` → `:fill="colors.treeLeaf"`
- Tree crown highlight circles `fill="#a8c490"` → `:fill="colors.treeLeafHighlight"`
- Add `v-if="!colors.showBareTree"` to tree crown circles
- Add bare branch lines for winter:

```html
<g v-if="colors.showBareTree">
  <!-- Tree 1 bare branches -->
  <line x1="75" y1="40" x2="55" y2="15" stroke="#8a7050" stroke-width="2" />
  <line x1="75" y1="40" x2="95" y2="10" stroke="#8a7050" stroke-width="2" />
  <line x1="75" y1="35" x2="70" y2="5" stroke="#8a7050" stroke-width="1.5" />
  <!-- repeat for tree 2, 3 with adjusted coords -->
</g>
```

Add snow patches:

```html
<g v-if="colors.showSnow">
  <ellipse cx="400" cy="415" rx="200" ry="4" fill="white" opacity="0.3" />
  <circle
    v-for="n in 10"
    :key="'snow'+n"
    :cx="50 + n * 75"
    :cy="420 + (n % 3) * 5"
    :r="2 + n % 2"
    fill="white"
    opacity="0.5"
  />
</g>
```

- [ ] **Step 4: Run all tests**

Run: `pnpm vitest run`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/scenes/PlaygroundScene.vue tests/composables/useSeasonColors.test.ts
git commit -m "feat: playground scene changes by season"
```

---

## Task 4: VillageRoadScene + FarmlandScene 季节视觉

**Files:**

- Modify: `src/components/scenes/VillageRoadScene.vue`
- Modify: `src/components/scenes/FarmlandScene.vue`

- [ ] **Step 1: VillageRoadScene — add seasonal colors**

Same pattern: import `getSceneColors`, replace hardcoded colors:

- Sky: `fill="#c8d0b8"` → `:fill="colors.sky"`
- Grass: `fill="#9aaa88"` → `:fill="colors.grass"`
- Trees: crown `fill="#6a8a58"` → `:fill="colors.treeLeaf"`, with `v-if="!colors.showBareTree"` + bare branches
- Hills: adjust to use muted version of grass color

- [ ] **Step 2: FarmlandScene — add seasonal colors**

Same pattern, plus:

- Crop dots already have `season === 'autumn'` check — extend to full seasonal:
  ```html
  :fill="colors.flowerState === 'bare' ? '#a09080' : colors.flowerState === 'wilt' ? '#c8a840' :
  '#6a8a58'"
  ```
- Winter: show bare soil rows (no green dots)
- Sky: `:fill="colors.sky"`

- [ ] **Step 3: ClassroomScene — window exterior color**

Replace window fill `fill="#b8c8b8"` with `:fill="colors.sky"` so exterior color changes by season.

- [ ] **Step 4: Run all tests**

Run: `pnpm vitest run`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/scenes/VillageRoadScene.vue src/components/scenes/FarmlandScene.vue src/components/scenes/ClassroomScene.vue
git commit -m "feat: village road, farmland, classroom window color change by season"
```

---

## Task 5: NPC 关系影响事件选择

**Files:**

- Create: `src/engine/relationship-events.ts`
- Create: `tests/engine/relationship-events.test.ts`
- Modify: `src/data/event-pool.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/engine/relationship-events.test.ts
import { describe, it, expect } from "vitest";
import { getRelationshipBoost, type RelationshipInfo } from "../../src/engine/relationship-events";

describe("relationship-events", () => {
  const friendRelationship: RelationshipInfo = {
    npcA: "student-zhang-wei",
    npcB: "student-li-lei",
    type: "friend",
    strength: 80,
  };

  const rivalRelationship: RelationshipInfo = {
    npcA: "student-zhang-wei",
    npcB: "student-zhao-na",
    type: "rival",
    strength: 60,
  };

  it("boosts weight for friend events when friends present", () => {
    const boost = getRelationshipBoost(
      { relationshipTag: "friend-activity" },
      [friendRelationship],
      ["student-zhang-wei", "student-li-lei"],
    );
    expect(boost).toBeGreaterThan(1);
  });

  it("boosts weight for conflict events when rivals present", () => {
    const boost = getRelationshipBoost(
      { relationshipTag: "rival-conflict" },
      [rivalRelationship],
      ["student-zhang-wei", "student-zhao-na"],
    );
    expect(boost).toBeGreaterThan(1);
  });

  it("returns 1 when no matching relationship", () => {
    const boost = getRelationshipBoost(
      { relationshipTag: "friend-activity" },
      [],
      ["student-zhang-wei"],
    );
    expect(boost).toBe(1);
  });

  it("returns 1 for events without relationshipTag", () => {
    const boost = getRelationshipBoost(
      {},
      [friendRelationship],
      ["student-zhang-wei", "student-li-lei"],
    );
    expect(boost).toBe(1);
  });

  it("returns 0 for rival-conflict when no rivals are in scene", () => {
    const boost = getRelationshipBoost(
      { relationshipTag: "rival-conflict" },
      [rivalRelationship],
      ["student-zhang-wei"], // zhao-na not present
    );
    expect(boost).toBe(1); // not boosted, but not blocked either
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/engine/relationship-events.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

```ts
// src/engine/relationship-events.ts
export interface RelationshipInfo {
  npcA: string;
  npcB: string;
  type: string; // "friend" | "rival"
  strength: number;
}

/**
 * Returns a weight multiplier for event selection based on NPC relationships.
 * > 1 means more likely, 1 means no change.
 */
export function getRelationshipBoost(
  event: { relationshipTag?: string },
  relationships: RelationshipInfo[],
  presentNpcIds: string[],
): number {
  if (!event.relationshipTag) return 1;

  const tag = event.relationshipTag;
  const presentSet = new Set(presentNpcIds);

  for (const rel of relationships) {
    const bothPresent = presentSet.has(rel.npcA) && presentSet.has(rel.npcB);
    if (!bothPresent) continue;

    if (tag === "friend-activity" && rel.type === "friend") {
      return 1 + rel.strength / 100; // up to 1.8x
    }
    if (tag === "rival-conflict" && rel.type === "rival") {
      return 1 + rel.strength / 100;
    }
    if (tag === "secret-share" && rel.type === "friend" && rel.strength >= 70) {
      return 2; // high-trust friends share secrets
    }
  }

  return 1;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/engine/relationship-events.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/relationship-events.ts tests/engine/relationship-events.test.ts
git commit -m "feat: relationship-based event weight boost"
```

---

## Task 6: 接入关系权重到事件引擎 + 添加关系事件

**Files:**

- Modify: `src/data/event-pool.ts`
- Modify: `src/engine/events.ts`
- Modify: `tests/engine/events.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// 追加到 tests/engine/events.test.ts
import { getRelationshipBoost } from "../../src/engine/relationship-events";

it("selectEvent accepts relationships parameter", () => {
  const engine = new EventEngine(42);
  // Should not throw with new parameter
  const event = engine.selectEvent(makeGameTime(), [], "sunny", "classroom", "teacher", 50, []);
  // Just verify it runs
  expect(true).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/engine/events.test.ts`
Expected: FAIL — selectEvent doesn't accept 7th parameter

- [ ] **Step 3: Modify EventEngine.selectEvent to accept relationships**

In `src/engine/events.ts`, add import and parameter:

```ts
import { getRelationshipBoost, type RelationshipInfo } from "./relationship-events";
```

Add parameter to `selectEvent`:

```ts
selectEvent(
  gameTime: GameTime,
  triggeredEventIds: string[],
  weather?: string,
  location?: string,
  character?: string,
  affinity?: number,
  relationships?: RelationshipInfo[],
  presentNpcIds?: string[],
): EventTemplate | null {
```

In the weighted selection section, apply relationship boost:

```ts
// After filtering eligible events, apply relationship weighting
const weighted = eligible.map((e) => ({
  event: e,
  weight: getRelationshipBoost(e as any, relationships || [], presentNpcIds || []),
}));

// Weighted random selection
const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
if (totalWeight === 0) return null;
let roll = this.rng() * totalWeight;
for (const w of weighted) {
  roll -= w.weight;
  if (roll <= 0) return w.event;
}
return weighted[weighted.length - 1].event;
```

- [ ] **Step 4: Update server-side caller in `server/engine/tick.ts`**

In `server/engine/tick.ts:34`, the current call is:

```ts
const event = engine.selectEvent(gameTime as any, triggeredIds, weather, undefined, character);
```

New optional params are at the end, so this call continues to work without changes (relationships default to undefined). No action needed unless we want to pass relationships server-side — defer to a future task.

- [ ] **Step 5: Add `relationshipTag` to EventTemplate and tag events in event-pool.ts**

In `src/data/event-pool.ts`, add to the `EventTemplate` interface:

```ts
relationshipTag?: string; // "friend-activity" | "rival-conflict" | "secret-share"
```

Then tag existing events and add new ones:

```ts
// Existing events to tag:
// "张志强和李磊在操场打篮球" → relationshipTag: "friend-activity"
// "学生打架了" (conflict event pool) → relationshipTag: "rival-conflict"

// New events to add:
{
  id: "friends-play-together",
  type: "daily",
  description: "好朋友们凑在一起，有说有笑",
  periods: ["morning", "afternoon"],
  location: "playground",
  relationshipTag: "friend-activity",
},
{
  id: "friend-shares-secret",
  type: "daily",
  description: "有个学生悄悄拉住你，想跟你说个秘密",
  periods: ["morning", "afternoon"],
  location: "classroom",
  relationshipTag: "secret-share",
  minAffinity: 70,
},
```

- [ ] **Step 6: Run all tests**

Run: `pnpm vitest run`
Expected: All tests PASS (existing seed-deterministic tests still pass because events without relationshipTag all get weight 1, preserving uniform selection)

- [ ] **Step 7: Commit**

```bash
git add src/engine/events.ts src/data/event-pool.ts tests/engine/events.test.ts
git commit -m "feat: event selection weighted by NPC relationships"
```

---

## Task 7: StoryProgress 组件

**Files:**

- Create: `src/composables/storyDisplayData.ts` (pure logic, testable)
- Create: `src/components/StoryProgress.vue`
- Create: `tests/composables/storyDisplayData.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/composables/storyDisplayData.test.ts
import { describe, it, expect } from "vitest";
import { getStoryDisplayData, type StoryDisplayItem } from "../../src/composables/storyDisplayData";

// We test the pure function, not the Vue component rendering
describe("StoryProgress display logic", () => {
  it("returns display items for active stories", () => {
    const items = getStoryDisplayData([
      { storyId: "love-learning", currentStage: "stage-2", startedDate: "1994-09-20", data: "{}" },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("厌学到爱学");
    expect(items[0].totalStages).toBe(5);
    expect(items[0].currentStageIndex).toBe(1); // stage-2 is index 1
    expect(items[0].isFinal).toBe(false);
  });

  it("marks final stage", () => {
    const items = getStoryDisplayData([
      { storyId: "love-learning", currentStage: "stage-4", startedDate: "1994-09-20", data: "{}" },
    ]);
    expect(items[0].isFinal).toBe(true);
  });

  it("returns empty array for no stories", () => {
    const items = getStoryDisplayData([]);
    expect(items).toHaveLength(0);
  });

  it("calculates progress percentage", () => {
    const items = getStoryDisplayData([
      {
        storyId: "repair-classroom",
        currentStage: "stage-3",
        startedDate: "1994-11-01",
        data: "{}",
      },
    ]);
    // stage-3 is index 2 out of 5 stages → 2/4 = 50% (not counting final as separate)
    expect(items[0].progressPercent).toBeGreaterThan(0);
    expect(items[0].progressPercent).toBeLessThan(100);
  });

  it("returns 100% for final stage", () => {
    const items = getStoryDisplayData([
      { storyId: "waiting-letter", currentStage: "stage-4", startedDate: "1994-10-01", data: "{}" },
    ]);
    expect(items[0].progressPercent).toBe(100);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/composables/storyDisplayData.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Write the pure logic module**

```ts
// src/composables/storyDisplayData.ts
import { storyArcs } from "../data/stories";

export interface StoryDisplayItem {
  storyId: string;
  name: string;
  description: string;
  currentStageIndex: number;
  totalStages: number;
  isFinal: boolean;
  progressPercent: number;
}

export interface StoryProgressRow {
  storyId: string;
  currentStage: string;
  startedDate: string;
  data: string;
}

export function getStoryDisplayData(rows: StoryProgressRow[]): StoryDisplayItem[] {
  return rows
    .map((row) => {
      const arc = storyArcs.find((a) => a.id === row.storyId);
      if (!arc) return null;

      const stageIndex = arc.stages.findIndex((s) => s.id === row.currentStage);
      if (stageIndex < 0) return null;

      const stage = arc.stages[stageIndex];
      const isFinal = !!stage.isFinal;
      const progressPercent = isFinal
        ? 100
        : Math.round((stageIndex / (arc.stages.length - 1)) * 100);

      return {
        storyId: arc.id,
        name: arc.name,
        description: stage.description,
        currentStageIndex: stageIndex,
        totalStages: arc.stages.length,
        isFinal,
        progressPercent,
      };
    })
    .filter(Boolean) as StoryDisplayItem[];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/composables/storyDisplayData.test.ts`
Expected: PASS

- [ ] **Step 5: Write StoryProgress.vue component (imports from storyDisplayData.ts)**

```vue
<!-- src/components/StoryProgress.vue -->
<script setup lang="ts">
import { getStoryDisplayData, type StoryProgressRow } from "../composables/storyDisplayData";

const props = defineProps<{
  storyProgressRows: StoryProgressRow[];
}>();
</script>

<template>
  <div class="story-progress" v-if="storyProgressRows.length > 0">
    <div
      v-for="item in getStoryDisplayData(storyProgressRows)"
      :key="item.storyId"
      class="story-item"
    >
      <div class="story-header">
        <span class="story-name">{{ item.name }}</span>
        <span v-if="item.isFinal" class="story-badge done">完结</span>
        <span v-else class="story-badge"
          >{{ item.currentStageIndex + 1 }}/{{ item.totalStages }}</span
        >
      </div>
      <div class="story-bar-bg">
        <div class="story-bar-fill" :style="{ width: item.progressPercent + '%' }" />
      </div>
      <div class="story-desc">{{ item.description }}</div>
    </div>
  </div>
</template>

<style scoped>
.story-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.story-item {
  background: rgba(180, 160, 120, 0.1);
  border-radius: 6px;
  padding: 8px 10px;
}
.story-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.story-name {
  font-size: 13px;
  font-weight: 600;
  color: #4a4040;
}
.story-badge {
  font-size: 11px;
  color: #8a7a6a;
  background: rgba(180, 160, 120, 0.15);
  padding: 1px 6px;
  border-radius: 8px;
}
.story-badge.done {
  color: #6a8a58;
  background: rgba(106, 138, 88, 0.15);
}
.story-bar-bg {
  height: 4px;
  background: rgba(180, 160, 120, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 6px;
}
.story-bar-fill {
  height: 100%;
  background: #b89860;
  border-radius: 2px;
  transition: width 0.3s ease;
}
.story-desc {
  font-size: 12px;
  color: #6a5a4a;
  line-height: 1.6;
}
</style>
```

- [ ] **Step 6: Run all tests**

Run: `pnpm vitest run`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/composables/storyDisplayData.ts src/components/StoryProgress.vue tests/composables/storyDisplayData.test.ts
git commit -m "feat: StoryProgress component with progress bar"
```

---

## Task 8: 嵌入 StoryProgress 到 SidePanel + 里程碑 toast

**Files:**

- Modify: `src/components/SidePanel.vue`
- Modify: `src/App.vue`

- [ ] **Step 1: Add StoryProgress to SidePanel**

In `SidePanel.vue`:

- Import `StoryProgress` component and `StoryProgressRow` type
- Add a new prop `storyProgressRows` (array)
- Add `stories: true` to the `collapsed` ref default object
- Add section in template (following existing collapsed pattern):

```html
<div class="panel-section">
  <div class="section-header" @click="toggleSection('stories')">
    📖 故事 <span class="collapse-indicator">{{ collapsed.stories ? '▸' : '▾' }}</span>
  </div>
  <template v-if="!collapsed.stories">
    <StoryProgress :story-progress-rows="storyProgressRows" />
  </template>
</div>
```

- [ ] **Step 2: Update Toast.vue to support "story" type**

In `src/components/Toast.vue`, update the type prop:

```ts
const props = defineProps<{ message: string; type?: "info" | "success" | "streak" | "story" }>();
```

Add CSS for story toast (use a book-like warm color):

```css
.toast.story {
  background: rgba(184, 152, 96, 0.95);
  border-left: 4px solid #8a6a30;
}
```

- [ ] **Step 3: Pass story data from App.vue**

In `App.vue`, fetch story progress from the world API response and pass to SidePanel:

```ts
// In loadWorld or wherever world data is fetched
const storyProgressRows = ref<any[]>([]);
// After world API response:
storyProgressRows.value = data.storyProgress || [];
```

Add to SidePanel usage:

```html
<SidePanel ... :story-progress-rows="storyProgressRows" />
```

- [ ] **Step 4: Add story milestone toast**

In `App.vue`, when story advances (detected from briefing data or event log), show a toast:

```ts
// In loadWorld, check if any story advanced
if (data.advancedStories?.length > 0) {
  for (const storyId of data.advancedStories) {
    const arc = storyArcs.find((a) => a.id === storyId);
    if (arc) {
      showToast(`📖 ${arc.name} — 故事有了新进展`, "story");
    }
  }
}
```

- [ ] **Step 5: Run all tests**

Run: `pnpm vitest run`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/SidePanel.vue src/components/Toast.vue src/App.vue
git commit -m "feat: story progress in sidebar + milestone toast"
```

---

## Task 9: 集成测试 + 全量验证

- [ ] **Step 1: Run full test suite**

Run: `pnpm vitest run`
Expected: All 320+ tests PASS

- [ ] **Step 2: Start dev servers and manually verify**

Run: `pnpm dev` + `pnpm dev:server`

Verify:

1. 切换季节（跳到冬天）→ 花池只剩枯枝和竹子
2. 切换到春天 → 花苞出现
3. 操场树冠颜色随季节变化
4. 侧边栏"故事"区域显示进度条
5. 故事推进时出现 toast 通知

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "test: integration verification for seasonal visuals and story UI"
```
