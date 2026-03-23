import { createAiAdapter } from "../ai/adapter";
import { buildDialoguePrompt, SYSTEM_PROMPT } from "../ai/prompts";

interface DialogueParams {
  npcName: string;
  npcPersonality: string;
  situation: string;
  season: string;
  gameDate: string;
}

export async function handleDialogue(params: DialogueParams) {
  const adapter = createAiAdapter({
    model: process.env.AI_MODEL || "deepseek",
    apiKey: process.env.AI_API_KEY || "",
    baseUrl: process.env.AI_BASE_URL || "",
  });

  const prompt = buildDialoguePrompt(params);
  const dialogue = await adapter.generateText(prompt, SYSTEM_PROMPT);
  return { dialogue };
}
