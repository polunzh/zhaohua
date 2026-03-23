<script setup lang="ts">
defineProps<{
  stories: { id: string; name: string; stage: string; description: string }[];
}>();
</script>

<template>
  <div v-if="stories.length" class="story-progress">
    <h3>故事</h3>
    <div v-for="s in stories" :key="s.id" class="story-item">
      <div class="story-name">{{ s.name }}</div>
      <div class="story-desc">{{ s.description }}</div>
    </div>
  </div>
</template>

<style scoped>
.story-progress {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: rgba(245, 230, 200, 0.92);
  border: 1px solid #6b5b4e;
  border-radius: 6px;
  padding: 12px 16px;
  max-width: 240px;
  font-family: "Noto Serif SC", serif;
  color: #3a3530;
  font-size: 13px;
}
h3 {
  font-size: 14px;
  margin: 0 0 8px;
  color: #c4706a;
}
.story-item {
  margin-bottom: 8px;
}
.story-name {
  font-weight: bold;
  font-size: 12px;
}
.story-desc {
  line-height: 1.4;
  margin-top: 2px;
}
</style>
