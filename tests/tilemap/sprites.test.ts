import { describe, it, expect } from "vitest";
import {
  npcSpriteConfigs,
  playerSpriteConfigs,
  getSpriteConfig,
  getPlayerSpriteConfig,
  moodToEmoji,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
} from "../../src/tilemap/sprites";

describe("Sprites", () => {
  it("all NPCs have sprite configs", () => {
    const expectedNpcs = [
      "student-xiaoming",
      "student-xiaohua",
      "student-dapeng",
      "student-meimei",
      "student-tiezhu",
      "principal-zhang",
      "colleague-li",
      "parent-wang",
      "parent-zhao",
      "shopkeeper-liu",
      "postman-chen",
    ];
    for (const id of expectedNpcs) {
      expect(npcSpriteConfigs[id], `Missing sprite for ${id}`).toBeDefined();
    }
  });

  it("all NPCs have unique body colors (most of them)", () => {
    const bodyColors = Object.values(npcSpriteConfigs).map((c) => c.bodyColor);
    // At least 8 unique colors for 11 NPCs
    expect(new Set(bodyColors).size).toBeGreaterThanOrEqual(8);
  });

  it("player configs exist for teacher and postman", () => {
    expect(getPlayerSpriteConfig("teacher")).toBeDefined();
    expect(getPlayerSpriteConfig("postman")).toBeDefined();
  });

  it("getSpriteConfig returns config for known NPC", () => {
    const config = getSpriteConfig("student-xiaoming");
    expect(config).toBeDefined();
    expect(config!.bodyColor).toBe("#C4706A");
  });

  it("getSpriteConfig returns undefined for unknown NPC", () => {
    expect(getSpriteConfig("nobody")).toBeUndefined();
  });

  it("moodToEmoji maps moods", () => {
    expect(moodToEmoji("happy")).toBe("😊");
    expect(moodToEmoji("upset")).toBe("😟");
    expect(moodToEmoji("unknown")).toBe("😐");
  });

  it("sprite dimensions are correct", () => {
    expect(SPRITE_WIDTH).toBe(16);
    expect(SPRITE_HEIGHT).toBe(32);
  });
});
