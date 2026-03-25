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
  { x: 55, y: 70 },
  { x: 35, y: 68 },
];
</script>

<template>
  <div class="scene villager-house-scene">
    <svg viewBox="0 0 800 500" class="scene-bg" preserveAspectRatio="xMidYMid meet">
      <!-- Sky -->
      <rect x="0" y="0" width="800" height="200" fill="#c8d0b8" />
      <!-- Ground -->
      <rect x="0" y="200" width="800" height="300" fill="#d4c8a8" />
      <!-- Grass patches -->
      <rect x="0" y="200" width="140" height="300" fill="#9aaa88" opacity="0.5" />
      <rect x="660" y="200" width="140" height="300" fill="#9aaa88" opacity="0.5" />

      <!-- Fence (yard boundary) -->
      <g>
        <!-- Bottom fence -->
        <line x1="140" y1="410" x2="660" y2="410" stroke="#a08050" stroke-width="3" />
        <!-- Left fence -->
        <line x1="140" y1="200" x2="140" y2="410" stroke="#a08050" stroke-width="3" />
        <!-- Right fence -->
        <line x1="660" y1="200" x2="660" y2="410" stroke="#a08050" stroke-width="3" />
        <!-- Fence posts -->
        <rect
          v-for="i in 6"
          :key="'post' + i"
          :x="140 + i * 80 - 4"
          y="405"
          width="8"
          height="18"
          rx="2"
          fill="#a08050"
          stroke="#4a4040"
          stroke-width="1.5"
        />
        <!-- Fence rails -->
        <line x1="140" y1="390" x2="660" y2="390" stroke="#a08050" stroke-width="2" opacity="0.6" />
      </g>

      <!-- House body (brick walls) -->
      <rect
        x="250"
        y="120"
        width="300"
        height="180"
        rx="4"
        fill="#b8786a"
        stroke="#4a4040"
        stroke-width="3"
      />
      <!-- Brick pattern -->
      <g opacity="0.2">
        <line
          v-for="i in 8"
          :key="'bh' + i"
          :x1="250"
          :y1="120 + i * 20"
          :x2="550"
          :y2="120 + i * 20"
          stroke="#4a4040"
          stroke-width="1"
        />
        <line
          v-for="j in 6"
          :key="'bv' + j"
          :x1="250 + j * 50"
          :y1="120"
          :x2="250 + j * 50"
          :y2="300"
          stroke="#4a4040"
          stroke-width="1"
        />
      </g>

      <!-- Triangular roof -->
      <polygon points="230,120 400,30 570,120" fill="#8a6a48" stroke="#4a4040" stroke-width="3" />
      <!-- Roof ridge highlight -->
      <line x1="315" y1="75" x2="400" y2="30" stroke="#9a7a58" stroke-width="2" opacity="0.5" />

      <!-- Door -->
      <rect
        x="370"
        y="210"
        width="60"
        height="90"
        rx="3"
        fill="#6a5a3a"
        stroke="#4a4040"
        stroke-width="2"
      />
      <circle cx="420" cy="258" r="3" fill="#b89860" stroke="#4a4040" stroke-width="1" />
      <!-- Door panels -->
      <rect x="378" y="218" width="20" height="35" rx="2" fill="#5a4a2a" opacity="0.3" />
      <rect x="402" y="218" width="20" height="35" rx="2" fill="#5a4a2a" opacity="0.3" />

      <!-- Windows -->
      <rect
        x="275"
        y="160"
        width="55"
        height="50"
        rx="3"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="2"
      />
      <line x1="302" y1="160" x2="302" y2="210" stroke="#4a4040" stroke-width="1.5" />
      <line x1="275" y1="185" x2="330" y2="185" stroke="#4a4040" stroke-width="1.5" />

      <rect
        x="470"
        y="160"
        width="55"
        height="50"
        rx="3"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="2"
      />
      <line x1="497" y1="160" x2="497" y2="210" stroke="#4a4040" stroke-width="1.5" />
      <line x1="470" y1="185" x2="525" y2="185" stroke="#4a4040" stroke-width="1.5" />

      <!-- Chicken -->
      <g class="clickable-object" @click="emit('clickObject', 'chicken')">
        <!-- Body -->
        <ellipse
          cx="580"
          cy="365"
          rx="14"
          ry="10"
          fill="#e8d8a0"
          stroke="#4a4040"
          stroke-width="2"
        />
        <!-- Head -->
        <circle cx="596" cy="356" r="7" fill="#e8d8a0" stroke="#4a4040" stroke-width="1.5" />
        <!-- Beak -->
        <polygon
          points="603,355 610,358 603,360"
          fill="#d88040"
          stroke="#4a4040"
          stroke-width="1"
        />
        <!-- Eye -->
        <circle cx="598" cy="354" r="1.5" fill="#4a4040" />
        <!-- Legs -->
        <line x1="576" y1="375" x2="574" y2="385" stroke="#d88040" stroke-width="1.5" />
        <line x1="584" y1="375" x2="586" y2="385" stroke="#d88040" stroke-width="1.5" />
        <!-- Comb -->
        <path
          d="M592,350 Q594,345 596,349 Q598,344 600,349"
          fill="#c84040"
          stroke="#4a4040"
          stroke-width="1"
        />
      </g>

      <!-- Exit to village road -->
      <g class="exit-area" @click="emit('clickExit', 'village-road')">
        <rect
          x="340"
          y="430"
          width="120"
          height="50"
          rx="6"
          fill="#d4c8a8"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.7"
        />
        <text x="400" y="460" text-anchor="middle" font-size="12" fill="#4a4040">→ 村路</text>
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
