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
  { x: 55, y: 72 },
  { x: 62, y: 74 },
  { x: 69, y: 72 },
  { x: 76, y: 74 },
];
</script>

<template>
  <div class="scene water-tower-scene">
    <svg viewBox="0 0 800 500" class="scene-bg" preserveAspectRatio="xMidYMid meet">
      <!-- Sky -->
      <rect x="0" y="0" width="800" height="280" fill="#c8d0b8" />
      <!-- Grass -->
      <rect x="0" y="280" width="800" height="220" fill="#9aaa88" />
      <!-- Dirt patch around tower base -->
      <ellipse cx="350" cy="420" rx="180" ry="60" fill="#d4c8a8" />

      <!-- Tower supports (4 legs) -->
      <line
        x1="280"
        y1="140"
        x2="300"
        y2="380"
        stroke="#4a4040"
        stroke-width="3"
        stroke-linecap="round"
      />
      <line
        x1="420"
        y1="140"
        x2="400"
        y2="380"
        stroke="#4a4040"
        stroke-width="3"
        stroke-linecap="round"
      />
      <line x1="300" y1="380" x2="400" y2="380" stroke="#4a4040" stroke-width="2" />
      <!-- Cross braces -->
      <line x1="288" y1="240" x2="412" y2="240" stroke="#4a4040" stroke-width="2" />
      <line x1="292" y1="310" x2="408" y2="310" stroke="#4a4040" stroke-width="2" />

      <!-- Water tank (rounded rect) -->
      <rect
        x="260"
        y="60"
        width="180"
        height="90"
        rx="12"
        fill="#7a9ab0"
        stroke="#4a4040"
        stroke-width="3"
      />
      <!-- Tank highlight -->
      <rect x="270" y="68" width="60" height="8" rx="4" fill="#8aacc0" opacity="0.6" />
      <!-- Tank lid -->
      <rect
        x="310"
        y="48"
        width="80"
        height="16"
        rx="6"
        fill="#6a8a9a"
        stroke="#4a4040"
        stroke-width="2"
      />

      <!-- Water tap at base -->
      <rect
        x="340"
        y="380"
        width="20"
        height="30"
        rx="3"
        fill="#888888"
        stroke="#4a4040"
        stroke-width="2"
      />
      <rect
        x="335"
        y="405"
        width="30"
        height="8"
        rx="2"
        fill="#777777"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <!-- Drip -->
      <ellipse cx="350" cy="422" rx="3" ry="5" fill="#6aa8d0" opacity="0.7" />
      <!-- Water puddle -->
      <ellipse cx="350" cy="435" rx="20" ry="5" fill="#6aa8d0" opacity="0.3" />

      <!-- Queue line on ground -->
      <line
        x1="400"
        y1="420"
        x2="600"
        y2="420"
        stroke="#b8a888"
        stroke-width="1"
        stroke-dasharray="6,4"
        opacity="0.4"
      />

      <!-- Exit to playground -->
      <g class="exit-area" @click="emit('clickExit', 'playground')">
        <rect
          x="660"
          y="400"
          width="120"
          height="60"
          rx="6"
          fill="#9aaa88"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.7"
        />
        <text x="720" y="435" text-anchor="middle" font-size="12" fill="#4a4040">→ 操场</text>
      </g>
    </svg>

    <div class="npc-layer">
      <div
        v-for="(npc, i) in npcs.slice(0, 4)"
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
