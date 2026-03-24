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
      "student-zhang-wei",
      "student-wang-fang",
      "student-li-lei",
      "student-zhao-na",
      "student-zhu-peng",
      "principal-sun",
      "colleague-zhou",
      "parent-gao",
      "parent-tian",
      "shopkeeper-ma",
      "postman-he",
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
    const config = getSpriteConfig("student-zhang-wei");
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

  it("all NPCs have hairStyle field", () => {
    for (const [id, config] of Object.entries(npcSpriteConfigs)) {
      expect(config.hairStyle, `${id} missing hairStyle`).toBeDefined();
    }
  });

  it("all NPCs have gender field", () => {
    for (const [id, config] of Object.entries(npcSpriteConfigs)) {
      expect(config.gender, `${id} missing gender`).toBeDefined();
    }
  });

  it("principal has bald hairStyle", () => {
    expect(npcSpriteConfigs["principal-sun"].hairStyle).toBe("bald");
  });

  it("colleague-zhou has glasses accessory", () => {
    expect(npcSpriteConfigs["colleague-zhou"].accessory).toBe("glasses");
  });
});
