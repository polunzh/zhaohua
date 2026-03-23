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
    <div class="dialog-name">{{ npcName }}</div>
    <div class="dialog-text">
      <template v-if="loading">……</template>
      <template v-else>{{ text }}</template>
    </div>
    <div class="dialog-hint">点击关闭</div>
  </div>
</template>

<style scoped>
.dialog-box {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #f5e6c8;
  border: 2px solid #6b5b4e;
  border-radius: 6px;
  padding: 16px 24px;
  max-width: 600px;
  min-width: 300px;
  font-family: "Noto Serif SC", serif;
  color: #3a3530;
  cursor: pointer;
}
.dialog-name {
  font-weight: bold;
  color: #c4706a;
  margin-bottom: 8px;
  font-size: 14px;
}
.dialog-text {
  font-size: 16px;
  line-height: 1.6;
}
.dialog-hint {
  font-size: 11px;
  color: #a8b8b0;
  text-align: right;
  margin-top: 8px;
}
</style>
