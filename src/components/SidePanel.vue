<script setup lang="ts">
import type { GameTime } from "../engine/time";
import { getConnectedLocations, getLocation } from "../data/locations";
import RelationshipPanel from "./RelationshipPanel.vue";
import StatsPanel from "./StatsPanel.vue";

const props = defineProps<{
  gameTime: GameTime | null;
  weather: string;
  currentScene: string;
  activeCharacter: string;
  events: { id: string; description: string }[];
  todos: { id: number; title: string; priority: string; location: string; actionType: string }[];
  npcs: { id: string; name: string; role: string; mood: string; affinity: number }[];
  mission: {
    id: string;
    title: string;
    description: string;
    targetLocation: string;
    status: string;
  } | null;
  stats: {
    streakDays: number;
    totalDaysPlayed: number;
    missionsCompleted: number;
    npcsTalked: number;
    giftsReceived: number;
  } | null;
  inventory?: { itemType: string; quantity: number }[];
}>();

const itemIcons: Record<string, string> = {
  chalk: "\uD83D\uDD8D",
  notebook: "\uD83D\uDCD3",
  apple: "\uD83C\uDF4E",
  letter: "\u2709",
};

const emit = defineEmits<{
  navigate: [locationId: string];
  switchCharacter: [character: string];
  skip: [type: "day" | "week" | "semester"];
}>();

const seasonNames: Record<string, string> = {
  spring: "春",
  summer: "夏",
  autumn: "秋",
  winter: "冬",
};
const weatherNames: Record<string, string> = {
  sunny: "☀ 晴",
  cloudy: "☁ 阴",
  rainy: "🌧 雨",
  snowy: "❄ 雪",
  windy: "🌬 风",
};
const locationNames: Record<string, string> = {
  classroom: "教室",
  office: "办公室",
  playground: "操场",
  "flower-pool": "花池",
  "water-tower": "水塔",
  "village-road": "村路",
  farmland: "农田",
  "villager-house": "村民家",
  "town-road": "镇上",
  "post-office": "邮局",
  market: "集市",
  clinic: "卫生所",
  "home-zhang": "张志强家",
  "home-wang": "王芳家",
  "home-li": "李磊家",
  "home-zhao": "赵春燕家",
  "home-zhu": "朱小龙家",
};

// Collapsible sidebar sections
import { computed, ref } from "vue";

const collapsed = ref<Record<string, boolean>>({
  events: true,
  todos: false,
  navigation: false,
  relationships: true,
  stats: true,
});

function toggleSection(key: string) {
  collapsed.value[key] = !collapsed.value[key];
}

// Ambient atmosphere text — makes the world feel alive

const ambientText = computed(() => {
  if (!props.gameTime) return "";
  const h = props.gameTime.hour;
  const s = props.gameTime.season;
  const w = props.weather;
  const p = props.gameTime.period;

  // Season + weather combos
  if (s === "summer" && w === "sunny" && p === "afternoon")
    return "太阳晒得地面发烫，知了叫个不停。";
  if (s === "summer" && w === "rainy") return "夏天的雨来得急，噼里啪啦打在屋顶上。";
  if (s === "winter" && w === "snowy") return "雪花飘飘洒洒，校园白了一层。";
  if (s === "winter" && w === "sunny") return "冬天的太阳暖洋洋的，但风还是冷。";
  if (s === "winter" && p === "morning") return "早上出门哈气成雾，手脚冻得发僵。";
  if (s === "spring" && w === "rainy") return "春雨绵绵，空气里有泥土的味道。";
  if (s === "spring" && p === "morning") return "柳树发了新芽，一切都在苏醒。";
  if (s === "autumn" && w === "windy") return "秋风吹过，黄叶在操场上打转。";
  if (s === "autumn" && p === "afternoon") return "秋天的下午，阳光透过窗户暖暖的。";

  // Time-based
  if (p === "night") return "村子安静下来了，远处偶尔传来几声狗叫。";
  if (p === "evening") return "夕阳西下，炊烟从各家烟囱升起。";
  if (h >= 7 && h < 8) return "早读的声音从教室传出来，书声琅琅。";
  if (h >= 12 && h < 13) return "中午了，空气里飘着饭菜的香味。";

  // Weather fallbacks
  if (w === "rainy") return "雨淅淅沥沥地下着，路上有些泥泞。";
  if (w === "cloudy") return "天阴沉沉的，像是要下雨。";
  if (w === "windy") return "风吹得树叶沙沙响。";

  // Season fallbacks
  if (s === "spring") return "春天的空气里有花香。";
  if (s === "summer") return "夏天就是热，但校园里的花开得正好。";
  if (s === "autumn") return "秋高气爽，天特别蓝。";
  if (s === "winter") return "冬天的日子短，天黑得早。";

  return "";
});
</script>

