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
  font-family: "Noto Serif SC", serif;
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
  font-family: "Noto Serif SC", serif;
  font-size: 12px;
  color: #5c6b7a;
  cursor: pointer;
}
.skip-buttons button:hover {
  background: #d4c08e;
}
</style>
