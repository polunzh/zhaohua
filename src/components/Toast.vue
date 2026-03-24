<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{ message: string; type?: "info" | "success" | "streak" }>();

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
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 13px;
  font-family: "Noto Serif SC", serif;
  z-index: 300;
}
.toast.info {
  background: #f5e6c8;
  color: #6b5b4e;
  border: 1px solid #d4c08e;
}
.toast.success {
  background: #7a9178;
  color: #f5e6c8;
}
.toast.streak {
  background: #c4706a;
  color: #f5e6c8;
}
.toast-enter-active {
  animation: toastIn 0.3s ease;
}
.toast-leave-active {
  animation: toastOut 0.3s ease;
}
@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
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
