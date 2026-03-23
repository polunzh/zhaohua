interface DialogueContext {
  npcName: string;
  npcPersonality: string;
  situation: string;
  season: string;
  gameDate: string;
}

interface EventDescContext {
  eventDescription: string;
  season: string;
  weather: string;
  gameDate: string;
}

export const SYSTEM_PROMPT = `你是一个 1990 年代中国北方农村生活模拟器的文本生成器。
你生成的文字要符合那个年代的农村语境：朴实、直接、口语化。
不要使用现代网络用语、流行语或英文。
保持简短——每段对话不超过两三句话。`;

export function buildDialoguePrompt(ctx: DialogueContext): string {
  const seasonName: Record<string, string> = {
    spring: "春天",
    summer: "夏天",
    autumn: "秋天",
    winter: "冬天",
  };
  return `时间：${ctx.gameDate}，${seasonName[ctx.season] || ctx.season}。
角色：${ctx.npcName}，性格：${ctx.npcPersonality}。
场景：${ctx.situation}。
不要使用现代网络用语。

请用${ctx.npcName}的口吻说一两句话。只输出对话内容，不要加引号或角色名前缀。`;
}

export function buildEventDescriptionPrompt(ctx: EventDescContext): string {
  const seasonName: Record<string, string> = {
    spring: "春",
    summer: "夏",
    autumn: "秋",
    winter: "冬",
  };
  return `时间：${ctx.gameDate}，${seasonName[ctx.season] || ctx.season}天，天气${ctx.weather}。
事件：${ctx.eventDescription}。
不要使用现代网络用语。

用一两句话描述这个场景，要有画面感，像在写一篇短日记。只输出描述，不加标题。`;
}
