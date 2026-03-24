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
import { getSeasonalPalette } from "../tilemap/season-palette";
import type { SeasonalPalette } from "../tilemap/season-palette";

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
  season?: string;
}>();

const emit = defineEmits<{
  clickTile: [tileX: number, tileY: number];
  clickNpc: [npcId: string];
  clickExit: [targetMapId: string];
  clickObject: [tileName: string];
}>();

const canvasRef = ref<HTMLCanvasElement>();
let engine: TileMapEngine | null = null;

function drawTile(
  ctx: CanvasRenderingContext2D,
  tileId: number,
  x: number,
  y: number,
  s: number,
  seasonPal: SeasonalPalette,
) {
  const config = getTileConfig(tileId);
  if (!config || config.color === "transparent") return;

  // Convert SeasonalPalette material objects to array format [light, base, dark, shadow]
  const toArr = (m: { light: string; base: string; dark: string; shadow: string }) => [
    m.light,
    m.base,
    m.dark,
    m.shadow,
  ];
  const PAL = {
    grass: toArr(seasonPal.grass),
    dirt: toArr(seasonPal.dirt),
    brick: toArr(seasonPal.brick),
    wood: toArr(seasonPal.wood),
    floor: toArr(seasonPal.floor),
    stone: toArr(seasonPal.stone),
    metal: toArr(seasonPal.metal),
  };

  switch (tileId) {
    // ── Ground tiles ──────────────────────────────────
    case TILES.DIRT: {
      // Base fill
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Dark speckles scattered across tile (12 dots)
      ctx.fillStyle = PAL.dirt[2];
      ctx.fillRect(x + 4, y + 6, 2, 2);
      ctx.fillRect(x + 18, y + 2, 2, 2);
      ctx.fillRect(x + 26, y + 10, 2, 2);
      ctx.fillRect(x + 10, y + 18, 2, 2);
      ctx.fillRect(x + 2, y + 24, 2, 2);
      ctx.fillRect(x + 22, y + 22, 2, 2);
      ctx.fillRect(x + 14, y + 4, 1, 1);
      ctx.fillRect(x + 8, y + 14, 1, 1);
      ctx.fillRect(x + 28, y + 16, 1, 1);
      ctx.fillRect(x + 6, y + 28, 1, 1);
      ctx.fillRect(x + 20, y + 12, 1, 1);
      ctx.fillRect(x + 30, y + 26, 1, 1);
      // Highlight spots (lighter areas)
      ctx.fillStyle = PAL.dirt[0];
      ctx.fillRect(x + 14, y + 4, 2, 2);
      ctx.fillRect(x + 6, y + 14, 2, 2);
      ctx.fillRect(x + 24, y + 8, 2, 1);
      ctx.fillRect(x + 12, y + 26, 3, 1);
      // Bottom edge darkening (2px shadow)
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x, y + 28, s, 2);
      ctx.fillRect(x + 6, y + 26, 4, 2);
      ctx.fillRect(x + 20, y + 26, 6, 2);
      // Extra deep speckles
      ctx.fillRect(x + 12, y + 28, 2, 2);
      ctx.fillRect(x + 28, y + 20, 2, 2);
      ctx.fillRect(x + 3, y + 20, 1, 1);
      ctx.fillRect(x + 16, y + 22, 1, 1);
      break;
    }

    case TILES.GRASS: {
      // Base fill
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Dark grass blades — 1-2px wide, 3-4px tall (16 blades)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 2, y + 4, 1, 4);
      ctx.fillRect(x + 8, y + 0, 1, 3);
      ctx.fillRect(x + 12, y + 8, 1, 4);
      ctx.fillRect(x + 18, y + 2, 1, 3);
      ctx.fillRect(x + 24, y + 6, 1, 4);
      ctx.fillRect(x + 28, y + 0, 1, 3);
      ctx.fillRect(x + 6, y + 18, 1, 4);
      ctx.fillRect(x + 14, y + 20, 1, 3);
      ctx.fillRect(x + 20, y + 16, 1, 4);
      ctx.fillRect(x + 26, y + 22, 1, 3);
      ctx.fillRect(x + 4, y + 26, 1, 3);
      ctx.fillRect(x + 10, y + 12, 1, 4);
      ctx.fillRect(x + 16, y + 6, 2, 3);
      ctx.fillRect(x + 22, y + 14, 1, 3);
      ctx.fillRect(x + 30, y + 10, 1, 4);
      ctx.fillRect(x + 1, y + 14, 1, 3);
      // Highlight patches (6 patches)
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 4, y + 12, 2, 1);
      ctx.fillRect(x + 16, y + 6, 2, 1);
      ctx.fillRect(x + 10, y + 24, 2, 1);
      ctx.fillRect(x + 22, y + 14, 2, 1);
      ctx.fillRect(x + 28, y + 4, 1, 1);
      ctx.fillRect(x + 7, y + 2, 1, 1);
      // Shadow dots (3 dots)
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 0, y + 28, 2, 2);
      ctx.fillRect(x + 30, y + 26, 2, 2);
      ctx.fillRect(x + 15, y + 30, 2, 1);
      break;
    }

    case TILES.FLOOR_CLASSROOM: {
      // Base fill
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // Tile grid lines at edges and center (16px tile pattern)
      ctx.fillStyle = PAL.floor[2];
      ctx.fillRect(x, y, 1, s); // left edge
      ctx.fillRect(x, y, s, 1); // top edge
      ctx.fillRect(x + 31, y, 1, s); // right edge
      ctx.fillRect(x, y + 31, s, 1); // bottom edge
      ctx.fillRect(x + 16, y, 1, s); // center vertical
      ctx.fillRect(x, y + 16, s, 1); // center horizontal
      // Subtle diagonal grain in each quadrant
      ctx.fillRect(x + 4, y + 4, 3, 1);
      ctx.fillRect(x + 8, y + 8, 3, 1);
      ctx.fillRect(x + 20, y + 4, 3, 1);
      ctx.fillRect(x + 24, y + 8, 3, 1);
      ctx.fillRect(x + 4, y + 20, 3, 1);
      ctx.fillRect(x + 8, y + 24, 3, 1);
      ctx.fillRect(x + 20, y + 20, 3, 1);
      ctx.fillRect(x + 24, y + 24, 3, 1);
      ctx.fillRect(x + 12, y + 12, 2, 1);
      ctx.fillRect(x + 10, y + 26, 2, 1);
      // Highlight center areas
      ctx.fillStyle = PAL.floor[0];
      ctx.fillRect(x + 6, y + 6, 2, 1);
      ctx.fillRect(x + 22, y + 6, 2, 1);
      ctx.fillRect(x + 12, y + 10, 1, 1);
      ctx.fillRect(x + 20, y + 16, 1, 1);
      // Shadow corners (2x2)
      ctx.fillStyle = PAL.floor[3];
      ctx.fillRect(x, y + 30, 2, 2);
      ctx.fillRect(x + 30, y + 30, 2, 2);
      ctx.fillRect(x + 16, y + 16, 1, 1);
      break;
    }

    case TILES.FLOOR_OFFICE: {
      // Base fill
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // 3px border grid
      ctx.fillStyle = PAL.floor[2];
      ctx.fillRect(x, y, 3, s); // left border
      ctx.fillRect(x, y, s, 3); // top border
      ctx.fillRect(x + 29, y, 3, s); // right border
      ctx.fillRect(x, y + 29, s, 3); // bottom border
      // Inner highlight
      ctx.fillStyle = PAL.floor[0];
      ctx.fillRect(x + 6, y + 6, 2, 2);
      ctx.fillRect(x + 16, y + 10, 2, 2);
      ctx.fillRect(x + 10, y + 20, 2, 1);
      ctx.fillRect(x + 22, y + 14, 2, 1);
      // Subtle wood grain inside
      ctx.fillStyle = PAL.floor[2];
      ctx.fillRect(x + 8, y + 14, 6, 1);
      ctx.fillRect(x + 18, y + 20, 4, 1);
      ctx.fillRect(x + 12, y + 8, 3, 1);
      ctx.fillRect(x + 6, y + 24, 5, 1);
      // Dark corner accents (3x3)
      ctx.fillStyle = PAL.floor[3];
      ctx.fillRect(x, y, 3, 3);
      ctx.fillRect(x + 29, y, 3, 3);
      ctx.fillRect(x, y + 29, 3, 3);
      ctx.fillRect(x + 29, y + 29, 3, 3);
      break;
    }

    case TILES.ROAD: {
      // Base fill
      ctx.fillStyle = PAL.dirt[2];
      ctx.fillRect(x, y, s, s);
      // Edge darkening (3px each side)
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x, y, 3, s); // left edge
      ctx.fillRect(x + 29, y, 3, s); // right edge
      // Center dashed line (2px wide)
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x + 15, y + 2, 2, 8);
      ctx.fillRect(x + 15, y + 18, 2, 8);
      // Pebble clusters (5 clusters)
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 8, y + 6, 2, 1);
      ctx.fillRect(x + 9, y + 7, 1, 1);
      ctx.fillRect(x + 20, y + 16, 2, 1);
      ctx.fillRect(x + 21, y + 17, 1, 1);
      ctx.fillRect(x + 10, y + 26, 2, 2);
      ctx.fillRect(x + 24, y + 8, 1, 1);
      ctx.fillRect(x + 6, y + 20, 2, 1);
      // Highlight spots
      ctx.fillStyle = PAL.dirt[0];
      ctx.fillRect(x + 6, y + 14, 2, 1);
      ctx.fillRect(x + 24, y + 10, 2, 1);
      ctx.fillRect(x + 12, y + 22, 1, 1);
      break;
    }

    // ── Wall tiles ────────────────────────────────────
    case TILES.WALL_BRICK: {
      // Base fill
      ctx.fillStyle = PAL.brick[1];
      ctx.fillRect(x, y, s, s);
      // Mortar lines (2px gap) in highlight color
      ctx.fillStyle = PAL.brick[0];
      // Horizontal mortar — 5 rows of bricks, each ~6px tall
      ctx.fillRect(x, y + 6, s, 2);
      ctx.fillRect(x, y + 14, s, 2);
      ctx.fillRect(x, y + 22, s, 2);
      ctx.fillRect(x, y + 30, s, 2);
      // Vertical mortar — offset pattern
      ctx.fillRect(x + 14, y, 2, 6); // row 1
      ctx.fillRect(x + 6, y + 8, 2, 6); // row 2
      ctx.fillRect(x + 22, y + 8, 2, 6); // row 2
      ctx.fillRect(x + 14, y + 16, 2, 6); // row 3
      ctx.fillRect(x + 6, y + 24, 2, 6); // row 4
      ctx.fillRect(x + 22, y + 24, 2, 6); // row 4
      // Per-brick highlight (top-left 2px strip)
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x + 2, y + 1, 4, 1);
      ctx.fillRect(x + 18, y + 1, 4, 1);
      ctx.fillRect(x + 8, y + 9, 4, 1);
      ctx.fillRect(x + 2, y + 17, 4, 1);
      ctx.fillRect(x + 18, y + 17, 4, 1);
      ctx.fillRect(x + 8, y + 25, 4, 1);
      // Per-brick shadow (bottom-right 2px strip)
      ctx.fillStyle = PAL.brick[2];
      ctx.fillRect(x + 10, y + 4, 3, 2);
      ctx.fillRect(x + 26, y + 4, 3, 2);
      ctx.fillRect(x + 4, y + 12, 2, 2);
      ctx.fillRect(x + 18, y + 12, 3, 2);
      ctx.fillRect(x + 10, y + 20, 3, 2);
      ctx.fillRect(x + 26, y + 20, 3, 2);
      ctx.fillRect(x + 4, y + 28, 2, 2);
      ctx.fillRect(x + 18, y + 28, 3, 2);
      // Bottom edge shadow line (2px)
      ctx.fillStyle = PAL.brick[3];
      ctx.fillRect(x, y + 30, s, 2);
      break;
    }

    case TILES.WALL_TOP: {
      // Bottom 20px: brick section
      ctx.fillStyle = PAL.brick[1];
      ctx.fillRect(x, y + 12, s, 20);
      // Brick mortar lines
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x, y + 20, s, 2);
      ctx.fillRect(x + 14, y + 12, 2, 8);
      ctx.fillRect(x + 6, y + 22, 2, 10);
      ctx.fillRect(x + 22, y + 22, 2, 10);
      // Brick highlight
      ctx.fillRect(x + 2, y + 14, 4, 1);
      ctx.fillRect(x + 18, y + 14, 4, 1);
      ctx.fillRect(x + 8, y + 22, 4, 1);
      // Brick shadow
      ctx.fillStyle = PAL.brick[2];
      ctx.fillRect(x + 10, y + 18, 3, 2);
      ctx.fillRect(x + 26, y + 18, 3, 2);
      ctx.fillRect(x + 18, y + 28, 3, 2);
      // Top 12px: roof edge
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(x, y, s, 12);
      // Highlight line at very top
      ctx.fillStyle = "#a06828";
      ctx.fillRect(x, y, s, 2);
      ctx.fillRect(x + 2, y + 2, 6, 2);
      ctx.fillRect(x + 16, y + 2, 6, 2);
      // Dark line at bottom of roof section
      ctx.fillStyle = "#6a3010";
      ctx.fillRect(x, y + 10, s, 2);
      // Shingle texture on roof portion
      ctx.fillStyle = "#a06828";
      ctx.fillRect(x + 6, y + 4, 4, 2);
      ctx.fillRect(x + 20, y + 6, 4, 2);
      ctx.fillRect(x + 12, y + 5, 3, 1);
      ctx.fillRect(x + 26, y + 4, 3, 1);
      break;
    }

    case TILES.ROOF: {
      // Base fill
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(x, y, s, s);
      // Shingle pattern — overlapping rows (6px tall each)
      // Row 1 (y 0-5)
      ctx.fillStyle = "#a06828";
      ctx.fillRect(x + 2, y, 10, 2);
      ctx.fillRect(x + 18, y, 10, 2);
      ctx.fillRect(x + 0, y + 2, 6, 2);
      ctx.fillRect(x + 16, y + 2, 6, 2);
      // Row 2 (y 8-13)
      ctx.fillRect(x + 8, y + 8, 10, 2);
      ctx.fillRect(x + 24, y + 8, 6, 2);
      ctx.fillRect(x + 6, y + 10, 6, 2);
      ctx.fillRect(x + 22, y + 10, 6, 2);
      // Row 3 (y 16-21)
      ctx.fillRect(x + 2, y + 16, 10, 2);
      ctx.fillRect(x + 18, y + 16, 10, 2);
      ctx.fillRect(x + 0, y + 18, 6, 2);
      ctx.fillRect(x + 16, y + 18, 6, 2);
      // Row 4 (y 24-29)
      ctx.fillRect(x + 8, y + 24, 10, 2);
      ctx.fillRect(x + 24, y + 24, 6, 2);
      ctx.fillRect(x + 6, y + 26, 6, 2);
      ctx.fillRect(x + 22, y + 26, 6, 2);
      // Dark shadow lines between shingle rows (2px)
      ctx.fillStyle = "#6a3010";
      ctx.fillRect(x, y + 6, s, 2);
      ctx.fillRect(x, y + 14, s, 2);
      ctx.fillRect(x, y + 22, s, 2);
      ctx.fillRect(x, y + 30, s, 2);
      // Extra deep shadow spots
      ctx.fillRect(x + 12, y + 6, 4, 2);
      ctx.fillRect(x + 4, y + 14, 4, 2);
      ctx.fillRect(x + 28, y + 22, 4, 2);
      // Snow on roof (winter)
      if (seasonPal.showSnow) {
        ctx.fillStyle = "#e8e8e8";
        ctx.fillRect(x + 2, y, 28, 2);
        ctx.fillRect(x + 0, y + 2, 32, 2);
        ctx.fillRect(x + 4, y + 4, 24, 2);
        ctx.fillStyle = "#d0d0d0";
        ctx.fillRect(x + 8, y + 4, 6, 2);
        ctx.fillRect(x + 20, y + 4, 6, 2);
        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(x + 6, y + 1, 4, 1);
        ctx.fillRect(x + 22, y + 1, 4, 1);
      }
      break;
    }

    // ── Object tiles ──────────────────────────────────
    case TILES.DESK: {
      // Floor underneath
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // Desk top surface (24x8)
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 4, y + 8, 24, 8);
      // Top edge highlight (2px)
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 4, y + 8, 24, 2);
      ctx.fillRect(x + 6, y + 10, 4, 1);
      // Wood grain on desk top
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 10, y + 12, 6, 1);
      ctx.fillRect(x + 20, y + 10, 4, 1);
      ctx.fillRect(x + 8, y + 14, 3, 1);
      ctx.fillRect(x + 18, y + 13, 5, 1);
      // Bottom edge shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 4, y + 15, 24, 1);
      // Drawer outline on front face
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 10, y + 16, 12, 4);
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 10, y + 16, 12, 1);
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 10, y + 19, 12, 1);
      // Drawer handle
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 14, y + 17, 4, 1);
      // Two legs (4x10 each)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 6, y + 16, 4, 10);
      ctx.fillRect(x + 22, y + 16, 4, 10);
      // Leg highlights
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 6, y + 16, 2, 10);
      ctx.fillRect(x + 22, y + 16, 2, 10);
      // Leg shadows
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 9, y + 24, 1, 2);
      ctx.fillRect(x + 25, y + 24, 1, 2);
      // Shadow on floor beneath desk
      ctx.fillStyle = PAL.floor[3];
      ctx.fillRect(x + 8, y + 26, 16, 2);
      break;
    }

    case TILES.BLACKBOARD: {
      // Wall background
      ctx.fillStyle = PAL.brick[1];
      ctx.fillRect(x, y, s, s);
      // Wooden frame (outer) — 24x18 board with 2px frame
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 3, y + 2, 26, 22);
      // Frame highlight top-left (2px)
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 3, y + 2, 26, 2);
      ctx.fillRect(x + 3, y + 2, 2, 22);
      // Frame shadow bottom-right (2px)
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 3, y + 22, 26, 2);
      ctx.fillRect(x + 27, y + 2, 2, 22);
      // Board surface (dark green-black)
      ctx.fillStyle = "#2a3a2e";
      ctx.fillRect(x + 5, y + 4, 22, 16);
      // Slightly lighter board center
      ctx.fillStyle = "#344438";
      ctx.fillRect(x + 7, y + 6, 18, 12);
      // Chalk marks (5 lines of varying lengths)
      ctx.fillStyle = "#d0d0c8";
      ctx.fillRect(x + 8, y + 8, 8, 1);
      ctx.fillRect(x + 18, y + 8, 4, 1);
      ctx.fillStyle = "#c0c0b8";
      ctx.fillRect(x + 7, y + 12, 10, 1);
      ctx.fillRect(x + 10, y + 16, 6, 1);
      ctx.fillStyle = "#d8d8d0";
      ctx.fillRect(x + 20, y + 11, 3, 1);
      // Chalk tray (2px tall)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 6, y + 20, 20, 2);
      // Chalk tray highlight
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 6, y + 20, 20, 1);
      // Chalk pieces on tray (3 pieces)
      ctx.fillStyle = "#e8e8e0";
      ctx.fillRect(x + 10, y + 20, 3, 2);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 16, y + 20, 2, 2);
      ctx.fillStyle = "#c85050";
      ctx.fillRect(x + 20, y + 20, 2, 2);
      // Wall mortar hint at edges
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x, y + 14, 2, 1);
      ctx.fillRect(x + 30, y + 8, 2, 1);
      ctx.fillRect(x + 1, y + 26, 1, 1);
      break;
    }

    case TILES.WINDOW: {
      // Wall background
      ctx.fillStyle = PAL.brick[1];
      ctx.fillRect(x, y, s, s);
      // Brick mortar hints
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x, y + 8, 3, 1);
      ctx.fillRect(x + 29, y + 24, 3, 1);
      ctx.fillRect(x + 1, y + 28, 2, 1);
      // Window frame (wood) — 24x24
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 4, y + 4, 24, 24);
      // Frame highlight (2px)
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 4, y + 4, 24, 2);
      ctx.fillRect(x + 4, y + 4, 2, 24);
      // Frame shadow (2px)
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 4, y + 26, 24, 2);
      ctx.fillRect(x + 26, y + 4, 2, 24);
      // Glass — top lighter (sky gradient, 4 panes)
      ctx.fillStyle = "#a8d0e8";
      ctx.fillRect(x + 6, y + 6, 20, 9);
      ctx.fillStyle = "#90c0d8";
      ctx.fillRect(x + 6, y + 17, 20, 9);
      // Cross frame (2px dividers)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 15, y + 6, 2, 20); // vertical
      ctx.fillRect(x + 6, y + 15, 20, 2); // horizontal
      // White reflection in top-left pane (4x4 lighter)
      ctx.fillStyle = "#d8eef8";
      ctx.fillRect(x + 8, y + 8, 4, 2);
      ctx.fillRect(x + 8, y + 10, 2, 2);
      // Slight blue reflection bottom-right
      ctx.fillStyle = "#b8d8e8";
      ctx.fillRect(x + 22, y + 22, 2, 2);
      // Curtain hints at sides
      ctx.fillStyle = "#d8c8b0";
      ctx.fillRect(x + 6, y + 6, 1, 20);
      ctx.fillRect(x + 25, y + 6, 1, 20);
      ctx.fillStyle = "#c8b8a0";
      ctx.fillRect(x + 7, y + 7, 1, 6);
      ctx.fillRect(x + 24, y + 7, 1, 6);
      break;
    }

    case TILES.DOOR: {
      // Wall background
      ctx.fillStyle = PAL.brick[1];
      ctx.fillRect(x, y, s, s);
      // Door frame (darker wood) — 20x28 door
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 5, y + 2, 22, 28);
      // Door surface
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 7, y + 4, 18, 24);
      // Top panel (slightly lighter) with recessed effect
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 9, y + 6, 14, 8);
      // Top panel inner highlight
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 9, y + 6, 14, 2);
      ctx.fillRect(x + 9, y + 6, 2, 8);
      // Top panel shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 9, y + 12, 14, 2);
      ctx.fillRect(x + 21, y + 6, 2, 8);
      // Bottom panel with recessed effect
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 9, y + 18, 14, 8);
      // Bottom panel highlight
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 9, y + 18, 14, 2);
      ctx.fillRect(x + 9, y + 18, 2, 8);
      // Bottom panel shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 9, y + 24, 14, 2);
      ctx.fillRect(x + 21, y + 18, 2, 8);
      // Handle (circle-ish, 3px)
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 20, y + 16, 3, 3);
      ctx.fillStyle = "#d0b040";
      ctx.fillRect(x + 21, y + 17, 2, 2);
      ctx.fillStyle = "#f0d860";
      ctx.fillRect(x + 20, y + 16, 1, 1);
      // Right side shadow on frame (2px)
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 25, y + 4, 2, 24);
      // Brick hints at top corners
      ctx.fillStyle = PAL.brick[0];
      ctx.fillRect(x, y + 8, 4, 1);
      ctx.fillRect(x + 28, y + 14, 4, 1);
      ctx.fillRect(x + 1, y + 20, 3, 1);
      break;
    }

    case TILES.STOVE: {
      // Floor background
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // Stovepipe going up (6px wide)
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 12, y + 0, 8, 8);
      // Pipe highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 12, y + 0, 2, 8);
      // Pipe shadow
      ctx.fillStyle = PAL.metal[3];
      ctx.fillRect(x + 18, y + 0, 2, 8);
      // Stove body (iron) — 24x20
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 4, y + 8, 24, 20);
      // Body highlight (left side)
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 4, y + 8, 2, 20);
      ctx.fillRect(x + 6, y + 8, 6, 2);
      // Body shadow (right side)
      ctx.fillStyle = PAL.metal[3];
      ctx.fillRect(x + 26, y + 8, 2, 20);
      ctx.fillRect(x + 20, y + 26, 8, 2);
      // Glowing embers on top
      ctx.fillStyle = "#c83020";
      ctx.fillRect(x + 8, y + 8, 16, 4);
      ctx.fillStyle = "#e86030";
      ctx.fillRect(x + 10, y + 8, 4, 2);
      ctx.fillRect(x + 18, y + 8, 4, 2);
      ctx.fillStyle = "#e8a040";
      ctx.fillRect(x + 12, y + 8, 2, 2);
      ctx.fillRect(x + 20, y + 8, 2, 2);
      ctx.fillStyle = "#f0c060";
      ctx.fillRect(x + 14, y + 9, 2, 1);
      // Stove door (12x8)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 10, y + 16, 12, 8);
      // Door frame
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 10, y + 16, 12, 2);
      ctx.fillRect(x + 10, y + 16, 2, 8);
      ctx.fillStyle = PAL.metal[3];
      ctx.fillRect(x + 20, y + 16, 2, 8);
      ctx.fillRect(x + 10, y + 22, 12, 2);
      // Door handle
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 14, y + 19, 4, 2);
      // Ash detail at base
      ctx.fillStyle = "#8a8880";
      ctx.fillRect(x + 6, y + 28, 8, 2);
      ctx.fillRect(x + 18, y + 28, 6, 2);
      break;
    }

    case TILES.BOOKSHELF: {
      // Floor background
      ctx.fillStyle = PAL.floor[1];
      ctx.fillRect(x, y, s, s);
      // Shelf frame (wood) — 28x30
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 2, y + 0, 28, 30);
      // Frame highlight
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 2, y + 0, 28, 2);
      ctx.fillRect(x + 2, y + 0, 2, 30);
      // Frame shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 28, y + 0, 2, 30);
      ctx.fillRect(x + 2, y + 28, 28, 2);
      // Shelf dividers (2px thick)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 4, y + 10, 24, 2);
      ctx.fillRect(x + 4, y + 20, 24, 2);
      // Books top row — varied widths and colors
      ctx.fillStyle = "#c85050"; // red
      ctx.fillRect(x + 4, y + 2, 4, 8);
      ctx.fillStyle = "#5a8a58"; // green
      ctx.fillRect(x + 8, y + 3, 4, 7);
      ctx.fillStyle = "#5070a0"; // blue
      ctx.fillRect(x + 12, y + 2, 5, 8);
      ctx.fillStyle = "#b89840"; // brown
      ctx.fillRect(x + 17, y + 3, 4, 7);
      ctx.fillStyle = "#d06060"; // warm red
      ctx.fillRect(x + 21, y + 2, 4, 8);
      ctx.fillStyle = "#6B5B4E"; // dark brown
      ctx.fillRect(x + 25, y + 4, 3, 6);
      // Book spine highlights (top row)
      ctx.fillStyle = "#e07070";
      ctx.fillRect(x + 4, y + 2, 2, 2);
      ctx.fillStyle = "#7aaa78";
      ctx.fillRect(x + 8, y + 3, 2, 2);
      ctx.fillStyle = "#6888b8";
      ctx.fillRect(x + 12, y + 2, 2, 2);
      // Books middle row
      ctx.fillStyle = "#6B5B4E"; // brown
      ctx.fillRect(x + 4, y + 12, 5, 8);
      ctx.fillStyle = "#e8c84a"; // yellow
      ctx.fillRect(x + 9, y + 12, 4, 8);
      ctx.fillStyle = "#5C6B7A"; // steel blue
      ctx.fillRect(x + 13, y + 12, 4, 8);
      ctx.fillStyle = "#d88a84"; // pink
      ctx.fillRect(x + 17, y + 13, 4, 7);
      ctx.fillStyle = "#5a8a58"; // green
      ctx.fillRect(x + 21, y + 12, 4, 8);
      ctx.fillStyle = "#8B4513"; // dark
      ctx.fillRect(x + 25, y + 14, 3, 6);
      // Book spine shine dots (middle row)
      ctx.fillStyle = "#f0d860";
      ctx.fillRect(x + 10, y + 12, 2, 2);
      ctx.fillStyle = "#e0a0a0";
      ctx.fillRect(x + 18, y + 13, 2, 2);
      // Books bottom row
      ctx.fillStyle = "#8B4513"; // dark brown
      ctx.fillRect(x + 4, y + 22, 4, 6);
      ctx.fillStyle = "#c85050"; // red
      ctx.fillRect(x + 8, y + 22, 5, 6);
      ctx.fillStyle = "#5070a0"; // blue
      ctx.fillRect(x + 13, y + 23, 4, 5);
      ctx.fillStyle = "#b89840"; // gold
      ctx.fillRect(x + 18, y + 22, 5, 6);
      ctx.fillStyle = "#d06060"; // warm red
      ctx.fillRect(x + 23, y + 24, 4, 4);
      // Leaning book
      ctx.fillStyle = "#5C6B7A";
      ctx.fillRect(x + 27, y + 22, 1, 6);
      ctx.fillRect(x + 26, y + 24, 1, 4);
      break;
    }

    case TILES.BENCH: {
      // No background fill — ground layer already provides the correct surface
      // Shadow under bench (uses a semi-transparent overlay)
      ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
      ctx.fillRect(x + 4, y + 22, 24, 2);
      // Bench seat (stone) — 28x6
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 2, y + 12, 28, 6);
      // Seat highlight (2px)
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 2, y + 12, 28, 2);
      ctx.fillRect(x + 4, y + 14, 6, 1);
      // Seat shadow
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 2, y + 16, 28, 2);
      // Seat texture
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 14, y + 14, 4, 1);
      ctx.fillRect(x + 24, y + 14, 2, 1);
      ctx.fillRect(x + 8, y + 15, 3, 1);
      // Legs (4x6)
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 4, y + 18, 4, 6);
      ctx.fillRect(x + 24, y + 18, 4, 6);
      // Leg highlight
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 4, y + 18, 2, 6);
      ctx.fillRect(x + 24, y + 18, 2, 6);
      // Leg shadow
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 7, y + 22, 1, 2);
      ctx.fillRect(x + 27, y + 22, 1, 2);
      break;
    }

    // ── Nature tiles ──────────────────────────────────
    case TILES.TREE_TOP: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);

      if (seasonPal.showBareTree) {
        // Bare tree: draw branches instead of foliage
        const treeLeaf = toArr(seasonPal.treeLeaf);
        // Main branches extending from center
        ctx.fillStyle = treeLeaf[2];
        // Central trunk top (4px wide)
        ctx.fillRect(x + 14, y + 20, 4, 12);
        // Left branch
        ctx.fillRect(x + 8, y + 8, 2, 14);
        ctx.fillRect(x + 10, y + 12, 2, 10);
        ctx.fillRect(x + 6, y + 6, 2, 6);
        ctx.fillRect(x + 4, y + 4, 2, 4);
        // Right branch
        ctx.fillRect(x + 22, y + 8, 2, 14);
        ctx.fillRect(x + 20, y + 12, 2, 10);
        ctx.fillRect(x + 24, y + 6, 2, 6);
        ctx.fillRect(x + 26, y + 4, 2, 4);
        // Upper small twigs
        ctx.fillStyle = treeLeaf[3];
        ctx.fillRect(x + 12, y + 14, 2, 8);
        ctx.fillRect(x + 18, y + 14, 2, 8);
        ctx.fillRect(x + 6, y + 2, 2, 4);
        ctx.fillRect(x + 24, y + 2, 2, 4);
        ctx.fillRect(x + 3, y + 2, 1, 2);
        ctx.fillRect(x + 28, y + 2, 1, 2);
        // Highlight on left branches
        ctx.fillStyle = treeLeaf[1];
        ctx.fillRect(x + 8, y + 8, 1, 2);
        ctx.fillRect(x + 22, y + 8, 1, 2);
        ctx.fillRect(x + 4, y + 4, 1, 2);
      } else {
        // Use treeLeaf palette for canopy colors
        const treeLeaf = toArr(seasonPal.treeLeaf);
        // Canopy dark outline (rounded shape ~26px diameter)
        ctx.fillStyle = treeLeaf[3];
        ctx.fillRect(x + 8, y + 0, 16, 2);
        ctx.fillRect(x + 4, y + 2, 24, 2);
        ctx.fillRect(x + 2, y + 4, 28, 2);
        ctx.fillRect(x + 0, y + 6, 32, 16);
        ctx.fillRect(x + 2, y + 22, 28, 2);
        ctx.fillRect(x + 4, y + 24, 24, 2);
        ctx.fillRect(x + 8, y + 26, 16, 2);
        ctx.fillRect(x + 12, y + 28, 8, 2);
        // Main canopy fill
        ctx.fillStyle = treeLeaf[1];
        ctx.fillRect(x + 8, y + 2, 16, 2);
        ctx.fillRect(x + 4, y + 4, 24, 2);
        ctx.fillRect(x + 2, y + 6, 28, 16);
        ctx.fillRect(x + 4, y + 22, 24, 2);
        ctx.fillRect(x + 8, y + 24, 16, 2);
        // Inner highlight patches (top-left feel) — 8+ bumps
        ctx.fillStyle = treeLeaf[0];
        ctx.fillRect(x + 8, y + 6, 6, 4);
        ctx.fillRect(x + 6, y + 8, 4, 6);
        ctx.fillRect(x + 12, y + 4, 4, 2);
        ctx.fillRect(x + 16, y + 10, 4, 2);
        ctx.fillRect(x + 10, y + 14, 2, 2);
        ctx.fillRect(x + 20, y + 8, 2, 2);
        ctx.fillRect(x + 5, y + 12, 2, 2);
        ctx.fillRect(x + 14, y + 7, 3, 1);
        // Mid-tone detail (darker leaf clusters)
        ctx.fillStyle = treeLeaf[2];
        ctx.fillRect(x + 18, y + 14, 6, 4);
        ctx.fillRect(x + 12, y + 18, 4, 4);
        ctx.fillRect(x + 24, y + 10, 4, 6);
        ctx.fillRect(x + 6, y + 18, 4, 4);
        ctx.fillRect(x + 14, y + 22, 6, 2);
        ctx.fillRect(x + 22, y + 18, 3, 3);
        ctx.fillRect(x + 3, y + 14, 3, 3);
        // Deep shadow at bottom
        ctx.fillStyle = treeLeaf[3];
        ctx.fillRect(x + 10, y + 24, 12, 2);
        ctx.fillRect(x + 22, y + 16, 4, 4);
        ctx.fillRect(x + 4, y + 20, 3, 2);
      }
      break;
    }

    case TILES.TREE_TRUNK: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Grass details around trunk (tufts at base)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 2, y + 24, 2, 3);
      ctx.fillRect(x + 26, y + 22, 2, 3);
      ctx.fillRect(x + 4, y + 28, 2, 3);
      ctx.fillRect(x + 28, y + 26, 1, 2);
      ctx.fillRect(x + 8, y + 28, 1, 2);
      // Trunk (8px wide centered)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 12, y + 0, 8, 24);
      // Highlight on left side (2px)
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 12, y + 0, 2, 24);
      // Shadow on right side (2px)
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 18, y + 0, 2, 24);
      // Bark texture (3-4 dark vertical scratches)
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 14, y + 4, 1, 4);
      ctx.fillRect(x + 16, y + 10, 1, 6);
      ctx.fillRect(x + 14, y + 18, 1, 4);
      ctx.fillRect(x + 15, y + 7, 1, 3);
      // Bark highlight detail
      ctx.fillStyle = PAL.wood[0];
      ctx.fillRect(x + 13, y + 6, 1, 2);
      ctx.fillRect(x + 13, y + 14, 1, 2);
      // Root flare at bottom (12px wide)
      ctx.fillStyle = PAL.wood[2];
      ctx.fillRect(x + 10, y + 24, 12, 4);
      ctx.fillRect(x + 8, y + 26, 4, 4);
      ctx.fillRect(x + 20, y + 26, 4, 4);
      // Root highlight
      ctx.fillStyle = PAL.wood[1];
      ctx.fillRect(x + 10, y + 24, 2, 2);
      ctx.fillRect(x + 8, y + 26, 2, 2);
      // Root shadow
      ctx.fillStyle = PAL.wood[3];
      ctx.fillRect(x + 20, y + 24, 2, 2);
      ctx.fillRect(x + 22, y + 26, 2, 2);
      // Shadow at base on grass
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 6, y + 30, 20, 2);
      break;
    }

    case TILES.FLOWER_RED: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Grass blades
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 0, y + 20, 1, 4);
      ctx.fillRect(x + 28, y + 16, 1, 3);
      ctx.fillRect(x + 18, y + 26, 1, 3);
      ctx.fillRect(x + 30, y + 24, 1, 3);
      // Stems (green, 2px tall)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 6, y + 14, 2, 12);
      ctx.fillRect(x + 16, y + 10, 2, 16);
      ctx.fillRect(x + 24, y + 12, 2, 14);
      if (seasonPal.flowerState === "bare") {
        // Just stems, no flowers
      } else if (seasonPal.flowerState === "bud") {
        // Small buds at stem tops
        ctx.fillStyle = "#C4706A";
        ctx.fillRect(x + 6, y + 12, 2, 2);
        ctx.fillRect(x + 16, y + 8, 2, 2);
        ctx.fillRect(x + 24, y + 10, 2, 2);
      } else if (seasonPal.flowerState === "wilt") {
        // Drooping flowers — shifted down, muted color
        ctx.fillStyle = "#a07060";
        ctx.fillRect(x + 6, y + 12, 4, 2);
        ctx.fillRect(x + 8, y + 14, 2, 2);
        ctx.fillRect(x + 16, y + 8, 4, 2);
        ctx.fillRect(x + 18, y + 10, 2, 2);
        ctx.fillRect(x + 24, y + 10, 4, 2);
        ctx.fillRect(x + 26, y + 12, 2, 2);
      } else {
        // bloom (default)
        // Leaves on stems
        ctx.fillStyle = PAL.grass[0];
        ctx.fillRect(x + 8, y + 18, 4, 2);
        ctx.fillRect(x + 12, y + 16, 4, 2);
        ctx.fillRect(x + 26, y + 18, 4, 2);
        // Flower 1 — petals (cross shape with 3-4 petals)
        ctx.fillStyle = "#C4706A";
        ctx.fillRect(x + 4, y + 8, 2, 6); // left petal
        ctx.fillRect(x + 6, y + 10, 2, 2); // center
        ctx.fillRect(x + 8, y + 8, 2, 6); // right petal
        ctx.fillRect(x + 6, y + 8, 2, 2); // top petal
        ctx.fillRect(x + 6, y + 12, 2, 2); // bottom petal
        ctx.fillStyle = "#a05a54";
        ctx.fillRect(x + 4, y + 12, 2, 2);
        ctx.fillRect(x + 8, y + 12, 2, 2);
        ctx.fillStyle = "#e8c84a"; // center
        ctx.fillRect(x + 6, y + 10, 2, 2);
        // Flower 2
        ctx.fillStyle = "#C4706A";
        ctx.fillRect(x + 14, y + 4, 2, 6);
        ctx.fillRect(x + 16, y + 6, 2, 2);
        ctx.fillRect(x + 18, y + 4, 2, 6);
        ctx.fillRect(x + 16, y + 4, 2, 2);
        ctx.fillRect(x + 16, y + 8, 2, 2);
        ctx.fillStyle = "#a05a54";
        ctx.fillRect(x + 14, y + 8, 2, 2);
        ctx.fillRect(x + 18, y + 8, 2, 2);
        ctx.fillStyle = "#e8c84a";
        ctx.fillRect(x + 16, y + 6, 2, 2);
        // Flower 3
        ctx.fillStyle = "#C4706A";
        ctx.fillRect(x + 22, y + 6, 2, 6);
        ctx.fillRect(x + 24, y + 8, 2, 2);
        ctx.fillRect(x + 26, y + 6, 2, 6);
        ctx.fillRect(x + 24, y + 6, 2, 2);
        ctx.fillRect(x + 24, y + 10, 2, 2);
        ctx.fillStyle = "#a05a54";
        ctx.fillRect(x + 22, y + 10, 2, 2);
        ctx.fillRect(x + 26, y + 10, 2, 2);
        ctx.fillStyle = "#e8c84a";
        ctx.fillRect(x + 24, y + 8, 2, 2);
      }
      break;
    }

    case TILES.FLOWER_PINK: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 0, y + 22, 1, 3);
      ctx.fillRect(x + 28, y + 18, 1, 4);
      // Stems
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 8, y + 12, 2, 14);
      ctx.fillRect(x + 16, y + 14, 2, 12);
      ctx.fillRect(x + 24, y + 10, 2, 16);
      if (seasonPal.flowerState === "bare") {
        // Just stems
        break;
      }
      if (seasonPal.flowerState === "bud") {
        ctx.fillStyle = "#d88a84";
        ctx.fillRect(x + 8, y + 10, 2, 2);
        ctx.fillRect(x + 16, y + 12, 2, 2);
        ctx.fillRect(x + 24, y + 8, 2, 2);
        break;
      }
      if (seasonPal.flowerState === "wilt") {
        ctx.fillStyle = "#a07060";
        ctx.fillRect(x + 8, y + 10, 4, 2);
        ctx.fillRect(x + 10, y + 12, 2, 2);
        ctx.fillRect(x + 16, y + 12, 4, 2);
        ctx.fillRect(x + 18, y + 14, 2, 2);
        ctx.fillRect(x + 24, y + 8, 4, 2);
        ctx.fillRect(x + 26, y + 10, 2, 2);
        break;
      }
      // bloom (default)
      // Leaves
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 10, y + 16, 4, 2);
      ctx.fillRect(x + 12, y + 20, 4, 2);
      ctx.fillRect(x + 20, y + 16, 4, 2);
      // Flower 1
      ctx.fillStyle = "#d88a84";
      ctx.fillRect(x + 6, y + 6, 2, 6);
      ctx.fillRect(x + 8, y + 8, 2, 2);
      ctx.fillRect(x + 10, y + 6, 2, 6);
      ctx.fillRect(x + 8, y + 6, 2, 2);
      ctx.fillRect(x + 8, y + 10, 2, 2);
      ctx.fillStyle = "#b06a64";
      ctx.fillRect(x + 6, y + 10, 2, 2);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 8, y + 8, 2, 2);
      // Flower 2
      ctx.fillStyle = "#d88a84";
      ctx.fillRect(x + 14, y + 8, 2, 6);
      ctx.fillRect(x + 16, y + 10, 2, 2);
      ctx.fillRect(x + 18, y + 8, 2, 6);
      ctx.fillRect(x + 16, y + 8, 2, 2);
      ctx.fillRect(x + 16, y + 12, 2, 2);
      ctx.fillStyle = "#b06a64";
      ctx.fillRect(x + 18, y + 12, 2, 2);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 16, y + 10, 2, 2);
      // Flower 3
      ctx.fillStyle = "#d88a84";
      ctx.fillRect(x + 22, y + 4, 2, 6);
      ctx.fillRect(x + 24, y + 6, 2, 2);
      ctx.fillRect(x + 26, y + 4, 2, 6);
      ctx.fillRect(x + 24, y + 4, 2, 2);
      ctx.fillRect(x + 24, y + 8, 2, 2);
      ctx.fillStyle = "#b06a64";
      ctx.fillRect(x + 22, y + 8, 2, 2);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 24, y + 6, 2, 2);
      break;
    }

    case TILES.FLOWER_YELLOW: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 2, y + 24, 1, 3);
      ctx.fillRect(x + 20, y + 28, 1, 3);
      // Stems
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 4, y + 14, 2, 12);
      ctx.fillRect(x + 14, y + 12, 2, 14);
      ctx.fillRect(x + 26, y + 10, 2, 16);
      if (seasonPal.flowerState === "bare") {
        break;
      }
      if (seasonPal.flowerState === "bud") {
        ctx.fillStyle = "#e8c84a";
        ctx.fillRect(x + 4, y + 12, 2, 2);
        ctx.fillRect(x + 14, y + 10, 2, 2);
        ctx.fillRect(x + 26, y + 8, 2, 2);
        break;
      }
      if (seasonPal.flowerState === "wilt") {
        ctx.fillStyle = "#b0a040";
        ctx.fillRect(x + 4, y + 12, 4, 2);
        ctx.fillRect(x + 6, y + 14, 2, 2);
        ctx.fillRect(x + 14, y + 10, 4, 2);
        ctx.fillRect(x + 16, y + 12, 2, 2);
        ctx.fillRect(x + 26, y + 8, 4, 2);
        ctx.fillRect(x + 28, y + 10, 2, 2);
        break;
      }
      // bloom (default)
      // Leaves
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 6, y + 18, 4, 2);
      ctx.fillRect(x + 16, y + 18, 4, 2);
      ctx.fillRect(x + 22, y + 14, 4, 2);
      // Flower 1
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 2, y + 8, 2, 6);
      ctx.fillRect(x + 4, y + 10, 2, 2);
      ctx.fillRect(x + 6, y + 8, 2, 6);
      ctx.fillRect(x + 4, y + 8, 2, 2);
      ctx.fillRect(x + 4, y + 12, 2, 2);
      ctx.fillStyle = "#c0a030";
      ctx.fillRect(x + 2, y + 12, 2, 2);
      ctx.fillStyle = "#c85050";
      ctx.fillRect(x + 4, y + 10, 2, 2);
      // Flower 2
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 12, y + 6, 2, 6);
      ctx.fillRect(x + 14, y + 8, 2, 2);
      ctx.fillRect(x + 16, y + 6, 2, 6);
      ctx.fillRect(x + 14, y + 6, 2, 2);
      ctx.fillRect(x + 14, y + 10, 2, 2);
      ctx.fillStyle = "#c0a030";
      ctx.fillRect(x + 16, y + 10, 2, 2);
      ctx.fillStyle = "#c85050";
      ctx.fillRect(x + 14, y + 8, 2, 2);
      // Flower 3
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 24, y + 4, 2, 6);
      ctx.fillRect(x + 26, y + 6, 2, 2);
      ctx.fillRect(x + 28, y + 4, 2, 6);
      ctx.fillRect(x + 26, y + 4, 2, 2);
      ctx.fillRect(x + 26, y + 8, 2, 2);
      ctx.fillStyle = "#c0a030";
      ctx.fillRect(x + 24, y + 8, 2, 2);
      ctx.fillStyle = "#c85050";
      ctx.fillRect(x + 26, y + 6, 2, 2);
      break;
    }

    case TILES.FLOWER_PURPLE: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 0, y + 26, 1, 3);
      ctx.fillRect(x + 30, y + 20, 1, 4);
      // Stems
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 6, y + 12, 2, 14);
      ctx.fillRect(x + 18, y + 10, 2, 16);
      ctx.fillRect(x + 26, y + 14, 2, 12);
      if (seasonPal.flowerState === "bare") {
        break;
      }
      if (seasonPal.flowerState === "bud") {
        ctx.fillStyle = "#e0a0d0";
        ctx.fillRect(x + 6, y + 10, 2, 2);
        ctx.fillRect(x + 18, y + 8, 2, 2);
        ctx.fillRect(x + 26, y + 12, 2, 2);
        break;
      }
      if (seasonPal.flowerState === "wilt") {
        ctx.fillStyle = "#a07890";
        ctx.fillRect(x + 6, y + 10, 4, 2);
        ctx.fillRect(x + 8, y + 12, 2, 2);
        ctx.fillRect(x + 18, y + 8, 4, 2);
        ctx.fillRect(x + 20, y + 10, 2, 2);
        ctx.fillRect(x + 26, y + 12, 4, 2);
        ctx.fillRect(x + 28, y + 14, 2, 2);
        break;
      }
      // bloom (default)
      // Leaves
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 8, y + 16, 4, 2);
      ctx.fillRect(x + 14, y + 14, 4, 2);
      ctx.fillRect(x + 22, y + 20, 4, 2);
      // Flower 1
      ctx.fillStyle = "#e0a0d0";
      ctx.fillRect(x + 4, y + 6, 2, 6);
      ctx.fillRect(x + 6, y + 8, 2, 2);
      ctx.fillRect(x + 8, y + 6, 2, 6);
      ctx.fillRect(x + 6, y + 6, 2, 2);
      ctx.fillRect(x + 6, y + 10, 2, 2);
      ctx.fillStyle = "#b070a0";
      ctx.fillRect(x + 4, y + 10, 2, 2);
      ctx.fillRect(x + 8, y + 10, 2, 2);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 6, y + 8, 2, 2);
      // Flower 2
      ctx.fillStyle = "#e0a0d0";
      ctx.fillRect(x + 16, y + 4, 2, 6);
      ctx.fillRect(x + 18, y + 6, 2, 2);
      ctx.fillRect(x + 20, y + 4, 2, 6);
      ctx.fillRect(x + 18, y + 4, 2, 2);
      ctx.fillRect(x + 18, y + 8, 2, 2);
      ctx.fillStyle = "#b070a0";
      ctx.fillRect(x + 16, y + 8, 2, 2);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 18, y + 6, 2, 2);
      // Flower 3
      ctx.fillStyle = "#e0a0d0";
      ctx.fillRect(x + 24, y + 8, 2, 6);
      ctx.fillRect(x + 26, y + 10, 2, 2);
      ctx.fillRect(x + 28, y + 8, 2, 6);
      ctx.fillRect(x + 26, y + 8, 2, 2);
      ctx.fillRect(x + 26, y + 12, 2, 2);
      ctx.fillStyle = "#b070a0";
      ctx.fillRect(x + 28, y + 12, 2, 2);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 26, y + 10, 2, 2);
      break;
    }

    case TILES.BAMBOO: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Stem 1 (left, 4px wide)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 4, y, 4, s);
      ctx.fillStyle = PAL.grass[0]; // highlight left
      ctx.fillRect(x + 4, y, 2, s);
      ctx.fillStyle = PAL.grass[3]; // shadow right
      ctx.fillRect(x + 6, y, 2, s);
      // Stem 2 (center, 4px wide)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 14, y, 4, s);
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 14, y, 2, s);
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 16, y, 2, s);
      // Stem 3 (right, 4px wide)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 24, y, 4, s);
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 24, y, 2, s);
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 26, y, 2, s);
      // Nodes (horizontal bands, 2px) — every 8px
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 4, y + 8, 4, 2);
      ctx.fillRect(x + 4, y + 20, 4, 2);
      ctx.fillRect(x + 14, y + 4, 4, 2);
      ctx.fillRect(x + 14, y + 16, 4, 2);
      ctx.fillRect(x + 14, y + 28, 4, 2);
      ctx.fillRect(x + 24, y + 10, 4, 2);
      ctx.fillRect(x + 24, y + 24, 4, 2);
      // Node highlights
      ctx.fillStyle = PAL.grass[0];
      ctx.fillRect(x + 4, y + 6, 2, 2);
      ctx.fillRect(x + 14, y + 2, 2, 2);
      ctx.fillRect(x + 24, y + 8, 2, 2);
      // Leaves branching off nodes at 45° angles (4-6 leaves)
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 8, y + 6, 4, 2);
      ctx.fillRect(x + 10, y + 4, 2, 2);
      ctx.fillRect(x + 0, y + 18, 4, 2);
      ctx.fillRect(x + 2, y + 16, 2, 2);
      ctx.fillRect(x + 18, y + 2, 4, 2);
      ctx.fillRect(x + 20, y + 0, 2, 2);
      ctx.fillRect(x + 10, y + 14, 4, 2);
      ctx.fillRect(x + 12, y + 12, 2, 2);
      ctx.fillRect(x + 20, y + 22, 4, 2);
      ctx.fillRect(x + 22, y + 20, 2, 2);
      ctx.fillRect(x + 28, y + 8, 3, 2);
      ctx.fillRect(x + 29, y + 6, 2, 2);
      // Leaf shadows
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 11, y + 6, 2, 2);
      ctx.fillRect(x + 21, y + 2, 2, 2);
      ctx.fillRect(x + 30, y + 8, 1, 2);
      break;
    }

    // ── Structure tiles ───────────────────────────────
    case TILES.FLAG_POLE: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Grass detail
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 2, y + 24, 1, 3);
      ctx.fillRect(x + 26, y + 22, 1, 4);
      ctx.fillRect(x + 8, y + 28, 1, 2);
      // Pole (3px wide)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 14, y + 6, 3, 26);
      // Pole highlight (left edge)
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 14, y + 6, 1, 26);
      // Pole shadow (right)
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 16, y + 6, 1, 26);
      // Gold finial at top (6px)
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 12, y + 4, 7, 3);
      ctx.fillRect(x + 13, y + 2, 5, 2);
      ctx.fillStyle = "#d0b040";
      ctx.fillRect(x + 14, y + 0, 3, 2);
      // Finial highlight
      ctx.fillStyle = "#f0d860";
      ctx.fillRect(x + 14, y + 2, 2, 2);
      ctx.fillRect(x + 13, y + 4, 1, 1);
      // Red flag (wave shape — 12x8)
      ctx.fillStyle = "#c83030";
      ctx.fillRect(x + 17, y + 6, 10, 2);
      ctx.fillRect(x + 17, y + 8, 12, 2);
      ctx.fillRect(x + 17, y + 10, 12, 2);
      ctx.fillRect(x + 17, y + 12, 10, 2);
      ctx.fillRect(x + 17, y + 14, 8, 2);
      // Flag highlight
      ctx.fillStyle = "#e84040";
      ctx.fillRect(x + 19, y + 8, 6, 2);
      ctx.fillRect(x + 19, y + 10, 4, 2);
      // Flag shadow
      ctx.fillStyle = "#a02020";
      ctx.fillRect(x + 17, y + 14, 4, 2);
      // Pole base shadow
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 12, y + 30, 8, 2);
      break;
    }

    case TILES.BASKETBALL_HOOP: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Dirt speckles
      ctx.fillStyle = PAL.dirt[2];
      ctx.fillRect(x + 4, y + 26, 2, 2);
      ctx.fillRect(x + 24, y + 28, 2, 2);
      ctx.fillRect(x + 14, y + 30, 1, 1);
      // Metal pole (3px wide)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 14, y + 14, 3, 18);
      // Pole highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 14, y + 14, 1, 18);
      // White backboard (20x12)
      ctx.fillStyle = "#e8e8e8";
      ctx.fillRect(x + 6, y + 2, 20, 12);
      // Backboard border (2px)
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 6, y + 2, 20, 2); // top
      ctx.fillRect(x + 6, y + 2, 2, 12); // left
      ctx.fillRect(x + 24, y + 2, 2, 12); // right
      ctx.fillRect(x + 6, y + 12, 20, 2); // bottom
      // Red square outline on backboard
      ctx.fillStyle = "#c83030";
      ctx.fillRect(x + 12, y + 4, 8, 2);
      ctx.fillRect(x + 12, y + 4, 2, 6);
      ctx.fillRect(x + 18, y + 4, 2, 6);
      ctx.fillRect(x + 12, y + 8, 8, 2);
      // Orange rim (12px wide)
      ctx.fillStyle = "#e07030";
      ctx.fillRect(x + 10, y + 14, 12, 2);
      // Net suggestion (chain-like)
      ctx.fillStyle = "#d0d0d0";
      ctx.fillRect(x + 12, y + 16, 1, 4);
      ctx.fillRect(x + 16, y + 16, 1, 4);
      ctx.fillRect(x + 20, y + 16, 1, 4);
      ctx.fillRect(x + 14, y + 18, 1, 4);
      ctx.fillRect(x + 18, y + 18, 1, 4);
      ctx.fillRect(x + 13, y + 20, 1, 2);
      ctx.fillRect(x + 15, y + 21, 1, 2);
      ctx.fillRect(x + 17, y + 20, 1, 2);
      ctx.fillRect(x + 19, y + 21, 1, 2);
      // Shadow on ground
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 10, y + 30, 12, 2);
      break;
    }

    case TILES.WATER_TOWER_TOP: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Cylindrical tank — rounded top (~20px wide)
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 8, y + 2, 16, 2);
      ctx.fillRect(x + 6, y + 4, 20, 2);
      ctx.fillRect(x + 4, y + 6, 24, 20);
      ctx.fillRect(x + 6, y + 26, 20, 2);
      ctx.fillRect(x + 8, y + 28, 16, 2);
      // Metal sheen — highlight on left
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 8, y + 4, 4, 2);
      ctx.fillRect(x + 6, y + 6, 4, 16);
      ctx.fillRect(x + 10, y + 8, 2, 8);
      // Shadow on right
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 22, y + 6, 4, 16);
      ctx.fillRect(x + 24, y + 8, 2, 12);
      // Rivet/band detail
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 6, y + 12, 20, 2);
      ctx.fillRect(x + 6, y + 20, 20, 2);
      // Rivet dots
      ctx.fillRect(x + 8, y + 12, 2, 2);
      ctx.fillRect(x + 16, y + 12, 2, 2);
      ctx.fillRect(x + 24, y + 12, 2, 2);
      ctx.fillRect(x + 12, y + 20, 2, 2);
      ctx.fillRect(x + 20, y + 20, 2, 2);
      // Band highlight above rivet
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 8, y + 10, 8, 2);
      ctx.fillRect(x + 8, y + 18, 8, 2);
      // Rim at bottom
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 6, y + 28, 20, 2);
      break;
    }

    case TILES.WATER_TOWER_BASE: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Main support column (8px wide)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 12, y, 8, s);
      // Column highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 12, y, 2, s);
      // Column shadow
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 18, y, 2, s);
      // Cross beams
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 6, y + 8, 20, 2);
      ctx.fillRect(x + 4, y + 20, 24, 2);
      // Cross-brace legs (angled supports)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 8, y + 10, 2, 10);
      ctx.fillRect(x + 6, y + 14, 2, 6);
      ctx.fillRect(x + 22, y + 10, 2, 10);
      ctx.fillRect(x + 24, y + 14, 2, 6);
      // Leg flare at bottom
      ctx.fillRect(x + 4, y + 22, 4, 10);
      ctx.fillRect(x + 24, y + 22, 4, 10);
      // Leg highlights
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 4, y + 22, 2, 10);
      ctx.fillRect(x + 24, y + 22, 2, 10);
      // Shadow
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 2, y + 30, 28, 2);
      break;
    }

    case TILES.WATER_TAP: {
      // Grass bg
      ctx.fillStyle = PAL.grass[1];
      ctx.fillRect(x, y, s, s);
      // Grass detail
      ctx.fillStyle = PAL.grass[2];
      ctx.fillRect(x + 2, y + 26, 1, 3);
      ctx.fillRect(x + 28, y + 22, 1, 4);
      // Stone base (16x10)
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 8, y + 20, 16, 10);
      // Base highlight
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 8, y + 20, 16, 2);
      ctx.fillRect(x + 8, y + 20, 2, 10);
      // Base shadow
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 22, y + 20, 2, 10);
      ctx.fillRect(x + 8, y + 28, 16, 2);
      // Metal pipe (4px wide)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 14, y + 4, 4, 16);
      // Pipe highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 14, y + 4, 2, 16);
      // Pipe shadow
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 16, y + 4, 2, 16);
      // Tap head / handle (12x4)
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 10, y + 4, 12, 4);
      // Handle highlight
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 10, y + 4, 12, 2);
      // Spout (6x4)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 18, y + 10, 6, 4);
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 18, y + 10, 6, 2);
      // Water drip (2-3 blue pixels)
      ctx.fillStyle = "#68a8d0";
      ctx.fillRect(x + 22, y + 14, 2, 2);
      ctx.fillStyle = "#88c8e8";
      ctx.fillRect(x + 22, y + 16, 2, 2);
      ctx.fillStyle = "#a0d8f0";
      ctx.fillRect(x + 23, y + 18, 1, 1);
      // Shadow on grass
      ctx.fillStyle = PAL.grass[3];
      ctx.fillRect(x + 6, y + 30, 20, 2);
      break;
    }

    case TILES.GATE_PILLAR: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Pillar body (stone/brick) — 20x26
      ctx.fillStyle = PAL.stone[1];
      ctx.fillRect(x + 6, y + 6, 20, 26);
      // Pillar highlight (left, 2px)
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 6, y + 6, 2, 26);
      ctx.fillRect(x + 8, y + 6, 6, 2);
      // Pillar shadow (right, 2px)
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 24, y + 6, 2, 26);
      ctx.fillRect(x + 18, y + 30, 8, 2);
      // Cap on top (24x6)
      ctx.fillStyle = PAL.stone[2];
      ctx.fillRect(x + 4, y + 0, 24, 6);
      // Cap highlight
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 4, y + 0, 24, 2);
      // Cap shadow
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 4, y + 4, 24, 2);
      // Mortar lines (between stone blocks)
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 6, y + 14, 20, 2);
      ctx.fillRect(x + 6, y + 22, 20, 2);
      // Mortar highlights
      ctx.fillStyle = PAL.stone[0];
      ctx.fillRect(x + 8, y + 8, 4, 2);
      ctx.fillRect(x + 8, y + 16, 4, 2);
      ctx.fillRect(x + 8, y + 24, 4, 2);
      // Vertical mortar
      ctx.fillStyle = PAL.stone[3];
      ctx.fillRect(x + 16, y + 6, 2, 8);
      ctx.fillRect(x + 12, y + 16, 2, 6);
      ctx.fillRect(x + 20, y + 24, 2, 8);
      // Ground shadow
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 4, y + 30, 24, 2);
      break;
    }

    case TILES.GATE_BAR: {
      // Dirt bg
      ctx.fillStyle = PAL.dirt[1];
      ctx.fillRect(x, y, s, s);
      // Dirt detail
      ctx.fillStyle = PAL.dirt[2];
      ctx.fillRect(x + 6, y + 28, 2, 2);
      ctx.fillRect(x + 22, y + 26, 2, 2);
      // Horizontal bars (metal, 4px tall each)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x, y + 6, s, 4);
      ctx.fillRect(x, y + 18, s, 4);
      // Bar highlights (top of each bar, 2px)
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x, y + 6, s, 2);
      ctx.fillRect(x, y + 18, s, 2);
      // Bar shadows (bottom of each bar, 2px)
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x, y + 8, s, 2);
      ctx.fillRect(x, y + 20, s, 2);
      // Vertical supports (2px wide)
      ctx.fillStyle = PAL.metal[1];
      ctx.fillRect(x + 6, y + 6, 2, 16);
      ctx.fillRect(x + 16, y + 6, 2, 16);
      ctx.fillRect(x + 26, y + 6, 2, 16);
      // Support highlights
      ctx.fillStyle = PAL.metal[0];
      ctx.fillRect(x + 6, y + 10, 1, 2);
      ctx.fillRect(x + 16, y + 10, 1, 2);
      ctx.fillRect(x + 26, y + 10, 1, 2);
      // Arrow/finial tips on vertical bars
      ctx.fillStyle = PAL.metal[2];
      ctx.fillRect(x + 6, y + 4, 2, 2);
      ctx.fillRect(x + 16, y + 4, 2, 2);
      ctx.fillRect(x + 26, y + 4, 2, 2);
      // Shadow on ground
      ctx.fillStyle = PAL.dirt[3];
      ctx.fillRect(x + 4, y + 24, 4, 2);
      ctx.fillRect(x + 14, y + 24, 4, 2);
      ctx.fillRect(x + 24, y + 24, 4, 2);
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
        ctx.fillRect(x + 6, y + 6, 4, 4);
        ctx.fillRect(x + 20, y + 16, 4, 4);
        ctx.fillRect(x + 12, y + 24, 4, 4);
      }
      break;
    }
  }
}

