import { describe, it, expect } from "vitest";
import { getInteractionChoices } from "../../src/data/interactions";

describe("Interactions", () => {
  it("student in classroom gets classroom-specific choices", () => {
    const choices = getInteractionChoices("student", "classroom");
    expect(choices.length).toBeGreaterThanOrEqual(3);
    expect(choices.map((c) => c.id)).toContain("check-homework");
  });

  it("student at playground gets playground-specific choices", () => {
    const choices = getInteractionChoices("student", "playground");
    expect(choices.map((c) => c.id)).toContain("play-together");
  });

  it("principal in office gets office-specific choices", () => {
    const choices = getInteractionChoices("principal", "office");
    expect(choices.map((c) => c.id)).toContain("report-work");
  });

  it("shopkeeper at market gets market choices", () => {
    const choices = getInteractionChoices("shopkeeper", "market");
    expect(choices.map((c) => c.id)).toContain("buy-stuff");
  });

  it("returns fallback choices for unknown combo", () => {
    const choices = getInteractionChoices("student", "clinic");
    expect(choices.length).toBeGreaterThanOrEqual(2);
  });

  it("each choice has effect with affinityDelta", () => {
    const choices = getInteractionChoices("student", "classroom");
    for (const c of choices) {
      expect(c.effect).toBeDefined();
      expect(typeof c.effect.affinityDelta).toBe("number");
    }
  });

  it("postman choices work at any location", () => {
    const choices = getInteractionChoices("postman", "village-road");
    expect(choices.length).toBeGreaterThanOrEqual(2);
  });

  it("parent visiting school gets parent choices", () => {
    const choices = getInteractionChoices("parent", "classroom");
    expect(choices.map((c) => c.id)).toContain("introduce-situation");
  });
});
