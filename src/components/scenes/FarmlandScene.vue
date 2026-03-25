<script setup lang="ts">
import SvgCharacter from "../SvgCharacter.vue";

const props = defineProps<{
  npcs: { id: string; name: string; mood: string; hairColor?: string; bodyColor?: string }[];
  season: string;
}>();

const emit = defineEmits<{
  clickNpc: [npcId: string];
  clickExit: [targetMapId: string];
  clickObject: [objectName: string];
}>();

const npcPositions = [
  { x: 25, y: 65 },
  { x: 70, y: 60 },
];
</script>

<template>
  <div class="scene farmland-scene">
    <svg viewBox="0 0 800 500" class="scene-bg" preserveAspectRatio="xMidYMid meet">
      <!-- Sky -->
      <rect x="0" y="0" width="800" height="180" fill="#c8d0b8" />

      <!-- Gentle hills -->
      <ellipse cx="200" cy="180" rx="250" ry="40" fill="#a8be90" />
      <ellipse cx="600" cy="185" rx="300" ry="35" fill="#9ab080" />

      <!-- Field base -->
      <rect x="0" y="180" width="800" height="320" fill="#9aaa88" />

      <!-- Crop rows (parallel lines) -->
      <g v-for="i in 12" :key="'crop' + i">
        <line
          :x1="60"
          :y1="200 + i * 22"
          :x2="740"
          :y2="200 + i * 22"
          stroke="#7a9a60"
          stroke-width="2"
          opacity="0.6"
        />
        <!-- Crop dots along rows -->
        <circle
          v-for="j in 16"
          :key="'dot' + i + '-' + j"
          :cx="60 + j * 42"
          :cy="196 + i * 22"
          r="3"
          :fill="season === 'autumn' ? '#c8a840' : '#6a8a58'"
          opacity="0.7"
        />
      </g>

      <!-- Dirt path on left -->
      <rect x="0" y="400" width="120" height="100" fill="#d4c8a8" />
      <path d="M0,400 Q60,390 120,400" fill="#d4c8a8" />

      <!-- Tree (left edge) -->
      <rect
        x="30"
        y="160"
        width="12"
        height="50"
        rx="3"
        fill="#8a6a48"
        stroke="#4a4040"
        stroke-width="2"
      />
      <ellipse cx="36" cy="145" rx="28" ry="30" fill="#6a8a58" stroke="#4a4040" stroke-width="2" />
      <ellipse cx="50" cy="155" rx="20" ry="22" fill="#a8c490" opacity="0.6" />

      <!-- Tree (right edge) -->
      <rect
        x="748"
        y="170"
        width="10"
        height="45"
        rx="3"
        fill="#8a6a48"
        stroke="#4a4040"
        stroke-width="2"
      />
      <ellipse cx="753" cy="155" rx="25" ry="28" fill="#6a8a58" stroke="#4a4040" stroke-width="2" />

      <!-- Scarecrow -->
      <g class="clickable-object" @click="emit('clickObject', 'scarecrow')">
        <!-- Post -->
        <rect
          x="395"
          y="240"
          width="8"
          height="100"
          rx="2"
          fill="#a08050"
          stroke="#4a4040"
          stroke-width="2"
        />
        <!-- Arms -->
        <line
          x1="360"
          y1="270"
          x2="440"
          y2="270"
          stroke="#a08050"
          stroke-width="3"
          stroke-linecap="round"
        />
        <!-- Head -->
        <circle cx="399" cy="235" r="14" fill="#d4c8a8" stroke="#4a4040" stroke-width="2" />
        <!-- Hat -->
        <rect
          x="383"
          y="215"
          width="32"
          height="10"
          rx="2"
          fill="#8a6a48"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <rect
          x="389"
          y="205"
          width="20"
          height="14"
          rx="2"
          fill="#8a6a48"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <!-- Eyes -->
        <text x="399" y="239" text-anchor="middle" font-size="8" fill="#4a4040">x x</text>
        <!-- Shirt scraps -->
        <path d="M360,270 L355,285" stroke="#b8786a" stroke-width="2" opacity="0.6" />
        <path d="M440,270 L445,285" stroke="#b8786a" stroke-width="2" opacity="0.6" />
      </g>

      <!-- Exit to village road -->
      <g class="exit-area" @click="emit('clickExit', 'village-road')">
        <rect
          x="0"
          y="430"
          width="110"
          height="50"
          rx="6"
          fill="#d4c8a8"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.7"
        />
        <text x="55" y="460" text-anchor="middle" font-size="12" fill="#4a4040">→ 村路</text>
      </g>
    </svg>

    <div class="npc-layer">
      <div
        v-for="(npc, i) in npcs.slice(0, 2)"
        :key="npc.id"
        class="npc-slot"
        :style="{
          left: npcPositions[i]?.x + '%',
          top: npcPositions[i]?.y + '%',
        }"
        @click="emit('clickNpc', npc.id)"
      >
        <SvgCharacter
          :name="npc.name"
          :mood="npc.mood"
          :hair-color="npc.hairColor"
          :body-color="npc.bodyColor"
          :size="55"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.scene {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.scene-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.npc-layer {
  position: absolute;
  inset: 0;
}
.npc-slot {
  position: absolute;
  transform: translate(-50%, -80%);
}
.exit-area {
  cursor: pointer;
}
.exit-area:hover rect {
  opacity: 0.8;
}
.clickable-object {
  cursor: pointer;
}
.clickable-object:hover {
  opacity: 0.8;
}
</style>
