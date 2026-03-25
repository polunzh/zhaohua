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
  { x: 40, y: 65 },
  { x: 60, y: 68 },
];
</script>

<template>
  <div class="scene post-office-scene">
    <svg viewBox="0 0 800 500" class="scene-bg" preserveAspectRatio="xMidYMid meet">
      <!-- Floor -->
      <rect x="0" y="0" width="800" height="500" fill="#d4c8a8" />
      <!-- Floor tiles -->
      <g opacity="0.3">
        <line
          v-for="i in 10"
          :key="'fh' + i"
          x1="0"
          :y1="i * 50"
          x2="800"
          :y2="i * 50"
          stroke="#c0b490"
          stroke-width="1"
        />
        <line
          v-for="j in 16"
          :key="'fv' + j"
          :x1="j * 50"
          y1="0"
          :x2="j * 50"
          y2="500"
          stroke="#c0b490"
          stroke-width="1"
        />
      </g>

      <!-- Back wall -->
      <rect x="0" y="0" width="800" height="140" fill="#c8b898" stroke="#4a4040" stroke-width="2" />

      <!-- Counter (long desk) -->
      <rect
        x="100"
        y="180"
        width="600"
        height="40"
        rx="4"
        fill="#a08050"
        stroke="#4a4040"
        stroke-width="3"
      />
      <!-- Counter front panel -->
      <rect
        x="100"
        y="220"
        width="600"
        height="30"
        rx="0"
        fill="#8a6a38"
        stroke="#4a4040"
        stroke-width="2"
      />
      <!-- Counter top highlight -->
      <rect x="105" y="183" width="590" height="4" rx="2" fill="#b89860" opacity="0.5" />

      <!-- Scale on counter -->
      <g class="clickable-object" @click="emit('clickObject', 'scale')">
        <rect
          x="370"
          y="160"
          width="60"
          height="20"
          rx="3"
          fill="#888888"
          stroke="#4a4040"
          stroke-width="2"
        />
        <rect
          x="390"
          y="148"
          width="20"
          height="14"
          rx="2"
          fill="#999999"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <!-- Scale needle -->
        <line x1="400" y1="150" x2="400" y2="158" stroke="#4a4040" stroke-width="1.5" />
        <!-- Scale dish -->
        <ellipse
          cx="400"
          cy="162"
          rx="22"
          ry="4"
          fill="#aaaaaa"
          stroke="#4a4040"
          stroke-width="1"
        />
      </g>

      <!-- Shelves behind counter (on back wall) -->
      <!-- Shelf 1 -->
      <rect
        x="120"
        y="30"
        width="240"
        height="12"
        rx="2"
        fill="#a08050"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <!-- Packages on shelf 1 -->
      <rect
        x="130"
        y="10"
        width="30"
        height="20"
        rx="2"
        fill="#c8a860"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="170"
        y="14"
        width="25"
        height="16"
        rx="2"
        fill="#b8786a"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="210"
        y="8"
        width="35"
        height="22"
        rx="2"
        fill="#a8b888"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="260"
        y="12"
        width="28"
        height="18"
        rx="2"
        fill="#c8a860"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="300"
        y="16"
        width="22"
        height="14"
        rx="2"
        fill="#d4a870"
        stroke="#4a4040"
        stroke-width="1.5"
      />

      <!-- Shelf 2 -->
      <rect
        x="120"
        y="80"
        width="240"
        height="12"
        rx="2"
        fill="#a08050"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <!-- Packages on shelf 2 -->
      <rect
        x="125"
        y="60"
        width="28"
        height="20"
        rx="2"
        fill="#d4a870"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="165"
        y="64"
        width="32"
        height="16"
        rx="2"
        fill="#a8b888"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="215"
        y="58"
        width="26"
        height="22"
        rx="2"
        fill="#b8786a"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="260"
        y="62"
        width="30"
        height="18"
        rx="2"
        fill="#c8a860"
        stroke="#4a4040"
        stroke-width="1.5"
      />

      <!-- Mail bags (right side behind counter) -->
      <g>
        <ellipse
          cx="550"
          cy="100"
          rx="30"
          ry="35"
          fill="#8a9a68"
          stroke="#4a4040"
          stroke-width="2"
        />
        <text x="550" y="105" text-anchor="middle" font-size="10" fill="#4a4040" opacity="0.5">
          邮
        </text>
        <ellipse
          cx="620"
          cy="105"
          rx="28"
          ry="32"
          fill="#9a8a60"
          stroke="#4a4040"
          stroke-width="2"
        />
        <text x="620" y="110" text-anchor="middle" font-size="10" fill="#4a4040" opacity="0.5">
          邮
        </text>
        <ellipse
          cx="690"
          cy="100"
          rx="30"
          ry="35"
          fill="#8a9a68"
          stroke="#4a4040"
          stroke-width="2"
        />
      </g>

      <!-- Stamp/ink pad on counter -->
      <rect
        x="200"
        y="168"
        width="24"
        height="12"
        rx="2"
        fill="#4a4040"
        stroke="#4a4040"
        stroke-width="1"
      />

      <!-- Exit door (bottom) -->
      <g class="exit-area" @click="emit('clickExit', 'town-road')">
        <rect
          x="350"
          y="430"
          width="100"
          height="65"
          rx="3"
          fill="#8a7050"
          stroke="#4a4040"
          stroke-width="2"
        />
        <circle cx="435" cy="462" r="4" fill="#b89860" stroke="#4a4040" stroke-width="1.5" />
        <text x="400" y="425" text-anchor="middle" font-size="11" fill="#4a4040" opacity="0.6">
          → 镇街
        </text>
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
