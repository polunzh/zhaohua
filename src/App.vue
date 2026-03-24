<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import SidePanel from "./components/SidePanel.vue";
import GameCanvas from "./components/GameCanvas.vue";
import DialogBox from "./components/DialogBox.vue";
import Briefing from "./components/Briefing.vue";
import {
  fetchWorldState,
  skipTime,
  generateDialogue,
  moveToLocation,
  switchCharacter,
  submitChoice,
  fetchBriefing,
  completeTodo as completeTodoApi,
} from "./api/client";
import type { GameTime } from "./engine/time";
import type { TileMapData } from "./tilemap/types";
import { npcs } from "./data/npcs";
import { classroomMap } from "./tilemap/maps/classroom";
import { officeMap } from "./tilemap/maps/office";
import { playgroundMap } from "./tilemap/maps/playground";
import { flowerPoolMap } from "./tilemap/maps/flower-pool";
import { waterTowerMap } from "./tilemap/maps/water-tower";
import { villageRoadMap } from "./tilemap/maps/village-road";
import { farmlandMap } from "./tilemap/maps/farmland";
import { villagerHouseMap } from "./tilemap/maps/villager-house";
import { townRoadMap } from "./tilemap/maps/town-road";
import { postOfficeMap } from "./tilemap/maps/post-office";
import { marketMap } from "./tilemap/maps/market";
import { clinicMap } from "./tilemap/maps/clinic";

const gameTime = ref<GameTime | null>(null);
const weather = ref("sunny");
const currentScene = ref("classroom");
const activeCharacter = ref("teacher");
const events = ref<{ id: string; description: string }[]>([]);
const dialogNpc = ref("");
const dialogText = ref("");
const dialogLoading = ref(false);
const currentNpcId = ref("");
const choices = ref<{ id: string; label: string }[]>([]);
const npcStates = ref<any[]>([]);
const showBriefing = ref(true);
const briefingData = ref<any>(null);
const todos = ref<any[]>([]);

const maps: Record<string, TileMapData> = {
  classroom: classroomMap,
  office: officeMap,
  playground: playgroundMap,
  "flower-pool": flowerPoolMap,
  "water-tower": waterTowerMap,
  "village-road": villageRoadMap,
  farmland: farmlandMap,
  "villager-house": villagerHouseMap,
  "town-road": townRoadMap,
  "post-office": postOfficeMap,
  market: marketMap,
  clinic: clinicMap,
};

const currentMapData = computed(() => {
  return maps[currentScene.value] || playgroundMap;
});

// Map NPC states to include tile positions based on their schedule location
const visibleNpcs = computed(() => {
  return npcStates.value
    .filter((n: any) => {
      // Only show NPCs whose schedule location matches current scene
      const locId = n.location;
      return locId === currentScene.value;
    })
    .map((n: any, i: number) => {
      // Assign tile positions from map's npcSpawns or spread them out
      const mapData = currentMapData.value;
      const spawn = mapData.npcSpawns.find((s: any) => s.npcId === n.id);
      return {
        ...n,
        tileX: spawn ? spawn.tileX : 5 + i * 2,
        tileY: spawn ? spawn.tileY : 5 + i,
      };
    });
});

async function loadWorld() {
  const data = await fetchWorldState();
  gameTime.value = data.gameTime;
  weather.value = data.weather;
  currentScene.value = data.location || "classroom";
  activeCharacter.value = data.activeCharacter || "teacher";
  events.value = data.events || [];
  npcStates.value = data.npcs || [];
  // Also refresh todos
  try {
    const briefing = await fetchBriefing();
    todos.value = briefing.todos || [];
  } catch {
    /* ignore */
  }
}

async function handleNavigate(locationId: string) {
  await moveToLocation(locationId);
  await loadWorld();
}

async function handleSwitchCharacter(character: string) {
  await switchCharacter(character);
  await loadWorld();
}

async function handleSkip(type: "day" | "week" | "semester") {
  await skipTime(type);
  await loadWorld();
}

