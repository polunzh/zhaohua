import { describe, it, expect } from "vitest";
import { getInteractionChoices } from "../../src/data/interactions";

describe("NPC Requests — R10: High-affinity interactions", () => {
  it("getInteractionChoices accepts optional affinity parameter", () => {
    // Should not throw with affinity
    const choices = getInteractionChoices("student", "classroom", 70);
    expect(choices.length).toBeGreaterThan(0);
  });

  it("high affinity student in classroom gets special request choices", () => {
    const choices = getInteractionChoices("student", "classroom", 70);
    const ids = choices.map((c) => c.id);
    expect(ids).toContain("help-homework");
    expect(ids).toContain("lend-notebook");
  });

  it("low affinity student does NOT get high-affinity choices", () => {
    const choices = getInteractionChoices("student", "classroom", 30);
    const ids = choices.map((c) => c.id);
    expect(ids).not.toContain("help-homework");
    expect(ids).not.toContain("lend-notebook");
  });

  it("without affinity param, returns normal choices (backward compat)", () => {
    const choices = getInteractionChoices("student", "classroom");
    const ids = choices.map((c) => c.id);
    expect(ids).toContain("check-homework");
    // Should not include high-affinity choices when no affinity passed
    expect(ids).not.toContain("help-homework");
  });

  it("high affinity principal gets special choices", () => {
    const choices = getInteractionChoices("principal", "office", 70);
    const ids = choices.map((c) => c.id);
    expect(ids).toContain("share-concerns");
  });

  it("high affinity parent gets special choices", () => {
    const choices = getInteractionChoices("parent", "classroom", 70);
    const ids = choices.map((c) => c.id);
    expect(ids).toContain("invite-dinner");
  });
});
