export interface SpriteConfig {
  hairColor: string;
  bodyColor: string;
  legColor: string;
  skinColor: string;
}

export type Direction = "down" | "up" | "left" | "right";

export const SPRITE_WIDTH = 24;
export const SPRITE_HEIGHT = 32;

// NPC sprite configs — each NPC has distinct colors
export const npcSpriteConfigs: Record<string, SpriteConfig> = {
  "student-xiaoming": {
    hairColor: "#3a3530",
    bodyColor: "#C4706A",
    legColor: "#5C6B7A",
    skinColor: "#C9A882",
  },
  "student-xiaohua": {
    hairColor: "#3a3530",
    bodyColor: "#7A9178",
    legColor: "#5C6B7A",
    skinColor: "#C9A882",
  },
  "student-dapeng": {
    hairColor: "#3a3530",
    bodyColor: "#5C6B7A",
    legColor: "#6B5B4E",
    skinColor: "#C9A882",
  },
  "student-meimei": {
    hairColor: "#6B5B4E",
    bodyColor: "#d88a84",
    legColor: "#5C6B7A",
    skinColor: "#C9A882",
  },
  "student-tiezhu": {
    hairColor: "#3a3530",
    bodyColor: "#8B6914",
    legColor: "#6B5B4E",
    skinColor: "#C9A882",
  },
  "principal-zhang": {
    hairColor: "#A8B8B0",
    bodyColor: "#3a3530",
    legColor: "#3a3530",
    skinColor: "#C9A882",
  },
  "colleague-li": {
    hairColor: "#3a3530",
    bodyColor: "#e0a0d0",
    legColor: "#5C6B7A",
    skinColor: "#C9A882",
  },
  "parent-wang": {
    hairColor: "#A8B8B0",
    bodyColor: "#6B5B4E",
    legColor: "#6B5B4E",
    skinColor: "#C9A882",
  },
  "parent-zhao": {
    hairColor: "#3a3530",
    bodyColor: "#C4706A",
    legColor: "#6B5B4E",
    skinColor: "#C9A882",
  },
  "shopkeeper-liu": {
    hairColor: "#6B5B4E",
    bodyColor: "#D4C08E",
    legColor: "#6B5B4E",
    skinColor: "#C9A882",
  },
  "postman-chen": {
    hairColor: "#3a3530",
    bodyColor: "#5a7a58",
    legColor: "#3a3530",
    skinColor: "#C9A882",
  },
};

// Player character configs
export const playerSpriteConfigs: Record<string, SpriteConfig> = {
  teacher: {
    hairColor: "#3a3530",
    bodyColor: "#F5E6C8",
    legColor: "#5C6B7A",
    skinColor: "#C9A882",
  },
  postman: {
    hairColor: "#3a3530",
    bodyColor: "#5a7a58",
    legColor: "#3a3530",
    skinColor: "#C9A882",
  },
};

export function getSpriteConfig(npcId: string): SpriteConfig | undefined {
  return npcSpriteConfigs[npcId];
}

export function getPlayerSpriteConfig(character: string): SpriteConfig | undefined {
  return playerSpriteConfigs[character];
}

// Mood to emoji mapping
export function moodToEmoji(mood: string): string {
  const map: Record<string, string> = {
    happy: "😊",
    neutral: "😐",
    upset: "😟",
    excited: "😄",
    tired: "😴",
  };
  return map[mood] || "😐";
}

// Browser-only: draw a character sprite onto a canvas context
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  config: SpriteConfig,
  direction: Direction,
  label?: string,
  mood?: string,
): void {
  const w = SPRITE_WIDTH;
  const h = SPRITE_HEIGHT;

  // Hair
  ctx.fillStyle = config.hairColor;
  ctx.fillRect(x + 5, y, w - 10, 6);

  // Head
  ctx.fillStyle = config.skinColor;
  ctx.fillRect(x + 5, y + 6, w - 10, 10);

  // Eyes (based on direction)
  ctx.fillStyle = "#3a3530";
  if (direction === "down" || direction === "up") {
    ctx.fillRect(x + 8, y + 9, 2, 2);
    ctx.fillRect(x + 14, y + 9, 2, 2);
  } else if (direction === "left") {
    ctx.fillRect(x + 6, y + 9, 2, 2);
    ctx.fillRect(x + 11, y + 9, 2, 2);
  } else {
    ctx.fillRect(x + 11, y + 9, 2, 2);
    ctx.fillRect(x + 16, y + 9, 2, 2);
  }

  // Mouth
  if (direction !== "up") {
    ctx.fillStyle = config.hairColor === "#A8B8B0" ? "#C9A882" : "#C4706A";
    ctx.fillRect(x + 10, y + 13, 4, 1);
  }

  // Body
  ctx.fillStyle = config.bodyColor;
  ctx.fillRect(x + 4, y + 16, w - 8, 10);

  // Legs
  ctx.fillStyle = config.legColor;
  ctx.fillRect(x + 5, y + 26, 5, 6);
  ctx.fillRect(x + 14, y + 26, 5, 6);

  // Label + mood
  if (label) {
    ctx.fillStyle = "rgba(245, 230, 200, 0.85)";
    const text = mood ? `${label} ${moodToEmoji(mood)}` : label;
    ctx.font = "8px sans-serif";
    const textWidth = ctx.measureText(text).width;
    ctx.fillRect(x + w / 2 - textWidth / 2 - 2, y + h + 1, textWidth + 4, 10);
    ctx.fillStyle = "#3a3530";
    ctx.textAlign = "center";
    ctx.fillText(text, x + w / 2, y + h + 9);
  }
}