async function handleClickNpc(npcId: string) {
  const npc = npcs.find((n) => n.id === npcId);
  if (!npc || !gameTime.value) return;
  currentNpcId.value = npcId;
  dialogNpc.value = npc.name;
  dialogLoading.value = true;
  dialogText.value = "";
  choices.value = [];
  try {
    const periodName = gameTime.value.period === "morning" ? "上午" : "下午";
    const { dialogue } = await generateDialogue({
      npcName: npc.name,
      npcPersonality: npc.personality,
      situation: `在${currentScene.value}，当前是${periodName}`,
      season: gameTime.value.season,
      gameDate: gameTime.value.date,
    });
    dialogText.value = dialogue;
    choices.value = [
      { id: "encourage", label: "鼓励一下" },
      { id: "criticize", label: "批评几句" },
      { id: "ignore", label: "不说了" },
    ];
  } catch {
    dialogText.value = "（沉默）";
  }
  dialogLoading.value = false;
}

async function handleClickExit(targetMapId: string) {
  await moveToLocation(targetMapId);
  await loadWorld();
}

async function handleChoose(choiceId: string) {
  if (!gameTime.value) return;
  await submitChoice({
    npcId: currentNpcId.value,
    choiceId,
    gameDate: gameTime.value.date,
    gameTime: `${String(gameTime.value.hour).padStart(2, "0")}:${String(gameTime.value.minute).padStart(2, "0")}`,
  });
  choices.value = [];
  dialogText.value = "";
  dialogNpc.value = "";
  await loadWorld();
}

function handleCloseDialog() {
  dialogText.value = "";
  dialogNpc.value = "";
  choices.value = [];
}

async function handleCompleteTodo(todoId: number) {
  await completeTodoApi(todoId);
  await loadWorld();
  // Refresh todos
  const briefing = await fetchBriefing();
  todos.value = briefing.todos || [];
}

function handleStartGame() {
  showBriefing.value = false;
  loadWorld();
}

onMounted(async () => {
  try {
    briefingData.value = await fetchBriefing();
  } catch {
    showBriefing.value = false;
    await loadWorld();
  }
});
</script>

<template>
  <Briefing
    v-if="showBriefing && briefingData"
    :offline-text="briefingData.offlineText"
    :events="briefingData.events"
    :todos="briefingData.todos"
    :consequences="briefingData.consequences"
    @start="handleStartGame"
  />
  <div class="game-layout">
    <div class="game-main">
      <SidePanel
        :game-time="gameTime"
        :weather="weather"
        :current-scene="currentScene"
        :active-character="activeCharacter"
        :events="events"
        :todos="todos"
        @navigate="handleNavigate"
        @switch-character="handleSwitchCharacter"
        @skip="handleSkip"
        @complete-todo="handleCompleteTodo"
      />
      <div class="canvas-area">
        <GameCanvas
          :map-data="currentMapData"
          :npcs="visibleNpcs"
          :active-character="activeCharacter"
          :current-scene="currentScene"
          @click-npc="handleClickNpc"
          @click-exit="handleClickExit"
        />
      </div>
    </div>
    <div class="dialog-area" v-if="dialogNpc || dialogLoading">
      <DialogBox
        :npc-name="dialogNpc"
        :text="dialogText"
        :loading="dialogLoading"
        @close="handleCloseDialog"
      />
      <div class="choices" v-if="choices.length && !dialogLoading">
        <button v-for="c in choices" :key="c.id" @click="handleChoose(c.id)">{{ c.label }}</button>
      </div>
    </div>
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap");

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #3a3530;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: "Noto Serif SC", serif;
}

.game-layout {
  max-width: 95vw;
  background: #f5e6c8;
  border: 3px solid #6b5b4e;
  border-radius: 4px;
  overflow: hidden;
}

.game-main {
  display: flex;
  min-height: 400px;
}

.canvas-area {
  flex: 1;
  position: relative;
  background: #3a3530;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-area {
  border-top: 2px solid #6b5b4e;
  background: #f5e6c8;
  padding: 12px 16px;
  min-height: 60px;
}

.choices {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.choices button {
  background: #d4c08e;
  border: 1px solid #6b5b4e;
  border-radius: 3px;
  padding: 4px 16px;
  font-family: "Noto Serif SC", serif;
  font-size: 12px;
  color: #3a3530;
  cursor: pointer;
}

.choices button:hover {
  background: #c9a882;
}
</style>
