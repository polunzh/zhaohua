<script setup lang="ts">
import type { GameTime } from "../engine/time";
import { getConnectedLocations, getLocation } from "../data/locations";

const props = defineProps<{
  gameTime: GameTime | null;
  weather: string;
  currentScene: string;
  activeCharacter: string;
  events: { id: string; description: string }[];
  todos: { id: number; title: string; priority: string; location: string; actionType: string }[];
  mission: {
    id: string;
    title: string;
    description: string;
    targetLocation: string;
    status: string;
  } | null;
}>();

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
</script>

<template>
  <div class="side-panel">
    <!-- Time & Weather -->
    <div class="panel-section" v-if="gameTime">
      <div class="panel-title">📅 时间</div>
      <div class="panel-text">{{ gameTime.date }}</div>
      <div class="panel-text">
        {{ seasonNames[gameTime.season] || gameTime.season }} ·
        {{ weatherNames[weather] || weather }}
      </div>
      <div class="panel-text">
        {{ String(gameTime.hour).padStart(2, "0") }}:{{ String(gameTime.minute).padStart(2, "0") }}
      </div>
      <div class="skip-row">
        <button @click="emit('skip', 'day')">明天</button>
        <button @click="emit('skip', 'week')">下周</button>
        <button @click="emit('skip', 'semester')">下学期</button>
      </div>
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
    </div>

    <!-- Events -->
    <div class="panel-section events-section">
      <div class="panel-title">📋 你不在时……</div>
      <template v-if="events.length">
        <div class="event-item" v-for="e in events.slice(0, 8)" :key="e.id">
          · {{ e.description }}
        </div>
      </template>
      <div v-else class="event-item hint">一切如常，没什么特别的事。</div>
    </div>

    <!-- Todos -->
    <div class="panel-section" v-if="todos.length">
      <div class="panel-title">📝 待处理</div>
      <div v-for="t in todos" :key="t.id" class="todo-sidebar-item">
        <span class="todo-dot" :class="t.priority">●</span> {{ t.title }}
        <span class="todo-location">({{ locationNames[t.location] || t.location }})</span>
      </div>
    </div>

    <!-- Tips -->
    <div class="panel-section">
      <div class="panel-title">💡 提示</div>
      <div class="event-item hint">点击场景中的人物可以对话</div>
      <div class="event-item hint">点击门或出口可以换地方</div>
    </div>

    <!-- Navigation -->
    <div class="panel-section">
      <div class="panel-title">🚶 可以去</div>
      <div
        class="nav-item"
        v-for="loc in getConnectedLocations(currentScene)"
        :key="loc.id"
        @click="emit('navigate', loc.id)"
      >
        → {{ loc.name }}
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
  </div>
</template>

<style scoped>
.side-panel {
  width: 180px;
  background: #f5e6c8;
  border-right: 2px solid #6b5b4e;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  font-family: "Noto Serif SC", serif;
  color: #3a3530;
}
.panel-section {
  padding: 10px 12px;
  border-bottom: 1px solid #d4c08e;
}
.panel-title {
  font-size: 11px;
  font-weight: bold;
  color: #c4706a;
  margin-bottom: 6px;
}
.panel-text {
  font-size: 11px;
  line-height: 1.5;
}
.skip-row {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}
.skip-row button {
  flex: 1;
  background: #d4c08e;
  border: 1px solid #6b5b4e;
  border-radius: 2px;
  font-size: 9px;
  padding: 2px;
  cursor: pointer;
  font-family: "Noto Serif SC", serif;
  color: #3a3530;
}
.skip-row button:hover {
  background: #c9a882;
}
.events-section {
  flex: 1;
  overflow-y: auto;
}
.event-item {
  font-size: 10px;
  line-height: 1.5;
  color: #5c6b7a;
}
.event-item.hint {
  color: #a8b8b0;
  font-style: italic;
}
.location-name {
  font-size: 14px;
  font-weight: bold;
  color: #6b5b4e;
}
.nav-item {
  font-size: 11px;
  color: #5c6b7a;
  cursor: pointer;
  padding: 2px 0;
}
.nav-item:hover {
  color: #c4706a;
}
.character-switch {
  display: flex;
  gap: 4px;
}
.character-switch button {
  flex: 1;
  background: #d4c08e;
  border: 1px solid #6b5b4e;
  border-radius: 2px;
  padding: 4px;
  font-size: 10px;
  cursor: pointer;
  font-family: "Noto Serif SC", serif;
  color: #3a3530;
}
.character-switch button.active {
  background: #c4706a;
  color: #f5e6c8;
}
.todo-sidebar-item {
  font-size: 10px;
  line-height: 1.8;
  color: #3a3530;
  padding: 1px 0;
}
.todo-location {
  font-size: 9px;
  color: #a8b8b0;
}
.todo-dot {
  font-size: 8px;
  color: #d4c08e;
}
.todo-dot.high {
  color: #c4706a;
}
.mission-sidebar {
  font-size: 11px;
  font-weight: bold;
  color: #3a3530;
  padding: 3px 0;
}
.mission-hint {
  font-size: 10px;
  color: #5c6b7a;
  line-height: 1.5;
}
</style>
