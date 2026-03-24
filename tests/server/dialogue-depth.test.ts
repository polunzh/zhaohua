import { describe, it, expect } from "vitest";
import { buildDialoguePrompt } from "../../server/ai/prompts";

describe("NPC Dialogue Varies by Relationship Depth — R12", () => {
  const baseCtx = {
    npcName: "张志强",
    npcPersonality: "调皮好动",
    situation: "课间休息",
    season: "autumn",
    gameDate: "1994-09-15",
  };

  it("affinity >= 80 mentions intimate relationship", () => {
    const prompt = buildDialoguePrompt({ ...baseCtx, affinity: 85 });
    expect(prompt).toContain("非常亲密");
  });

  it("affinity >= 60 mentions friendly relationship", () => {
    const prompt = buildDialoguePrompt({ ...baseCtx, affinity: 65 });
    expect(prompt).toContain("不错");
  });

  it("affinity >= 40 mentions reserved relationship", () => {
    const prompt = buildDialoguePrompt({ ...baseCtx, affinity: 45 });
    expect(prompt).toContain("拘谨");
  });

  it("affinity >= 20 mentions guarded relationship", () => {
    const prompt = buildDialoguePrompt({ ...baseCtx, affinity: 25 });
    expect(prompt).toContain("防备");
  });

  it("affinity < 20 mentions hostile relationship", () => {
    const prompt = buildDialoguePrompt({ ...baseCtx, affinity: 10 });
    expect(prompt).toContain("抵触");
  });

  it("no affinity => no relationship hint", () => {
    const prompt = buildDialoguePrompt({ ...baseCtx });
    expect(prompt).not.toContain("亲密");
    expect(prompt).not.toContain("防备");
    expect(prompt).not.toContain("抵触");
    expect(prompt).not.toContain("拘谨");
  });

  it("boundary: exactly 80 gets intimate level", () => {
    const prompt = buildDialoguePrompt({ ...baseCtx, affinity: 80 });
    expect(prompt).toContain("非常亲密");
  });

  it("boundary: exactly 60 gets friendly level", () => {
    const prompt = buildDialoguePrompt({ ...baseCtx, affinity: 60 });
    expect(prompt).toContain("不错");
  });

  it("boundary: exactly 40 gets reserved level", () => {
    const prompt = buildDialoguePrompt({ ...baseCtx, affinity: 40 });
    expect(prompt).toContain("拘谨");
  });

  it("boundary: exactly 20 gets guarded level", () => {
    const prompt = buildDialoguePrompt({ ...baseCtx, affinity: 20 });
    expect(prompt).toContain("防备");
  });
});
