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
  { x: 22, y: 72 },
  { x: 42, y: 68 },
  { x: 62, y: 74 },
  { x: 80, y: 70 },
];

// Stall definitions
const stalls = [
  { x: 60, color: "#c84040", label: "蔬菜" },
  { x: 260, color: "#4080c0", label: "布匹" },
  { x: 460, color: "#c8a040", label: "粮油" },
  { x: 640, color: "#60a060", label: "杂货" },
];
</script>

<template>
  <div class="scene market-scene">
    <svg viewBox="0 0 800 500" class="scene-bg" preserveAspectRatio="xMidYMid meet">
      <!-- Sky -->
      <rect x="0" y="0" width="800" height="120" fill="#c8d0b8" />
      <!-- Ground (dirt) -->
      <rect x="0" y="120" width="800" height="380" fill="#d4c8a8" />
      <!-- Ground texture -->
      <g opacity="0.15">
        <circle
          v-for="i in 20"
          :key="'gd' + i"
          :cx="40 * i"
          :cy="350 + (i % 3) * 30"
          :r="2"
          fill="#4a4040"
        />
      </g>

      <!-- Market stalls -->
      <g v-for="(stall, idx) in stalls" :key="'stall' + idx">
        <!-- Stall counter (table) -->
        <rect
          :x="stall.x"
          y="240"
          width="150"
          height="50"
          rx="4"
          fill="#a08050"
          stroke="#4a4040"
          stroke-width="2"
        />
        <!-- Front panel -->
        <rect
          :x="stall.x"
          y="290"
          width="150"
          height="20"
          fill="#8a6a38"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <!-- Awning poles -->
        <line
          :x1="stall.x + 10"
          y1="140"
          :x2="stall.x + 10"
          y2="240"
          stroke="#8a7050"
          stroke-width="3"
        />
        <line
          :x1="stall.x + 140"
          y1="140"
          :x2="stall.x + 140"
          y2="240"
          stroke="#8a7050"
          stroke-width="3"
        />
        <!-- Awning (triangle top) -->
        <polygon
          :points="`${stall.x - 10},175 ${stall.x + 75},130 ${stall.x + 160},175`"
          :fill="stall.color"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.8"
        />
        <!-- Awning scallop edge -->
        <path
          :d="`M${stall.x - 10},175 Q${stall.x + 15},185 ${stall.x + 40},175 Q${stall.x + 65},185 ${stall.x + 90},175 Q${stall.x + 115},185 ${stall.x + 140},175 Q${stall.x + 155},185 ${stall.x + 160},175`"
          fill="none"
          :stroke="stall.color"
          stroke-width="2"
          opacity="0.6"
        />
        <!-- Goods on stall -->
        <circle
          :cx="stall.x + 25"
          cy="232"
          r="8"
          fill="#e8c870"
          stroke="#4a4040"
          stroke-width="1"
        />
        <circle
          :cx="stall.x + 50"
          cy="230"
          r="10"
          :fill="idx % 2 === 0 ? '#88b868' : '#c89050'"
          stroke="#4a4040"
          stroke-width="1"
        />
        <circle
          :cx="stall.x + 75"
          cy="232"
          r="7"
          fill="#d88060"
          stroke="#4a4040"
          stroke-width="1"
        />
        <rect
          :x="stall.x + 90"
          y="226"
          width="20"
          height="14"
          rx="2"
          fill="#c8a860"
          stroke="#4a4040"
          stroke-width="1"
        />
        <circle
          :cx="stall.x + 125"
          cy="230"
          r="9"
          :fill="idx % 2 === 0 ? '#d0a040' : '#80a860'"
          stroke="#4a4040"
          stroke-width="1"
        />
        <!-- Stall label -->
        <text
          :x="stall.x + 75"
          y="160"
          text-anchor="middle"
          font-size="11"
          fill="#4a4040"
          opacity="0.6"
        >
          {{ stall.label }}
        </text>
      </g>

      <!-- Exit to town road -->
      <g class="exit-area" @click="emit('clickExit', 'town-road')">
        <rect
          x="340"
          y="440"
          width="120"
          height="50"
          rx="6"
          fill="#d4c8a8"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.7"
        />
        <text x="400" y="470" text-anchor="middle" font-size="12" fill="#4a4040">→ 镇街</text>
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
