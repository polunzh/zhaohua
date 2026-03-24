<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  npcs: {
    id: string;
    name: string;
    role: string;
    mood: string;
    affinity: number;
  }[];
}>();

const moodEmoji: Record<string, string> = {
  happy: "😊",
  neutral: "😐",
  upset: "😟",
  excited: "😄",
  tired: "😴",
};

// Only show students and key adults
const visibleNpcs = computed(() => {
  return props.npcs.filter(
    (n) => n.role === "student" || n.role === "principal" || n.role === "teacher-colleague",
  );
});

function affinityBar(value: number): string {
  const filled = Math.round(value / 10);
  return "❤".repeat(filled) + "♡".repeat(10 - filled);
}

function affinityLabel(value: number): string {
  if (value >= 80) return "亲密";
  if (value >= 60) return "友好";
  if (value >= 40) return "普通";
  if (value >= 20) return "疏远";
  return "陌生";
}

function getGrade(affinity: number): string {
  if (affinity >= 80) return "优";
  if (affinity >= 60) return "良";
  if (affinity >= 40) return "中";
  return "差";
}
</script>

<template>
  <div class="relationship-panel">
    <div v-for="npc in visibleNpcs" :key="npc.id" class="rel-item">
      <div class="rel-name">
        {{ npc.name }}
        <span class="rel-mood">{{ moodEmoji[npc.mood] || "😐" }}</span>
        <span v-if="npc.role === 'student'" class="rel-grade">[{{ getGrade(npc.affinity) }}]</span>
      </div>
      <div class="rel-bar" :title="`好感 ${npc.affinity}`">{{ affinityBar(npc.affinity) }}</div>
      <div class="rel-label">{{ affinityLabel(npc.affinity) }}</div>
    </div>
  </div>
</template>

<style scoped>
.relationship-panel {
  padding: 10px 12px;
  border-bottom: 1px solid #d4c08e;
}
.rel-title {
  font-size: 11px;
  font-weight: bold;
  color: #c4706a;
  margin-bottom: 6px;
}
.rel-item {
  margin-bottom: 4px;
}
.rel-name {
  font-size: 10px;
  color: #3a3530;
  font-weight: bold;
}
.rel-mood {
  font-size: 9px;
}
.rel-grade {
  font-size: 9px;
  color: #c4706a;
  margin-left: 2px;
}
.rel-bar {
  font-size: 8px;
  letter-spacing: -1px;
  color: #c4706a;
  line-height: 1;
}
.rel-label {
  font-size: 8px;
  color: #a8b8b0;
}
</style>
