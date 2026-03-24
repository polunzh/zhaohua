<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import SidePanel from "./components/SidePanel.vue";
import GameCanvas from "./components/GameCanvas.vue";
import DialogBox from "./components/DialogBox.vue";
import Briefing from "./components/Briefing.vue";
import Toast from "./components/Toast.vue";
import {
  fetchWorldState,
  skipTime,
  generateDialogue,
  moveToLocation,
  switchCharacter,
  submitChoice,
  fetchBriefing,
  completeTodo as completeTodoApi,
  completeMission as completeMissionApi,
} from "./api/client";
import type { GameTime } from "./engine/time";
import { getTravelEvent } from "./data/travel-events";
import type { TileMapData } from "./tilemap/types";
import { npcs } from "./data/npcs";
import { getInteractionChoices } from "./data/interactions";
import { generateSceneDescription } from "./engine/scene-descriptions";
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
import { homeMap } from "./tilemap/maps/home";
// All student homes share the same map layout (rural houses look similar)

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
const mission = ref<any>(null);
const toastMessage = ref("");
const toastType = ref<"info" | "success" | "streak">("info");
const playerStats = ref<any>(null);
const weatherIcons: Record<string, string> = {
  sunny: "☀",
  cloudy: "☁",
  rainy: "🌧",
  snowy: "❄",
  windy: "🌬",
};
const seasonMap: Record<string, string> = {
  spring: "春",
  summer: "夏",
  autumn: "秋",
  winter: "冬",
};
const showLocationName = ref(false);
const locationLabel = ref("");
const isLoading = ref(false);
const sceneFading = ref(false);

const locationNames: Record<string, string> = {
  classroom: "教室",
  office: "办公室",
  playground: "操场",
  "flower-pool": "花池",
  "water-tower": "水塔",
  "village-road": "村路",
  farmland: "农田",
  "villager-house": "村民家",
  "town-road": "镇上",
  "post-office": "邮局",
  market: "集市",
  clinic: "卫生所",
  "home-zhang": "张志强家",
  "home-wang": "王芳家",
  "home-li": "李磊家",
  "home-zhao": "赵春燕家",
  "home-zhu": "朱小龙家",
};

function showToast(msg: string, type: "info" | "success" | "streak" = "info") {
  toastMessage.value = "";
  // Force reactivity by toggling in next tick
  setTimeout(() => {
    toastMessage.value = msg;
    toastType.value = type;
  }, 10);
}

function checkStreakMilestone(streakDays: number) {
  if (streakDays === 3) showToast("连续3天！继续保持", "streak");
  else if (streakDays === 7) showToast("连续一周了！", "streak");
  else if (streakDays === 14) showToast("连续两周！你是真正的老师", "streak");
  else if (streakDays === 30) showToast("连续一个月！了不起", "streak");
}

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
  "home-zhang": homeMap,
  "home-wang": homeMap,
  "home-li": homeMap,
  "home-zhao": homeMap,
  "home-zhu": homeMap,
};

const currentMapData = computed(() => {
  return maps[currentScene.value] || playgroundMap;
});

