<script setup lang="ts">
import { computed } from "vue";
import SvgCharacter from "../SvgCharacter.vue";
import { getSceneColors } from "../../composables/useSeasonColors";

const props = defineProps<{
  npcs: { id: string; name: string; mood: string; hairColor?: string; bodyColor?: string }[];
  season: string;
}>();

const colors = computed(() => getSceneColors(props.season));

const emit = defineEmits<{
  clickNpc: [npcId: string];
  clickExit: [targetMapId: string];
  clickObject: [objectName: string];
}>();

// NPC positions spread across the playground
const npcPositions = [
  { x: 30, y: 50 },
  { x: 55, y: 40 },
  { x: 70, y: 55 },
  { x: 25, y: 70 },
  { x: 50, y: 65 },
  { x: 75, y: 72 },
];
</script>

<template>
  <div class="scene playground-scene">
    <!-- SVG Background -->
    <svg viewBox="0 0 800 500" class="scene-bg" preserveAspectRatio="xMidYMid meet">
      <!-- Grass background -->
      <rect x="0" y="0" width="800" height="500" :fill="colors.grass" />

      <!-- Dirt center area -->
      <rect
        x="150"
        y="120"
        width="500"
        height="300"
        rx="20"
        fill="#d4c8a8"
        stroke="#4a4040"
        stroke-width="2"
      />

      <!-- Trees along top -->
      <!-- Tree 1 (top-left) -->
      <rect
        x="68"
        y="40"
        width="14"
        height="40"
        rx="3"
        fill="#8a7050"
        stroke="#4a4040"
        stroke-width="2"
      />
      <!-- Tree 1 crown (hidden in winter) -->
      <g v-if="!colors.showBareTree">
        <circle cx="75" cy="30" r="35" :fill="colors.treeLeaf" stroke="#4a4040" stroke-width="2" />
        <circle cx="60" cy="38" r="22" :fill="colors.treeLeafHighlight" opacity="0.7" />
      </g>
      <!-- Tree 1 bare branches (winter) -->
      <g v-if="colors.showBareTree">
        <line
          x1="75"
          y1="40"
          x2="55"
          y2="18"
          stroke="#8a7050"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <line
          x1="75"
          y1="40"
          x2="95"
          y2="15"
          stroke="#8a7050"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <line
          x1="75"
          y1="40"
          x2="75"
          y2="10"
          stroke="#8a7050"
          stroke-width="2"
          stroke-linecap="round"
        />
      </g>

      <!-- Tree 2 (top-center-right) -->
      <rect
        x="618"
        y="30"
        width="14"
        height="45"
        rx="3"
        fill="#8a7050"
        stroke="#4a4040"
        stroke-width="2"
      />
      <!-- Tree 2 crown (hidden in winter) -->
      <g v-if="!colors.showBareTree">
        <circle cx="625" cy="22" r="38" :fill="colors.treeLeaf" stroke="#4a4040" stroke-width="2" />
        <circle cx="640" cy="28" r="24" :fill="colors.treeLeafHighlight" opacity="0.7" />
      </g>
      <!-- Tree 2 bare branches (winter) -->
      <g v-if="colors.showBareTree">
        <line
          x1="625"
          y1="30"
          x2="605"
          y2="6"
          stroke="#8a7050"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <line
          x1="625"
          y1="30"
          x2="648"
          y2="4"
          stroke="#8a7050"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <line
          x1="625"
          y1="30"
          x2="625"
          y2="0"
          stroke="#8a7050"
          stroke-width="2"
          stroke-linecap="round"
        />
      </g>

      <!-- Tree 3 (right side) -->
      <rect
        x="738"
        y="180"
        width="14"
        height="40"
        rx="3"
        fill="#8a7050"
        stroke="#4a4040"
        stroke-width="2"
      />
      <!-- Tree 3 crown (hidden in winter) -->
      <g v-if="!colors.showBareTree">
        <circle
          cx="745"
          cy="170"
          r="32"
          :fill="colors.treeLeaf"
          stroke="#4a4040"
          stroke-width="2"
        />
        <circle cx="732" cy="178" r="20" :fill="colors.treeLeafHighlight" opacity="0.7" />
      </g>
      <!-- Tree 3 bare branches (winter) -->
      <g v-if="colors.showBareTree">
        <line
          x1="745"
          y1="180"
          x2="725"
          y2="158"
          stroke="#8a7050"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <line
          x1="745"
          y1="180"
          x2="765"
          y2="155"
          stroke="#8a7050"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <line
          x1="745"
          y1="180"
          x2="745"
          y2="150"
          stroke="#8a7050"
          stroke-width="2"
          stroke-linecap="round"
        />
      </g>

      <!-- Flag pole (center-top) -->
      <rect
        x="396"
        y="50"
        width="8"
        height="160"
        rx="2"
        fill="#888888"
        stroke="#4a4040"
        stroke-width="2"
      />
      <!-- Gold finial -->
      <circle cx="400" cy="48" r="6" fill="#d4b040" stroke="#4a4040" stroke-width="1.5" />
      <!-- Red flag -->
      <polygon points="404,55 450,70 404,85" fill="#c85050" stroke="#4a4040" stroke-width="1.5" />

      <!-- Basketball hoop (right side) -->
      <rect
        x="670"
        y="200"
        width="10"
        height="100"
        rx="3"
        fill="#888888"
        stroke="#4a4040"
        stroke-width="2"
      />
      <!-- Backboard -->
      <rect
        x="645"
        y="190"
        width="60"
        height="40"
        rx="4"
        fill="#e8e0d0"
        stroke="#4a4040"
        stroke-width="2"
        class="clickable-object"
        @click="emit('clickObject', 'basketball-hoop')"
      />
      <!-- Rim -->
      <ellipse cx="675" cy="232" rx="15" ry="5" fill="none" stroke="#c85050" stroke-width="2.5" />

      <!-- Exit bottom → village-road -->
      <g class="exit-area" @click="emit('clickExit', 'village-road')">
        <rect
          x="340"
          y="450"
          width="120"
          height="50"
          rx="10"
          fill="#d4c8a8"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.8"
        />
        <text x="400" y="480" text-anchor="middle" font-size="12" fill="#4a4040" opacity="0.7">
          ↓ 村路
        </text>
      </g>

      <!-- Exit top-left → classroom -->
      <g class="exit-area" @click="emit('clickExit', 'classroom')">
        <rect
          x="20"
          y="90"
          width="100"
          height="40"
          rx="6"
          fill="#b8786a"
          stroke="#4a4040"
          stroke-width="2"
        />
        <text x="70" y="115" text-anchor="middle" font-size="12" fill="#4a4040" opacity="0.7">
          ← 教室
        </text>
      </g>

      <!-- Exit left → flower-pool -->
      <g class="exit-area" @click="emit('clickExit', 'flower-pool')">
        <rect
          x="0"
          y="250"
          width="40"
          height="80"
          rx="8"
          fill="#a8c490"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.8"
        />
        <text
          x="20"
          y="295"
          text-anchor="middle"
          font-size="11"
          fill="#4a4040"
          opacity="0.7"
          writing-mode="tb"
        >
          ← 花坛
        </text>
      </g>

      <!-- Snow overlay (winter) -->
      <g v-if="colors.showSnow">
        <!-- Ground snow layer -->
        <ellipse cx="400" cy="490" rx="380" ry="18" fill="white" opacity="0.55" />
        <!-- Small snow patches -->
        <circle cx="80" cy="478" r="12" fill="white" opacity="0.5" />
        <circle cx="200" cy="482" r="9" fill="white" opacity="0.45" />
        <circle cx="580" cy="480" r="11" fill="white" opacity="0.5" />
        <circle cx="720" cy="476" r="10" fill="white" opacity="0.45" />
        <!-- Snow on tree tops -->
        <ellipse cx="75" cy="18" rx="28" ry="8" fill="white" opacity="0.6" />
        <ellipse cx="625" cy="8" rx="30" ry="9" fill="white" opacity="0.6" />
        <ellipse cx="745" cy="158" rx="24" ry="7" fill="white" opacity="0.6" />
      </g>

      <!-- Exit right → water-tower -->
      <g class="exit-area" @click="emit('clickExit', 'water-tower')">
        <rect
          x="760"
          y="250"
          width="40"
          height="80"
          rx="8"
          fill="#c8d0b8"
          stroke="#4a4040"
          stroke-width="2"
          opacity="0.8"
        />
        <text
          x="780"
          y="295"
          text-anchor="middle"
          font-size="11"
          fill="#4a4040"
          opacity="0.7"
          writing-mode="tb"
        >
          水塔 →
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
