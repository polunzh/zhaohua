<script setup lang="ts">
import ClassroomScene from "./ClassroomScene.vue";
import PlaygroundScene from "./PlaygroundScene.vue";
import FlowerPoolScene from "./FlowerPoolScene.vue";
import OfficeScene from "./OfficeScene.vue";
import VillageRoadScene from "./VillageRoadScene.vue";
import WaterTowerScene from "./WaterTowerScene.vue";
import FarmlandScene from "./FarmlandScene.vue";
import VillagerHouseScene from "./VillagerHouseScene.vue";
import TownRoadScene from "./TownRoadScene.vue";
import PostOfficeScene from "./PostOfficeScene.vue";
import MarketScene from "./MarketScene.vue";
import HomeScene from "./HomeScene.vue";

const props = defineProps<{
  currentScene: string;
  npcs: any[];
  season: string;
}>();

const emit = defineEmits<{
  clickNpc: [npcId: string];
  clickExit: [targetMapId: string];
  clickObject: [objectName: string];
}>();
</script>

<template>
  <ClassroomScene
    v-if="currentScene === 'classroom'"
    :npcs="npcs"
    :season="season"
    @click-npc="emit('clickNpc', $event)"
    @click-exit="emit('clickExit', $event)"
    @click-object="emit('clickObject', $event)"
  />
  <PlaygroundScene
    v-else-if="currentScene === 'playground'"
    :npcs="npcs"
    :season="season"
    @click-npc="emit('clickNpc', $event)"
    @click-exit="emit('clickExit', $event)"
    @click-object="emit('clickObject', $event)"
  />
  <FlowerPoolScene
    v-else-if="currentScene === 'flower-pool'"
    :npcs="npcs"
    :season="season"
    @click-npc="emit('clickNpc', $event)"
    @click-exit="emit('clickExit', $event)"
    @click-object="emit('clickObject', $event)"
  />
  <OfficeScene
    v-else-if="currentScene === 'office'"
    :npcs="npcs"
    :season="season"
    @click-npc="emit('clickNpc', $event)"
    @click-exit="emit('clickExit', $event)"
    @click-object="emit('clickObject', $event)"
  />
  <VillageRoadScene
    v-else-if="currentScene === 'village-road'"
    :npcs="npcs"
    :season="season"
    @click-npc="emit('clickNpc', $event)"
    @click-exit="emit('clickExit', $event)"
    @click-object="emit('clickObject', $event)"
  />
  <WaterTowerScene
    v-else-if="currentScene === 'water-tower'"
    :npcs="npcs"
    :season="season"
    @click-npc="emit('clickNpc', $event)"
    @click-exit="emit('clickExit', $event)"
    @click-object="emit('clickObject', $event)"
  />
  <FarmlandScene
    v-else-if="currentScene === 'farmland'"
    :npcs="npcs"
    :season="season"
    @click-npc="emit('clickNpc', $event)"
    @click-exit="emit('clickExit', $event)"
    @click-object="emit('clickObject', $event)"
  />
  <VillagerHouseScene
    v-else-if="currentScene === 'villager-house'"
    :npcs="npcs"
    :season="season"
    @click-npc="emit('clickNpc', $event)"
    @click-exit="emit('clickExit', $event)"
    @click-object="emit('clickObject', $event)"
  />
  <TownRoadScene
    v-else-if="currentScene === 'town-road'"
    :npcs="npcs"
    :season="season"
    @click-npc="emit('clickNpc', $event)"
    @click-exit="emit('clickExit', $event)"
    @click-object="emit('clickObject', $event)"
  />
  <PostOfficeScene
    v-else-if="currentScene === 'post-office'"
    :npcs="npcs"
    :season="season"
    @click-npc="emit('clickNpc', $event)"
    @click-exit="emit('clickExit', $event)"
    @click-object="emit('clickObject', $event)"
  />
  <MarketScene
    v-else-if="currentScene === 'market'"
    :npcs="npcs"
    :season="season"
    @click-npc="emit('clickNpc', $event)"
    @click-exit="emit('clickExit', $event)"
    @click-object="emit('clickObject', $event)"
  />
  <HomeScene
    v-else-if="currentScene.startsWith('home')"
    :npcs="npcs"
    :season="season"
    @click-npc="emit('clickNpc', $event)"
    @click-exit="emit('clickExit', $event)"
    @click-object="emit('clickObject', $event)"
  />
  <!-- For now, other scenes show a placeholder -->
  <div v-else class="placeholder-scene">
    <div class="placeholder-text">{{ currentScene }}</div>
    <div class="placeholder-hint">场景建设中...</div>
    <div
      v-for="npc in npcs"
      :key="npc.id"
      class="placeholder-npc"
      @click="emit('clickNpc', npc.id)"
    >
      {{ npc.name }} {{ npc.mood === "happy" ? "\u{1F60A}" : "\u{1F610}" }}
    </div>
  </div>
</template>

<style scoped>
.placeholder-scene {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #c8d0b8 0%, #d4c8a8 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.placeholder-text {
  font-size: 24px;
  color: #4a4040;
  font-family: "Noto Serif SC", serif;
}
.placeholder-hint {
  font-size: 13px;
  color: #8a8070;
}
.placeholder-npc {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #4a4040;
  transition: all 0.15s ease;
}
.placeholder-npc:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}
</style>
