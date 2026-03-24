<script setup lang="ts">
defineProps<{
  stats: {
    streakDays: number;
    totalDaysPlayed: number;
    missionsCompleted: number;
    npcsTalked: number;
    giftsReceived: number;
  } | null;
}>();
</script>

<template>
  <div v-if="stats" class="stats-panel">
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-value">{{ stats.totalDaysPlayed }}</span>
        <span class="stat-label">天</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.streakDays }}</span>
        <span class="stat-label">连续</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.missionsCompleted }}</span>
        <span class="stat-label">任务</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.npcsTalked }}</span>
        <span class="stat-label">对话</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.giftsReceived }}</span>
        <span class="stat-label">礼物</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-panel {
  font-family: "Noto Serif SC", serif;
}
.stats-title {
  font-size: 11px;
  font-weight: bold;
  color: #c4706a;
  margin-bottom: 6px;
}
.stats-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 40px;
  padding: 4px 8px;
  background: rgba(212, 192, 142, 0.3);
  border-radius: 3px;
}
.stat-value {
  font-size: 14px;
  font-weight: bold;
  color: #6b5b4e;
}
.stat-label {
  font-size: 11px;
  color: #a8b8b0;
}
</style>
