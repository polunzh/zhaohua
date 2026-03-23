<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { TileMapEngine } from "../tilemap/engine";
import { getTileConfig } from "../tilemap/tileset";
import {
  drawCharacter,
  getSpriteConfig,
  getPlayerSpriteConfig,
  moodToEmoji,
} from "../tilemap/sprites";
import { TILE_SIZE } from "../tilemap/types";
import type { TileMapData } from "../tilemap/types";
import { applyColorGrading } from "../scene/filter";

const props = defineProps<{
  mapData: TileMapData | null;
  npcs: {
    id: string;
    name: string;
    location: string;
    mood: string;
    tileX?: number;
    tileY?: number;
  }[];
  activeCharacter: string;
  currentScene: string;
}>();

const emit = defineEmits<{
  clickTile: [tileX: number, tileY: number];
  clickNpc: [npcId: string];
  clickExit: [targetMapId: string];
}>();

const canvasRef = ref<HTMLCanvasElement>();
let engine: TileMapEngine | null = null;

function render() {
  if (!canvasRef.value || !props.mapData) return;
  const ctx = canvasRef.value.getContext("2d")!;
  engine = new TileMapEngine(props.mapData);

  const w = props.mapData.width * TILE_SIZE;
  const h = props.mapData.height * TILE_SIZE;
  canvasRef.value.width = w;
  canvasRef.value.height = h;

  // Clear
  ctx.fillStyle = "#D4C08E";
  ctx.fillRect(0, 0, w, h);

  // Draw ground layer
  for (let y = 0; y < props.mapData.height; y++) {
    for (let x = 0; x < props.mapData.width; x++) {
      const tileId = engine.getGroundTile(x, y);
      const config = getTileConfig(tileId);
      if (config && config.color !== "transparent") {
        ctx.fillStyle = config.color;
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        if (config.detail) {
          ctx.fillStyle = config.detail;
          ctx.fillRect(x * TILE_SIZE + 2, y * TILE_SIZE + 2, 2, 2);
          ctx.fillRect(x * TILE_SIZE + 10, y * TILE_SIZE + 8, 2, 2);
        }
      }
    }
  }

  // Draw objects layer
  for (let y = 0; y < props.mapData.height; y++) {
    for (let x = 0; x < props.mapData.width; x++) {
      const tileId = engine.getObjectTile(x, y);
      if (tileId === 0) continue;
      const config = getTileConfig(tileId);
      if (config) {
        ctx.fillStyle = config.color;
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        if (config.detail) {
          ctx.fillStyle = config.detail;
          ctx.fillRect(x * TILE_SIZE + 1, y * TILE_SIZE + 1, TILE_SIZE - 2, 2);
        }
      }
    }
  }

  // Draw NPCs
  for (const npc of props.npcs) {
    if (npc.tileX === undefined || npc.tileY === undefined) continue;
    const spriteConfig = getSpriteConfig(npc.id);
    if (!spriteConfig) continue;
    const px = npc.tileX * TILE_SIZE - 4; // center 24px sprite on 16px tile
    const py = npc.tileY * TILE_SIZE - 16; // sprite is taller than tile
    drawCharacter(ctx, px, py, spriteConfig, "down", npc.name, npc.mood);
  }

  // Draw player character
  const playerConfig = getPlayerSpriteConfig(props.activeCharacter);
  if (playerConfig) {
    // Player at center-ish spawn or wherever they are
    // For now, just draw at a default position
  }

  // Apply nostalgic filter
  const imageData = ctx.getImageData(0, 0, w, h);
  applyColorGrading(imageData.data);
  ctx.putImageData(imageData, 0, 0);

  // Draw vignette
  const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
  gradient.addColorStop(0, "transparent");
  gradient.addColorStop(1, "rgba(58, 46, 34, 0.2)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function handleClick(e: MouseEvent) {
  if (!canvasRef.value || !engine || !props.mapData) return;
  const rect = canvasRef.value.getBoundingClientRect();
  const scaleX = canvasRef.value.width / rect.width;
  const scaleY = canvasRef.value.height / rect.height;
  const px = (e.clientX - rect.left) * scaleX;
  const py = (e.clientY - rect.top) * scaleY;
  const { tileX, tileY } = engine.pixelToTile(px, py);

  // Check NPC click
  for (const npc of props.npcs) {
    if (npc.tileX === tileX && npc.tileY === tileY) {
      emit("clickNpc", npc.id);
      return;
    }
  }

  // Check exit click
  const exit = engine.getExitAt(tileX, tileY);
  if (exit) {
    emit("clickExit", exit.targetMapId);
    return;
  }

  emit("clickTile", tileX, tileY);
}

onMounted(() => {
  render();
});

watch(
  () => [props.mapData, props.npcs, props.currentScene],
  () => {
    render();
  },
  { deep: true },
);
</script>

<template>
  <canvas ref="canvasRef" class="game-canvas" @click="handleClick" />
</template>

<style scoped>
.game-canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  cursor: pointer;
}
</style>
