import { describe, it, expect } from "vitest";
import { getRefusalText, getGatedChoices } from "../../src/engine/affinity-gate";
import { getInteractionChoices } from "../../src/data/interactions";

describe("Affinity gate", () => {
  it("returns refusal text for known roles", () => {
    const text = getRefusalText("student");
    expect(text).toBeTruthy();
    expect(typeof text).toBe("string");
  });

  it("returns refusal text for unknown role (default)", () => {
    const text = getRefusalText("alien");
    expect(text).toBeTruthy();
  });

  it("getGatedChoices returns empty choices + apologize when affinity < 20", () => {
    const result = getGatedChoices("student", "classroom", 15);
    expect(result.refused).toBe(true);
    expect(result.choices).toHaveLength(1);
    expect(result.choices[0].id).toBe("apologize");
  });

  it("getGatedChoices returns only 2 basic choices when affinity < 35", () => {
    const result = getGatedChoices("student", "classroom", 30);
    expect(result.refused).toBe(false);
    expect(result.choices.length).toBeLessThanOrEqual(2);
  });

  it("getGatedChoices returns full choices when affinity >= 35", () => {
    const result = getGatedChoices("student", "classroom", 50);
    const fullChoices = getInteractionChoices("student", "classroom");
    expect(result.refused).toBe(false);
    expect(result.choices).toEqual(fullChoices);
  });
});
