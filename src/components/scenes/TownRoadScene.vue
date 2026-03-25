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
  { x: 40, y: 72 },
  { x: 55, y: 70 },
  { x: 65, y: 74 },
];
</script>

<template>
  <div class="scene town-road-scene">
    <svg viewBox="0 0 800 500" class="scene-bg" preserveAspectRatio="xMidYMid meet">
      <!-- Sky -->
      <rect x="0" y="0" width="800" height="160" fill="#c8d0b8" />

      <!-- Buildings - left side -->
      <!-- Building 1 (tall) -->
      <rect
        x="20"
        y="80"
        width="120"
        height="280"
        rx="3"
        fill="#b8786a"
        stroke="#4a4040"
        stroke-width="2"
      />
      <rect
        x="35"
        y="100"
        width="30"
        height="30"
        rx="2"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="95"
        y="100"
        width="30"
        height="30"
        rx="2"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="35"
        y="150"
        width="30"
        height="30"
        rx="2"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="95"
        y="150"
        width="30"
        height="30"
        rx="2"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="60"
        y="290"
        width="40"
        height="70"
        rx="2"
        fill="#6a5a3a"
        stroke="#4a4040"
        stroke-width="2"
      />

      <!-- Building 2 (shorter) -->
      <rect
        x="160"
        y="140"
        width="110"
        height="220"
        rx="3"
        fill="#c8b898"
        stroke="#4a4040"
        stroke-width="2"
      />
      <rect
        x="175"
        y="160"
        width="28"
        height="28"
        rx="2"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="228"
        y="160"
        width="28"
        height="28"
        rx="2"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="195"
        y="290"
        width="40"
        height="70"
        rx="2"
        fill="#6a5a3a"
        stroke="#4a4040"
        stroke-width="2"
      />

      <!-- Buildings - right side -->
      <!-- Building 3 (medium) -->
      <rect
        x="530"
        y="110"
        width="120"
        height="250"
        rx="3"
        fill="#c4a882"
        stroke="#4a4040"
        stroke-width="2"
      />
      <rect
        x="545"
        y="130"
        width="28"
        height="28"
        rx="2"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="608"
        y="130"
        width="28"
        height="28"
        rx="2"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="545"
        y="180"
        width="28"
        height="28"
        rx="2"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="608"
        y="180"
        width="28"
        height="28"
        rx="2"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="572"
        y="290"
        width="38"
        height="70"
        rx="2"
        fill="#6a5a3a"
        stroke="#4a4040"
        stroke-width="2"
      />

      <!-- Building 4 (tall, rightmost) -->
      <rect
        x="670"
        y="70"
        width="110"
        height="290"
        rx="3"
        fill="#b8786a"
        stroke="#4a4040"
        stroke-width="2"
      />
      <rect
        x="685"
        y="90"
        width="26"
        height="26"
        rx="2"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="740"
        y="90"
        width="26"
        height="26"
        rx="2"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="685"
        y="140"
        width="26"
        height="26"
        rx="2"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="740"
        y="140"
        width="26"
        height="26"
        rx="2"
        fill="#b8c8b8"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="710"
        y="290"
        width="36"
        height="70"
        rx="2"
        fill="#6a5a3a"
        stroke="#4a4040"
        stroke-width="2"
      />

      <!-- Road -->
      <rect x="290" y="160" width="220" height="340" fill="#b8a888" />
      <line
        v-for="i in 6"
        :key="'dash' + i"
        x1="400"
        :y1="180 + i * 50"
        x2="400"
        :y2="200 + i * 50"
        stroke="#d4c8a8"
        stroke-width="2"
        stroke-dasharray="4,3"
        opacity="0.5"
      />

      <!-- Sidewalks -->
      <rect
        x="275"
        y="160"
        width="18"
        height="340"
        fill="#d4c8a8"
        stroke="#4a4040"
        stroke-width="1"
        opacity="0.5"
      />
      <rect
        x="507"
        y="160"
        width="18"
        height="340"
        fill="#d4c8a8"
        stroke="#4a4040"
        stroke-width="1"
        opacity="0.5"
      />

      <!-- Signpost (left) -->
      <rect
        x="300"
        y="200"
        width="5"
        height="60"
        fill="#8a7050"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="285"
        y="195"
        width="50"
        height="18"
        rx="3"
        fill="#c8b060"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <text x="310" y="208" text-anchor="middle" font-size="8" fill="#4a4040">邮局→</text>

      <!-- Signpost (right) -->
      <rect
        x="490"
        y="220"
        width="5"
        height="55"
        fill="#8a7050"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="470"
        y="215"
        width="50"
        height="18"
        rx="3"
        fill="#c8b060"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <text x="495" y="228" text-anchor="middle" font-size="8" fill="#4a4040">←集市</text>

      <!-- Exit: village-road (bottom) -->
      <g class="exit-area" @click="emit('clickExit', 'village-road')">
        <rect
          x="340"
          y="450"
          width="120"
          height="45"
          rx="6"
          fill="#b8a888"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.7"
        />
        <text x="400" y="477" text-anchor="middle" font-size="12" fill="#4a4040">→ 村路</text>
      </g>

      <!-- Exit: post-office (left) -->
      <g class="exit-area" @click="emit('clickExit', 'post-office')">
        <rect x="160" y="290" width="40" height="70" rx="3" fill="#6a5a3a" opacity="0.01" />
        <text x="215" y="335" text-anchor="middle" font-size="10" fill="#4a4040" opacity="0.7">
          邮局
        </text>
      </g>

      <!-- Exit: market (right) -->
      <g class="exit-area" @click="emit('clickExit', 'market')">
        <rect x="530" y="290" width="120" height="70" rx="3" fill="transparent" />
        <text x="590" y="335" text-anchor="middle" font-size="10" fill="#4a4040" opacity="0.7">
          集市
        </text>
      </g>

      <!-- Exit: clinic (top right building) -->
      <g class="exit-area" @click="emit('clickExit', 'clinic')">
        <rect x="670" y="290" width="110" height="70" rx="3" fill="transparent" />
        <text x="725" y="335" text-anchor="middle" font-size="10" fill="#4a4040" opacity="0.7">
          诊所
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