// Scene status text based on time and location — uses NPC names for vivid descriptions
const sceneStatus = computed(() => {
  if (!gameTime.value) return "";
  const period = gameTime.value.period;
  const scene = currentScene.value;
  const npcList = visibleNpcs.value.map((n: any) => ({
    name: n.name,
    role: n.role,
    mood: n.mood,
  }));
  return generateSceneDescription(scene, period, npcList, gameTime.value.season, weather.value);
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
  isLoading.value = true;
  const data = await fetchWorldState();
  gameTime.value = data.gameTime;
  weather.value = data.weather;
  currentScene.value = data.location || "classroom";
  activeCharacter.value = data.activeCharacter || "teacher";
  events.value = data.events || [];
  npcStates.value = data.npcs || [];
  // Also refresh todos and mission
  try {
    const briefing = await fetchBriefing();
    todos.value = briefing.todos || [];
    mission.value = briefing.mission || null;
  } catch {
    /* ignore */
  }
  isLoading.value = false;
}

async function handleNavigate(locationId: string) {
  // Check for travel event before moving
  const fromScene = currentScene.value;
  const travelEvent = getTravelEvent(
    fromScene,
    locationId,
    gameTime.value?.season || "autumn",
    weather.value,
    gameTime.value?.date || "",
  );

  // Fade out
  sceneFading.value = true;
  await new Promise((r) => setTimeout(r, 250));

  await moveToLocation(locationId);
  await loadWorld();

  // Fade in + location announcement
  sceneFading.value = false;
  locationLabel.value = locationNames[locationId] || locationId;
  showLocationName.value = true;
  setTimeout(() => {
    showLocationName.value = false;
  }, 1500);

  // Show travel event if one occurred
  if (travelEvent) {
    dialogNpc.value = "";
    dialogText.value = travelEvent.text;
    dialogLoading.value = false;
    choices.value = [];
    setTimeout(() => {
      if (dialogText.value === travelEvent.text) {
        dialogText.value = "";
      }
    }, 3000);
  }

  await checkMissionCompletion();
}

async function checkMissionCompletion() {
  const m = mission.value;
  if (!m || m.status !== "active") return;
  if (currentScene.value === m.targetLocation && !m.targetNpc) {
    // Location-only mission: complete on arrival
    await completeMissionApi(m.id);
    mission.value = { ...m, status: "done" };
    dialogNpc.value = "";
    dialogText.value = m.completionText || "完成了今天的任务。";
    dialogLoading.value = false;
    choices.value = [];
    showToast("任务完成！", "success");
  }
}

async function handleSwitchCharacter(character: string) {
  await switchCharacter(character);
  await loadWorld();
}

// Time skip narration — brief passage-of-time text
const skipNarrations: Record<string, string[]> = {
  day: [
    "夜里下了一场小雨，早上起来空气格外新鲜。",
    "一觉睡到天亮，新的一天开始了。",
    "昨晚批了半夜作业，今天得打起精神。",
    "窗外的鸡叫了，又是新的一天。",
    "早起走在路上，远处有人已经开始干活了。",
  ],
  week: [
    "一周过得很快，日子就这么一天天过。",
    "这一周过得平平淡淡，倒也踏实。",
    "周末在家歇了歇，周一又精神了。",
    "一周下来，学生们又长进了不少。",
  ],
  semester: [
    "日子像流水一样，一个学期就这么过去了。",
    "翻翻日历，不知不觉已经过了好几个月。",
    "学生们又长高了一截，时间过得真快。",
    "寒来暑往，校园里的树又换了一身衣裳。",
  ],
};

const showTransition = ref(false);
const transitionText = ref("");

async function handleSkip(type: "day" | "week" | "semester") {
  // Show narration
  const narrations = skipNarrations[type];
  transitionText.value = narrations[Math.floor(Math.random() * narrations.length)];
  showTransition.value = true;

  await skipTime(type);
  await loadWorld();

  // Re-generate mission for new day
  try {
    const briefing = await fetchBriefing();
    todos.value = briefing.todos || [];
    if (briefing.mission) mission.value = briefing.mission;
  } catch {
    /* ignore */
  }

  // Hide transition after a moment
  setTimeout(() => {
    showTransition.value = false;
  }, 2500);
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
    const periodNames: Record<string, string> = {
      morning: "上午",
      afternoon: "下午",
      evening: "傍晚",
      night: "晚上",
    };
    const locationCN: Record<string, string> = {
      classroom: "教室",
      office: "办公室",
      playground: "操场",
      "flower-pool": "花池",
      "water-tower": "水塔",
      "village-road": "村路",
      market: "集市",
      "post-office": "邮局",
    };
    const npcState = npcStates.value.find((n: any) => n.id === npcId);
    const recentEvent = events.value.length > 0 ? events.value[0].description : undefined;
    const missionText = mission.value?.status === "active" ? mission.value.title : undefined;
    const { dialogue } = await generateDialogue({
      npcName: npc.name,
      npcId: npcId,
      npcPersonality: npc.personality,
      situation: `在${locationCN[currentScene.value] || currentScene.value}，${periodNames[gameTime.value.period] || ""}`,
      season: gameTime.value.season,
      gameDate: gameTime.value.date,
      weather: weather.value,
      mood: npcState?.mood,
      affinity: npcState?.affinity,
      recentEvent,
      mission: missionText,
    });
    dialogText.value = dialogue;
    // Delay choices for RPG pacing — dialog shows first, then options appear
    setTimeout(() => {
      const interactionChoices = getInteractionChoices(npc.role, currentScene.value);
      choices.value = interactionChoices.map((c) => ({ id: c.id, label: c.label }));
    }, 600);
    // Check if this NPC interaction completes a todo
    const matchingTodo = todos.value.find(
      (t: any) => t.location === currentScene.value && t.actionType === "click-npc",
    );
    if (matchingTodo) {
      await completeTodoApi(matchingTodo.id);
      await loadWorld();
    }
    // Check if this NPC interaction completes the daily mission
    if (mission.value?.status === "active" && mission.value.targetNpc === npcId) {
      await completeMissionApi(mission.value.id);
      mission.value = { ...mission.value, status: "done" };
      showToast("任务完成！", "success");
    }
  } catch {
    dialogText.value = "（沉默）";
  }
  dialogLoading.value = false;
}

