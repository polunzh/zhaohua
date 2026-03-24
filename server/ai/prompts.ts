interface DialogueContext {
  npcName: string;
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
  const weatherName: Record<string, string> = {
    sunny: "晴天",
    cloudy: "阴天",
    rainy: "下雨",
    snowy: "下雪",
    windy: "刮风",
  };
  const moodName: Record<string, string> = {
    happy: "开心",
    neutral: "平静",
    upset: "不高兴",
    excited: "兴奋",
    tired: "疲惫",
  };

  let prompt = `时间：${ctx.gameDate}，${seasonName[ctx.season] || ctx.season}`;
  if (ctx.weather) prompt += `，${weatherName[ctx.weather] || ctx.weather}`;
  prompt += `。\n角色：${ctx.npcName}，性格：${ctx.npcPersonality}。`;
  if (ctx.mood) prompt += `\n当前心情：${moodName[ctx.mood] || ctx.mood}。`;
  if (ctx.affinity !== undefined) {
    if (ctx.affinity >= 70) prompt += `\n和老师关系很好，信任老师。`;
    else if (ctx.affinity <= 30) prompt += `\n和老师关系一般，有些疏远。`;
  }
  prompt += `\n场景：${ctx.situation}。`;
  if (ctx.recentEvent) prompt += `\n最近发生的事：${ctx.recentEvent}。`;
  if (ctx.mission) prompt += `\n老师今天的任务：${ctx.mission}。`;
  prompt += `\n不要使用现代网络用语。\n\n请用${ctx.npcName}的口吻说一两句话。只输出对话内容，不要加引号或角色名前缀。`;
  return prompt;
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
