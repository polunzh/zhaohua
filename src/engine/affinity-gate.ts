import { getInteractionChoices, type InteractionChoice } from "../data/interactions";

const refusalTexts: Record<string, string[]> = {
  student: ["……不想说话。", "低着头不理你。", "扭过头去了。"],
  principal: ["校长看起来很忙。", "现在不方便。"],
  "teacher-colleague": ["周老师似乎在忙。"],
  parent: ["叹了口气，没说什么。"],
  default: ["……"],
};

const apologizeChoice: InteractionChoice = {
  id: "apologize",
  label: "道歉",
  effect: { affinityDelta: 8, mood: "neutral" },
};

export function getRefusalText(role: string): string {
  const pool = refusalTexts[role] || refusalTexts.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

export interface GatedChoicesResult {
  refused: boolean;
  refusalText?: string;
  choices: InteractionChoice[];
}

export function getGatedChoices(
  role: string,
  location: string,
  affinity: number,
): GatedChoicesResult {
  // Low affinity: NPC refuses to talk
  if (affinity < 20) {
    return {
      refused: true,
      refusalText: getRefusalText(role),
      choices: [apologizeChoice],
    };
  }

  const fullChoices = getInteractionChoices(role, location);

  // Medium-low affinity: only 2 basic choices
  if (affinity < 35) {
    return {
      refused: false,
      choices: fullChoices.slice(0, 2),
    };
  }

  // Normal: full choices
  return {
    refused: false,
    choices: fullChoices,
  };
}
