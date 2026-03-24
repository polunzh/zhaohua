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
        <span class="rel-label">{{ affinityLabel(npc.affinity) }}</span>
      </div>
      <div class="rel-bar-container" :title="`好感 ${npc.affinity}`">
        <div class="rel-bar-fill" :style="{ width: npc.affinity + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.relationship-panel {
  font-family: "Noto Serif SC", serif;
}
.rel-title {
  font-size: 11px;
  font-weight: bold;
  color: #c4706a;
  margin-bottom: 6px;
}
.rel-item {
  margin-bottom: 6px;
  background: rgba(212, 192, 142, 0.15);
  padding: 6px 8px;
  border-radius: 4px;
}
.rel-name {
  font-size: 13px;
  color: #3a3530;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
}
.rel-mood {
  font-size: 12px;
}
.rel-grade {
  font-size: 12px;
  color: #c4706a;
  margin-left: 2px;
}
.rel-label {
  font-size: 11px;
  color: #a8b8b0;
  margin-left: auto;
}
.rel-bar-container {
  width: 100%;
  height: 4px;
  background: rgba(107, 91, 78, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin: 2px 0;
}
.rel-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #c4706a, #d4915a);
  border-radius: 2px;
  transition: width 0.3s ease;
}
</style>
