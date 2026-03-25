<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{ message: string; type?: "info" | "success" | "streak" | "story" }>();

const visible = ref(false);

watch(
  () => props.message,
  (msg) => {
    if (msg) {
      visible.value = true;
      setTimeout(() => {
        visible.value = false;
      }, 3000);
    }
  },
);
</script>

<template>
  <Transition name="toast">
    <div v-if="visible && message" class="toast" :class="type || 'info'">
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 13px;
  backdrop-filter: blur(8px);
  font-family: "Noto Serif SC", serif;
  z-index: 300;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}
.toast.info {
  background: rgba(245, 230, 200, 0.85);
  color: #6b5b4e;
  border: 1px solid #d4c08e;
}
.toast.success {
  background: #7a9178;
  color: #f5e6c8;
}
.toast.streak {
  background: linear-gradient(135deg, #c4706a 0%, #d4915a 50%, #c4706a 100%);
  color: #f5e6c8;
}
.toast.story {
  background: rgba(184, 152, 96, 0.95);
  color: #f5e6c8;
  border-left: 4px solid #8a6a30;
}
.toast-enter-active {
  animation: toastIn 0.4s ease;
}
.toast-leave-active {
  animation: toastOut 0.3s ease;
}
@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
}
@keyframes toastOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