async function handleClickExit(targetMapId: string) {
  await moveToLocation(targetMapId);
  await loadWorld();
  await checkMissionCompletion();
}

// Choice response templates — brief NPC reactions to player choices
const choiceResponses: Record<string, string[]> = {
  "check-homework": ["让我看看……嗯，这次写得还行。", "作业……我写了，真的写了……"],
  "ask-question": ["嗯……让我想想……", "老师，这个题我不太会。"],
  encourage: ["谢谢老师！", "嘿嘿，我会继续努力的。"],
  "leave-alone": ["……", "好的。"],
  "play-together": ["太好了！老师也来玩吗！", "老师来踢球吧！"],
  chat: ["老师想聊啥？", "嘿，最近还行。"],
  "call-back": ["啊……好吧。", "马上就回去了……"],
  "report-work": ["好，我听着。", "嗯，说吧。"],
  "request-supplies": ["经费紧张啊……我尽量想办法。", "写个申请吧。"],
  "casual-chat": ["哈哈，今天天不错。", "坐，喝口水。"],
  "introduce-situation": ["他在学校还好吧？", "麻烦老师多操心了。"],
  comfort: ["谢谢老师，我就是有点担心。", "有老师在我就放心了。"],
  "buy-stuff": ["要啥？粉笔还是本子？", "今天到了新货！"],
  "ask-for-mail": ["今天没你的信。", "等等，让我翻翻。"],
  "discuss-teaching": ["我觉得下周可以讲到第三单元了。", "数学这块他们学得有点慢。"],
  "help-farm": ["哎哟，老师来帮忙啊！", "别弄脏了衣裳！"],
  criticize: ["……知道了。", "我下次注意。"],
};

async function handleChoose(choiceId: string) {
  if (!gameTime.value) return;
  const result = await submitChoice({
    npcId: currentNpcId.value,
    choiceId,
    gameDate: gameTime.value.date,
    gameTime: `${String(gameTime.value.hour).padStart(2, "0")}:${String(gameTime.value.minute).padStart(2, "0")}`,
    npcRole: npcs.find((n) => n.id === currentNpcId.value)?.role || "",
    location: currentScene.value,
  });
  choices.value = [];

  // Show gift toast if received
  if (result?.gift) {
    showToast(`🎁 收到了${result.gift.name}！`, "success");
  }

  // Show NPC response + effect
  const responses = choiceResponses[choiceId] || ["……"];
  const response = responses[Math.floor(Math.random() * responses.length)];
  const effect = result?.effect;
  let effectText = "";
  if (effect) {
    if (effect.affinityDelta > 0) effectText = ` (好感+${effect.affinityDelta})`;
    else if (effect.affinityDelta < 0) effectText = ` (好感${effect.affinityDelta})`;
  }
  dialogText.value = response + effectText;

  // Keep response visible briefly, then close
  setTimeout(() => {
    dialogText.value = "";
    dialogNpc.value = "";
    loadWorld();
  }, 2000);
}

