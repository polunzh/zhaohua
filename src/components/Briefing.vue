<script setup lang="ts">
defineProps<{
  offlineText: string;
  events: { id: string; description: string; type: string }[];
  todos: { id: number; type: string; title: string; description: string; priority: string }[];
  consequences: { type: string; npcId: string; description: string }[];
}>();

const emit = defineEmits<{ start: [] }>();
</script>

<template>
  <div class="briefing-overlay">
    <div class="briefing-panel">
      <h2>📜 {{ offlineText }}</h2>

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
