import type Database from "better-sqlite3";
import { updateNpcAffinity, addEventLog, saveNpcState, getNpcState } from "../db/queries";
import { conflictEvents } from "../../src/data/conflict-events";

interface ConflictResolveParams {
  conflictId: string;
  choiceId: string;
  gameDate: string;
}

export function handleConflictResolve(db: Database.Database, params: ConflictResolveParams) {
  const event = conflictEvents.find((e) => e.id === params.conflictId);
  if (!event) return { ok: false, error: "unknown-conflict" };

  const choice = event.choices.find((c) => c.id === params.choiceId);
  if (!choice) return { ok: false, error: "unknown-choice" };

  // Apply affinity changes
  for (const [npcId, delta] of Object.entries(choice.affinityChanges)) {
    // Ensure NPC state exists
    const state = getNpcState(db, npcId);
    if (!state) {
      saveNpcState(db, { npcId, location: "unknown", mood: "neutral", affinity: 50 });
    }
    updateNpcAffinity(db, npcId, delta);
  }

  // Log the conflict resolution
  addEventLog(db, {
    eventId: `conflict-${event.id}`,
    gameDate: params.gameDate,
    gameTime: "08:00",
    type: "conflict",
    involvedNpcs: Object.keys(choice.affinityChanges).join(","),
    description: `${event.title}：${choice.consequence}`,
  });

  return {
    ok: true,
    consequence: choice.consequence,
    affinityChanges: choice.affinityChanges,
  };
}
