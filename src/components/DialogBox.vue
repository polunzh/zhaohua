<script setup lang="ts">
defineProps<{
  npcName: string;
  text: string;
  loading: boolean;
}>();

const emit = defineEmits<{ close: [] }>();
</script>

<template>
  <div v-if="text || loading" class="rpg-dialog" @click="emit('close')">
    <div class="dialog-nameplate" v-if="npcName">{{ npcName }}</div>
    <div class="dialog-body">
      <div class="dialog-content">
        <template v-if="loading">
          <span class="typing">……</span>
        </template>
        <template v-else>{{ text }}</template>
      </div>
      <div class="dialog-hint">▼</div>
    </div>
  </div>
</template>

<style scoped>
.rpg-dialog {
  cursor: pointer;
  position: relative;
}
.dialog-nameplate {
  display: inline-block;
  background: #c4706a;
  color: #f5e6c8;
  padding: 3px 12px;
  font-size: 11px;
  font-weight: bold;
  border-radius: 3px 3px 0 0;
  font-family: "Noto Serif SC", serif;
  margin-left: 12px;
}
.dialog-body {
  background: rgba(58, 53, 48, 0.92);
  border: 2px solid #6b5b4e;
  border-radius: 4px;
  padding: 12px 16px;
  min-height: 48px;
  position: relative;
}
.dialog-content {
  color: #f5e6c8;
  font-size: 14px;
  line-height: 1.7;
  font-family: "Noto Serif SC", serif;
}
.dialog-hint {
  position: absolute;
  bottom: 4px;
  right: 8px;
  color: #d4c08e;
  font-size: 10px;
  animation: bounce 1s infinite;
}
.typing {
  color: #d4c08e;
  animation: blink 0.8s infinite;
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(3px);
  }
}
@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
