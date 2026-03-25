<script setup lang="ts">
import { computed } from "vue";
import SvgCharacter from "../SvgCharacter.vue";
import { getSceneColors } from "../../composables/useSeasonColors";

const props = defineProps<{
  npcs: { id: string; name: string; mood: string; hairColor?: string; bodyColor?: string }[];
  season: string;
}>();

const emit = defineEmits<{
  clickNpc: [npcId: string];
  clickExit: [targetMapId: string];
  clickObject: [objectName: string];
}>();

// NPC positions around the garden
const npcPositions = [
  { x: 20, y: 45 },
  { x: 75, y: 40 },
  { x: 50, y: 75 },
  { x: 30, y: 70 },
  { x: 70, y: 70 },
];

// Flower base positions (cx, cy, base radius)
const flowerPositions = [
  { cx: 310, cy: 220, r: 6 },
  { cx: 340, cy: 200, r: 5 },
  { cx: 370, cy: 230, r: 7 },
  { cx: 400, cy: 210, r: 5 },
  { cx: 430, cy: 235, r: 6 },
  { cx: 460, cy: 205, r: 5 },
  { cx: 490, cy: 225, r: 7 },
  { cx: 325, cy: 250, r: 5 },
  { cx: 355, cy: 260, r: 6 },
  { cx: 385, cy: 245, r: 5 },
  { cx: 415, cy: 260, r: 7 },
  { cx: 445, cy: 250, r: 5 },
  { cx: 475, cy: 265, r: 6 },
  { cx: 350, cy: 280, r: 5 },
  { cx: 380, cy: 275, r: 6 },
  { cx: 410, cy: 285, r: 5 },
  { cx: 440, cy: 278, r: 7 },
  { cx: 470, cy: 285, r: 5 },
  { cx: 500, cy: 250, r: 6 },
  { cx: 300, cy: 265, r: 5 },
];

const colors = computed(() => getSceneColors(props.season));

const seasonalFlowers = computed(() => {
  const fc = colors.value.flowerColors;
  if (fc.length === 0) return [];
  const isBud = colors.value.flowerState === "bud";
  return flowerPositions.map((pos, i) => ({
    ...pos,
    r: isBud ? pos.r * 0.6 : pos.r,
    fill: fc[i % fc.length],
  }));
});

// Winter bare stems: 8 short brown lines inside the flower bed
const bareStems = [
  { x1: 320, y1: 290, x2: 320, y2: 260 },
  { x1: 350, y1: 295, x2: 350, y2: 265 },
  { x1: 380, y1: 290, x2: 380, y2: 258 },
  { x1: 410, y1: 295, x2: 410, y2: 262 },
  { x1: 440, y1: 290, x2: 440, y2: 260 },
  { x1: 470, y1: 295, x2: 470, y2: 263 },
  { x1: 335, y1: 285, x2: 335, y2: 255 },
  { x1: 455, y1: 285, x2: 455, y2: 257 },
];

// Snow overlay positions
const snowCircles = [
  { cx: 150, cy: 80, r: 6 },
  { cx: 280, cy: 60, r: 4 },
  { cx: 420, cy: 50, r: 5 },
  { cx: 560, cy: 75, r: 6 },
  { cx: 680, cy: 55, r: 4 },
  { cx: 100, cy: 170, r: 5 },
  { cx: 230, cy: 155, r: 4 },
  { cx: 500, cy: 150, r: 5 },
  { cx: 630, cy: 165, r: 6 },
  { cx: 750, cy: 145, r: 4 },
  { cx: 50, cy: 350, r: 5 },
  { cx: 190, cy: 370, r: 6 },
  { cx: 360, cy: 360, r: 4 },
  { cx: 580, cy: 375, r: 5 },
  { cx: 720, cy: 355, r: 6 },
  { cx: 800, cy: 420, r: 4 },
  { cx: 130, cy: 450, r: 5 },
  { cx: 450, cy: 440, r: 6 },
  { cx: 640, cy: 455, r: 4 },
];
</script>

