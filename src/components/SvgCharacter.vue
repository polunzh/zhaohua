<script setup lang="ts">
defineProps<{
  name: string;
  hairColor?: string;
  bodyColor?: string;
  skinColor?: string;
  mood?: string;
  size?: number; // default 80
}>();
</script>

<template>
  <svg :width="size || 80" :height="(size || 80) * 1.5" viewBox="0 0 80 120" class="svg-character">
    <!-- Shadow on ground -->
    <ellipse cx="40" cy="116" rx="22" ry="5" fill="rgba(0,0,0,0.1)" />

    <!-- Body -->
    <rect
      x="24"
      y="62"
      width="32"
      height="30"
      rx="6"
      :fill="bodyColor || '#8a9878'"
      stroke="#4a4040"
      stroke-width="2.5"
    />
    <!-- Arms -->
    <rect
      x="14"
      y="66"
      width="12"
      height="22"
      rx="6"
      :fill="bodyColor || '#8a9878'"
      stroke="#4a4040"
      stroke-width="2"
    />
    <rect
      x="54"
      y="66"
      width="12"
      height="22"
      rx="6"
      :fill="bodyColor || '#8a9878'"
      stroke="#4a4040"
      stroke-width="2"
    />
    <!-- Hands -->
    <circle
      cx="20"
      cy="90"
      r="5"
      :fill="skinColor || '#d4b898'"
      stroke="#4a4040"
      stroke-width="1.5"
    />
    <circle
      cx="60"
      cy="90"
      r="5"
      :fill="skinColor || '#d4b898'"
      stroke="#4a4040"
      stroke-width="1.5"
    />

    <!-- Legs -->
    <rect
      x="28"
      y="90"
      width="10"
      height="18"
      rx="4"
      fill="#6a6a6a"
      stroke="#4a4040"
      stroke-width="2"
    />
    <rect
      x="42"
      y="90"
      width="10"
      height="18"
      rx="4"
      fill="#6a6a6a"
      stroke="#4a4040"
      stroke-width="2"
    />
    <!-- Shoes -->
    <ellipse cx="33" cy="110" rx="8" ry="5" fill="#5a4a3a" stroke="#4a4040" stroke-width="2" />
    <ellipse cx="47" cy="110" rx="8" ry="5" fill="#5a4a3a" stroke="#4a4040" stroke-width="2" />

    <!-- Head (big!) -->
    <circle
      cx="40"
      cy="36"
      r="28"
      :fill="skinColor || '#d4b898'"
      stroke="#4a4040"
      stroke-width="2.5"
    />

    <!-- Hair -->
    <path
      :d="'M12,32 Q12,8 40,6 Q68,8 68,32 Q68,20 40,18 Q12,20 12,32Z'"
      :fill="hairColor || '#5a4030'"
      stroke="#4a4040"
      stroke-width="2"
    />

    <!-- Eyes -->
    <ellipse cx="30" cy="38" rx="5" ry="6" fill="white" stroke="#4a4040" stroke-width="1.5" />
    <ellipse cx="50" cy="38" rx="5" ry="6" fill="white" stroke="#4a4040" stroke-width="1.5" />
    <!-- Pupils -->
    <circle cx="31" cy="39" r="3" fill="#3a3030" />
    <circle cx="51" cy="39" r="3" fill="#3a3030" />
    <!-- Eye highlights -->
    <circle cx="29" cy="37" r="1.5" fill="white" />
    <circle cx="49" cy="37" r="1.5" fill="white" />

    <!-- Blush -->
    <ellipse cx="22" cy="44" rx="4" ry="2.5" fill="#d4a090" opacity="0.5" />
    <ellipse cx="58" cy="44" rx="4" ry="2.5" fill="#d4a090" opacity="0.5" />

    <!-- Mouth -->
    <path
      d="M35,48 Q40,53 45,48"
      fill="none"
      stroke="#4a4040"
      stroke-width="1.5"
      stroke-linecap="round"
    />

    <!-- Mood indicator -->
    <text v-if="mood" x="40" y="-2" text-anchor="middle" font-size="14">
      {{
        mood === "happy"
          ? "\u{1F60A}"
          : mood === "upset"
            ? "\u{1F61F}"
            : mood === "excited"
              ? "\u{1F604}"
              : ""
      }}
    </text>

    <!-- Name tag -->
    <rect x="10" y="118" width="60" height="16" rx="4" fill="rgba(255,255,255,0.85)" />
    <text
      x="40"
      y="130"
      text-anchor="middle"
      font-size="11"
      fill="#4a4040"
      font-family="'Noto Serif SC', serif"
    >
      {{ name }}
    </text>
  </svg>
</template>

<style scoped>
.svg-character {
  cursor: pointer;
  transition: transform 0.15s ease;
}
.svg-character:hover {
  transform: translateY(-3px);
}
</style>
