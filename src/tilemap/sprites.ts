export interface SpriteConfig {
  hairColor: string;
  bodyColor: string;
  legColor: string;
  skinColor: string;
  hairStyle: "short" | "long" | "ponytail" | "bald" | "bun";
  gender: "male" | "female";
  accessory?: "glasses" | "hat" | "apron" | "scarf";
}

export type Direction = "down" | "up" | "left" | "right";

export const SPRITE_WIDTH = 32;
export const SPRITE_HEIGHT = 64;

// NPC sprite configs — each NPC has distinct colors
export const npcSpriteConfigs: Record<string, SpriteConfig> = {
  "student-zhang-wei": {
    hairColor: "#3a3530",
    bodyColor: "#C4706A",
    legColor: "#5C6B7A",
    skinColor: "#C9A882",
    hairStyle: "short",
    gender: "male",
  },
  "student-wang-fang": {
    hairColor: "#3a3530",
    bodyColor: "#7A9178",
    legColor: "#5C6B7A",
    skinColor: "#C9A882",
    hairStyle: "ponytail",
    gender: "female",
  },
  "student-li-lei": {
    hairColor: "#3a3530",
    bodyColor: "#5C6B7A",
    legColor: "#6B5B4E",
    skinColor: "#C9A882",
    hairStyle: "short",
    gender: "male",
  },
  "student-zhao-na": {
    hairColor: "#6B5B4E",
    bodyColor: "#d88a84",
    legColor: "#5C6B7A",
    skinColor: "#C9A882",
    hairStyle: "long",
    gender: "female",
  },
  "student-zhu-peng": {
    hairColor: "#3a3530",
    bodyColor: "#8B6914",
    legColor: "#6B5B4E",
    skinColor: "#C9A882",
    hairStyle: "short",
    gender: "male",
    accessory: "scarf",
  },
  "principal-sun": {
    hairColor: "#A8B8B0",
    bodyColor: "#3a3530",
    legColor: "#3a3530",
    skinColor: "#C9A882",
    hairStyle: "bald",
    gender: "male",
  },
  "colleague-zhou": {
    hairColor: "#3a3530",
    bodyColor: "#e0a0d0",
    legColor: "#5C6B7A",
    skinColor: "#C9A882",
    hairStyle: "bun",
    gender: "female",
    accessory: "glasses",
  },
  "parent-gao": {
    hairColor: "#A8B8B0",
    bodyColor: "#6B5B4E",
    legColor: "#6B5B4E",
    skinColor: "#C9A882",
    hairStyle: "short",
    gender: "male",
  },
  "parent-tian": {
    hairColor: "#3a3530",
    bodyColor: "#C4706A",
    legColor: "#6B5B4E",
    skinColor: "#C9A882",
    hairStyle: "bun",
    gender: "female",
  },
  "shopkeeper-ma": {
    hairColor: "#6B5B4E",
    bodyColor: "#D4C08E",
    legColor: "#6B5B4E",
    skinColor: "#C9A882",
    hairStyle: "short",
    gender: "male",
    accessory: "apron",
  },
  "postman-he": {
    hairColor: "#3a3530",
    bodyColor: "#5a7a58",
    legColor: "#3a3530",
    skinColor: "#C9A882",
    hairStyle: "short",
    gender: "male",
    accessory: "hat",
  },
};

