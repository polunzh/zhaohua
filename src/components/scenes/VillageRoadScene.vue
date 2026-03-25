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

// NPC positions along the road
const npcPositions = [
  { x: 25, y: 52 },
  { x: 45, y: 48 },
  { x: 65, y: 52 },
  { x: 35, y: 60 },
  { x: 55, y: 58 },
  { x: 80, y: 50 },
];
</script>

<template>
  <div class="scene village-road-scene">
    <!-- SVG Background -->
    <svg viewBox="0 0 800 500" class="scene-bg" preserveAspectRatio="xMidYMid meet">
      <!-- Sky -->
      <rect x="0" y="0" width="800" height="120" fill="#c8d0b8" />

      <!-- Mountains/hills in background -->
      <path
        d="M0,120 Q100,50 200,100 Q300,40 400,90 Q500,30 600,85 Q700,55 800,100 L800,120 Z"
        fill="#a8b8a0"
        opacity="0.6"
      />
      <path
        d="M0,120 Q150,70 300,110 Q450,60 600,100 Q750,80 800,110 L800,120 Z"
        fill="#b0c0a8"
        opacity="0.5"
      />

      <!-- Grass top area -->
      <rect x="0" y="120" width="800" height="100" fill="#9aaa88" />

      <!-- Dirt road in middle -->
      <rect
        x="0"
        y="220"
        width="800"
        height="120"
        fill="#d4c8a8"
        stroke="#4a4040"
        stroke-width="2"
      />
      <!-- Road texture lines -->
      <line x1="50" y1="280" x2="90" y2="280" stroke="#c8bc98" stroke-width="2" opacity="0.5" />
      <line x1="200" y1="280" x2="260" y2="280" stroke="#c8bc98" stroke-width="2" opacity="0.5" />
      <line x1="380" y1="280" x2="430" y2="280" stroke="#c8bc98" stroke-width="2" opacity="0.5" />
      <line x1="550" y1="280" x2="600" y2="280" stroke="#c8bc98" stroke-width="2" opacity="0.5" />
      <line x1="700" y1="280" x2="750" y2="280" stroke="#c8bc98" stroke-width="2" opacity="0.5" />

      <!-- Grass bottom area -->
      <rect x="0" y="340" width="800" height="160" fill="#9aaa88" />

      <!-- Trees scattered -->
      <!-- Tree 1 (top-left) -->
      <rect
        x="93"
        y="110"
        width="14"
        height="50"
        rx="3"
        fill="#8a7050"
        stroke="#4a4040"
        stroke-width="2"
      />
      <circle cx="100" cy="95" r="35" fill="#6a8a58" stroke="#4a4040" stroke-width="2" />
      <circle cx="85" cy="105" r="22" fill="#a8c490" opacity="0.7" />

      <!-- Tree 2 (top-right) -->
      <rect
        x="593"
        y="100"
        width="14"
        height="55"
        rx="3"
        fill="#8a7050"
        stroke="#4a4040"
        stroke-width="2"
      />
      <circle cx="600" cy="85" r="38" fill="#6a8a58" stroke="#4a4040" stroke-width="2" />
      <circle cx="615" cy="92" r="24" fill="#a8c490" opacity="0.7" />

      <!-- Tree 3 (bottom-left) -->
      <rect
        x="193"
        y="350"
        width="14"
        height="45"
        rx="3"
        fill="#8a7050"
        stroke="#4a4040"
        stroke-width="2"
      />
      <circle cx="200" cy="338" r="30" fill="#6a8a58" stroke="#4a4040" stroke-width="2" />
      <circle cx="188" cy="345" r="18" fill="#a8c490" opacity="0.7" />

      <!-- Tree 4 (bottom-right) -->
      <rect
        x="643"
        y="360"
        width="14"
        height="40"
        rx="3"
        fill="#8a7050"
        stroke="#4a4040"
        stroke-width="2"
      />
      <circle cx="650" cy="348" r="28" fill="#6a8a58" stroke="#4a4040" stroke-width="2" />
      <circle cx="662" cy="355" r="17" fill="#a8c490" opacity="0.7" />

      <!-- Small fence/wall on bottom side -->
      <g>
        <!-- Fence posts -->
        <rect
          x="350"
          y="345"
          width="8"
          height="30"
          rx="2"
          fill="#b89860"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <rect
          x="400"
          y="345"
          width="8"
          height="30"
          rx="2"
          fill="#b89860"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <rect
          x="450"
          y="345"
          width="8"
          height="30"
          rx="2"
          fill="#b89860"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <rect
          x="500"
          y="345"
          width="8"
          height="30"
          rx="2"
          fill="#b89860"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <!-- Fence rails -->
        <line x1="350" y1="352" x2="508" y2="352" stroke="#b89860" stroke-width="3" />
        <line x1="350" y1="365" x2="508" y2="365" stroke="#b89860" stroke-width="3" />
      </g>

      <!-- Exit left → playground (school) -->
      <g class="exit-area" @click="emit('clickExit', 'playground')">
        <rect
          x="0"
          y="230"
          width="50"
          height="100"
          rx="8"
          fill="#d4c8a8"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.8"
        />
        <text x="25" y="285" text-anchor="middle" font-size="11" fill="#4a4040" opacity="0.7">
          ← 学校
        </text>
      </g>

      <!-- Exit right → town-road -->
      <g class="exit-area" @click="emit('clickExit', 'town-road')">
        <rect
          x="750"
          y="230"
          width="50"
          height="100"
          rx="8"
          fill="#d4c8a8"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.8"
        />
        <text x="775" y="285" text-anchor="middle" font-size="11" fill="#4a4040" opacity="0.7">
          镇上 →
        </text>
      </g>

      <!-- Exit up → farmland -->
      <g class="exit-area" @click="emit('clickExit', 'farmland')">
        <rect
          x="350"
          y="125"
          width="100"
          height="40"
          rx="10"
          fill="#9aaa88"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.8"
        />
        <text x="400" y="150" text-anchor="middle" font-size="12" fill="#4a4040" opacity="0.7">
          ↑ 农田
        </text>
      </g>

      <!-- Exit down → villager-house -->
      <g class="exit-area" @click="emit('clickExit', 'villager-house')">
        <rect
          x="100"
          y="440"
          width="110"
          height="40"
          rx="10"
          fill="#b8786a"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.8"
        />
        <text x="155" y="465" text-anchor="middle" font-size="12" fill="#4a4040" opacity="0.7">
          ↓ 村民家
        </text>
      </g>
    </svg>

    <!-- NPC Layer -->
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
