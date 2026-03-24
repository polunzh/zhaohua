<script setup lang="ts">
defineProps<{
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
}>();

const emit = defineEmits<{ start: [] }>();
</script>

<template>
  <div class="briefing-overlay">
    <div class="briefing-panel">
      <h2>📜 {{ offlineText }}</h2>

      <div class="briefing-section" v-if="yesterdayMission">
        <h3 v-if="yesterdayMission.status === 'done'">✅ 昨天的任务完成了</h3>
        <h3 v-else>❌ 昨天的任务没完成</h3>
        <div class="yesterday-item" :class="yesterdayMission.status">
          <div class="yesterday-title">{{ yesterdayMission.title }}</div>
          <div class="yesterday-text">{{ yesterdayMission.completionText }}</div>
        </div>
      </div>

      <div class="briefing-section" v-if="storyProgress && storyProgress.length">
        <h3>📖 故事进展</h3>
        <div v-for="(s, i) in storyProgress" :key="i" class="story-item">
          <div class="story-name">{{ s.name }} {{ s.isFinal ? "（完结）" : "" }}</div>
          <div class="story-desc">{{ s.description }}</div>
        </div>
      </div>

      <div class="briefing-section" v-if="consequences.length">
        <h3>🌱 你的选择产生了影响</h3>
        <div v-for="(c, i) in consequences" :key="i" class="consequence-item" :class="c.type">
          {{ c.description }}
        </div>
      </div>

      <div class="briefing-section" v-if="events.length">
        <h3>📋 发生了这些事</h3>
        <div v-for="e in events.slice(0, 6)" :key="e.id" class="event-item">
          · {{ e.description }}
        </div>
      </div>

      <div class="briefing-section" v-if="todos.length">
        <h3>📝 等你处理</h3>
        <div v-for="t in todos" :key="t.id" class="todo-item" :class="t.priority">
          <span class="todo-title">{{ t.title }}</span>
          <span class="todo-desc">{{ t.description }}</span>
        </div>
      </div>

      <div class="briefing-section" v-if="!events.length && !todos.length && !consequences.length">
        <p class="quiet">一切如常，平静的一天。</p>
      </div>

      <div class="briefing-section" v-if="mission && mission.status === 'active'">
        <h3>🎯 今日任务</h3>
        <div class="mission-item">
          <div class="mission-title">{{ mission.title }}</div>
          <div class="mission-desc">{{ mission.description }}</div>
        </div>
      </div>

      <button class="start-btn" @click="emit('start')">好的，开始</button>
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
  margin-bottom: 16px;
}
h3 {
  font-size: 13px;
  color: #c4706a;
  margin-bottom: 8px;
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
.event-item {
  font-size: 11px;
  line-height: 1.5;
  color: #5c6b7a;
}
.todo-item {
  display: flex;
  flex-direction: column;
  padding: 6px 8px;
  border-left: 3px solid #d4c08e;
  margin-bottom: 4px;
  background: rgba(212, 192, 142, 0.2);
}
.todo-item.high {
  border-left-color: #c4706a;
}
.todo-title {
  font-size: 12px;
  font-weight: bold;
}
.todo-desc {
  font-size: 10px;
  color: #5c6b7a;
  margin-top: 2px;
}
.quiet {
  font-size: 12px;
  color: #a8b8b0;
  text-align: center;
  font-style: italic;
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
.story-item {
  padding: 4px 8px;
  margin-bottom: 4px;
  border-left: 2px solid #d4c08e;
}
.story-name {
  font-size: 11px;
  font-weight: bold;
  color: #6b5b4e;
}
.story-desc {
  font-size: 10px;
  color: #5c6b7a;
  margin-top: 2px;
}
.start-btn {
  display: block;
  width: 100%;
  margin-top: 16px;
  padding: 10px;
  background: #c4706a;
  color: #f5e6c8;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-family: "Noto Serif SC", serif;
  cursor: pointer;
}
.start-btn:hover {
  background: #a05a54;
}
</style>
