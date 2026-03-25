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
  { x: 35, y: 60 },
  { x: 55, y: 62 },
  { x: 72, y: 58 },
];
</script>

<template>
  <div class="scene home-scene">
    <svg viewBox="0 0 800 500" class="scene-bg" preserveAspectRatio="xMidYMid meet">
      <!-- Floor -->
      <rect x="0" y="0" width="800" height="500" fill="#d4c8a8" />
      <!-- Floor boards -->
      <line
        v-for="i in 10"
        :key="'fb' + i"
        x1="0"
        :y1="i * 50"
        x2="800"
        :y2="i * 50"
        stroke="#c8bc98"
        stroke-width="1"
        opacity="0.4"
      />

      <!-- Back wall -->
      <rect x="0" y="0" width="800" height="150" fill="#c8b898" stroke="#4a4040" stroke-width="2" />
      <!-- Wall line -->
      <line x1="0" y1="150" x2="800" y2="150" stroke="#4a4040" stroke-width="2" />

      <!-- Window showing outside (left wall) -->
      <rect
        x="50"
        y="25"
        width="100"
        height="90"
        rx="4"
        fill="#c8d0b8"
        stroke="#4a4040"
        stroke-width="2"
      />
      <!-- Window panes -->
      <line x1="100" y1="25" x2="100" y2="115" stroke="#4a4040" stroke-width="1.5" />
      <line x1="50" y1="70" x2="150" y2="70" stroke="#4a4040" stroke-width="1.5" />
      <!-- Sky through window -->
      <rect x="52" y="27" width="46" height="41" fill="#c8d0b8" />
      <rect x="102" y="27" width="46" height="41" fill="#c8d0b8" />
      <!-- Grass through window -->
      <rect x="52" y="72" width="46" height="41" fill="#9aaa88" />
      <rect x="102" y="72" width="46" height="41" fill="#9aaa88" />
      <!-- Curtains -->
      <path
        d="M50,25 Q60,45 50,65 Q60,85 50,105"
        fill="none"
        stroke="#c4706a"
        stroke-width="1.5"
        opacity="0.4"
      />
      <path
        d="M150,25 Q140,45 150,65 Q140,85 150,105"
        fill="none"
        stroke="#c4706a"
        stroke-width="1.5"
        opacity="0.4"
      />

      <!-- Table (center) -->
      <g class="clickable-object" @click="emit('clickObject', 'table')">
        <rect
          x="280"
          y="220"
          width="200"
          height="80"
          rx="6"
          fill="#a08050"
          stroke="#4a4040"
          stroke-width="3"
        />
        <!-- Table top highlight -->
        <rect x="285" y="223" width="190" height="5" rx="3" fill="#b89860" opacity="0.5" />
        <!-- Table legs -->
        <rect
          x="290"
          y="300"
          width="10"
          height="40"
          fill="#8a6a38"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <rect
          x="460"
          y="300"
          width="10"
          height="40"
          fill="#8a6a38"
          stroke="#4a4040"
          stroke-width="1.5"
        />
      </g>

      <!-- Items on table -->
      <!-- Tea pot -->
      <ellipse
        cx="340"
        cy="215"
        rx="15"
        ry="10"
        fill="#8a7050"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="348"
        y="208"
        width="12"
        height="6"
        rx="2"
        fill="#8a7050"
        stroke="#4a4040"
        stroke-width="1"
      />
      <!-- Cups -->
      <rect
        x="380"
        y="210"
        width="12"
        height="10"
        rx="2"
        fill="#c8c8b8"
        stroke="#4a4040"
        stroke-width="1"
      />
      <rect
        x="410"
        y="210"
        width="12"
        height="10"
        rx="2"
        fill="#c8c8b8"
        stroke="#4a4040"
        stroke-width="1"
      />

      <!-- Chairs -->
      <!-- Chair left -->
      <rect
        x="240"
        y="260"
        width="30"
        height="30"
        rx="3"
        fill="#8a6a38"
        stroke="#4a4040"
        stroke-width="2"
      />
      <rect
        x="240"
        y="240"
        width="30"
        height="8"
        rx="2"
        fill="#8a6a38"
        stroke="#4a4040"
        stroke-width="1.5"
      />

      <!-- Chair right -->
      <rect
        x="490"
        y="260"
        width="30"
        height="30"
        rx="3"
        fill="#8a6a38"
        stroke="#4a4040"
        stroke-width="2"
      />
      <rect
        x="490"
        y="240"
        width="30"
        height="8"
        rx="2"
        fill="#8a6a38"
        stroke="#4a4040"
        stroke-width="1.5"
      />

      <!-- Stove (right side) -->
      <g class="clickable-object" @click="emit('clickObject', 'stove')">
        <rect
          x="620"
          y="180"
          width="80"
          height="90"
          rx="6"
          fill="#5a5050"
          stroke="#4a4040"
          stroke-width="3"
        />
        <!-- Stove top -->
        <rect
          x="625"
          y="175"
          width="70"
          height="10"
          rx="3"
          fill="#4a4040"
          stroke="#4a4040"
          stroke-width="1"
        />
        <!-- Stove door -->
        <rect
          x="640"
          y="210"
          width="40"
          height="30"
          rx="3"
          fill="#4a3a3a"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <!-- Fire glow -->
        <circle cx="660" cy="225" r="8" fill="#d88040" opacity="0.4" />
        <circle cx="660" cy="225" r="4" fill="#e8a040" opacity="0.6" />
        <!-- Chimney pipe -->
        <rect
          x="648"
          y="140"
          width="16"
          height="40"
          rx="2"
          fill="#5a5050"
          stroke="#4a4040"
          stroke-width="1.5"
        />
      </g>

      <!-- Calendar on wall -->
      <rect
        x="350"
        y="30"
        width="40"
        height="50"
        rx="2"
        fill="#e8e0d0"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect x="352" y="32" width="36" height="12" rx="1" fill="#c84040" />
      <text x="370" y="42" text-anchor="middle" font-size="8" fill="#ffffff">日历</text>
      <text x="370" y="68" text-anchor="middle" font-size="14" fill="#4a4040">15</text>

      <!-- Shelf on wall (right) -->
      <rect
        x="560"
        y="50"
        width="120"
        height="10"
        rx="2"
        fill="#a08050"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <!-- Items on shelf -->
      <rect
        x="570"
        y="32"
        width="20"
        height="18"
        rx="2"
        fill="#b8786a"
        stroke="#4a4040"
        stroke-width="1"
      />
      <circle cx="610" cy="42" r="9" fill="#c8a860" stroke="#4a4040" stroke-width="1" />
      <rect
        x="640"
        y="35"
        width="18"
        height="15"
        rx="2"
        fill="#8a9a68"
        stroke="#4a4040"
        stroke-width="1"
      />

      <!-- Exit door (bottom center) -->
      <g class="exit-area" @click="emit('clickExit', 'village-road')">
        <rect
          x="360"
          y="420"
          width="80"
          height="75"
          rx="3"
          fill="#8a7050"
          stroke="#4a4040"
          stroke-width="2"
        />
        <circle cx="425" cy="458" r="4" fill="#b89860" stroke="#4a4040" stroke-width="1.5" />
        <!-- Door panels -->
        <rect x="368" y="428" width="28" height="25" rx="2" fill="#7a6040" opacity="0.3" />
        <rect x="404" y="428" width="28" height="25" rx="2" fill="#7a6040" opacity="0.3" />
        <text x="400" y="415" text-anchor="middle" font-size="11" fill="#4a4040" opacity="0.6">
          → 村路
        </text>
      </g>
    </svg>

    <div class="npc-layer">
      <div
        v-for="(npc, i) in npcs.slice(0, 3)"
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
