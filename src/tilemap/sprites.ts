export interface SpriteConfig {
  hairColor: string;
  bodyColor: string;
  legColor: string;
  skinColor: string;
}

export type Direction = "down" | "up" | "left" | "right";

export const SPRITE_WIDTH = 16;
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

// Helper: darken a hex color
export function darkenColor(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// Helper: lighten a hex color
export function lightenColor(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// Browser-only: draw a Stardew Valley Q-style character sprite (16×32) onto a canvas context
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  config: SpriteConfig,
  direction: Direction,
  label?: string,
  mood?: string,
): void {
  // Colors with shading
  const hairDark = darkenColor(config.hairColor, 20);
  const skinLight = lightenColor(config.skinColor, 15);
  const skinDark = darkenColor(config.skinColor, 15);
  const bodyDark = darkenColor(config.bodyColor, 20);
  const bodyLight = lightenColor(config.bodyColor, 15);
  const legDark = darkenColor(config.legColor, 15);

  // === HAIR TOP (rows 0-1) ===
  ctx.fillStyle = config.hairColor;
  ctx.fillRect(x + 3, y, 10, 2);

  // === HEAD (rows 2-12) — round shape ===
  // Hair upper part
  ctx.fillStyle = config.hairColor;
  ctx.fillRect(x + 2, y + 2, 12, 5);
  ctx.fillRect(x + 1, y + 3, 14, 3);
  // Hair highlight
  ctx.fillStyle = lightenColor(config.hairColor, 20);
  ctx.fillRect(x + 4, y + 2, 3, 1);

  // Face
  ctx.fillStyle = config.skinColor;
  ctx.fillRect(x + 2, y + 7, 12, 5);
  ctx.fillRect(x + 1, y + 8, 14, 3);
  // Face highlight (forehead)
  ctx.fillStyle = skinLight;
  ctx.fillRect(x + 4, y + 7, 8, 1);

  // Eyes (2×2 each, dark)
  ctx.fillStyle = "#3a3530";
  if (direction === "down") {
    ctx.fillRect(x + 4, y + 8, 2, 2);
    ctx.fillRect(x + 10, y + 8, 2, 2);
    // Eye highlights
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 4, y + 8, 1, 1);
    ctx.fillRect(x + 10, y + 8, 1, 1);
  } else if (direction === "left") {
    ctx.fillRect(x + 3, y + 8, 2, 2);
    ctx.fillRect(x + 8, y + 8, 2, 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 3, y + 8, 1, 1);
    ctx.fillRect(x + 8, y + 8, 1, 1);
  } else if (direction === "right") {
    ctx.fillRect(x + 6, y + 8, 2, 2);
    ctx.fillRect(x + 11, y + 8, 2, 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 6, y + 8, 1, 1);
    ctx.fillRect(x + 11, y + 8, 1, 1);
  } else {
    // up — no face visible
    ctx.fillStyle = config.hairColor;
    ctx.fillRect(x + 2, y + 7, 12, 5);
    ctx.fillRect(x + 1, y + 8, 14, 3);
  }

  // Blush (small pink dots on cheeks) — only facing down
  if (direction === "down") {
    ctx.fillStyle = "#e8a0a0";
    ctx.fillRect(x + 3, y + 10, 1, 1);
    ctx.fillRect(x + 12, y + 10, 1, 1);
  }

  // Small mouth
  if (direction === "down") {
    ctx.fillStyle = "#c49080";
    ctx.fillRect(x + 7, y + 11, 2, 1);
  }

  // Chin / face bottom
  ctx.fillStyle = skinDark;
  ctx.fillRect(x + 3, y + 12, 10, 1);

  // === NECK & COLLAR (rows 13-14) ===
  ctx.fillStyle = config.skinColor;
  ctx.fillRect(x + 6, y + 13, 4, 1);
  ctx.fillStyle = config.bodyColor;
  ctx.fillRect(x + 4, y + 14, 8, 1);
  // Collar detail
  ctx.fillStyle = bodyLight;
  ctx.fillRect(x + 5, y + 14, 2, 1);
  ctx.fillRect(x + 9, y + 14, 2, 1);

  // === BODY (rows 15-24) ===
  ctx.fillStyle = config.bodyColor;
  ctx.fillRect(x + 3, y + 15, 10, 10);
  // Arms
  ctx.fillRect(x + 1, y + 15, 2, 8);
  ctx.fillRect(x + 13, y + 15, 2, 8);
  // Body shading (right side darker)
  ctx.fillStyle = bodyDark;
  ctx.fillRect(x + 11, y + 15, 2, 10);
  ctx.fillRect(x + 14, y + 16, 1, 6);
  // Body highlight (left side lighter)
  ctx.fillStyle = bodyLight;
  ctx.fillRect(x + 3, y + 15, 2, 3);
  // Hands (skin color)
  ctx.fillStyle = config.skinColor;
  ctx.fillRect(x + 1, y + 23, 2, 2);
  ctx.fillRect(x + 13, y + 23, 2, 2);

  // === LEGS (rows 25-31) ===
  ctx.fillStyle = config.legColor;
  ctx.fillRect(x + 4, y + 25, 3, 6);
  ctx.fillRect(x + 9, y + 25, 3, 6);
  // Leg shading
  ctx.fillStyle = legDark;
  ctx.fillRect(x + 6, y + 25, 1, 6);
  ctx.fillRect(x + 11, y + 25, 1, 6);
  // Shoes (darker at bottom)
  ctx.fillStyle = darkenColor(config.legColor, 30);
  ctx.fillRect(x + 3, y + 30, 4, 2);
  ctx.fillRect(x + 9, y + 30, 4, 2);

  // === LABEL + MOOD ===
  if (label) {
    const text = mood ? `${label} ${moodToEmoji(mood)}` : label;
    ctx.font = "8px sans-serif";
    const textWidth = ctx.measureText(text).width;
    ctx.fillStyle = "rgba(245, 230, 200, 0.9)";
    ctx.fillRect(x + 8 - textWidth / 2 - 2, y + 33, textWidth + 4, 10);
    ctx.fillStyle = "#3a3530";
    ctx.textAlign = "center";
    ctx.fillText(text, x + 8, y + 41);
  }
}
