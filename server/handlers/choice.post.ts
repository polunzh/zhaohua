import type Database from "better-sqlite3";
import {
  savePlayerChoice,
  getNpcState,
  saveNpcState,
  updateNpcAffinity,
  updateNpcMood,
} from "../db/queries";

interface ChoiceParams {
  npcId: string;
  choiceId: string;
  gameDate: string;
  gameTime: string;
}

const effects: Record<string, { affinityDelta: number; mood: string }> = {
  encourage: { affinityDelta: 10, mood: "happy" },
  criticize: { affinityDelta: -5, mood: "upset" },
  ignore: { affinityDelta: 0, mood: "neutral" },
};

export function handleChoice(db: Database.Database, params: ChoiceParams) {
  const effect = effects[params.choiceId] || effects["ignore"];

  savePlayerChoice(db, {
    gameDate: params.gameDate,
    gameTime: params.gameTime,
    choiceType: "npc-interaction",
    choiceValue: params.choiceId,
    context: params.npcId,
  });

  // Ensure NPC state exists before updating
  const npcState = getNpcState(db, params.npcId);
  if (!npcState) {
    saveNpcState(db, {
      npcId: params.npcId,
      location: "unknown",
      mood: "neutral",
      affinity: 50,
    });
  }

  updateNpcAffinity(db, params.npcId, effect.affinityDelta);
  updateNpcMood(db, params.npcId, effect.mood);

  return { ok: true, effect };
}
