import { describe, it, expect } from "vitest";
import { getStoryDisplayData, type StoryDisplayItem } from "../../src/composables/storyDisplayData";

describe("StoryProgress display logic", () => {
  it("returns display items for active stories", () => {
    const items = getStoryDisplayData([
      { storyId: "love-learning", currentStage: "stage-2", startedDate: "1994-09-20", data: "{}" },
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe("厌学到爱学");
    expect(items[0].totalStages).toBe(5);
    expect(items[0].currentStageIndex).toBe(1);
    expect(items[0].isFinal).toBe(false);
  });

  it("marks final stage", () => {
    const items = getStoryDisplayData([
      { storyId: "love-learning", currentStage: "stage-4", startedDate: "1994-09-20", data: "{}" },
    ]);
    expect(items[0].isFinal).toBe(true);
  });

  it("returns empty array for no stories", () => {
    const items = getStoryDisplayData([]);
    expect(items).toHaveLength(0);
  });

  it("calculates progress percentage", () => {
    const items = getStoryDisplayData([
      {
        storyId: "repair-classroom",
        currentStage: "stage-3",
        startedDate: "1994-11-01",
        data: "{}",
      },
    ]);
    expect(items[0].progressPercent).toBeGreaterThan(0);
    expect(items[0].progressPercent).toBeLessThan(100);
  });

  it("returns 100% for final stage", () => {
    const items = getStoryDisplayData([
      { storyId: "waiting-letter", currentStage: "stage-4", startedDate: "1994-10-01", data: "{}" },
    ]);
    expect(items[0].progressPercent).toBe(100);
  });
});
