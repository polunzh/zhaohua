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

// NPC positions in the classroom (x, y percentages)
const npcPositions = [
  { x: 20, y: 35 },
  { x: 45, y: 35 },
  { x: 70, y: 35 },
  { x: 20, y: 55 },
  { x: 45, y: 55 },
  { x: 70, y: 55 },
];
</script>

<template>
  <div class="scene classroom-scene">
    <!-- SVG Background -->
    <svg viewBox="0 0 800 500" class="scene-bg" preserveAspectRatio="xMidYMid meet">
      <!-- Floor -->
      <rect x="0" y="0" width="800" height="500" fill="#d4c8a8" />
      <!-- Floor boards -->
      <line
        v-for="i in 10"
        :key="'fb' + i"
        :x1="0"
        :y1="i * 50"
        :x2="800"
        :y2="i * 50"
        stroke="#c8bc98"
        stroke-width="1"
        opacity="0.5"
      />

      <!-- Back wall -->
      <rect x="0" y="0" width="800" height="120" fill="#c8b898" stroke="#4a4040" stroke-width="2" />
      <!-- Wall line -->
      <line x1="0" y1="120" x2="800" y2="120" stroke="#4a4040" stroke-width="2" />

      <!-- Blackboard -->
      <rect
        x="250"
        y="15"
        width="300"
        height="90"
        rx="4"
        fill="#3a5a3a"
        stroke="#6a5a4a"
        stroke-width="4"
      />
      <!-- Chalk text on board -->
      <text
        x="400"
        y="55"
        text-anchor="middle"
        font-size="16"
        fill="#c8c8b0"
        font-family="serif"
        opacity="0.7"
      >
        语 文 课
      </text>
      <line x1="300" y1="75" x2="500" y2="75" stroke="#c8c8b0" stroke-width="1" opacity="0.5" />

      <!-- Windows (left) -->
      <rect
        x="30"
        y="20"
        width="60"
        height="80"
        rx="3"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="2"
      />
      <line x1="60" y1="20" x2="60" y2="100" stroke="#4a4040" stroke-width="1.5" />
      <line x1="30" y1="60" x2="90" y2="60" stroke="#4a4040" stroke-width="1.5" />
      <!-- Curtain hint -->
      <path
        d="M30,20 Q38,30 30,40 Q38,50 30,60"
        fill="none"
        stroke="#c4706a"
        stroke-width="1"
        opacity="0.3"
      />

      <!-- Windows (right) -->
      <rect
        x="710"
        y="20"
        width="60"
        height="80"
        rx="3"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="2"
      />
      <line x1="740" y1="20" x2="740" y2="100" stroke="#4a4040" stroke-width="1.5" />
      <line x1="710" y1="60" x2="770" y2="60" stroke="#4a4040" stroke-width="1.5" />

      <!-- Desks (3 columns x 2 rows) -->
      <g v-for="row in 2" :key="'row' + row">
        <g v-for="col in 3" :key="'desk' + row + col">
          <rect
            :x="100 + (col - 1) * 250"
            :y="160 + (row - 1) * 140"
            width="120"
            height="50"
            rx="4"
            fill="#b89860"
            stroke="#4a4040"
            stroke-width="2"
          />
          <!-- Desk highlight -->
          <rect
            :x="102 + (col - 1) * 250"
            :y="162 + (row - 1) * 140"
            width="116"
            height="3"
            rx="2"
            fill="#c8a870"
          />
        </g>
      </g>

      <!-- Stove (bottom left, winter) -->
      <g v-if="season === 'winter'">
        <rect
          x="20"
          y="400"
          width="50"
          height="60"
          rx="4"
          fill="#5a5050"
          stroke="#4a4040"
          stroke-width="2"
        />
        <rect
          x="35"
          y="388"
          width="20"
          height="14"
          rx="2"
          fill="#5a5050"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <!-- Fire glow -->
        <circle cx="45" cy="420" r="8" fill="#d88040" opacity="0.4" />
        <circle cx="45" cy="420" r="4" fill="#e8a040" opacity="0.6" />
      </g>

      <!-- Door (bottom center) -->
      <g class="exit-area" @click="emit('clickExit', 'playground')">
        <rect
          x="360"
          y="440"
          width="80"
          height="60"
          rx="3"
          fill="#8a7050"
          stroke="#4a4040"
          stroke-width="2"
        />
        <!-- Door handle -->
        <circle cx="425" cy="470" r="4" fill="#b89860" stroke="#4a4040" stroke-width="1.5" />
        <!-- Door panels -->
        <rect x="368" y="448" width="28" height="20" rx="2" fill="#7a6040" opacity="0.3" />
        <rect x="404" y="448" width="28" height="20" rx="2" fill="#7a6040" opacity="0.3" />
        <!-- Exit label -->
        <text x="400" y="438" text-anchor="middle" font-size="11" fill="#4a4040" opacity="0.6">
          → 操场
        </text>
      </g>

      <!-- Teacher's desk (front, near blackboard) -->
      <rect
        x="330"
        y="125"
        width="140"
        height="30"
        rx="4"
        fill="#a08050"
        stroke="#4a4040"
        stroke-width="2"
        class="clickable-object"
        @click="emit('clickObject', 'desk')"
      />
    </svg>

    <!-- NPC Layer (HTML positioned over SVG) -->
    <div class="npc-layer">
      <div
        v-for="(npc, i) in npcs.slice(0, 6)"
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