<template>
  <div class="side-panel">
    <!-- Skip time -->
    <div class="panel-section" v-if="gameTime">
      <div class="skip-row">
        <button @click="emit('skip', 'day')">⏩ 明天</button>
        <button @click="emit('skip', 'week')">⏩ 下周</button>
        <button @click="emit('skip', 'semester')">⏩ 下学期</button>
      </div>
    </div>

    <!-- Ambient atmosphere -->
    <div v-if="ambientText" class="panel-section ambient">
      <div class="ambient-text">{{ ambientText }}</div>
    </div>

    <!-- Current Location -->
    <div class="panel-section">
      <div class="panel-title">📍 当前位置</div>
      <div class="panel-text location-name">
        {{ locationNames[currentScene] || currentScene }}
      </div>
    </div>

    <!-- Daily Mission -->
    <div class="panel-section" v-if="mission && mission.status === 'active'">
      <div class="panel-title">🎯 今日任务</div>
      <div class="mission-sidebar">{{ mission.title }}</div>
      <div class="mission-hint">{{ mission.description }}</div>
      <button
        v-if="mission.targetLocation && mission.targetLocation !== currentScene"
        class="mission-go-btn"
        @click="emit('navigate', mission.targetLocation)"
      >
        前往{{ locationNames[mission.targetLocation] || mission.targetLocation }} →
      </button>
      <div v-else-if="mission.targetLocation === currentScene" class="mission-here">
        📍 就在这里{{ mission.targetNpc ? "，找到对应的人" : "" }}
      </div>
    </div>
    <div class="panel-section" v-else-if="mission && mission.status === 'done'">
      <div class="panel-title">✅ 今日任务已完成</div>
      <div class="mission-done">{{ mission.title }}</div>
    </div>

    <!-- Events -->
    <div class="panel-section events-section">
      <div class="panel-title clickable" @click="toggleSection('events')">
        📋 你不在时…… <span class="collapse-indicator">{{ collapsed.events ? "▸" : "▾" }}</span>
      </div>
      <template v-if="!collapsed.events">
        <template v-if="events.length">
          <div class="event-item" v-for="e in events.slice(0, 8)" :key="e.id">
            · {{ e.description }}
          </div>
        </template>
        <div v-else class="event-item hint">一切如常，没什么特别的事。</div>
      </template>
    </div>

    <!-- Todos -->
    <div class="panel-section" v-if="todos.length">
      <div class="panel-title clickable" @click="toggleSection('todos')">
        📝 待处理 <span class="collapse-indicator">{{ collapsed.todos ? "▸" : "▾" }}</span>
      </div>
      <template v-if="!collapsed.todos">
        <div v-for="t in todos" :key="t.id" class="todo-sidebar-item">
          <span class="todo-dot" :class="t.priority">●</span> {{ t.title }}
          <span class="todo-location">({{ locationNames[t.location] || t.location }})</span>
        </div>
      </template>
    </div>

    <!-- Tips -->
    <div class="panel-section">
      <div class="panel-title">💡 提示</div>
      <div class="event-item hint">点击场景中的人物可以对话</div>
      <div class="event-item hint">点击门或出口可以换地方</div>
    </div>

    <!-- Navigation -->
    <div class="panel-section">
      <div class="panel-title clickable" @click="toggleSection('navigation')">
        🚶 可以去 <span class="collapse-indicator">{{ collapsed.navigation ? "▸" : "▾" }}</span>
      </div>
      <template v-if="!collapsed.navigation">
        <div
          class="nav-item"
          v-for="loc in getConnectedLocations(currentScene)"
          :key="loc.id"
          @click="emit('navigate', loc.id)"
        >
          → {{ loc.name }}
        </div>
      </template>
    </div>

    <!-- Stats -->
    <div class="panel-section" v-if="stats">
      <div class="panel-title clickable" @click="toggleSection('stats')">
        📊 记录 <span class="collapse-indicator">{{ collapsed.stats ? "▸" : "▾" }}</span>
      </div>
      <template v-if="!collapsed.stats">
        <StatsPanel :stats="stats" />
      </template>
    </div>

    <!-- Tutorial (first day only) -->
    <div class="panel-section tutorial" v-if="stats && stats.totalDaysPlayed <= 1">
      <div class="panel-title">📖 新手指引</div>
      <div class="tutorial-step">1. 点击左侧地点可以移动</div>
      <div class="tutorial-step">2. 点击场景中的人物可以对话</div>
      <div class="tutorial-step">3. 对话后选择互动方式</div>
      <div class="tutorial-step">4. 完成🎯今日任务获得成就感</div>
      <div class="tutorial-step">5. 每天来看看，保持连续签到🔥</div>
    </div>

    <!-- Relationships -->
    <div class="panel-section">
      <div class="panel-title clickable" @click="toggleSection('relationships')">
        💛 关系 <span class="collapse-indicator">{{ collapsed.relationships ? "▸" : "▾" }}</span>
      </div>
      <template v-if="!collapsed.relationships">
        <RelationshipPanel :npcs="npcs" />
      </template>
    </div>

    <!-- Inventory -->
    <div class="panel-section" v-if="inventory && inventory.length > 0">
      <div class="panel-title">🎒 物品</div>
      <div class="inventory-row">
        <span v-for="item in inventory" :key="item.itemType" class="inv-badge">
          {{ itemIcons[item.itemType] || "📦" }}{{ item.quantity }}
        </span>
      </div>
    </div>

    <!-- Character Switch -->
    <div class="panel-section">
      <div class="panel-title">👤 角色</div>
      <div class="character-switch">
        <button
          :class="{ active: activeCharacter === 'teacher' }"
          @click="emit('switchCharacter', 'teacher')"
        >
          老师
        </button>
        <button
          :class="{ active: activeCharacter === 'postman' }"
          @click="emit('switchCharacter', 'postman')"
        >
          邮递员
        </button>
      </div>
    </div>

    <div class="sidebar-footer">📍 {{ locationNames[currentScene] || currentScene }}</div>
  </div>
