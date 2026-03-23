<script setup lang="ts">
defineProps<{
  choices: { id: string; label: string }[];
}>();
const emit = defineEmits<{ choose: [id: string] }>();
</script>

<template>
  <div v-if="choices.length" class="choice-panel">
    <button v-for="c in choices" :key="c.id" class="choice-btn" @click="emit('choose', c.id)">
      {{ c.label }}
    </button>
  </div>
</template>

<style scoped>
.choice-panel {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
}
.choice-btn {
  background: #f5e6c8;
  border: 1px solid #6b5b4e;
  border-radius: 4px;
  padding: 8px 20px;
  font-family: "Noto Serif SC", serif;
  font-size: 14px;
  color: #3a3530;
  cursor: pointer;
}
.choice-btn:hover {
  background: #d4c08e;
}
</style>
