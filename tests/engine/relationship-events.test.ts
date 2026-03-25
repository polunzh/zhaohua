// tests/engine/relationship-events.test.ts
import { describe, it, expect } from "vitest";
import { getRelationshipBoost, type RelationshipInfo } from "../../src/engine/relationship-events";

describe("relationship-events", () => {
  const friendRelationship: RelationshipInfo = {
    npcA: "student-zhang-wei",
    npcB: "student-li-lei",
    type: "friend",
    strength: 80,
  };

  const rivalRelationship: RelationshipInfo = {
    npcA: "student-zhang-wei",
    npcB: "student-zhao-na",
    type: "rival",
    strength: 60,
  };

  it("boosts weight for friend events when friends present", () => {
    const boost = getRelationshipBoost(
      { relationshipTag: "friend-activity" },
      [friendRelationship],
      ["student-zhang-wei", "student-li-lei"],
    );
    expect(boost).toBeGreaterThan(1);
  });

  it("boosts weight for conflict events when rivals present", () => {
    const boost = getRelationshipBoost(
      { relationshipTag: "rival-conflict" },
      [rivalRelationship],
      ["student-zhang-wei", "student-zhao-na"],
    );
    expect(boost).toBeGreaterThan(1);
  });

  it("returns 1 when no matching relationship", () => {
    const boost = getRelationshipBoost(
      { relationshipTag: "friend-activity" },
      [],
      ["student-zhang-wei"],
    );
    expect(boost).toBe(1);
  });

  it("returns 1 for events without relationshipTag", () => {
    const boost = getRelationshipBoost(
      {},
      [friendRelationship],
      ["student-zhang-wei", "student-li-lei"],
    );
    expect(boost).toBe(1);
  });

  it("returns 1 for rival-conflict when no rivals are in scene", () => {
    const boost = getRelationshipBoost(
      { relationshipTag: "rival-conflict" },
      [rivalRelationship],
      ["student-zhang-wei"], // zhao-na not present
    );
    expect(boost).toBe(1);
  });
});
