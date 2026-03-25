import { storyArcs } from "../data/stories";

export interface StoryDisplayItem {
  storyId: string;
  name: string;
  description: string;
  currentStageIndex: number;
  totalStages: number;
  isFinal: boolean;
  progressPercent: number;
}

export interface StoryProgressRow {
  storyId: string;
  currentStage: string;
  startedDate: string;
  data: string;
}

export function getStoryDisplayData(rows: StoryProgressRow[]): StoryDisplayItem[] {
  return rows
    .map((row) => {
      const arc = storyArcs.find((a) => a.id === row.storyId);
      if (!arc) return null;

      const stageIndex = arc.stages.findIndex((s) => s.id === row.currentStage);
      if (stageIndex < 0) return null;

      const stage = arc.stages[stageIndex];
      const isFinal = !!stage.isFinal;
      const progressPercent = isFinal
        ? 100
        : Math.round((stageIndex / (arc.stages.length - 1)) * 100);

      return {
        storyId: arc.id,
        name: arc.name,
        description: stage.description,
        currentStageIndex: stageIndex,
        totalStages: arc.stages.length,
        isFinal,
        progressPercent,
      };
    })
    .filter(Boolean) as StoryDisplayItem[];
}