function render() {
  if (!canvasRef.value || !props.mapData) return;
  const ctx = canvasRef.value.getContext("2d")!;
  engine = new TileMapEngine(props.mapData);

  const seasonPal = getSeasonalPalette(props.season || "summer");

  const w = props.mapData.width * TILE_SIZE;
  const h = props.mapData.height * TILE_SIZE;
  canvasRef.value.width = w;
  canvasRef.value.height = h;

  // Clear
  ctx.fillStyle = "#D4C08E";
  ctx.fillRect(0, 0, w, h);

  // Draw ground layer
  for (let y = 0; y < props.mapData.height; y++) {
    for (let x = 0; x < props.mapData.width; x++) {
      const tileId = engine.getGroundTile(x, y);
      drawTile(ctx, tileId, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, seasonPal);
    }
  }

  // Draw objects layer
  for (let y = 0; y < props.mapData.height; y++) {
    for (let x = 0; x < props.mapData.width; x++) {
      const tileId = engine.getObjectTile(x, y);
      if (tileId === 0) continue;
      drawTile(ctx, tileId, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, seasonPal);
    }
  }

  // Draw NPCs
  for (const npc of props.npcs) {
    if (npc.tileX === undefined || npc.tileY === undefined) continue;
    const spriteConfig = getSpriteConfig(npc.id);
    if (!spriteConfig) continue;
    const px = npc.tileX * TILE_SIZE; // 32px sprite fits exactly in 32px tile
    const py = npc.tileY * TILE_SIZE - TILE_SIZE; // sprite is 2 tiles tall
    // Draw interaction hint under NPC
    ctx.fillStyle = "rgba(196, 112, 106, 0.15)";
    ctx.beginPath();
    ctx.ellipse(px + 16, py + 60, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    drawCharacter(ctx, px, py, spriteConfig, "down", npc.name, npc.mood);
  }

  // Draw exit labels
  if (props.mapData) {
    for (const exit of props.mapData.exits) {
      const ex = exit.tileX * TILE_SIZE;
      const ey = exit.tileY * TILE_SIZE;
      const destNames: Record<string, string> = {
        classroom: "教室",
        office: "办公室",
        playground: "操场",
        "flower-pool": "花池",
        "water-tower": "水塔",
        "village-road": "村路",
        farmland: "农田",
        "villager-house": "村民家",
        "town-road": "镇上",
        "post-office": "邮局",
        market: "集市",
        clinic: "卫生所",
        "home-zhang": "张家",
        "home-wang": "王家",
        "home-li": "李家",
        "home-zhao": "赵家",
        "home-zhu": "朱家",
      };
      const label = destNames[exit.targetMapId] || exit.targetMapId;
      ctx.fillStyle = "rgba(245, 230, 200, 0.7)";
      ctx.font = '10px "Noto Serif SC", serif';
      ctx.textAlign = "center";
      ctx.fillText("→" + label, ex + TILE_SIZE / 2, ey - 4);
    }
  }

  // Draw player character
  const playerConfig = getPlayerSpriteConfig(props.activeCharacter);
  if (playerConfig) {
    // Player at center-ish spawn or wherever they are
    // For now, just draw at a default position
  }

  // Apply nostalgic filter (operates on actual pixel buffer)
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
  const { tileX, tileY } = engine.pixelToTile(canvasX, canvasY);

  // Check NPC click (sprites are 2 tiles tall, check both tile and tile above)
  for (const npc of props.npcs) {
    if (npc.tileX === tileX && (npc.tileY === tileY || npc.tileY === tileY + 1)) {
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

  // Check object click
  const objectTileId = engine.getObjectTile(tileX, tileY);
  if (objectTileId !== 0) {
    const config = getTileConfig(objectTileId);
    if (config) {
      emit("clickObject", config.name);
      return;
    }
  }

  emit("clickTile", tileX, tileY);
}

function handleMouseMove(e: MouseEvent) {
  if (!canvasRef.value || !engine || !props.mapData) return;
  const rect = canvasRef.value.getBoundingClientRect();
  const cssToCanvasX = canvasRef.value.width / rect.width;
  const cssToCanvasY = canvasRef.value.height / rect.height;
  const canvasX = (e.clientX - rect.left) * cssToCanvasX;
  const canvasY = (e.clientY - rect.top) * cssToCanvasY;
  const { tileX, tileY } = engine.pixelToTile(canvasX, canvasY);

  // Check what's under the cursor
  for (const npc of props.npcs) {
    if (npc.tileX === tileX && (npc.tileY === tileY || npc.tileY === tileY + 1)) {
      canvasRef.value.style.cursor = "pointer";
      return;
    }
  }
  if (engine.getExitAt(tileX, tileY)) {
    canvasRef.value.style.cursor = "pointer";
    return;
  }
  const objId = engine.getObjectTile(tileX, tileY);
  if (objId !== 0) {
    canvasRef.value.style.cursor = "pointer";
    return;
  }
  canvasRef.value.style.cursor = "default";
}

onMounted(() => {
  render();
});

watch(
  () => [props.currentScene, props.season, props.mapData],
  () => {
    render();
  },
);

// Separate lighter watch for NPC count changes (less frequent)
watch(
  () => props.npcs.length,
  () => {
    render();
  },
);
</script>

<template>
  <canvas
    ref="canvasRef"
    class="game-canvas"
    role="img"
    aria-label="游戏场景"
    @click="handleClick"
    @mousemove="handleMouseMove"
  />
</template>

<style scoped>
.game-canvas {
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
