// src/engine/relationship-events.ts
export interface RelationshipInfo {
  npcA: string;
  npcB: string;
  type: string; // "friend" | "rival"
  strength: number;
}

export function getRelationshipBoost(
  event: { relationshipTag?: string },
  relationships: RelationshipInfo[],
  presentNpcIds: string[],
): number {
  if (!event.relationshipTag) return 1;

  const tag = event.relationshipTag;
  const presentSet = new Set(presentNpcIds);

  for (const rel of relationships) {
    const bothPresent = presentSet.has(rel.npcA) && presentSet.has(rel.npcB);
    if (!bothPresent) continue;

    if (tag === "friend-activity" && rel.type === "friend") {
      return 1 + rel.strength / 100;
    }
    if (tag === "rival-conflict" && rel.type === "rival") {
      return 1 + rel.strength / 100;
    }
    if (tag === "secret-share" && rel.type === "friend" && rel.strength >= 70) {
      return 2;
    }
  }

  return 1;
}