// Player character configs
export const playerSpriteConfigs: Record<string, SpriteConfig> = {
  teacher: {
    hairColor: "#3a3530",
    bodyColor: "#F5E6C8",
    legColor: "#5C6B7A",
    skinColor: "#C9A882",
    hairStyle: "short",
    gender: "male",
  },
  postman: {
    hairColor: "#3a3530",
    bodyColor: "#5a7a58",
    legColor: "#3a3530",
    skinColor: "#C9A882",
    hairStyle: "short",
    gender: "male",
    accessory: "hat",
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

// Draw hair based on hairStyle (32×64 scale)
function drawHair(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  config: SpriteConfig,
  direction: Direction,
): void {
  const hairHighlight = lightenColor(config.hairColor, 20);
  const hairShadow = darkenColor(config.hairColor, 15);

  switch (config.hairStyle) {
    case "bald": {
      // No hair — show skin scalp with shine highlights
      ctx.fillStyle = config.skinColor;
      ctx.fillRect(x + 6, y, 20, 4); // top of scalp
      ctx.fillRect(x + 4, y + 4, 24, 8); // upper head
      ctx.fillRect(x + 3, y + 6, 26, 6); // widest part
      // Shine spots on bald head
      ctx.fillStyle = lightenColor(config.skinColor, 30);
      ctx.fillRect(x + 10, y + 1, 5, 2);
      ctx.fillRect(x + 8, y + 3, 3, 2);
      ctx.fillStyle = lightenColor(config.skinColor, 15);
      ctx.fillRect(x + 16, y + 2, 4, 1);
      break;
    }
    case "long": {
      // Hair top dome
      ctx.fillStyle = config.hairColor;
      ctx.fillRect(x + 7, y, 18, 2); // very top
      ctx.fillRect(x + 5, y + 2, 22, 2); // slightly wider
      ctx.fillRect(x + 4, y + 4, 24, 4); // upper dome
      ctx.fillRect(x + 3, y + 8, 26, 4); // full width crown
      // Hair highlight on top
      ctx.fillStyle = hairHighlight;
      ctx.fillRect(x + 9, y + 2, 6, 2);
      ctx.fillRect(x + 7, y + 4, 4, 2);
      // Long hair flowing down sides past shoulders
      ctx.fillStyle = config.hairColor;
      ctx.fillRect(x + 1, y + 12, 4, 18); // left side
      ctx.fillRect(x + 27, y + 12, 4, 18); // right side
      // Side hair tapers at bottom
      ctx.fillRect(x + 2, y + 30, 3, 4); // left taper
      ctx.fillRect(x + 27, y + 30, 3, 4); // right taper
      // Side hair highlight
      ctx.fillStyle = hairHighlight;
      ctx.fillRect(x + 1, y + 12, 2, 8);
      // Side hair shadow (inner edge)
      ctx.fillStyle = hairShadow;
      ctx.fillRect(x + 4, y + 14, 1, 12);
      ctx.fillRect(x + 27, y + 14, 1, 12);
      break;
    }
    case "ponytail": {
      // Short front hair (same dome as short)
      ctx.fillStyle = config.hairColor;
      ctx.fillRect(x + 7, y, 18, 2);
      ctx.fillRect(x + 5, y + 2, 22, 2);
      ctx.fillRect(x + 4, y + 4, 24, 4);
      ctx.fillRect(x + 3, y + 8, 26, 4);
      // Hair highlight
      ctx.fillStyle = hairHighlight;
      ctx.fillRect(x + 9, y + 2, 6, 2);
      ctx.fillRect(x + 7, y + 4, 4, 2);
      // Ponytail extending behind (visible when not facing up)
      if (direction !== "up") {
        ctx.fillStyle = config.hairColor;
        ctx.fillRect(x + 26, y + 9, 4, 2); // tail root
        ctx.fillRect(x + 27, y + 11, 5, 2); // tail extends
        ctx.fillRect(x + 28, y + 13, 4, 10); // hanging tail
        ctx.fillRect(x + 29, y + 23, 3, 4); // tail tip taper
        // Tail highlight
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(x + 28, y + 13, 2, 4);
        // Tail shadow
        ctx.fillStyle = hairShadow;
        ctx.fillRect(x + 31, y + 15, 1, 8);
        // Hair band
        ctx.fillStyle = "#c85050";
        ctx.fillRect(x + 27, y + 11, 5, 1);
      }
      break;
    }
    case "bun": {
      // Normal hair base
      ctx.fillStyle = config.hairColor;
      ctx.fillRect(x + 7, y + 2, 18, 2);
      ctx.fillRect(x + 5, y + 4, 22, 2);
      ctx.fillRect(x + 4, y + 6, 24, 4);
      ctx.fillRect(x + 3, y + 10, 26, 2);
      // Round bun on top (6×6 circle)
      ctx.fillRect(x + 12, y - 3, 8, 1); // top edge
      ctx.fillRect(x + 11, y - 2, 10, 1);
      ctx.fillRect(x + 10, y - 1, 12, 4); // bun body
      ctx.fillRect(x + 11, y + 3, 10, 1);
      ctx.fillRect(x + 12, y + 4, 8, 1); // bottom edge
      // Bun highlight
      ctx.fillStyle = hairHighlight;
      ctx.fillRect(x + 12, y - 2, 4, 2);
      ctx.fillRect(x + 11, y, 3, 2);
      // Hair base highlight
      ctx.fillRect(x + 9, y + 4, 5, 2);
      break;
    }
    default: {
      // "short" — spiky/messy top with 3-4 tufts
      ctx.fillStyle = config.hairColor;
      // Spiky tufts on top
      ctx.fillRect(x + 7, y, 4, 2); // tuft 1 (left)
      ctx.fillRect(x + 13, y - 1, 5, 2); // tuft 2 (center, tallest)
      ctx.fillRect(x + 20, y, 4, 2); // tuft 3 (right)
      ctx.fillRect(x + 10, y + 1, 3, 1); // tuft 4 (small fill)
      // Main hair mass
      ctx.fillRect(x + 5, y + 2, 22, 2);
      ctx.fillRect(x + 4, y + 4, 24, 4);
      ctx.fillRect(x + 3, y + 8, 26, 4);
      // Hair highlight
      ctx.fillStyle = hairHighlight;
      ctx.fillRect(x + 9, y + 3, 6, 2);
      ctx.fillRect(x + 7, y + 5, 4, 2);
      // Shadow on lower hair edge
      ctx.fillStyle = hairShadow;
      ctx.fillRect(x + 5, y + 10, 22, 1);
      break;
    }
  }
}

// Draw accessory overlay (32×64 scale)
function drawAccessory(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  config: SpriteConfig,
  direction: Direction,
): void {
  if (!config.accessory) return;

  switch (config.accessory) {
    case "glasses": {
      // Round frames (6×4px per lens) with bridge at eye level
      if (direction === "down" || direction === "left" || direction === "right") {
        ctx.fillStyle = "#4a4a4a";
        // Left lens frame
        ctx.fillRect(x + 6, y + 14, 6, 4);
        // Left lens glass (transparent tint)
        ctx.fillStyle = "#a8d0e8";
        ctx.fillRect(x + 7, y + 15, 4, 2);
        // Right lens frame
        ctx.fillStyle = "#4a4a4a";
        ctx.fillRect(x + 19, y + 14, 6, 4);
        // Right lens glass
        ctx.fillStyle = "#a8d0e8";
        ctx.fillRect(x + 20, y + 15, 4, 2);
        // Bridge between lenses
        ctx.fillStyle = "#4a4a4a";
        ctx.fillRect(x + 12, y + 15, 7, 1);
        // Temple arms on sides
        ctx.fillRect(x + 5, y + 15, 1, 2);
        ctx.fillRect(x + 25, y + 15, 2, 2);
      }
      break;
    }
    case "hat": {
      // Cap covering top of head, extends 2px beyond head width
      const hatColor = darkenColor(config.bodyColor, 10);
      ctx.fillStyle = hatColor;
      ctx.fillRect(x + 3, y - 2, 26, 6); // hat crown
      ctx.fillRect(x + 2, y + 4, 28, 2); // hat body lower
      // Brim extends wider
      ctx.fillStyle = darkenColor(hatColor, 15);
      ctx.fillRect(x + 1, y + 6, 30, 2); // brim
      // Hat highlight
      ctx.fillStyle = lightenColor(hatColor, 25);
      ctx.fillRect(x + 6, y - 1, 8, 2);
      // Hat band
      ctx.fillStyle = darkenColor(hatColor, 30);
      ctx.fillRect(x + 3, y + 3, 26, 1);
      break;
    }
    case "apron": {
      // Front body overlay with straps and pocket
      if (direction === "down" || direction === "left" || direction === "right") {
        ctx.fillStyle = "#e8e0d0";
        // Main apron body
        ctx.fillRect(x + 9, y + 28, 14, 16);
        // Apron straps from shoulders
        ctx.fillRect(x + 10, y + 24, 3, 4);
        ctx.fillRect(x + 19, y + 24, 3, 4);
        // Apron pocket
        ctx.fillStyle = "#d8d0c0";
        ctx.fillRect(x + 12, y + 36, 8, 4);
        // Pocket top line
        ctx.fillStyle = "#c8c0b0";
        ctx.fillRect(x + 12, y + 36, 8, 1);
        // Apron ties visible at sides
        ctx.fillStyle = "#e8e0d0";
        ctx.fillRect(x + 6, y + 32, 3, 2);
        ctx.fillRect(x + 23, y + 32, 3, 2);
      }
      break;
    }
    case "scarf": {
      // Wrapped around neck with hanging tail
      ctx.fillStyle = "#c85050"; // red scarf
      ctx.fillRect(x + 5, y + 23, 22, 3); // scarf wrap around neck
      ctx.fillRect(x + 6, y + 26, 4, 2); // knot
      // Hanging tail (4px wide)
      ctx.fillRect(x + 7, y + 28, 4, 6);
      ctx.fillRect(x + 8, y + 34, 3, 3); // tail tip taper
      // Scarf highlight
      ctx.fillStyle = "#e07060";
      ctx.fillRect(x + 7, y + 23, 6, 1);
      ctx.fillRect(x + 7, y + 28, 2, 3);
      // Scarf shadow
      ctx.fillStyle = "#a04040";
      ctx.fillRect(x + 24, y + 24, 3, 2);
      break;
    }
  }
}

// Browser-only: draw a Stardew Valley Q-style character sprite (32×64) onto a canvas context
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
  const skinLight = lightenColor(config.skinColor, 15);
  const skinDark = darkenColor(config.skinColor, 15);
  const bodyDark = darkenColor(config.bodyColor, 20);
  const bodyLight = lightenColor(config.bodyColor, 15);
  const legDark = darkenColor(config.legColor, 15);
  const shoeColor = darkenColor(config.legColor, 30);
  const shoeDark = darkenColor(config.legColor, 50);

  const isFemale = config.gender === "female";

  // === HAIR (rows 0-11) ===
  drawHair(ctx, x, y, config, direction);

  // === HEAD / FACE (rows 4-22, ~24px wide centered) ===
  // Skin base — rounded head shape
  ctx.fillStyle = config.skinColor;
  ctx.fillRect(x + 5, y + 8, 22, 2); // top of face under hair
  ctx.fillRect(x + 4, y + 10, 24, 10); // main face area
  ctx.fillRect(x + 5, y + 20, 22, 2); // chin area
  ctx.fillRect(x + 7, y + 22, 18, 1); // chin bottom
  // Ear hints on sides
  ctx.fillStyle = config.skinColor;
  ctx.fillRect(x + 3, y + 13, 1, 4); // left ear
  ctx.fillRect(x + 28, y + 13, 1, 4); // right ear
  ctx.fillStyle = skinDark;
  ctx.fillRect(x + 3, y + 16, 1, 1); // left ear shadow
  ctx.fillRect(x + 28, y + 16, 1, 1); // right ear shadow
  // Forehead highlight
  ctx.fillStyle = skinLight;
  ctx.fillRect(x + 8, y + 10, 16, 1);

  if (direction === "up") {
    // Facing up — draw hair over entire face
    ctx.fillStyle = config.hairColor;
    ctx.fillRect(x + 4, y + 10, 24, 12);
    ctx.fillRect(x + 5, y + 8, 22, 2);
    ctx.fillRect(x + 5, y + 20, 22, 2);
    // Hair highlight for back-of-head
    ctx.fillStyle = lightenColor(config.hairColor, 20);
    ctx.fillRect(x + 10, y + 12, 8, 2);
  } else {
    // === EYEBROWS (2px strokes above eyes) ===
    ctx.fillStyle = darkenColor(config.hairColor, 10);
    if (direction === "down") {
      ctx.fillRect(x + 8, y + 13, 4, 1); // left eyebrow
      ctx.fillRect(x + 20, y + 13, 4, 1); // right eyebrow
    } else if (direction === "left") {
      ctx.fillRect(x + 6, y + 13, 4, 1);
      ctx.fillRect(x + 17, y + 13, 4, 1);
    } else {
      ctx.fillRect(x + 11, y + 13, 4, 1);
      ctx.fillRect(x + 22, y + 13, 4, 1);
    }

    // === EYES (4×3px white, 2×2 iris, 1×1 highlight) ===
    // Iris position shifts based on direction
    let leftEyeX: number;
    let rightEyeX: number;
    if (direction === "down") {
      leftEyeX = x + 8;
      rightEyeX = x + 20;
    } else if (direction === "left") {
      leftEyeX = x + 6;
      rightEyeX = x + 17;
    } else {
      leftEyeX = x + 11;
      rightEyeX = x + 22;
    }

    // Eyelashes for female (1px extra above eyes)
    if (isFemale) {
      ctx.fillStyle = "#3a3530";
      ctx.fillRect(leftEyeX, y + 13, 4, 1);
      ctx.fillRect(rightEyeX, y + 13, 4, 1);
    }

    // Eye whites
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(leftEyeX, y + 14, 4, 3);
    ctx.fillRect(rightEyeX, y + 14, 4, 3);

    // Iris (2×2 dark, positioned based on direction)
    ctx.fillStyle = "#3a3530";
    if (direction === "down") {
      // Centered iris
      ctx.fillRect(leftEyeX + 1, y + 15, 2, 2);
      ctx.fillRect(rightEyeX + 1, y + 15, 2, 2);
    } else if (direction === "left") {
      // Iris shifted left
      ctx.fillRect(leftEyeX, y + 15, 2, 2);
      ctx.fillRect(rightEyeX, y + 15, 2, 2);
    } else {
      // Iris shifted right
      ctx.fillRect(leftEyeX + 2, y + 15, 2, 2);
      ctx.fillRect(rightEyeX + 2, y + 15, 2, 2);
    }

    // Eye highlights (1×1 white dot)
    ctx.fillStyle = "#ffffff";
    if (direction === "down") {
      ctx.fillRect(leftEyeX + 1, y + 15, 1, 1);
      ctx.fillRect(rightEyeX + 1, y + 15, 1, 1);
    } else if (direction === "left") {
      ctx.fillRect(leftEyeX, y + 15, 1, 1);
      ctx.fillRect(rightEyeX, y + 15, 1, 1);
    } else {
      ctx.fillRect(leftEyeX + 2, y + 15, 1, 1);
      ctx.fillRect(rightEyeX + 2, y + 15, 1, 1);
    }

    // === NOSE (2×1px, small cute) ===
    if (direction === "down") {
      ctx.fillStyle = skinDark;
      ctx.fillRect(x + 15, y + 18, 2, 1);
    } else if (direction === "left") {
      ctx.fillStyle = skinDark;
      ctx.fillRect(x + 5, y + 18, 2, 1);
    } else if (direction === "right") {
      ctx.fillStyle = skinDark;
      ctx.fillRect(x + 25, y + 18, 2, 1);
    }

    // === BLUSH (3×2px pink ovals on cheeks) — facing down only ===
    if (direction === "down") {
      ctx.fillStyle = "#e8a0a0";
      ctx.fillRect(x + 5, y + 18, 3, 2); // left cheek blush
      ctx.fillRect(x + 24, y + 18, 3, 2); // right cheek blush
    }

    // === MOUTH (3×1px) ===
    if (direction === "down") {
      ctx.fillStyle = "#c49080";
      ctx.fillRect(x + 14, y + 20, 3, 1);
    }
  }

  // Chin shadow
  ctx.fillStyle = skinDark;
  ctx.fillRect(x + 7, y + 22, 18, 1);

  // === NECK & COLLAR (rows 23-25) ===
  ctx.fillStyle = config.skinColor;
  ctx.fillRect(x + 12, y + 23, 8, 3); // neck
  // Collar
  ctx.fillStyle = config.bodyColor;
  ctx.fillRect(x + 8, y + 25, 16, 2);
  // Collar detail — V-shape / lapels
  ctx.fillStyle = bodyLight;
  ctx.fillRect(x + 9, y + 25, 3, 1);
  ctx.fillRect(x + 20, y + 25, 3, 1);
  ctx.fillRect(x + 11, y + 26, 2, 1);
  ctx.fillRect(x + 19, y + 26, 2, 1);

  // === BODY (rows 26-44) ===
  if (isFemale) {
    // Female body: narrower shoulders (x+7 to x+25)
    ctx.fillStyle = config.bodyColor;
    ctx.fillRect(x + 7, y + 27, 18, 14); // torso
    // Arms (4px wide each)
    ctx.fillRect(x + 3, y + 27, 4, 14); // left arm
    ctx.fillRect(x + 25, y + 27, 4, 14); // right arm
    // Body shading (right side)
    ctx.fillStyle = bodyDark;
    ctx.fillRect(x + 22, y + 27, 3, 14);
    ctx.fillRect(x + 27, y + 29, 2, 10);
    // Body highlight (left side)
    ctx.fillStyle = bodyLight;
    ctx.fillRect(x + 7, y + 27, 3, 5);
    // Shirt wrinkle lines
    ctx.fillStyle = bodyDark;
    ctx.fillRect(x + 12, y + 33, 1, 4);
    ctx.fillRect(x + 18, y + 34, 1, 3);
    // Button line (center)
    ctx.fillStyle = darkenColor(config.bodyColor, 30);
    ctx.fillRect(x + 15, y + 28, 1, 1);
    ctx.fillRect(x + 15, y + 31, 1, 1);
    ctx.fillRect(x + 15, y + 34, 1, 1);
    // Hands (skin color)
    ctx.fillStyle = config.skinColor;
    ctx.fillRect(x + 3, y + 41, 4, 3); // left hand
    ctx.fillRect(x + 25, y + 41, 4, 3); // right hand
    ctx.fillStyle = skinDark;
    ctx.fillRect(x + 3, y + 43, 4, 1); // hand shadow
    ctx.fillRect(x + 25, y + 43, 4, 1);
    // Skirt flare — widening trapezoid from waist
    ctx.fillStyle = config.bodyColor;
    ctx.fillRect(x + 6, y + 41, 20, 2);
    ctx.fillRect(x + 5, y + 43, 22, 2);
    // Skirt shadow
    ctx.fillStyle = bodyDark;
    ctx.fillRect(x + 23, y + 41, 3, 4);
    ctx.fillRect(x + 12, y + 43, 1, 2); // skirt fold
  } else {
    // Male body: full shoulders (x+6 to x+26)
    ctx.fillStyle = config.bodyColor;
    ctx.fillRect(x + 6, y + 27, 20, 14); // torso
    // Arms (4px wide each)
    ctx.fillRect(x + 2, y + 27, 4, 14); // left arm
    ctx.fillRect(x + 26, y + 27, 4, 14); // right arm
    // Body shading (right side)
    ctx.fillStyle = bodyDark;
    ctx.fillRect(x + 23, y + 27, 3, 14);
    ctx.fillRect(x + 28, y + 29, 2, 10);
    // Body highlight (left side)
    ctx.fillStyle = bodyLight;
    ctx.fillRect(x + 6, y + 27, 3, 5);
    // Shirt wrinkle lines
    ctx.fillStyle = bodyDark;
    ctx.fillRect(x + 12, y + 33, 1, 4);
    ctx.fillRect(x + 19, y + 34, 1, 3);
    // Button line (center)
    ctx.fillStyle = darkenColor(config.bodyColor, 30);
    ctx.fillRect(x + 15, y + 28, 1, 1);
    ctx.fillRect(x + 15, y + 31, 1, 1);
    ctx.fillRect(x + 15, y + 34, 1, 1);
    ctx.fillRect(x + 15, y + 37, 1, 1);
    // Hands (skin color)
    ctx.fillStyle = config.skinColor;
    ctx.fillRect(x + 2, y + 41, 4, 3); // left hand
    ctx.fillRect(x + 26, y + 41, 4, 3); // right hand
    ctx.fillStyle = skinDark;
    ctx.fillRect(x + 2, y + 43, 4, 1); // hand shadow
    ctx.fillRect(x + 26, y + 43, 4, 1);
  }

  // === LEGS (rows 45-56, ~12px tall) ===
  if (isFemale) {
    // Legs under skirt — visible from row 45
    ctx.fillStyle = config.legColor;
    ctx.fillRect(x + 8, y + 45, 6, 12); // left leg
    ctx.fillRect(x + 18, y + 45, 6, 12); // right leg
    // Leg shading (inner edges)
    ctx.fillStyle = legDark;
    ctx.fillRect(x + 13, y + 45, 1, 12); // left inner
    ctx.fillRect(x + 18, y + 45, 1, 12); // right inner
    // Ankle taper
    ctx.fillRect(x + 8, y + 55, 1, 2);
    ctx.fillRect(x + 23, y + 55, 1, 2);
  } else {
    // Male pants legs with 2px gap
    ctx.fillStyle = config.legColor;
    ctx.fillRect(x + 7, y + 45, 7, 12); // left leg
    ctx.fillRect(x + 18, y + 45, 7, 12); // right leg
    // Leg shading
    ctx.fillStyle = legDark;
    ctx.fillRect(x + 13, y + 45, 1, 12); // left inner
    ctx.fillRect(x + 18, y + 45, 1, 12); // right inner
    // Ankle taper
    ctx.fillRect(x + 7, y + 55, 1, 2);
    ctx.fillRect(x + 24, y + 55, 1, 2);
  }

  // === FEET / SHOES (rows 57-63, 4px tall) ===
  // Shoes with visible shape, toe, and heel
  ctx.fillStyle = shoeColor;
  if (isFemale) {
    // Left shoe
    ctx.fillRect(x + 7, y + 57, 8, 4);
    // Right shoe
    ctx.fillRect(x + 17, y + 57, 8, 4);
  } else {
    // Left shoe
    ctx.fillRect(x + 6, y + 57, 9, 4);
    // Right shoe
    ctx.fillRect(x + 17, y + 57, 9, 4);
  }
  // Shoe soles (darker bottom line)
  ctx.fillStyle = shoeDark;
  if (isFemale) {
    ctx.fillRect(x + 7, y + 60, 8, 1);
    ctx.fillRect(x + 17, y + 60, 8, 1);
  } else {
    ctx.fillRect(x + 6, y + 60, 9, 1);
    ctx.fillRect(x + 17, y + 60, 9, 1);
  }
  // Shoe toe highlights
  ctx.fillStyle = lightenColor(config.legColor, 10);
  if (isFemale) {
    ctx.fillRect(x + 7, y + 57, 2, 1);
    ctx.fillRect(x + 17, y + 57, 2, 1);
  } else {
    ctx.fillRect(x + 6, y + 57, 2, 1);
    ctx.fillRect(x + 17, y + 57, 2, 1);
  }

  // === ACCESSORIES (drawn as overlay after main body) ===
  drawAccessory(ctx, x, y, config, direction);

  // === LABEL + MOOD ===
  if (label) {
    const text = mood ? `${label} ${moodToEmoji(mood)}` : label;
    ctx.font = '10px "Noto Serif SC", serif';
    const textWidth = ctx.measureText(text).width;
    ctx.fillStyle = "rgba(245, 230, 200, 0.9)";
    ctx.fillRect(x + 16 - textWidth / 2 - 2, y + 66, textWidth + 4, 12);
    ctx.fillStyle = "#3a3530";
    ctx.textAlign = "center";
    ctx.fillText(text, x + 16, y + 76);
  }
}