<template>
  <div class="scene flower-pool-scene">
    <!-- SVG Background -->
    <svg viewBox="0 0 800 500" class="scene-bg" preserveAspectRatio="xMidYMid meet">
      <!-- Grass background -->
      <rect x="0" y="0" width="800" height="500" :fill="colors.grass" />

      <!-- Small path through the middle -->
      <path
        d="M0,300 Q200,280 400,300 Q600,320 800,300"
        fill="none"
        stroke="#d4c8a8"
        stroke-width="40"
        stroke-linecap="round"
        opacity="0.7"
      />

      <!-- Central flower bed -->
      <rect
        x="270"
        y="180"
        width="260"
        height="130"
        rx="20"
        :fill="colors.flowerState === 'bare' ? '#8a8a70' : '#7a9a68'"
        stroke="#4a4040"
        stroke-width="2"
        class="clickable-object"
        @click="emit('clickObject', 'flower-bed')"
      />
      <!-- Flower bed border -->
      <rect
        x="275"
        y="185"
        width="250"
        height="120"
        rx="18"
        fill="none"
        stroke="#6a8a58"
        stroke-width="1.5"
        opacity="0.5"
      />

      <!-- Flowers (seasonal) -->
      <circle
        v-for="(f, i) in seasonalFlowers"
        :key="'flower' + i"
        :cx="f.cx"
        :cy="f.cy"
        :r="f.r"
        :fill="f.fill"
        stroke="#4a4040"
        stroke-width="1"
        opacity="0.9"
      />

      <!-- Winter bare stems -->
      <line
        v-if="colors.flowerState === 'bare'"
        v-for="(s, i) in bareStems"
        :key="'stem' + i"
        :x1="s.x1"
        :y1="s.y1"
        :x2="s.x2"
        :y2="s.y2"
        stroke="#7a5030"
        stroke-width="2"
        stroke-linecap="round"
      />

      <!-- Snow overlay -->
      <circle
        v-if="colors.showSnow"
        v-for="(s, i) in snowCircles"
        :key="'snow' + i"
        :cx="s.cx"
        :cy="s.cy"
        :r="s.r"
        fill="white"
        opacity="0.7"
      />

      <!-- Bamboo (left side) -->
      <g>
        <rect
          x="80"
          y="80"
          width="8"
          height="300"
          rx="3"
          fill="#6a8a58"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <rect x="80" y="140" width="8" height="4" rx="1" fill="#5a7a48" />
        <rect x="80" y="220" width="8" height="4" rx="1" fill="#5a7a48" />
        <rect x="80" y="300" width="8" height="4" rx="1" fill="#5a7a48" />

        <rect
          x="100"
          y="100"
          width="7"
          height="270"
          rx="3"
          fill="#7a9a68"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <rect x="100" y="160" width="7" height="4" rx="1" fill="#6a8a58" />
        <rect x="100" y="240" width="7" height="4" rx="1" fill="#6a8a58" />
        <rect x="100" y="320" width="7" height="4" rx="1" fill="#6a8a58" />

        <rect
          x="118"
          y="90"
          width="7"
          height="280"
          rx="3"
          fill="#6a8a58"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <rect x="118" y="150" width="7" height="4" rx="1" fill="#5a7a48" />
        <rect x="118" y="230" width="7" height="4" rx="1" fill="#5a7a48" />
        <rect x="118" y="310" width="7" height="4" rx="1" fill="#5a7a48" />
      </g>

      <!-- Stone bench (right side) -->
      <rect
        x="620"
        y="260"
        width="100"
        height="20"
        rx="6"
        fill="#a0a0a0"
        stroke="#4a4040"
        stroke-width="2"
        class="clickable-object"
        @click="emit('clickObject', 'bench')"
      />
      <!-- Bench legs -->
      <rect
        x="635"
        y="280"
        width="14"
        height="16"
        rx="3"
        fill="#909090"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="691"
        y="280"
        width="14"
        height="16"
        rx="3"
        fill="#909090"
        stroke="#4a4040"
        stroke-width="1.5"
      />

      <!-- Exit right → playground -->
      <g class="exit-area" @click="emit('clickExit', 'playground')">
        <rect
          x="740"
          y="210"
          width="60"
          height="80"
          rx="10"
          fill="#d4c8a8"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.8"
        />
        <text x="770" y="255" text-anchor="middle" font-size="12" fill="#4a4040" opacity="0.7">
          操场 →
        </text>
      </g>

      <!-- Exit top → classroom -->
      <g class="exit-area" @click="emit('clickExit', 'classroom')">
        <rect
          x="350"
          y="0"
          width="100"
          height="40"
          rx="10"
          fill="#b8786a"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.8"
        />
        <text x="400" y="25" text-anchor="middle" font-size="12" fill="#4a4040" opacity="0.7">
          ↑ 教室
        </text>
      </g>
    </svg>

    <!-- NPC Layer -->
    <div class="npc-layer">
      <div
        v-for="(npc, i) in npcs.slice(0, 5)"
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
          :size="60"
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
