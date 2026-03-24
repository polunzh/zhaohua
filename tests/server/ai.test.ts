import { describe, it, expect } from "vitest";
import { createAiAdapter } from "../../server/ai/adapter";
import { buildDialoguePrompt, buildEventDescriptionPrompt } from "../../server/ai/prompts";

describe("AI Adapter", () => {
  it("creates deepseek adapter", () => {
    const a = createAiAdapter({
      model: "deepseek",
      apiKey: "k",
      baseUrl: "https://api.deepseek.com",
    });
    expect(a.name).toBe("deepseek");
  });

  it("creates kimi adapter", () => {
    const a = createAiAdapter({ model: "kimi", apiKey: "k", baseUrl: "" });
    expect(a.name).toBe("kimi");
  });

  it("creates minimax adapter", () => {
    const a = createAiAdapter({ model: "minimax", apiKey: "k", baseUrl: "" });
    expect(a.name).toBe("minimax");
  });

  it("creates openai adapter", () => {
    const a = createAiAdapter({ model: "openai", apiKey: "k", baseUrl: "" });
    expect(a.name).toBe("openai");
  });

  it("creates claude adapter", () => {
    const a = createAiAdapter({ model: "claude", apiKey: "k", baseUrl: "" });
    expect(a.name).toBe("claude");
  });

  it("throws for unknown model", () => {
    expect(() => createAiAdapter({ model: "unknown", apiKey: "k", baseUrl: "" })).toThrow();
  });
});

describe("Prompts", () => {
  it("builds dialogue prompt with NPC context", () => {
    const prompt = buildDialoguePrompt({
      npcName: "张伟",
      npcPersonality: "调皮好动",
      situation: "上课迟到被老师叫住",
      season: "autumn",
      gameDate: "1994-09-15",
    });
    expect(prompt).toContain("张伟");
    expect(prompt).toContain("调皮好动");
    expect(prompt).toContain("1994");
    expect(prompt).toContain("不要使用现代网络用语");
  });

  it("builds event description prompt", () => {
    const prompt = buildEventDescriptionPrompt({
      eventDescription: "有学生迟到了",
      season: "winter",
      weather: "snowy",
      gameDate: "1994-12-15",
    });
    expect(prompt).toContain("迟到");
    expect(prompt).toContain("冬");
  });
});