</template>

<style scoped>
.side-panel {
  width: 300px;
  min-width: 300px;
  background: #f5e6c8;
  border-right: 2px solid #d4c08e;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Noto Serif SC", serif;
  color: #3a3530;
  scrollbar-width: none;
}
.side-panel::-webkit-scrollbar {
  display: none;
}
.panel-section {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(212, 192, 142, 0.5);
}
.panel-title {
  font-size: 14px;
  font-weight: bold;
  color: #c4706a;
  margin-bottom: 6px;
  border-left: 3px solid #c4706a;
  padding-left: 10px;
  text-transform: none;
}
.panel-text {
  font-size: 13px;
  line-height: 1.5;
}
.panel-time-large {
  font-size: 16px;
  font-weight: bold;
  color: #3a3530;
  line-height: 1.3;
}
.skip-row {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}
.skip-row button {
  flex: 1;
  background: linear-gradient(180deg, #e8dcc4 0%, #d4c08e 100%);
  border: 1px solid rgba(107, 91, 78, 0.3);
  border-radius: 4px;
  font-size: 12px;
  padding: 6px 4px;
  cursor: pointer;
  font-family: "Noto Serif SC", serif;
  color: #5a4a3e;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.skip-row button:hover {
  background: linear-gradient(180deg, #c4706a 0%, #a05a54 100%);
  color: #f5e6c8;
  border-color: #a05a54;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
.skip-row button:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.events-section {
  flex: 1;
  overflow-y: auto;
}
.event-item {
  font-size: 12px;
  line-height: 1.5;
  color: #5c6b7a;
}
.event-item.hint {
  color: #a8b8b0;
  font-style: italic;
}
.ambient {
  background: rgba(196, 112, 106, 0.06);
}
.ambient-text {
  font-size: 12px;
  line-height: 1.6;
  color: #8a7a6a;
  font-style: italic;
}
.location-name {
  font-size: 15px;
  font-weight: bold;
  color: #6b5b4e;
}
.nav-item {
  font-size: 13px;
  color: #5c6b7a;
  cursor: pointer;
  padding: 6px 10px;
  background: #ede4d0;
  border-radius: 4px;
  margin-bottom: 3px;
  transition: all 0.15s ease;
}
.nav-item:hover {
  color: #f5e6c8;
  background: #c4706a;
  transform: translateX(4px);
}
.character-switch {
  display: flex;
  gap: 4px;
}
.character-switch button {
  flex: 1;
  background: linear-gradient(180deg, #e8dcc4 0%, #d4c08e 100%);
  border: 1px solid rgba(107, 91, 78, 0.3);
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 13px;
  cursor: pointer;
  font-family: "Noto Serif SC", serif;
  color: #5a4a3e;
  transition: all 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.character-switch button.active {
  background: linear-gradient(180deg, #c4706a 0%, #a05a54 100%);
  color: #f5e6c8;
  border-color: #a05a54;
  box-shadow: 0 1px 4px rgba(196, 112, 106, 0.3);
}
.character-switch button:hover:not(.active) {
  background: linear-gradient(180deg, #d4c08e 0%, #c9a882 100%);
  transform: translateY(-1px);
}
.todo-sidebar-item {
  font-size: 12px;
  line-height: 1.8;
  color: #3a3530;
  padding: 1px 0;
}
.todo-location {
  font-size: 11px;
  color: #a8b8b0;
}
.todo-dot {
  font-size: 11px;
  color: #d4c08e;
}
.todo-dot.high {
  color: #c4706a;
}
.mission-sidebar {
  font-size: 13px;
  font-weight: bold;
  color: #3a3530;
  padding: 4px 0 4px 8px;
  border-left: 3px solid #c4706a;
}
.mission-hint {
  font-size: 12px;
  color: #5c6b7a;
  line-height: 1.5;
  padding-left: 13px;
}
.mission-go-btn {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 8px 12px;
  background: linear-gradient(180deg, #c4706a 0%, #a05a54 100%);
  color: #f5e6c8;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-family: "Noto Serif SC", serif;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 6px rgba(196, 112, 106, 0.3);
  letter-spacing: 1px;
}
.mission-go-btn:hover {
  background: linear-gradient(180deg, #d4806a 0%, #b06a5a 100%);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(196, 112, 106, 0.4);
}
.mission-here {
  font-size: 11px;
  color: #7a9178;
  margin-top: 4px;
}
.mission-done {
  font-size: 12px;
  color: #7a9178;
  text-decoration: line-through;
}
.clickable {
  cursor: pointer;
  user-select: none;
  font-size: 14px;
}
.clickable:hover {
  color: #a05a54;
}
.collapse-indicator {
  color: #b0a090;
  font-size: 12px;
}
.tutorial {
  background: rgba(196, 112, 106, 0.06);
}
.tutorial-step {
  font-size: 12px;
  line-height: 1.8;
  color: #5c6b7a;
  padding-left: 2px;
}
.inventory-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.inv-badge {
  font-size: 14px;
  color: #6b5b4e;
  white-space: nowrap;
}
.sidebar-footer {
  margin-top: auto;
  padding: 12px 16px;
  background: linear-gradient(180deg, transparent, #ede0c0);
  border-top: 1px solid #d4c08e;
  font-size: 13px;
  font-weight: bold;
  color: #6b5b4e;
  text-align: center;
  font-family: "Noto Serif SC", serif;
}
</style>
