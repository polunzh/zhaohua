import { describe, it, expect } from "vitest";
import { createAiAdapter } from "../../server/ai/adapter";
import { buildDialoguePrompt, buildEventDescriptionPrompt } from "../../server/ai/prompts";

describe("AI Adapter", () => {
  it("creates adapter from config", () => {
    const adapter = createAiAdapter({
      model: "deepseek",
      apiKey: "test",
      baseUrl: "https://api.deepseek.com",
    });
    expect(adapter).toBeDefined();
    expect(adapter.name).toBe("deepseek");
  });

  it("throws for unknown model", () => {
    expect(() => createAiAdapter({ model: "unknown", apiKey: "test", baseUrl: "" })).toThrow(
      "Unknown AI model: unknown",
    );
  });
});

describe("Prompts", () => {
  it("builds dialogue prompt with NPC context", () => {
    const prompt = buildDialoguePrompt({
      npcName: "小明",
      npcPersonality: "调皮好动",
      situation: "上课迟到被老师叫住",
      season: "autumn",
      gameDate: "1994-09-15",
    });
    expect(prompt).toContain("小明");
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
