<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  offlineText: string;
  events: { id: string; description: string; type: string }[];
  todos: { id: number; type: string; title: string; description: string; priority: string }[];
  consequences: { type: string; npcId: string; description: string }[];
  mission: {
    id: string;
    title: string;
    description: string;
    targetLocation: string;
    status: string;
  } | null;
  yesterdayMission: { title: string; status: string; completionText: string } | null;
  storyProgress: { name: string; description: string; isFinal: boolean }[];
  stats: {
    streakDays: number;
    longestStreak: number;
    totalDaysPlayed: number;
    missionsCompleted: number;
    npcsTalked: number;
    giftsReceived?: number;
  } | null;
}>();

const emit = defineEmits<{ start: [] }>();

const displayEvents = computed(() => props.events.slice(0, 3));
const extraEventsCount = computed(() => Math.max(0, props.events.length - 3));

// Combine yesterday mission + consequences into one recap section
const hasRecap = computed(
  () =>
    props.yesterdayMission ||
    props.consequences.length ||
    (props.storyProgress && props.storyProgress.length),
);
</script>

<template>
  <div class="briefing-overlay">
    <div class="briefing-panel">
      <h2>📜 {{ offlineText }}</h2>

      <!-- 1. Mission first — most important -->
      <div class="briefing-section" v-if="mission && mission.status === 'active'">
        <h3>🎯 今日任务</h3>
        <div class="mission-item">
          <div class="mission-title">{{ mission.title }}</div>
          <div class="mission-desc">{{ mission.description }}</div>
        </div>
      </div>

      <!-- 2. Recap: yesterday + consequences + story combined -->
      <div class="briefing-section" v-if="hasRecap">
        <h3>📖 回顾</h3>
        <div v-if="yesterdayMission" class="yesterday-item" :class="yesterdayMission.status">
          <div class="yesterday-title">
            {{ yesterdayMission.status === "done" ? "✅" : "❌" }} {{ yesterdayMission.title }}
          </div>
          <div class="yesterday-text">{{ yesterdayMission.completionText }}</div>
        </div>
        <div v-for="(c, i) in consequences" :key="'c' + i" class="consequence-item" :class="c.type">
          {{ c.description }}
        </div>
        <div v-for="(s, i) in storyProgress" :key="'s' + i" class="story-item">
          <span class="story-name">{{ s.name }}{{ s.isFinal ? "（完结）" : "" }}</span>
          — {{ s.description }}
        </div>
      </div>

      <!-- 3. Events — max 3 -->
      <div class="briefing-section" v-if="events.length">
        <h3>📋 发生了这些事</h3>
        <div v-for="e in displayEvents" :key="e.id" class="event-item">· {{ e.description }}</div>
        <div v-if="extraEventsCount > 0" class="event-more">(还有{{ extraEventsCount }}件事)</div>
      </div>

      <!-- 4. Quiet fallback -->
      <div
        class="briefing-section"
        v-if="!events.length && !hasRecap && !(mission && mission.status === 'active')"
      >
        <p class="quiet">一切如常，平静的一天。</p>
      </div>

      <!-- 5. Compact stats line -->
      <div class="stats-line" v-if="stats">
        🔥 连续{{ stats.streakDays }}天 · 完成{{ stats.missionsCompleted }}个任务 · 收到{{
          stats.giftsReceived ?? 0
        }}个礼物
      </div>

      <!-- 6. Prominent start button -->
      <button class="start-btn" @click="emit('start')">好的，开始</button>
      <div class="start-sub">去看看今天的学校吧</div>
    </div>
  </div>
</template>

<style scoped>
.briefing-overlay {
  position: fixed;
  inset: 0;
  background: rgba(58, 53, 48, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  font-family: "Noto Serif SC", serif;
}
.briefing-panel {
  background: #f5e6c8;
  border: 3px solid #6b5b4e;
  border-radius: 6px;
  padding: 24px 32px;
  max-width: 480px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  color: #3a3530;
}
h2 {
  font-size: 18px;
  color: #6b5b4e;
  margin-bottom: 16px;
  text-align: center;
}
.briefing-section {
  margin-bottom: 14px;
}
h3 {
  font-size: 13px;
  color: #c4706a;
  margin-bottom: 6px;
}
.mission-item {
  padding: 8px 10px;
  border-left: 3px solid #c4706a;
  background: rgba(196, 112, 106, 0.1);
  border-radius: 0 3px 3px 0;
}
.mission-title {
  font-size: 13px;
  font-weight: bold;
  color: #3a3530;
}
.mission-desc {
  font-size: 11px;
  color: #5c6b7a;
  margin-top: 3px;
}
.yesterday-item {
  padding: 6px 8px;
  border-radius: 3px;
  margin-bottom: 4px;
}
.yesterday-item.done {
  background: rgba(122, 145, 120, 0.1);
}
.yesterday-item.active {
  background: rgba(196, 112, 106, 0.1);
}
.yesterday-title {
  font-size: 12px;
  font-weight: bold;
}
.yesterday-text {
  font-size: 10px;
  color: #5c6b7a;
  margin-top: 2px;
}
.consequence-item {
  font-size: 12px;
  line-height: 1.6;
  padding: 4px 8px;
  border-radius: 3px;
  margin-bottom: 4px;
}
.consequence-item.positive {
  background: rgba(122, 145, 120, 0.15);
  color: #5a7a58;
}
.consequence-item.negative {
  background: rgba(196, 112, 106, 0.15);
  color: #c4706a;
}
.story-item {
  font-size: 11px;
  line-height: 1.5;
  color: #5c6b7a;
  padding: 2px 8px;
}
.story-name {
  font-weight: bold;
  color: #6b5b4e;
}
.event-item {
  font-size: 11px;
  line-height: 1.5;
  color: #5c6b7a;
}
.event-more {
  font-size: 10px;
  color: #a8b8b0;
  font-style: italic;
  margin-top: 2px;
}
.quiet {
  font-size: 12px;
  color: #a8b8b0;
  text-align: center;
  font-style: italic;
}
.stats-line {
  font-size: 12px;
  color: #6b5b4e;
  text-align: center;
  margin-bottom: 4px;
}
.start-btn {
  display: block;
  width: 100%;
  margin-top: 16px;
  padding: 14px;
  background: #c4706a;
  color: #f5e6c8;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  font-family: "Noto Serif SC", serif;
  cursor: pointer;
  transition: background 0.15s ease;
}
.start-btn:hover {
  background: #a05a54;
}
.start-sub {
  text-align: center;
  font-size: 11px;
  color: #a8b8b0;
  margin-top: 6px;
}
</style>
