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

// NPC positions in the office
const npcPositions = [
  { x: 50, y: 40 },
  { x: 30, y: 60 },
  { x: 65, y: 65 },
  { x: 45, y: 75 },
];
</script>

<template>
  <div class="scene office-scene">
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
      <rect x="0" y="0" width="800" height="130" fill="#c8b898" stroke="#4a4040" stroke-width="2" />
      <line x1="0" y1="130" x2="800" y2="130" stroke="#4a4040" stroke-width="2" />

      <!-- Window on back wall -->
      <rect
        x="320"
        y="20"
        width="160"
        height="90"
        rx="4"
        fill="#c8d0b8"
        stroke="#4a4040"
        stroke-width="2"
      />
      <line x1="400" y1="20" x2="400" y2="110" stroke="#4a4040" stroke-width="1.5" />
      <line x1="320" y1="65" x2="480" y2="65" stroke="#4a4040" stroke-width="1.5" />
      <!-- Curtain hints -->
      <path
        d="M320,20 Q330,35 320,50 Q330,65 320,80"
        fill="none"
        stroke="#c4706a"
        stroke-width="1"
        opacity="0.3"
      />
      <path
        d="M480,20 Q470,35 480,50 Q470,65 480,80"
        fill="none"
        stroke="#c4706a"
        stroke-width="1"
        opacity="0.3"
      />

      <!-- Bookshelf (left wall) -->
      <rect
        x="30"
        y="135"
        width="120"
        height="200"
        rx="4"
        fill="#a08050"
        stroke="#4a4040"
        stroke-width="2"
        class="clickable-object"
        @click="emit('clickObject', 'bookshelf')"
      />
      <!-- Shelf dividers -->
      <line x1="30" y1="185" x2="150" y2="185" stroke="#4a4040" stroke-width="1.5" />
      <line x1="30" y1="235" x2="150" y2="235" stroke="#4a4040" stroke-width="1.5" />
      <line x1="30" y1="285" x2="150" y2="285" stroke="#4a4040" stroke-width="1.5" />
      <!-- Book spines - row 1 -->
      <rect x="38" y="140" width="10" height="42" rx="1" fill="#c85050" />
      <rect x="52" y="140" width="8" height="42" rx="1" fill="#5080c0" />
      <rect x="64" y="140" width="12" height="42" rx="1" fill="#d4b040" />
      <rect x="80" y="140" width="9" height="42" rx="1" fill="#6a8a58" />
      <rect x="93" y="140" width="10" height="42" rx="1" fill="#b890b0" />
      <rect x="107" y="140" width="8" height="42" rx="1" fill="#c87848" />
      <rect x="119" y="140" width="12" height="42" rx="1" fill="#5a7a90" />
      <!-- Book spines - row 2 -->
      <rect x="38" y="190" width="12" height="42" rx="1" fill="#d4b040" />
      <rect x="54" y="190" width="9" height="42" rx="1" fill="#c85050" />
      <rect x="67" y="190" width="11" height="42" rx="1" fill="#5a7a90" />
      <rect x="82" y="190" width="8" height="42" rx="1" fill="#b890b0" />
      <rect x="94" y="190" width="10" height="42" rx="1" fill="#6a8a58" />
      <rect x="108" y="190" width="12" height="42" rx="1" fill="#5080c0" />
      <!-- Book spines - row 3 -->
      <rect x="38" y="240" width="10" height="42" rx="1" fill="#5080c0" />
      <rect x="52" y="240" width="12" height="42" rx="1" fill="#c87848" />
      <rect x="68" y="240" width="8" height="42" rx="1" fill="#d4b040" />
      <rect x="80" y="240" width="11" height="42" rx="1" fill="#c85050" />
      <rect x="95" y="240" width="9" height="42" rx="1" fill="#6a8a58" />
      <rect x="108" y="240" width="10" height="42" rx="1" fill="#b890b0" />
      <!-- Row 4 - fewer books -->
      <rect x="38" y="290" width="12" height="42" rx="1" fill="#5a7a90" />
      <rect x="54" y="290" width="10" height="42" rx="1" fill="#d4b040" />
      <rect x="68" y="290" width="8" height="42" rx="1" fill="#c85050" />

      <!-- Teacher's desk (center) -->
      <rect
        x="280"
        y="200"
        width="240"
        height="80"
        rx="6"
        fill="#b89860"
        stroke="#4a4040"
        stroke-width="2"
        class="clickable-object"
        @click="emit('clickObject', 'teacher-desk')"
      />
      <!-- Desk highlight -->
      <rect x="282" y="202" width="236" height="4" rx="2" fill="#c8a870" />
      <!-- Papers on desk -->
      <rect
        x="300"
        y="215"
        width="40"
        height="50"
        rx="2"
        fill="#e8e0d0"
        stroke="#4a4040"
        stroke-width="1"
        opacity="0.7"
      />
      <rect
        x="305"
        y="220"
        width="40"
        height="50"
        rx="2"
        fill="#ece4d4"
        stroke="#4a4040"
        stroke-width="1"
        opacity="0.5"
      />
      <!-- Book on desk -->
      <rect
        x="380"
        y="220"
        width="35"
        height="45"
        rx="2"
        fill="#c85050"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <line x1="397" y1="220" x2="397" y2="265" stroke="#4a4040" stroke-width="1" opacity="0.5" />
      <!-- Thermos/kettle on desk -->
      <rect
        x="450"
        y="225"
        width="20"
        height="35"
        rx="4"
        fill="#5a8a5a"
        stroke="#4a4040"
        stroke-width="1.5"
      />
      <rect
        x="448"
        y="222"
        width="24"
        height="6"
        rx="3"
        fill="#5a8a5a"
        stroke="#4a4040"
        stroke-width="1"
      />
      <!-- Small lid -->
      <rect
        x="454"
        y="216"
        width="12"
        height="8"
        rx="3"
        fill="#6a9a6a"
        stroke="#4a4040"
        stroke-width="1"
      />

      <!-- Chair behind desk -->
      <rect
        x="370"
        y="145"
        width="60"
        height="50"
        rx="6"
        fill="#8a6a40"
        stroke="#4a4040"
        stroke-width="2"
      />
      <!-- Chair back -->
      <rect
        x="375"
        y="135"
        width="50"
        height="14"
        rx="4"
        fill="#7a5a30"
        stroke="#4a4040"
        stroke-width="1.5"
      />

      <!-- Door (bottom-right) -->
      <g class="exit-area" @click="emit('clickExit', 'classroom')">
        <rect
          x="650"
          y="420"
          width="80"
          height="80"
          rx="3"
          fill="#8a7050"
          stroke="#4a4040"
          stroke-width="2"
        />
        <!-- Door handle -->
        <circle cx="665" cy="460" r="4" fill="#b89860" stroke="#4a4040" stroke-width="1.5" />
        <!-- Door panels -->
        <rect x="672" y="428" width="25" height="28" rx="2" fill="#7a6040" opacity="0.3" />
        <rect x="700" y="428" width="25" height="28" rx="2" fill="#7a6040" opacity="0.3" />
        <!-- Exit label -->
        <text x="690" y="415" text-anchor="middle" font-size="11" fill="#4a4040" opacity="0.6">
          → 教室
        </text>
      </g>
    </svg>

    <!-- NPC Layer -->
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
