<script setup lang="ts">
defineProps<{
  npcName: string;
  text: string;
  loading: boolean;
}>();

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div v-if="text || loading" class="dialog-box" @click="emit('close')">
    <span class="dialog-name">{{ npcName }}：</span>
    <span class="dialog-text">
      <template v-if="loading">……</template>
      <template v-else>{{ text }}</template>
    </span>
  </div>
</template>

<style scoped>
.dialog-box {
  cursor: pointer;
  font-size: 14px;
  line-height: 1.6;
  color: #3a3530;
}
.dialog-name {
  font-weight: bold;
  color: #c4706a;
}
</style>