function handleCloseDialog() {
  dialogText.value = "";
  dialogNpc.value = "";
  choices.value = [];
}

async function handleClickObject(tileType: string) {
  const matchingTodo = todos.value.find(
    (t: any) => t.location === currentScene.value && t.actionType === "click-object",
  );
  if (matchingTodo) {
    await completeTodoApi(matchingTodo.id);
    await loadWorld();
  }
}

function handleStartGame() {
  showBriefing.value = false;
  if (briefingData.value?.mission) {
    mission.value = briefingData.value.mission;
  }
  playerStats.value = briefingData.value?.stats || null;
  if (briefingData.value?.stats) {
    checkStreakMilestone(briefingData.value.stats.streakDays);
  }
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
  <!-- Time skip transition -->
  <div v-if="showTransition" class="transition-overlay">
    <div class="transition-text">{{ transitionText }}</div>
  </div>

  <Toast :message="toastMessage" :type="toastType" />

  <Briefing
    v-if="showBriefing && briefingData"
    :offline-text="briefingData.offlineText"
    :events="briefingData.events"
    :todos="briefingData.todos"
    :consequences="briefingData.consequences"
    :mission="briefingData.mission || null"
    :yesterday-mission="briefingData.yesterdayMission || null"
    :story-progress="briefingData.storyProgress || []"
    :stats="briefingData.stats || null"
    @start="handleStartGame"
  />
  <div class="game-layout">
    <div class="game-header">
      <span class="game-title">朝花夕拾</span>
      <span v-if="gameTime" class="header-info">
        <span class="header-date">{{ gameTime.date }}</span>
        <span class="header-sep">·</span>
        <span class="header-season">{{ seasonMap[gameTime.season] }}</span>
        <span class="header-sep">·</span>
        <span class="header-weather">{{ weatherIcons[weather] || weather }}</span>
        <span class="header-sep">·</span>
        <span class="header-time"
          >{{ String(gameTime.hour).padStart(2, "0") }}:{{
            String(gameTime.minute).padStart(2, "0")
          }}</span
        >
      </span>
    </div>
    <div class="game-main">
      <SidePanel
        :game-time="gameTime"
        :weather="weather"
        :current-scene="currentScene"
        :active-character="activeCharacter"
        :events="events"
        :todos="todos"
        :mission="mission"
        :npcs="npcStates"
        :stats="playerStats"
        @navigate="handleNavigate"
        @switch-character="handleSwitchCharacter"
        @skip="handleSkip"
      />
      <div class="canvas-area" :class="{ 'scene-fade': sceneFading }">
        <div v-if="isLoading" class="loading-indicator">
          <div class="loading-text">……</div>
        </div>
        <div v-if="showLocationName" class="location-announce">
          {{ locationLabel }}
        </div>
        <div v-if="sceneStatus" class="scene-status">{{ sceneStatus }}</div>
        <GameCanvas
          :map-data="currentMapData"
          :npcs="visibleNpcs"
          :active-character="activeCharacter"
          :current-scene="currentScene"
          :season="gameTime?.season || 'autumn'"
          @click-npc="handleClickNpc"
          @click-exit="handleClickExit"
          @click-object="handleClickObject"
        />
      </div>
    </div>
    <div class="dialog-area">
      <template v-if="dialogNpc || dialogLoading">
        <DialogBox
          :npc-name="dialogNpc"
          :text="dialogText"
          :loading="dialogLoading"
          @close="handleCloseDialog"
        />
        <div class="choices" v-if="choices.length && !dialogLoading">
          <button v-for="c in choices" :key="c.id" @click="handleChoose(c.id)">
            {{ c.label }}
          </button>
        </div>
      </template>
      <div v-else class="dialog-empty">
        <span class="dialog-placeholder">点击场景中的人物开始对话</span>
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
  font-family: "Noto Serif SC", serif;
  overflow: hidden;
}

