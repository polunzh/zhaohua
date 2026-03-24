<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { TileMapEngine } from "../tilemap/engine";
import { getTileConfig, TILES } from "../tilemap/tileset";
import {
  drawCharacter,
  getSpriteConfig,
  getPlayerSpriteConfig,
  moodToEmoji,
} from "../tilemap/sprites";
import { TILE_SIZE } from "../tilemap/types";
import type { TileMapData } from "../tilemap/types";
import { applyColorGrading } from "../scene/filter";

const props = defineProps<{
  mapData: TileMapData | null;
  npcs: {
    id: string;
    name: string;
    location: string;
    mood: string;
    tileX?: number;
    tileY?: number;
  }[];
  activeCharacter: string;
  currentScene: string;
}>();

const emit = defineEmits<{
  clickTile: [tileX: number, tileY: number];
  clickNpc: [npcId: string];
  clickExit: [targetMapId: string];
}>();

const canvasRef = ref<HTMLCanvasElement>();
let engine: TileMapEngine | null = null;

function drawTile(ctx: CanvasRenderingContext2D, tileId: number, x: number, y: number, s: number) {
  const config = getTileConfig(tileId);
  if (!config || config.color === "transparent") return;

  // Stardew Valley palette — 4 levels per material: highlight / base / dark / shadow
  const PAL = {
    grass: ["#9abc96", "#7A9178", "#5a7a58", "#4a6a48"],
    dirt: ["#dcd0a8", "#D4C08E", "#C9A882", "#b89870"],
    brick: ["#d89088", "#C4706A", "#a05a54", "#8a4a44"],
    wood: ["#b89840", "#8B6914", "#6B5B4E", "#5a4a3e"],
    floor: ["#f5ecd8", "#F5E6C8", "#e8d8b0", "#d4c898"],
    stone: ["#c0d0c8", "#A8B8B0", "#8a9a92", "#6a7a72"],
    metal: ["#7888a0", "#5C6B7A", "#4a5868", "#3a4858"],
  };

  switch (tileId) {
    // ── Ground tiles ──────────────────────────────────
    case TILES.DIRT: {
      // Base fill
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Dark speckles scattered across tile
      ctx.fillStyle = PAL.dirt[2];
      ctx.fillRect(x + 2, y + 3, 1, 1);
      ctx.fillRect(x + 9, y + 1, 1, 1);
      ctx.fillRect(x + 13, y + 5, 1, 1);
      ctx.fillRect(x + 5, y + 9, 1, 1);
      ctx.fillRect(x + 1, y + 12, 1, 1);
      ctx.fillRect(x + 11, y + 11, 1, 1);
      // Highlight spots
      ctx.fillStyle = PAL.dirt[0];
      ctx.fillRect(x + 7, y + 2, 1, 1);
      ctx.fillRect(x + 3, y + 7, 1, 1);
      // Bottom edge darkening
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x, y + 14, s, 1);
      ctx.fillRect(x + 3, y + 13, 2, 1);
      ctx.fillRect(x + 10, y + 13, 3, 1);
      // Extra deep speckles
      ctx.fillRect(x + 6, y + 14, 1, 1);
      ctx.fillRect(x + 14, y + 10, 1, 1);
      break;
    }

    case TILES.GRASS: {
      // Base fill
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Dark grass blades — 1px wide, 2-3px tall
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 1, y + 2, 1, 3);
      ctx.fillRect(x + 4, y + 0, 1, 2);
      ctx.fillRect(x + 6, y + 4, 1, 3);
      ctx.fillRect(x + 9, y + 1, 1, 2);
      ctx.fillRect(x + 12, y + 3, 1, 3);
      ctx.fillRect(x + 14, y + 0, 1, 2);
      ctx.fillRect(x + 3, y + 9, 1, 3);
      ctx.fillRect(x + 7, y + 10, 1, 2);
      ctx.fillRect(x + 10, y + 8, 1, 3);
      ctx.fillRect(x + 13, y + 11, 1, 2);
      // Highlight patches
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 2, y + 6, 1, 1);
      ctx.fillRect(x + 8, y + 3, 1, 1);
      ctx.fillRect(x + 5, y + 12, 1, 1);
      ctx.fillRect(x + 11, y + 7, 1, 1);
      // Shadow dots
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 0, y + 14, 1, 1);
      ctx.fillRect(x + 15, y + 13, 1, 1);
      break;
    }

    case TILES.FLOOR_CLASSROOM: {
      // Base fill
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // Tile grid lines (1px) at edges
      ctx.fillStyle = PAL.floor[2];
      ctx.fillRect(x, y, 1, s); // left edge
      ctx.fillRect(x, y, s, 1); // top edge
      ctx.fillRect(x + 15, y, 1, s); // right edge
      ctx.fillRect(x, y + 15, s, 1); // bottom edge
      // Subtle diagonal grain
      ctx.fillRect(x + 3, y + 3, 2, 1);
      ctx.fillRect(x + 7, y + 7, 2, 1);
      ctx.fillRect(x + 11, y + 11, 2, 1);
      ctx.fillRect(x + 5, y + 13, 1, 1);
      // Highlight center
      ctx.fillStyle = PAL.floor[0];
      ctx.fillRect(x + 6, y + 4, 1, 1);
      ctx.fillRect(x + 10, y + 8, 1, 1);
      // Shadow corners
      ctx.fillStyle = PAL.floor[3];
      ctx.fillRect(x, y + 15, 1, 1);
      ctx.fillRect(x + 15, y + 15, 1, 1);
      break;
    }

    case TILES.FLOOR_OFFICE: {
      // Base fill
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // 2px border grid
      ctx.fillStyle = PAL.floor[2];
      ctx.fillRect(x, y, 2, s); // left border
      ctx.fillRect(x, y, s, 2); // top border
      ctx.fillRect(x + 14, y, 2, s); // right border
      ctx.fillRect(x, y + 14, s, 2); // bottom border
      // Inner highlight
      ctx.fillStyle = PAL.floor[0];
      ctx.fillRect(x + 3, y + 3, 1, 1);
      ctx.fillRect(x + 8, y + 5, 1, 1);
      // Subtle wood grain inside
      ctx.fillStyle = PAL.floor[2];
      ctx.fillRect(x + 4, y + 7, 3, 1);
      ctx.fillRect(x + 9, y + 10, 2, 1);
      // Dark corner accents
      ctx.fillStyle = PAL.floor[3];
      ctx.fillRect(x, y, 2, 2);
      ctx.fillRect(x + 14, y, 2, 2);
      ctx.fillRect(x, y + 14, 2, 2);
      ctx.fillRect(x + 14, y + 14, 2, 2);
      break;
    }

    case TILES.ROAD: {
      // Base fill
      ctx.fillStyle = PAL.dirt[2];
      ctx.fillRect(x, y, s, s);
      // Edge darkening
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x, y, 2, s); // left edge
      ctx.fillRect(x + 14, y, 2, s); // right edge
      // Center dashed line
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x + 7, y + 1, 2, 4);
      ctx.fillRect(x + 7, y + 9, 2, 4);
      // Pebble dots
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 4, y + 3, 1, 1);
      ctx.fillRect(x + 10, y + 8, 1, 1);
      ctx.fillRect(x + 5, y + 13, 1, 1);
      // Highlight spots
      ctx.fillStyle = PAL.dirt[0];
      ctx.fillRect(x + 3, y + 7, 1, 1);
      ctx.fillRect(x + 12, y + 5, 1, 1);
      break;
    }

    // ── Wall tiles ────────────────────────────────────
    case TILES.WALL_BRICK: {
      // Base fill
      ctx.fillStyle = PAL.brick[1];
      ctx.fillRect(x, y, s, s);
      // Mortar lines in highlight color
      ctx.fillStyle = PAL.brick[0];
      // Horizontal mortar
      ctx.fillRect(x, y + 4, s, 1);
      ctx.fillRect(x, y + 8, s, 1);
      ctx.fillRect(x, y + 12, s, 1);
      // Vertical mortar — offset pattern
      ctx.fillRect(x + 7, y, 1, 4); // row 1
      ctx.fillRect(x + 3, y + 5, 1, 3); // row 2
      ctx.fillRect(x + 11, y + 5, 1, 3); // row 2
      ctx.fillRect(x + 7, y + 9, 1, 3); // row 3
      ctx.fillRect(x + 3, y + 13, 1, 3); // row 4
      ctx.fillRect(x + 11, y + 13, 1, 3); // row 4
      // Per-brick highlight (top-left 1px)
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x + 1, y + 1, 2, 1);
      ctx.fillRect(x + 9, y + 1, 2, 1);
      ctx.fillRect(x + 4, y + 5, 2, 1);
      ctx.fillRect(x + 1, y + 9, 2, 1);
      ctx.fillRect(x + 9, y + 9, 2, 1);
      ctx.fillRect(x + 4, y + 13, 2, 1);
      // Per-brick shadow (bottom-right 1px)
      ctx.fillStyle = PAL.brick[2];
      ctx.fillRect(x + 5, y + 3, 2, 1);
      ctx.fillRect(x + 13, y + 3, 2, 1);
      ctx.fillRect(x + 2, y + 7, 1, 1);
      ctx.fillRect(x + 9, y + 7, 2, 1);
      ctx.fillRect(x + 5, y + 11, 2, 1);
      ctx.fillRect(x + 13, y + 11, 2, 1);
      // Bottom edge shadow line
      ctx.fillStyle = PAL.brick[3];
      ctx.fillRect(x, y + 15, s, 1);
      break;
    }

    case TILES.WALL_TOP: {
      // Bottom 10px: brick section
      ctx.fillStyle = PAL.brick[1];
      ctx.fillRect(x, y + 6, s, 10);
      // Brick mortar lines
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x, y + 10, s, 1);
      ctx.fillRect(x + 7, y + 6, 1, 4);
      ctx.fillRect(x + 3, y + 11, 1, 5);
      ctx.fillRect(x + 11, y + 11, 1, 5);
      // Brick highlight
      ctx.fillRect(x + 1, y + 7, 2, 1);
      ctx.fillRect(x + 9, y + 7, 2, 1);
      ctx.fillRect(x + 4, y + 11, 2, 1);
      // Brick shadow
      ctx.fillStyle = PAL.brick[2];
      ctx.fillRect(x + 5, y + 9, 2, 1);
      ctx.fillRect(x + 13, y + 9, 2, 1);
      ctx.fillRect(x + 9, y + 14, 2, 1);
      // Top 6px: roof edge
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(x, y, s, 6);
      // Highlight line at very top
      ctx.fillStyle = "#a06828";
      ctx.fillRect(x, y, s, 1);
      ctx.fillRect(x + 1, y + 1, 3, 1);
      ctx.fillRect(x + 8, y + 1, 3, 1);
      // Dark line at bottom of roof section
      ctx.fillStyle = "#6a3010";
      ctx.fillRect(x, y + 5, s, 1);
      // Shingle texture on roof portion
      ctx.fillStyle = "#a06828";
      ctx.fillRect(x + 3, y + 2, 2, 1);
      ctx.fillRect(x + 10, y + 3, 2, 1);
      break;
    }

    case TILES.ROOF: {
      // Base fill
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(x, y, s, s);
      // Shingle pattern — overlapping rows
      // Row 1 (y 0-3)
      ctx.fillStyle = "#a06828";
      ctx.fillRect(x + 1, y, 5, 1);
      ctx.fillRect(x + 9, y, 5, 1);
      ctx.fillRect(x + 0, y + 1, 3, 1);
      ctx.fillRect(x + 8, y + 1, 3, 1);
      // Row 2 (y 4-7)
      ctx.fillRect(x + 4, y + 4, 5, 1);
      ctx.fillRect(x + 12, y + 4, 3, 1);
      ctx.fillRect(x + 3, y + 5, 3, 1);
      ctx.fillRect(x + 11, y + 5, 3, 1);
      // Row 3 (y 8-11)
      ctx.fillRect(x + 1, y + 8, 5, 1);
      ctx.fillRect(x + 9, y + 8, 5, 1);
      ctx.fillRect(x + 0, y + 9, 3, 1);
      ctx.fillRect(x + 8, y + 9, 3, 1);
      // Row 4 (y 12-15)
      ctx.fillRect(x + 4, y + 12, 5, 1);
      ctx.fillRect(x + 12, y + 12, 3, 1);
      ctx.fillRect(x + 3, y + 13, 3, 1);
      ctx.fillRect(x + 11, y + 13, 3, 1);
      // Dark shadow lines between shingle rows
      ctx.fillStyle = "#6a3010";
      ctx.fillRect(x, y + 3, s, 1);
      ctx.fillRect(x, y + 7, s, 1);
      ctx.fillRect(x, y + 11, s, 1);
      ctx.fillRect(x, y + 15, s, 1);
      // Extra deep shadow spots
      ctx.fillRect(x + 6, y + 3, 2, 1);
      ctx.fillRect(x + 2, y + 7, 2, 1);
      ctx.fillRect(x + 14, y + 11, 2, 1);
      break;
    }

    // ── Object tiles ──────────────────────────────────
    case TILES.DESK: {
      // Floor underneath
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // Desk top surface (12x4)
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 2, y + 4, 12, 4);
      // Top edge highlight
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 2, y + 4, 12, 1);
      ctx.fillRect(x + 3, y + 5, 2, 1);
      // Wood grain on desk top
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 5, y + 6, 3, 1);
      ctx.fillRect(x + 10, y + 5, 2, 1);
      // Bottom edge shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 2, y + 7, 12, 1);
      // Two legs (2x5 each)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 3, y + 8, 2, 5);
      ctx.fillRect(x + 11, y + 8, 2, 5);
      // Leg highlights
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 3, y + 8, 1, 5);
      ctx.fillRect(x + 11, y + 8, 1, 5);
      // Leg shadows
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 4, y + 12, 1, 1);
      ctx.fillRect(x + 12, y + 12, 1, 1);
      // Shadow on floor beneath desk
      ctx.fillStyle = PAL.floor[3];
      ctx.fillRect(x + 4, y + 13, 8, 1);
      break;
    }

    case TILES.BLACKBOARD: {
      // Wall background
      ctx.fillStyle = PAL.brick[1];
      ctx.fillRect(x, y, s, s);
      // Wooden frame (outer)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 1, y + 1, 14, 12);
      // Frame highlight top-left
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 1, y + 1, 14, 1);
      ctx.fillRect(x + 1, y + 1, 1, 12);
      // Frame shadow bottom-right
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 1, y + 12, 14, 1);
      ctx.fillRect(x + 14, y + 1, 1, 12);
      // Board surface (dark green-black)
      ctx.fillStyle = "#2a3a2e";
      ctx.fillRect(x + 2, y + 2, 12, 9);
      // Slightly lighter board center
      ctx.fillStyle = "#344438";
      ctx.fillRect(x + 3, y + 3, 10, 7);
      // Chalk marks
      ctx.fillStyle = "#d0d0c8";
      ctx.fillRect(x + 4, y + 4, 4, 1);
      ctx.fillRect(x + 9, y + 4, 2, 1);
      ctx.fillStyle = "#c0c0b8";
      ctx.fillRect(x + 3, y + 6, 5, 1);
      ctx.fillRect(x + 5, y + 8, 3, 1);
      // Chalk tray
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 3, y + 11, 10, 1);
      // Chalk tray highlight
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 3, y + 11, 10, 1);
      // Chalk pieces on tray
      ctx.fillStyle = "#e8e8e0";
      ctx.fillRect(x + 5, y + 11, 2, 1);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 9, y + 11, 1, 1);
      // Wall mortar hint at edges
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x, y + 7, 1, 1);
      ctx.fillRect(x + 15, y + 4, 1, 1);
      break;
    }

    case TILES.WINDOW: {
      // Wall background
      ctx.fillStyle = PAL.brick[1];
      ctx.fillRect(x, y, s, s);
      // Brick mortar hints
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x, y + 4, 2, 1);
      ctx.fillRect(x + 14, y + 12, 2, 1);
      // Window frame (wood)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 2, y + 2, 12, 12);
      // Frame highlight
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 2, y + 2, 12, 1);
      ctx.fillRect(x + 2, y + 2, 1, 12);
      // Frame shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 2, y + 13, 12, 1);
      ctx.fillRect(x + 13, y + 2, 1, 12);
      // Glass — top lighter (sky gradient feel)
      ctx.fillStyle = "#a8d0e8";
      ctx.fillRect(x + 3, y + 3, 10, 5);
      ctx.fillStyle = "#90c0d8";
      ctx.fillRect(x + 3, y + 8, 10, 5);
      // Cross frame
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 7, y + 3, 2, 10); // vertical
      ctx.fillRect(x + 3, y + 7, 10, 2); // horizontal
      // White reflection in top-left pane
      ctx.fillStyle = "#d8eef8";
      ctx.fillRect(x + 4, y + 4, 2, 1);
      ctx.fillRect(x + 4, y + 5, 1, 1);
      // Slight blue reflection bottom-right
      ctx.fillStyle = "#b8d8e8";
      ctx.fillRect(x + 11, y + 11, 1, 1);
      break;
    }

    case TILES.DOOR: {
      // Wall background
      ctx.fillStyle = PAL.brick[1];
      ctx.fillRect(x, y, s, s);
      // Door frame (darker wood)
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 2, y + 1, 12, 15);
      // Door surface
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 3, y + 2, 10, 13);
      // Top panel (slightly lighter)
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 4, y + 3, 8, 4);
      // Top panel inner highlight
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 4, y + 3, 8, 1);
      // Top panel shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 4, y + 6, 8, 1);
      // Bottom panel
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 4, y + 9, 8, 4);
      // Bottom panel highlight
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 4, y + 9, 8, 1);
      // Bottom panel shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 4, y + 12, 8, 1);
      // Handle
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 10, y + 8, 2, 2);
      ctx.fillStyle = "#d0b040";
      ctx.fillRect(x + 11, y + 9, 1, 1);
      // Right side shadow on frame
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 13, y + 2, 1, 13);
      // Brick hints at top corners
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x, y + 4, 2, 1);
      ctx.fillRect(x + 14, y + 7, 2, 1);
      break;
    }

    case TILES.STOVE: {
      // Floor background
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // Stovepipe going up
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 6, y + 0, 4, 4);
      // Pipe highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 6, y + 0, 1, 4);
      // Stove body (iron)
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 2, y + 4, 12, 10);
      // Body highlight (left side)
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 2, y + 4, 1, 10);
      ctx.fillRect(x + 3, y + 4, 3, 1);
      // Body shadow (right side)
      ctx.fillStyle = PAL.metal[3];
      ctx.fillRect(x + 13, y + 4, 1, 10);
      ctx.fillRect(x + 10, y + 13, 4, 1);
      // Glowing embers on top
      ctx.fillStyle = "#c83020";
      ctx.fillRect(x + 4, y + 4, 8, 2);
      ctx.fillStyle = "#e86030";
      ctx.fillRect(x + 5, y + 4, 2, 1);
      ctx.fillRect(x + 9, y + 4, 2, 1);
      ctx.fillStyle = "#e8a040";
      ctx.fillRect(x + 6, y + 4, 1, 1);
      ctx.fillRect(x + 10, y + 4, 1, 1);
      // Stove door
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 5, y + 8, 6, 4);
      // Door frame
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 5, y + 8, 6, 1);
      ctx.fillRect(x + 5, y + 8, 1, 4);
      ctx.fillStyle = PAL.metal[3];
      ctx.fillRect(x + 10, y + 8, 1, 4);
      ctx.fillRect(x + 5, y + 11, 6, 1);
      // Ash detail at base
      ctx.fillStyle = "#8a8880";
      ctx.fillRect(x + 3, y + 14, 4, 1);
      ctx.fillRect(x + 9, y + 14, 3, 1);
      break;
    }

    case TILES.BOOKSHELF: {
      // Floor background
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // Shelf frame (wood)
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 1, y + 0, 14, 15);
      // Frame highlight
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 1, y + 0, 14, 1);
      ctx.fillRect(x + 1, y + 0, 1, 15);
      // Frame shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 14, y + 0, 1, 15);
      ctx.fillRect(x + 1, y + 14, 14, 1);
      // Shelf dividers
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 2, y + 5, 12, 1);
      ctx.fillRect(x + 2, y + 10, 12, 1);
      // Books top row — varied widths and colors
      ctx.fillStyle = "#c85050"; // red
      ctx.fillRect(x + 2, y + 1, 2, 4);
      ctx.fillStyle = "#5a8a58"; // green
      ctx.fillRect(x + 4, y + 2, 2, 3);
      ctx.fillStyle = "#5070a0"; // blue
      ctx.fillRect(x + 6, y + 1, 3, 4);
      ctx.fillStyle = "#b89840"; // brown
      ctx.fillRect(x + 9, y + 2, 2, 3);
      ctx.fillStyle = "#d06060"; // warm red
      ctx.fillRect(x + 11, y + 1, 2, 4);
      // Book spine highlights (top row)
      ctx.fillStyle = "#e07070";
      ctx.fillRect(x + 2, y + 1, 1, 1);
      ctx.fillStyle = "#7aaa78";
      ctx.fillRect(x + 4, y + 2, 1, 1);
      // Books middle row
      ctx.fillStyle = "#6B5B4E"; // brown
      ctx.fillRect(x + 2, y + 6, 3, 4);
      ctx.fillStyle = "#e8c84a"; // yellow
      ctx.fillRect(x + 5, y + 6, 2, 4);
      ctx.fillStyle = "#5C6B7A"; // steel blue
      ctx.fillRect(x + 7, y + 6, 2, 4);
      ctx.fillStyle = "#d88a84"; // pink
      ctx.fillRect(x + 9, y + 7, 2, 3);
      ctx.fillStyle = "#5a8a58"; // green
      ctx.fillRect(x + 11, y + 6, 2, 4);
      // Books bottom row
      ctx.fillStyle = "#8B4513"; // dark brown
      ctx.fillRect(x + 2, y + 11, 2, 3);
      ctx.fillStyle = "#c85050"; // red
      ctx.fillRect(x + 4, y + 11, 3, 3);
      ctx.fillStyle = "#5070a0"; // blue
      ctx.fillRect(x + 7, y + 12, 2, 2);
      ctx.fillStyle = "#b89840"; // gold
      ctx.fillRect(x + 10, y + 11, 3, 3);
      // Book spine shine dots
      ctx.fillStyle = "#f0d860";
      ctx.fillRect(x + 5, y + 6, 1, 1);
      ctx.fillStyle = "#e0a0a0";
      ctx.fillRect(x + 4, y + 11, 1, 1);
      break;
    }

    case TILES.BENCH: {
      // Grass background
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Grass blades on bg
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 1, y + 2, 1, 2);
      ctx.fillRect(x + 14, y + 1, 1, 2);
      ctx.fillRect(x + 3, y + 13, 1, 2);
      ctx.fillRect(x + 12, y + 14, 1, 2);
      // Shadow under bench
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 2, y + 11, 12, 1);
      // Bench seat (stone)
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 1, y + 6, 14, 3);
      // Seat highlight
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 1, y + 6, 14, 1);
      ctx.fillRect(x + 2, y + 7, 3, 1);
      // Seat shadow
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 1, y + 8, 14, 1);
      // Seat texture
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 7, y + 7, 2, 1);
      ctx.fillRect(x + 12, y + 7, 1, 1);
      // Legs
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 2, y + 9, 2, 3);
      ctx.fillRect(x + 12, y + 9, 2, 3);
      // Leg highlight
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 2, y + 9, 1, 3);
      ctx.fillRect(x + 12, y + 9, 1, 3);
      // Leg shadow
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 3, y + 11, 1, 1);
      ctx.fillRect(x + 13, y + 11, 1, 1);
      break;
    }

    // ── Nature tiles ──────────────────────────────────
    case TILES.TREE_TOP: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Canopy dark outline (rounded shape)
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 4, y + 0, 8, 1);
      ctx.fillRect(x + 2, y + 1, 12, 1);
      ctx.fillRect(x + 1, y + 2, 14, 1);
      ctx.fillRect(x + 0, y + 3, 16, 8);
      ctx.fillRect(x + 1, y + 11, 14, 1);
      ctx.fillRect(x + 2, y + 12, 12, 1);
      ctx.fillRect(x + 4, y + 13, 8, 1);
      ctx.fillRect(x + 6, y + 14, 4, 1);
      // Main canopy fill
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x + 4, y + 1, 8, 1);
      ctx.fillRect(x + 2, y + 2, 12, 1);
      ctx.fillRect(x + 1, y + 3, 14, 8);
      ctx.fillRect(x + 2, y + 11, 12, 1);
      ctx.fillRect(x + 4, y + 12, 8, 1);
      // Inner highlight patches (top-left feel)
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 4, y + 3, 3, 2);
      ctx.fillRect(x + 3, y + 4, 2, 3);
      ctx.fillRect(x + 6, y + 2, 2, 1);
      ctx.fillRect(x + 8, y + 5, 2, 1);
      ctx.fillRect(x + 5, y + 7, 1, 1);
      ctx.fillRect(x + 10, y + 4, 1, 1);
      // Mid-tone detail (darker leaf clusters)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 9, y + 7, 3, 2);
      ctx.fillRect(x + 6, y + 9, 2, 2);
      ctx.fillRect(x + 12, y + 5, 2, 3);
      ctx.fillRect(x + 3, y + 9, 2, 2);
      ctx.fillRect(x + 7, y + 11, 3, 1);
      // Deep shadow at bottom
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 5, y + 12, 6, 1);
      ctx.fillRect(x + 11, y + 8, 2, 2);
      break;
    }

    case TILES.TREE_TRUNK: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Grass details around trunk
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 1, y + 12, 1, 2);
      ctx.fillRect(x + 13, y + 11, 1, 2);
      ctx.fillRect(x + 2, y + 14, 1, 2);
      // Trunk (4px wide centered)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 6, y + 0, 4, 12);
      // Highlight on left side
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 6, y + 0, 1, 12);
      // Shadow on right side
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 9, y + 0, 1, 12);
      // Bark texture (darker vertical lines)
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 7, y + 2, 1, 2);
      ctx.fillRect(x + 8, y + 5, 1, 3);
      ctx.fillRect(x + 7, y + 9, 1, 2);
      // Root flare at bottom (wider)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 5, y + 12, 6, 2);
      ctx.fillRect(x + 4, y + 13, 2, 2);
      ctx.fillRect(x + 10, y + 13, 2, 2);
      // Root highlight
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 5, y + 12, 1, 1);
      ctx.fillRect(x + 4, y + 13, 1, 1);
      // Root shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 10, y + 12, 1, 1);
      ctx.fillRect(x + 11, y + 13, 1, 1);
      // Shadow at base on grass
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 3, y + 15, 10, 1);
      break;
    }

    case TILES.FLOWER_RED: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Grass blades
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 0, y + 10, 1, 3);
      ctx.fillRect(x + 14, y + 8, 1, 2);
      ctx.fillRect(x + 9, y + 13, 1, 2);
      // Stems (green)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 3, y + 7, 1, 6);
      ctx.fillRect(x + 8, y + 5, 1, 8);
      ctx.fillRect(x + 12, y + 6, 1, 7);
      // Leaves on stems
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 4, y + 9, 2, 1);
      ctx.fillRect(x + 6, y + 8, 2, 1);
      ctx.fillRect(x + 13, y + 9, 2, 1);
      // Flower 1 — petals
      ctx.fillStyle = "#C4706A";
      ctx.fillRect(x + 2, y + 4, 1, 3);
      ctx.fillRect(x + 3, y + 5, 1, 1);
      ctx.fillRect(x + 4, y + 4, 1, 3);
      ctx.fillRect(x + 3, y + 4, 1, 1);
      ctx.fillRect(x + 3, y + 6, 1, 1);
      ctx.fillStyle = "#a05a54"; // darker petal shade
      ctx.fillRect(x + 2, y + 6, 1, 1);
      ctx.fillRect(x + 4, y + 6, 1, 1);
      // Center
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 3, y + 5, 1, 1);
      // Flower 2
      ctx.fillStyle = "#C4706A";
      ctx.fillRect(x + 7, y + 2, 1, 3);
      ctx.fillRect(x + 8, y + 3, 1, 1);
      ctx.fillRect(x + 9, y + 2, 1, 3);
      ctx.fillRect(x + 8, y + 2, 1, 1);
      ctx.fillRect(x + 8, y + 4, 1, 1);
      ctx.fillStyle = "#a05a54";
      ctx.fillRect(x + 7, y + 4, 1, 1);
      ctx.fillRect(x + 9, y + 4, 1, 1);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 8, y + 3, 1, 1);
      // Flower 3
      ctx.fillStyle = "#C4706A";
      ctx.fillRect(x + 11, y + 3, 1, 3);
      ctx.fillRect(x + 12, y + 4, 1, 1);
      ctx.fillRect(x + 13, y + 3, 1, 3);
      ctx.fillRect(x + 12, y + 3, 1, 1);
      ctx.fillRect(x + 12, y + 5, 1, 1);
      ctx.fillStyle = "#a05a54";
      ctx.fillRect(x + 11, y + 5, 1, 1);
      ctx.fillRect(x + 13, y + 5, 1, 1);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 12, y + 4, 1, 1);
      break;
    }

    case TILES.FLOWER_PINK: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 0, y + 11, 1, 2);
      ctx.fillRect(x + 14, y + 9, 1, 3);
      // Stems
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 4, y + 6, 1, 7);
      ctx.fillRect(x + 8, y + 7, 1, 6);
      ctx.fillRect(x + 12, y + 5, 1, 8);
      // Leaves
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 5, y + 8, 2, 1);
      ctx.fillRect(x + 6, y + 10, 2, 1);
      ctx.fillRect(x + 10, y + 8, 2, 1);
      // Flower 1
      ctx.fillStyle = "#d88a84";
      ctx.fillRect(x + 3, y + 3, 1, 3);
      ctx.fillRect(x + 4, y + 4, 1, 1);
      ctx.fillRect(x + 5, y + 3, 1, 3);
      ctx.fillRect(x + 4, y + 3, 1, 1);
      ctx.fillRect(x + 4, y + 5, 1, 1);
      ctx.fillStyle = "#b06a64";
      ctx.fillRect(x + 3, y + 5, 1, 1);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 4, y + 4, 1, 1);
      // Flower 2
      ctx.fillStyle = "#d88a84";
      ctx.fillRect(x + 7, y + 4, 1, 3);
      ctx.fillRect(x + 8, y + 5, 1, 1);
      ctx.fillRect(x + 9, y + 4, 1, 3);
      ctx.fillRect(x + 8, y + 4, 1, 1);
      ctx.fillRect(x + 8, y + 6, 1, 1);
      ctx.fillStyle = "#b06a64";
      ctx.fillRect(x + 9, y + 6, 1, 1);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 8, y + 5, 1, 1);
      // Flower 3
      ctx.fillStyle = "#d88a84";
      ctx.fillRect(x + 11, y + 2, 1, 3);
      ctx.fillRect(x + 12, y + 3, 1, 1);
      ctx.fillRect(x + 13, y + 2, 1, 3);
      ctx.fillRect(x + 12, y + 2, 1, 1);
      ctx.fillRect(x + 12, y + 4, 1, 1);
      ctx.fillStyle = "#b06a64";
      ctx.fillRect(x + 11, y + 4, 1, 1);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 12, y + 3, 1, 1);
      break;
    }

    case TILES.FLOWER_YELLOW: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 1, y + 12, 1, 2);
      ctx.fillRect(x + 10, y + 14, 1, 2);
      // Stems
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 2, y + 7, 1, 6);
      ctx.fillRect(x + 7, y + 6, 1, 7);
      ctx.fillRect(x + 13, y + 5, 1, 8);
      // Leaves
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 3, y + 9, 2, 1);
      ctx.fillRect(x + 8, y + 9, 2, 1);
      ctx.fillRect(x + 11, y + 7, 2, 1);
      // Flower 1
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 1, y + 4, 1, 3);
      ctx.fillRect(x + 2, y + 5, 1, 1);
      ctx.fillRect(x + 3, y + 4, 1, 3);
      ctx.fillRect(x + 2, y + 4, 1, 1);
      ctx.fillRect(x + 2, y + 6, 1, 1);
      ctx.fillStyle = "#c0a030";
      ctx.fillRect(x + 1, y + 6, 1, 1);
      ctx.fillStyle = "#c85050";
      ctx.fillRect(x + 2, y + 5, 1, 1);
      // Flower 2
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 6, y + 3, 1, 3);
      ctx.fillRect(x + 7, y + 4, 1, 1);
      ctx.fillRect(x + 8, y + 3, 1, 3);
      ctx.fillRect(x + 7, y + 3, 1, 1);
      ctx.fillRect(x + 7, y + 5, 1, 1);
      ctx.fillStyle = "#c0a030";
      ctx.fillRect(x + 8, y + 5, 1, 1);
      ctx.fillStyle = "#c85050";
      ctx.fillRect(x + 7, y + 4, 1, 1);
      // Flower 3
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 12, y + 2, 1, 3);
      ctx.fillRect(x + 13, y + 3, 1, 1);
      ctx.fillRect(x + 14, y + 2, 1, 3);
      ctx.fillRect(x + 13, y + 2, 1, 1);
      ctx.fillRect(x + 13, y + 4, 1, 1);
      ctx.fillStyle = "#c0a030";
      ctx.fillRect(x + 12, y + 4, 1, 1);
      ctx.fillStyle = "#c85050";
      ctx.fillRect(x + 13, y + 3, 1, 1);
      break;
    }

    case TILES.FLOWER_PURPLE: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 0, y + 13, 1, 2);
      ctx.fillRect(x + 15, y + 10, 1, 3);
      // Stems
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 3, y + 6, 1, 7);
      ctx.fillRect(x + 9, y + 5, 1, 8);
      ctx.fillRect(x + 13, y + 7, 1, 6);
      // Leaves
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 4, y + 8, 2, 1);
      ctx.fillRect(x + 7, y + 7, 2, 1);
      ctx.fillRect(x + 11, y + 10, 2, 1);
      // Flower 1
      ctx.fillStyle = "#e0a0d0";
      ctx.fillRect(x + 2, y + 3, 1, 3);
      ctx.fillRect(x + 3, y + 4, 1, 1);
      ctx.fillRect(x + 4, y + 3, 1, 3);
      ctx.fillRect(x + 3, y + 3, 1, 1);
      ctx.fillRect(x + 3, y + 5, 1, 1);
      ctx.fillStyle = "#b070a0";
      ctx.fillRect(x + 2, y + 5, 1, 1);
      ctx.fillRect(x + 4, y + 5, 1, 1);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 3, y + 4, 1, 1);
      // Flower 2
      ctx.fillStyle = "#e0a0d0";
      ctx.fillRect(x + 8, y + 2, 1, 3);
      ctx.fillRect(x + 9, y + 3, 1, 1);
      ctx.fillRect(x + 10, y + 2, 1, 3);
      ctx.fillRect(x + 9, y + 2, 1, 1);
      ctx.fillRect(x + 9, y + 4, 1, 1);
      ctx.fillStyle = "#b070a0";
      ctx.fillRect(x + 8, y + 4, 1, 1);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 9, y + 3, 1, 1);
      // Flower 3
      ctx.fillStyle = "#e0a0d0";
      ctx.fillRect(x + 12, y + 4, 1, 3);
      ctx.fillRect(x + 13, y + 5, 1, 1);
      ctx.fillRect(x + 14, y + 4, 1, 3);
      ctx.fillRect(x + 13, y + 4, 1, 1);
      ctx.fillRect(x + 13, y + 6, 1, 1);
      ctx.fillStyle = "#b070a0";
      ctx.fillRect(x + 14, y + 6, 1, 1);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 13, y + 5, 1, 1);
      break;
    }

    case TILES.BAMBOO: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Stem 1 (left)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 3, y, 2, s);
      ctx.fillStyle = PAL.grass[0]; // highlight left
      ctx.fillRect(x + 3, y, 1, s);
      ctx.fillStyle = PAL.grass[3]; // shadow right
      ctx.fillRect(x + 4, y, 1, s);
      // Stem 2 (center)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 8, y, 2, s);
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 8, y, 1, s);
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 9, y, 1, s);
      // Stem 3 (right)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 13, y, 2, s);
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 13, y, 1, s);
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 14, y, 1, s);
      // Nodes (horizontal bands) — darker
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 3, y + 4, 2, 1);
      ctx.fillRect(x + 3, y + 10, 2, 1);
      ctx.fillRect(x + 8, y + 2, 2, 1);
      ctx.fillRect(x + 8, y + 8, 2, 1);
      ctx.fillRect(x + 8, y + 14, 2, 1);
      ctx.fillRect(x + 13, y + 5, 2, 1);
      ctx.fillRect(x + 13, y + 12, 2, 1);
      // Node highlights
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 3, y + 3, 1, 1);
      ctx.fillRect(x + 8, y + 1, 1, 1);
      ctx.fillRect(x + 13, y + 4, 1, 1);
      // Small angled leaves branching off nodes
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 5, y + 3, 2, 1);
      ctx.fillRect(x + 5, y + 2, 1, 1);
      ctx.fillRect(x + 1, y + 9, 2, 1);
      ctx.fillRect(x + 2, y + 8, 1, 1);
      ctx.fillRect(x + 10, y + 1, 2, 1);
      ctx.fillRect(x + 10, y + 0, 1, 1);
      ctx.fillRect(x + 6, y + 7, 2, 1);
      ctx.fillRect(x + 7, y + 6, 1, 1);
      ctx.fillRect(x + 11, y + 11, 2, 1);
      ctx.fillRect(x + 11, y + 10, 1, 1);
      // Leaf shadows
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 6, y + 3, 1, 1);
      ctx.fillRect(x + 11, y + 1, 1, 1);
      break;
    }

    // ── Structure tiles ───────────────────────────────
    case TILES.FLAG_POLE: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Grass detail
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 1, y + 12, 1, 2);
      ctx.fillRect(x + 13, y + 11, 1, 3);
      // Pole
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 7, y + 3, 2, 13);
      // Pole highlight (left)
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 7, y + 3, 1, 13);
      // Pole shadow (right)
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 8, y + 3, 1, 13);
      // Gold finial at top
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 6, y + 2, 4, 2);
      ctx.fillRect(x + 7, y + 1, 2, 1);
      ctx.fillStyle = "#d0b040";
      ctx.fillRect(x + 7, y + 0, 2, 1);
      // Finial highlight
      ctx.fillStyle = "#f0d860";
      ctx.fillRect(x + 7, y + 1, 1, 1);
      // Red flag (wave shape — not rectangle)
      ctx.fillStyle = "#c83030";
      ctx.fillRect(x + 9, y + 3, 5, 1);
      ctx.fillRect(x + 9, y + 4, 6, 1);
      ctx.fillRect(x + 9, y + 5, 6, 1);
      ctx.fillRect(x + 9, y + 6, 5, 1);
      ctx.fillRect(x + 9, y + 7, 4, 1);
      // Flag highlight
      ctx.fillStyle = "#e84040";
      ctx.fillRect(x + 10, y + 4, 3, 1);
      ctx.fillRect(x + 10, y + 5, 2, 1);
      // Flag shadow
      ctx.fillStyle = "#a02020";
      ctx.fillRect(x + 9, y + 7, 2, 1);
      // Pole base shadow
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 6, y + 15, 4, 1);
      break;
    }

    case TILES.BASKETBALL_HOOP: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Dirt speckles
      ctx.fillStyle = PAL.dirt[2];
      ctx.fillRect(x + 2, y + 13, 1, 1);
      ctx.fillRect(x + 12, y + 14, 1, 1);
      // Metal pole
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 7, y + 7, 2, 9);
      // Pole highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 7, y + 7, 1, 9);
      // White backboard
      ctx.fillStyle = "#e8e8e8";
      ctx.fillRect(x + 3, y + 1, 10, 6);
      // Backboard border
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 3, y + 1, 10, 1); // top
      ctx.fillRect(x + 3, y + 1, 1, 6); // left
      ctx.fillRect(x + 12, y + 1, 1, 6); // right
      ctx.fillRect(x + 3, y + 6, 10, 1); // bottom
      // Red square outline on backboard
      ctx.fillStyle = "#c83030";
      ctx.fillRect(x + 6, y + 2, 4, 1);
      ctx.fillRect(x + 6, y + 2, 1, 3);
      ctx.fillRect(x + 9, y + 2, 1, 3);
      ctx.fillRect(x + 6, y + 4, 4, 1);
      // Orange rim
      ctx.fillStyle = "#e07030";
      ctx.fillRect(x + 5, y + 7, 6, 1);
      // Net suggestion (chain-like)
      ctx.fillStyle = "#d0d0d0";
      ctx.fillRect(x + 6, y + 8, 1, 2);
      ctx.fillRect(x + 8, y + 8, 1, 2);
      ctx.fillRect(x + 10, y + 8, 1, 2);
      ctx.fillRect(x + 7, y + 9, 1, 2);
      ctx.fillRect(x + 9, y + 9, 1, 2);
      // Shadow on ground
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 5, y + 15, 6, 1);
      break;
    }

    case TILES.WATER_TOWER_TOP: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Cylindrical tank — rounded top
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 4, y + 1, 8, 1);
      ctx.fillRect(x + 3, y + 2, 10, 1);
      ctx.fillRect(x + 2, y + 3, 12, 10);
      ctx.fillRect(x + 3, y + 13, 10, 1);
      ctx.fillRect(x + 4, y + 14, 8, 1);
      // Metal sheen — highlight on left
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 4, y + 2, 2, 1);
      ctx.fillRect(x + 3, y + 3, 2, 8);
      ctx.fillRect(x + 5, y + 4, 1, 4);
      // Shadow on right
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 11, y + 3, 2, 8);
      ctx.fillRect(x + 12, y + 4, 1, 6);
      // Rivet/band detail
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 3, y + 6, 10, 1);
      ctx.fillRect(x + 3, y + 10, 10, 1);
      // Band highlight above rivet
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 4, y + 5, 4, 1);
      ctx.fillRect(x + 4, y + 9, 4, 1);
      // Rim at bottom
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 3, y + 14, 10, 1);
      break;
    }

    case TILES.WATER_TOWER_BASE: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Main support column
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 6, y, 4, s);
      // Column highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 6, y, 1, s);
      // Column shadow
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 9, y, 1, s);
      // Cross beams
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 3, y + 4, 10, 1);
      ctx.fillRect(x + 2, y + 10, 12, 1);
      // Cross-brace legs (angled supports)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 4, y + 5, 1, 5);
      ctx.fillRect(x + 3, y + 7, 1, 3);
      ctx.fillRect(x + 11, y + 5, 1, 5);
      ctx.fillRect(x + 12, y + 7, 1, 3);
      // Leg flare at bottom
      ctx.fillRect(x + 2, y + 11, 2, 5);
      ctx.fillRect(x + 12, y + 11, 2, 5);
      // Leg highlights
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 2, y + 11, 1, 5);
      ctx.fillRect(x + 12, y + 11, 1, 5);
      // Shadow
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 1, y + 15, 14, 1);
      break;
    }

    case TILES.WATER_TAP: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Grass detail
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 1, y + 13, 1, 2);
      ctx.fillRect(x + 14, y + 11, 1, 3);
      // Stone base
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 4, y + 10, 8, 5);
      // Base highlight
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 4, y + 10, 8, 1);
      ctx.fillRect(x + 4, y + 10, 1, 5);
      // Base shadow
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 11, y + 10, 1, 5);
      ctx.fillRect(x + 4, y + 14, 8, 1);
      // Metal pipe
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 7, y + 2, 2, 8);
      // Pipe highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 7, y + 2, 1, 8);
      // Pipe shadow
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 8, y + 2, 1, 8);
      // Tap head / handle
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 5, y + 2, 6, 2);
      // Handle highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 5, y + 2, 6, 1);
      // Spout
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 9, y + 5, 3, 2);
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 9, y + 5, 3, 1);
      // Water drip (1-2 blue pixels)
      ctx.fillStyle = "#68a8d0";
      ctx.fillRect(x + 11, y + 7, 1, 1);
      ctx.fillStyle = "#88c8e8";
      ctx.fillRect(x + 11, y + 8, 1, 1);
      // Shadow on grass
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 3, y + 15, 10, 1);
      break;
    }

    case TILES.GATE_PILLAR: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Pillar body (stone/brick)
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 3, y + 3, 10, 13);
      // Pillar highlight (left)
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 3, y + 3, 1, 13);
      ctx.fillRect(x + 4, y + 3, 3, 1);
      // Pillar shadow (right)
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 12, y + 3, 1, 13);
      ctx.fillRect(x + 9, y + 15, 4, 1);
      // Cap on top
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 2, y + 0, 12, 3);
      // Cap highlight
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 2, y + 0, 12, 1);
      // Cap shadow
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 2, y + 2, 12, 1);
      // Mortar lines
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 3, y + 7, 10, 1);
      ctx.fillRect(x + 3, y + 11, 10, 1);
      // Mortar highlights
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 4, y + 4, 2, 1);
      ctx.fillRect(x + 4, y + 8, 2, 1);
      ctx.fillRect(x + 4, y + 12, 2, 1);
      // Ground shadow
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 2, y + 15, 12, 1);
      break;
    }

    case TILES.GATE_BAR: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Dirt detail
      ctx.fillStyle = PAL.dirt[2];
      ctx.fillRect(x + 3, y + 14, 1, 1);
      ctx.fillRect(x + 11, y + 13, 1, 1);
      // Horizontal bars (metal)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x, y + 3, s, 2);
      ctx.fillRect(x, y + 9, s, 2);
      // Bar highlights (top of each bar)
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x, y + 3, s, 1);
      ctx.fillRect(x, y + 9, s, 1);
      // Bar shadows (bottom of each bar)
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x, y + 4, s, 1);
      ctx.fillRect(x, y + 10, s, 1);
      // Vertical supports
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 3, y + 3, 1, 8);
      ctx.fillRect(x + 8, y + 3, 1, 8);
      ctx.fillRect(x + 13, y + 3, 1, 8);
      // Support highlights
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 3, y + 5, 1, 1);
      ctx.fillRect(x + 8, y + 5, 1, 1);
      ctx.fillRect(x + 13, y + 5, 1, 1);
      // Shadow on ground
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 2, y + 12, 2, 1);
      ctx.fillRect(x + 7, y + 12, 2, 1);
      ctx.fillRect(x + 12, y + 12, 2, 1);
      break;
    }

    default: {
      // Fallback: solid fill with detail speckles
      const c = config.color;
      const d = config.detail || c;
      ctx.fillStyle = c;
      ctx.fillRect(x, y, s, s);
      if (config.detail) {
        ctx.fillStyle = d;
        ctx.fillRect(x + 3, y + 3, 2, 2);
        ctx.fillRect(x + 10, y + 8, 2, 2);
        ctx.fillRect(x + 6, y + 12, 2, 2);
      }
      break;
    }
  }
}

