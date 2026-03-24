import type Database from "better-sqlite3";
import {
  getAllActiveStories,
  getStoryProgress,
  saveStoryProgress,
  addEventLog,
  getNpcState,
} from "../db/queries";
import { storyArcs, type StoryArc, type StoryStage } from "../../src/data/stories";

export function processStories(
  db: Database.Database,
  gameDate: string,
  gameTime: string,
): string[] {
  const advancedStories: string[] = [];

  // Check for new stories to start
  for (const arc of storyArcs) {
    const progress = getStoryProgress(db, arc.id);
    if (progress) continue; // already started

    if (shouldStartStory(db, arc, gameDate)) {
      saveStoryProgress(db, {
        storyId: arc.id,
        currentStage: arc.stages[0].id,
        startedDate: gameDate,
        data: JSON.stringify({ lastAdvanced: gameDate }),
      });
      addEventLog(db, {
        eventId: `story-${arc.id}-${arc.stages[0].id}`,
        gameDate,
        gameTime,
        type: "story",
        involvedNpcs: "",
        description: arc.stages[0].description,
      });
      advancedStories.push(arc.id);
    }
  }

  // Check active stories for advancement
  const activeStories = getAllActiveStories(db);
  for (const progress of activeStories) {
    if (advancedStories.includes(progress.storyId)) continue; // just started

    const arc = storyArcs.find((a) => a.id === progress.storyId);
    if (!arc) continue;

    const currentStage = arc.stages.find((s) => s.id === progress.currentStage);
    if (!currentStage || currentStage.isFinal) continue;

    const data = JSON.parse(progress.data || "{}");
    const lastAdvanced = data.lastAdvanced || progress.startedDate;

    if (shouldAdvanceStage(db, currentStage, lastAdvanced, gameDate)) {
      const nextStageId = resolveNextStage(db, currentStage);
      if (!nextStageId) continue;

      const nextStage = arc.stages.find((s) => s.id === nextStageId);
      if (!nextStage) continue;

      saveStoryProgress(db, {
        storyId: arc.id,
        currentStage: nextStageId,
        startedDate: progress.startedDate,
        data: JSON.stringify({ lastAdvanced: gameDate }),
      });
      addEventLog(db, {
        eventId: `story-${arc.id}-${nextStageId}`,
        gameDate,
        gameTime,
        type: "story",
        involvedNpcs: "",
        description: nextStage.description,
      });
      advancedStories.push(arc.id);
    }
  }

  return advancedStories;
}

function shouldStartStory(db: Database.Database, arc: StoryArc, gameDate: string): boolean {
  if (arc.startCondition.afterGameDate && gameDate < arc.startCondition.afterGameDate) return false;
  if (arc.startCondition.minAffinity) {
    const state = getNpcState(db, arc.startCondition.minAffinity.npcId);
    if (!state || state.affinity < arc.startCondition.minAffinity.min) return false;
  }
  return true;
}

function shouldAdvanceStage(
  db: Database.Database,
  stage: StoryStage,
  lastAdvanced: string,
  gameDate: string,
): boolean {
  const cond = stage.triggerConditions;
  if (cond.minDaysSinceLastStage) {
    const last = new Date(lastAdvanced);
    const now = new Date(gameDate);
    const days = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    if (days < cond.minDaysSinceLastStage) return false;
  }
  if (cond.afterGameDate && gameDate < cond.afterGameDate) return false;
  if (cond.requiredAffinity) {
    const state = getNpcState(db, cond.requiredAffinity.npcId);
    if (!state || state.affinity < cond.requiredAffinity.min) return false;
  }
  return true;
}

function resolveNextStage(db: Database.Database, stage: StoryStage): string | null {
  if (stage.branches) {
    for (const branch of stage.branches) {
      if (evaluateBranchCondition(db, branch.condition)) {
        return branch.nextStageId;
      }
    }
  }
  return stage.nextStage || null;
}

export function evaluateBranchCondition(
  db: Database.Database,
  condition: { type: string; npcId?: string; minValue?: number; maxValue?: number },
): boolean {
  if (condition.type === "affinity" && condition.npcId) {
    const state = getNpcState(db, condition.npcId);
    if (!state) return false;
    if (condition.minValue && state.affinity < condition.minValue) return false;
    if (condition.maxValue && state.affinity > condition.maxValue) return false;
    return true;
  }
  if (condition.type === "choice-count" && condition.npcId) {
    const choices = db
      .prepare(
        "SELECT COUNT(*) as cnt FROM player_choices WHERE context = ? AND choice_value = 'encourage'",
      )
      .get(condition.npcId) as any;
    const count = choices?.cnt || 0;
    if (condition.minValue && count < condition.minValue) return false;
    return true;
  }
  return false;
}
