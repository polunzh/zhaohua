<script setup lang="ts">
import { ref, onMounted } from "vue";
import GameCanvas from "./components/GameCanvas.vue";
import DialogBox from "./components/DialogBox.vue";
import ChoicePanel from "./components/ChoicePanel.vue";
import EventSummary from "./components/EventSummary.vue";
import TimeControls from "./components/TimeControls.vue";
import { fetchWorldState, skipTime, generateDialogue } from "./api/client";
import type { GameTime } from "./engine/time";
import type { ClickableArea } from "./scene/scenes";
import { npcs } from "./data/npcs";

const gameTime = ref<GameTime | null>(null);
const events = ref<{ id: string; description: string }[]>([]);
const dialogNpc = ref("");
const dialogText = ref("");
const dialogLoading = ref(false);
const choices = ref<{ id: string; label: string }[]>([]);

async function loadWorld() {
  const data = await fetchWorldState();
  gameTime.value = data.gameTime;
  events.value = data.events || [];
}

async function handleAreaClick(area: ClickableArea) {
  if (area.type === "npc") {
    const npcId = area.id.replace("desk-", "student-");
    const npc = npcs.find((n) => n.id === npcId);
    if (!npc || !gameTime.value) return;
    dialogNpc.value = npc.name;
    dialogLoading.value = true;
    dialogText.value = "";
    try {
      const periodName = gameTime.value.period === "morning" ? "上午" : "下午";
      const { dialogue } = await generateDialogue({
        npcName: npc.name,
        npcPersonality: npc.personality,
        situation: `在教室里，当前是${periodName}`,
        season: gameTime.value.season,
        gameDate: gameTime.value.date,
      });
      dialogText.value = dialogue;
    } catch {
      dialogText.value = "（沉默）";
    }
    dialogLoading.value = false;
  }
}

async function handleSkip(type: "day" | "week" | "semester") {
  await skipTime(type);
  await loadWorld();
}

onMounted(loadWorld);
</script>

<template>
  <div class="game-container">
    <GameCanvas :game-time="gameTime" @area-click="handleAreaClick" />
    <EventSummary :events="events" />
    <TimeControls :game-time="gameTime" @skip="handleSkip" />
    <ChoicePanel :choices="choices" />
    <DialogBox
      :npc-name="dialogNpc"
      :text="dialogText"
      :loading="dialogLoading"
      @close="
        dialogText = '';
        dialogNpc = '';
      "
    />
  </div>
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap");

body {
  margin: 0;
  background: #3a3530;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.game-container {
  position: relative;
  width: 800px;
  height: 500px;
}
</style>
