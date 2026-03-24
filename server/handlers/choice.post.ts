import type Database from "better-sqlite3";
import {
  savePlayerChoice,
  getNpcState,
  saveNpcState,
  updateNpcAffinity,
  updateNpcMood,
  incrementStat,
  addGift,
} from "../db/queries";
import { checkGift } from "../../src/data/gifts";
import { getChoiceEffect } from "../../src/data/interactions";

interface ChoiceParams {
  npcId: string;
  choiceId: string;
  gameDate: string;
  gameTime: string;
  npcRole?: string;
  location?: string;
}

export function handleChoice(db: Database.Database, params: ChoiceParams) {
  const effect = getChoiceEffect(params.choiceId, params.npcRole || "", params.location || "");

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

  // Track NPC interaction
  incrementStat(db, "npcs_talked");

  // Check for gift from high-affinity NPC
  const updatedState = getNpcState(db, params.npcId);
  if (updatedState) {
    const gift = checkGift(params.npcRole || "", updatedState.affinity, Date.now());
    if (gift) {
      addGift(db, {
        npcId: params.npcId,
        giftName: gift.name,
        giftDescription: gift.description,
        gameDate: params.gameDate,
      });
      return { ok: true, effect, gift: { name: gift.name, description: gift.description } };
    }
  }

  return { ok: true, effect };
}
