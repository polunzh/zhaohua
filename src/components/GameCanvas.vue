<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { SceneRenderer } from "../scene/renderer";
import { scenes, getBackgroundKey } from "../scene/scenes";
import type { ClickableArea } from "../scene/scenes";
import type { GameTime } from "../engine/time";

const props = defineProps<{
  gameTime: GameTime | null;
  sceneId: string;
}>();

const emit = defineEmits<{
  areaClick: [area: ClickableArea];
}>();

const canvasRef = ref<HTMLCanvasElement>();
let renderer: SceneRenderer | null = null;

onMounted(() => {
  if (canvasRef.value) {
    renderer = new SceneRenderer(canvasRef.value);
    renderer.setClickHandler((area) => emit("areaClick", area));
    if (props.gameTime) renderCurrentScene();
  }
});

watch(
  () => [props.gameTime, props.sceneId],
  () => {
    if (props.gameTime) renderCurrentScene();
  },
);

function renderCurrentScene() {
  if (!renderer || !props.gameTime) return;
  const scene = scenes[props.sceneId];
  if (!scene) return;
  const bgKey = getBackgroundKey(props.sceneId, props.gameTime.season, props.gameTime.period);
  renderer.renderScene(scene, `/assets/scenes/${bgKey}.png`);
}

onUnmounted(() => renderer?.destroy());
</script>

<template>
  <canvas ref="canvasRef" width="800" height="500" class="game-canvas" />
</template>

<style scoped>
.game-canvas {
  border: 2px solid #6b5b4e;
  border-radius: 4px;
  cursor: pointer;
}
</style>
