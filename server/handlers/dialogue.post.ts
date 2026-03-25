import { createAiAdapter } from "../ai/adapter";
import { buildDialoguePrompt, SYSTEM_PROMPT } from "../ai/prompts";
import { getDb } from "../db/connection";
import { getLastChoiceForNpc, getNpcState } from "../db/queries";
import { createLogger } from "../utils/logger";

const log = createLogger("handler:dialogue");

interface DialogueParams {
  npcName: string;
  npcId?: string;
  npcPersonality: string;
  situation: string;
  season: string;
  gameDate: string;
  weather?: string;
  mood?: string;
  affinity?: number;
  recentEvent?: string;
  mission?: string;
}

// Map choice IDs to human-readable descriptions for context
const choiceDescriptions: Record<string, string> = {
  encourage: "鼓励了",
  criticize: "批评了",
  "check-homework": "检查了作业",
  "ask-question": "提了个问题",
  "play-together": "一起玩了一会儿",
  chat: "聊了会儿天",
  "call-back": "叫回了教室",
  "leave-alone": "没有打扰",
  "home-visit-chat": "去家里聊了聊",
  "help-farm": "帮忙干了会儿活",
  "report-work": "汇报了工作",
  comfort: "安慰了",
  "introduce-situation": "介绍了孩子的情况",
};

export async function handleDialogue(params: DialogueParams) {
  const adapter = createAiAdapter({
    model: process.env.AI_MODEL || "deepseek",
    apiKey: process.env.AI_API_KEY || "",
    baseUrl: process.env.AI_BASE_URL || "",
  });

  // Enrich with NPC memory if npcId provided
  let lastInteraction: string | undefined;
  if (params.npcId) {
    try {
      const db = getDb();
      const lastChoice = getLastChoiceForNpc(db, params.npcId);
      if (lastChoice) {
        const desc = choiceDescriptions[lastChoice.choiceValue] || lastChoice.choiceValue;
        lastInteraction = `上次老师${desc}这个人`;
      }
      // Also get live mood/affinity if not provided
      if (!params.mood || !params.affinity) {
        const state = getNpcState(db, params.npcId);
        if (state) {
          if (!params.mood) params.mood = state.mood;
          if (!params.affinity) params.affinity = state.affinity;
        }
      }
    } catch (err) {
      log.warn(`failed to enrich NPC state for ${params.npcId}`, err);
    }
  }

  const enrichedParams = {
    ...params,
    recentEvent: params.recentEvent || lastInteraction,
  };

  const prompt = buildDialoguePrompt(enrichedParams);
  const dialogue = await adapter.generateText(prompt, SYSTEM_PROMPT);
  return { dialogue };
}
