<script setup lang="ts">
defineProps<{
  events: { id: string; description: string }[];
}>();
</script>

<template>
  <div v-if="events.length" class="event-summary">
    <h3>你不在的时候……</h3>
    <ul>
      <li v-for="e in events" :key="e.id">{{ e.description }}</li>
    </ul>
  </div>
</template>

<style scoped>
.event-summary {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(245, 230, 200, 0.92);
  border: 1px solid #6b5b4e;
  border-radius: 6px;
  padding: 12px 16px;
  max-width: 240px;
  max-height: 400px;
  overflow-y: auto;
  font-family: "Noto Serif SC", serif;
  color: #3a3530;
  font-size: 13px;
}
h3 {
  font-size: 14px;
  margin: 0 0 8px;
  color: #c4706a;
}
ul {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  margin-bottom: 6px;
  line-height: 1.4;
}
li::before {
  content: "· ";
  color: #a8b8b0;
}
</style>
