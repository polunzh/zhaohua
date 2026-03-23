import { describe, it, expect } from "vitest";
import { calculateMoodShift } from "../../src/engine/mood";

describe("Mood", () => {
  it("sunny weather makes neutral mood happy", () => {
    expect(
      calculateMoodShift({ weather: "sunny", period: "morning", currentMood: "neutral" }),
    ).toBe("happy");
  });

  it("rainy weather dampens happy mood", () => {
    expect(calculateMoodShift({ weather: "rainy", period: "morning", currentMood: "happy" })).toBe(
      "neutral",
    );
  });

  it("snowy weather excites", () => {
    expect(
      calculateMoodShift({ weather: "snowy", period: "morning", currentMood: "neutral" }),
    ).toBe("excited");
  });

  it("night makes tired", () => {
    expect(calculateMoodShift({ weather: "sunny", period: "night", currentMood: "happy" })).toBe(
      "tired",
    );
  });
});