function render() {
  if (!canvasRef.value || !props.mapData) return;
  const ctx = canvasRef.value.getContext("2d")!;
  engine = new TileMapEngine(props.mapData);

  const SCALE = 2; // 2x pixel scaling for crisp rendering
  const w = props.mapData.width * TILE_SIZE * SCALE;
  const h = props.mapData.height * TILE_SIZE * SCALE;
  canvasRef.value.width = w;
  canvasRef.value.height = h;
  ctx.scale(SCALE, SCALE);

  // Clear
  ctx.fillStyle = "#D4C08E";
  ctx.fillRect(0, 0, w, h);

  // Draw ground layer
  for (let y = 0; y < props.mapData.height; y++) {
    for (let x = 0; x < props.mapData.width; x++) {
      const tileId = engine.getGroundTile(x, y);
      drawTile(ctx, tileId, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE);
    }
  }

  // Draw objects layer
  for (let y = 0; y < props.mapData.height; y++) {
    for (let x = 0; x < props.mapData.width; x++) {
      const tileId = engine.getObjectTile(x, y);
      if (tileId === 0) continue;
      drawTile(ctx, tileId, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE);
    }
  }

  // Draw NPCs
  for (const npc of props.npcs) {
    if (npc.tileX === undefined || npc.tileY === undefined) continue;
    const spriteConfig = getSpriteConfig(npc.id);
    if (!spriteConfig) continue;
    const px = npc.tileX * TILE_SIZE; // 16px sprite fits exactly in 16px tile
    const py = npc.tileY * TILE_SIZE - 16; // sprite is taller than tile
    drawCharacter(ctx, px, py, spriteConfig, "down", npc.name, npc.mood);
  }

  // Draw player character
  const playerConfig = getPlayerSpriteConfig(props.activeCharacter);
  if (playerConfig) {
    // Player at center-ish spawn or wherever they are
    // For now, just draw at a default position
  }

  // Apply nostalgic filter (operates on actual pixel buffer)
  ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scale for pixel operations
  const imageData = ctx.getImageData(0, 0, w, h);
  applyColorGrading(imageData.data);
  ctx.putImageData(imageData, 0, 0);

  // Draw vignette
  const gradient = ctx.createRadialGradient(w / 2, h / 2, w * 0.3, w / 2, h / 2, w * 0.7);
  gradient.addColorStop(0, "transparent");
  gradient.addColorStop(1, "rgba(58, 46, 34, 0.2)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

function handleClick(e: MouseEvent) {
  if (!canvasRef.value || !engine || !props.mapData) return;
  const rect = canvasRef.value.getBoundingClientRect();
  // Convert click position to tile coordinates (accounting for CSS scaling and 2x render scale)
  const cssToCanvasX = canvasRef.value.width / rect.width;
  const cssToCanvasY = canvasRef.value.height / rect.height;
  const canvasX = (e.clientX - rect.left) * cssToCanvasX;
  const canvasY = (e.clientY - rect.top) * cssToCanvasY;
  // Divide by 2 because canvas is rendered at 2x scale
  const { tileX, tileY } = engine.pixelToTile(canvasX / 2, canvasY / 2);

  // Check NPC click
  for (const npc of props.npcs) {
    if (npc.tileX === tileX && npc.tileY === tileY) {
      emit("clickNpc", npc.id);
      return;
    }
  }

  // Check exit click
  const exit = engine.getExitAt(tileX, tileY);
  if (exit) {
    emit("clickExit", exit.targetMapId);
    return;
  }

  emit("clickTile", tileX, tileY);
}

onMounted(() => {
  render();
});

watch(
  () => [props.mapData, props.npcs, props.currentScene],
  () => {
    render();
  },
  { deep: true },
);
</script>

<template>
  <canvas ref="canvasRef" class="game-canvas" @click="handleClick" />
</template>

<style scoped>
.game-canvas {
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  cursor: pointer;
  max-width: 100%;
  max-height: 100%;
}
</style>