.game-layout {
  width: 100vw;
  height: 100vh;
  background: #f5e6c8;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px;
  background: linear-gradient(180deg, #6b5b4e 0%, #5a4a3e 100%);
  border-bottom: 2px solid #4a3a2e;
}

.game-title {
  font-size: 14px;
  font-weight: bold;
  color: #f5e6c8;
  letter-spacing: 4px;
  font-family: "Noto Serif SC", serif;
}

.header-info {
  font-size: 10px;
  color: #d4c08e;
  font-family: "Noto Serif SC", serif;
  display: flex;
  align-items: center;
  gap: 2px;
}
.header-date {
  opacity: 0.7;
}
.header-sep {
  opacity: 0.4;
  margin: 0 2px;
}
.header-time {
  font-size: 12px;
  font-weight: bold;
  color: #f5e6c8;
}

.game-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.canvas-area {
  flex: 1;
  position: relative;
  background: #2e2a26;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.25s ease;
}
.canvas-area.scene-fade {
  opacity: 0;
}

.scene-status {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(46, 42, 38, 0.8);
  color: #d4c08e;
  font-size: 10px;
  padding: 3px 10px;
  border-radius: 10px;
  z-index: 2;
  white-space: nowrap;
  font-family: "Noto Serif SC", serif;
  letter-spacing: 0.5px;
}

.dialog-area {
  background: #2e2a26;
  padding: 8px 16px 12px;
  border-top: 2px solid #4a4440;
  min-height: 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.dialog-empty {
  text-align: center;
}
.dialog-placeholder {
  color: #5a5450;
  font-size: 11px;
  font-family: "Noto Serif SC", serif;
}

.choices {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
  padding: 4px 12px;
}

.choices button {
  background: rgba(58, 53, 48, 0.9);
  border: 1px solid #5a5450;
  border-radius: 4px;
  padding: 6px 14px;
  font-family: "Noto Serif SC", serif;
  font-size: 11px;
  color: #f5e6c8;
  cursor: pointer;
  transition: all 0.15s ease;
  animation: choicePulse 2s ease-in-out infinite;
}

.choices button:hover {
  background: #c4706a;
  border-color: #c4706a;
  transform: translateY(-1px);
  animation: none;
}

.choices button:active {
  transform: translateY(0);
}

@keyframes choicePulse {
  0%,
  100% {
    border-color: #5a5450;
  }
  50% {
    border-color: #8a7a6a;
  }
}

.transition-overlay {
  position: fixed;
  inset: 0;
  background: rgba(58, 53, 48, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fadeIn 0.8s ease;
}

.transition-overlay::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0, 0, 0, 0.3) 100%);
  pointer-events: none;
}

.transition-text {
  color: #f5e6c8;
  font-size: 18px;
  font-family: "Noto Serif SC", serif;
  max-width: 400px;
  text-align: center;
  line-height: 2;
  animation: slideUp 0.8s ease;
  position: relative;
  z-index: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.location-announce {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 28px;
  font-weight: bold;
  color: #f5e6c8;
  font-family: "Noto Serif SC", serif;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.7);
  z-index: 10;
  pointer-events: none;
  animation: locationFade 1.5s ease forwards;
}

.loading-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2e2a26;
  z-index: 5;
}

.loading-text {
  color: #d4c08e;
  font-size: 14px;
  font-family: "Noto Serif SC", serif;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes locationFade {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
