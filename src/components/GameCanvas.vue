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

  const c = config.color;
  const d = config.detail || c;

  switch (tileId) {
    // ── Ground tiles ──────────────────────────────────
    case TILES.DIRT: {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, s, s);
      // speckles
      ctx.fillStyle = "#c0a870";
      ctx.fillRect(x + 3, y + 2, 1, 1);
      ctx.fillRect(x + 9, y + 5, 1, 1);
      ctx.fillRect(x + 1, y + 10, 1, 1);
      ctx.fillRect(x + 12, y + 12, 1, 1);
      ctx.fillRect(x + 6, y + 14, 1, 1);
      ctx.fillRect(x + 14, y + 3, 1, 1);
      ctx.fillStyle = "#e0d0a0";
      ctx.fillRect(x + 7, y + 1, 1, 1);
      ctx.fillRect(x + 11, y + 9, 1, 1);
      break;
    }

    case TILES.GRASS: {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, s, s);
      // grass blade marks (darker vertical lines)
      ctx.fillStyle = "#5a7a58";
      ctx.fillRect(x + 2, y + 3, 1, 3);
      ctx.fillRect(x + 5, y + 1, 1, 3);
      ctx.fillRect(x + 8, y + 5, 1, 2);
      ctx.fillRect(x + 11, y + 2, 1, 3);
      ctx.fillRect(x + 14, y + 6, 1, 2);
      ctx.fillRect(x + 3, y + 10, 1, 3);
      ctx.fillRect(x + 7, y + 11, 1, 2);
      ctx.fillRect(x + 12, y + 10, 1, 3);
      // lighter highlights
      ctx.fillStyle = "#8aac86";
      ctx.fillRect(x + 4, y + 7, 1, 1);
      ctx.fillRect(x + 10, y + 0, 1, 1);
      ctx.fillRect(x + 0, y + 13, 1, 1);
      break;
    }

    case TILES.FLOOR_CLASSROOM: {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, s, s);
      // tile grid lines
      ctx.fillStyle = "#e0d4b0";
      ctx.fillRect(x + 7, y, 1, s); // vertical line
      ctx.fillRect(x, y + 7, s, 1); // horizontal line
      ctx.fillRect(x + 15, y, 1, s);
      ctx.fillRect(x, y + 15, s, 1);
      break;
    }

    case TILES.FLOOR_OFFICE: {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, s, s);
      // slightly offset grid pattern
      ctx.fillStyle = "#ddd0a8";
      ctx.fillRect(x, y + 7, s, 1);
      ctx.fillRect(x, y + 15, s, 1);
      // diagonal accent
      ctx.fillRect(x + 3, y + 3, 2, 1);
      ctx.fillRect(x + 11, y + 11, 2, 1);
      break;
    }

    case TILES.ROAD: {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, s, s);
      // center dashed line
      ctx.fillStyle = "#e0d4b0";
      ctx.fillRect(x + 7, y + 1, 2, 4);
      ctx.fillRect(x + 7, y + 9, 2, 4);
      break;
    }

    // ── Wall tiles ────────────────────────────────────
    case TILES.WALL_BRICK: {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, s, s);
      // mortar lines (dark)
      ctx.fillStyle = d;
      // horizontal mortar
      ctx.fillRect(x, y + 4, s, 1);
      ctx.fillRect(x, y + 9, s, 1);
      ctx.fillRect(x, y + 14, s, 1);
      // vertical mortar — offset every other row
      ctx.fillRect(x + 7, y, 1, 4);
      ctx.fillRect(x + 3, y + 5, 1, 4);
      ctx.fillRect(x + 11, y + 5, 1, 4);
      ctx.fillRect(x + 7, y + 10, 1, 4);
      // brick highlight
      ctx.fillStyle = "#d48880";
      ctx.fillRect(x + 1, y + 1, 2, 1);
      ctx.fillRect(x + 9, y + 6, 2, 1);
      ctx.fillRect(x + 1, y + 11, 2, 1);
      break;
    }

    case TILES.WALL_TOP: {
      // lower half: brick
      ctx.fillStyle = c;
      ctx.fillRect(x, y + 4, s, 12);
      ctx.fillStyle = d;
      ctx.fillRect(x, y + 9, s, 1);
      ctx.fillRect(x + 7, y + 4, 1, 5);
      ctx.fillRect(x + 3, y + 10, 1, 5);
      ctx.fillRect(x + 11, y + 10, 1, 5);
      // upper part: roof line
      ctx.fillStyle = d; // roof color
      ctx.fillRect(x, y, s, 4);
      ctx.fillStyle = "#a05828";
      ctx.fillRect(x, y + 3, s, 1);
      break;
    }

    case TILES.ROOF: {
      ctx.fillStyle = c;
      ctx.fillRect(x, y, s, s);
      // diagonal shingle pattern
      ctx.fillStyle = "#a05828";
      for (let i = 0; i < s; i += 4) {
        ctx.fillRect(x + i, y + (i % 8), 3, 1);
        ctx.fillRect(x + ((i + 2) % s), y + (i % 8) + 4, 3, 1);
      }
      ctx.fillStyle = "#6a3010";
      ctx.fillRect(x, y + 7, s, 1);
      ctx.fillRect(x, y + 15, s, 1);
      break;
    }

    // ── Object tiles ──────────────────────────────────
    case TILES.DESK: {
      // floor underneath visible at edges
      ctx.fillStyle = "#F5E6C8";
      ctx.fillRect(x, y, s, s);
      // desk top surface
      ctx.fillStyle = c;
      ctx.fillRect(x + 1, y + 3, 14, 7);
      // lighter top edge
      ctx.fillStyle = "#a08030";
      ctx.fillRect(x + 1, y + 3, 14, 2);
      // legs
      ctx.fillStyle = d;
      ctx.fillRect(x + 2, y + 10, 2, 4);
      ctx.fillRect(x + 12, y + 10, 2, 4);
      break;
    }

    case TILES.BLACKBOARD: {
      // wall behind
      ctx.fillStyle = "#C4706A";
      ctx.fillRect(x, y, s, s);
      // board frame
      ctx.fillStyle = "#6B5B4E";
      ctx.fillRect(x + 1, y + 2, 14, 11);
      // board surface
      ctx.fillStyle = c;
      ctx.fillRect(x + 2, y + 3, 12, 9);
      // chalk marks
      ctx.fillStyle = "#c0c0b0";
      ctx.fillRect(x + 4, y + 5, 3, 1);
      ctx.fillRect(x + 8, y + 5, 2, 1);
      ctx.fillRect(x + 3, y + 7, 5, 1);
      ctx.fillRect(x + 10, y + 8, 2, 1);
      // chalk tray
      ctx.fillStyle = "#6B5B4E";
      ctx.fillRect(x + 3, y + 13, 10, 1);
      break;
    }

    case TILES.WINDOW: {
      // wall behind
      ctx.fillStyle = "#C4706A";
      ctx.fillRect(x, y, s, s);
      // window frame
      ctx.fillStyle = d;
      ctx.fillRect(x + 2, y + 2, 12, 12);
      // glass
      ctx.fillStyle = "#b8d8e8";
      ctx.fillRect(x + 3, y + 3, 10, 10);
      // cross frame
      ctx.fillStyle = d;
      ctx.fillRect(x + 7, y + 2, 2, 12); // vertical bar
      ctx.fillRect(x + 2, y + 7, 12, 2); // horizontal bar
      // light reflection
      ctx.fillStyle = "#d0e8f0";
      ctx.fillRect(x + 4, y + 4, 2, 2);
      break;
    }

    case TILES.DOOR: {
      // wall behind
      ctx.fillStyle = "#C4706A";
      ctx.fillRect(x, y, s, s);
      // door frame
      ctx.fillStyle = "#5a4a3e";
      ctx.fillRect(x + 2, y + 1, 12, 14);
      // door surface
      ctx.fillStyle = c;
      ctx.fillRect(x + 3, y + 2, 10, 13);
      // door panels
      ctx.fillStyle = "#5e4e42";
      ctx.fillRect(x + 4, y + 3, 8, 4);
      ctx.fillRect(x + 4, y + 9, 8, 4);
      // doorknob
      ctx.fillStyle = d;
      ctx.fillRect(x + 10, y + 8, 2, 2);
      break;
    }

    case TILES.STOVE: {
      // floor
      ctx.fillStyle = "#F5E6C8";
      ctx.fillRect(x, y, s, s);
      // stove body
      ctx.fillStyle = c;
      ctx.fillRect(x + 2, y + 4, 12, 11);
      // fire glow on top
      ctx.fillStyle = d; // brick/red
      ctx.fillRect(x + 4, y + 4, 8, 3);
      ctx.fillStyle = "#e8a040";
      ctx.fillRect(x + 5, y + 5, 2, 2);
      ctx.fillRect(x + 9, y + 5, 2, 2);
      // chimney pipe
      ctx.fillStyle = c;
      ctx.fillRect(x + 6, y + 0, 4, 4);
      // stove door
      ctx.fillStyle = "#5a5048";
      ctx.fillRect(x + 5, y + 9, 6, 4);
      break;
    }

    case TILES.BOOKSHELF: {
      // floor
      ctx.fillStyle = "#F5E6C8";
      ctx.fillRect(x, y, s, s);
      // shelf frame
      ctx.fillStyle = c;
      ctx.fillRect(x + 1, y + 1, 14, 14);
      // shelf dividers
      ctx.fillStyle = d;
      ctx.fillRect(x + 1, y + 5, 14, 1);
      ctx.fillRect(x + 1, y + 10, 14, 1);
      // books top row
      ctx.fillStyle = "#C4706A";
      ctx.fillRect(x + 2, y + 2, 2, 3);
      ctx.fillStyle = "#5a7a58";
      ctx.fillRect(x + 4, y + 2, 2, 3);
      ctx.fillStyle = "#5C6B7A";
      ctx.fillRect(x + 6, y + 2, 3, 3);
      ctx.fillStyle = "#a08030";
      ctx.fillRect(x + 9, y + 2, 2, 3);
      ctx.fillStyle = "#C4706A";
      ctx.fillRect(x + 11, y + 2, 2, 3);
      // books middle row
      ctx.fillStyle = "#6B5B4E";
      ctx.fillRect(x + 2, y + 6, 3, 4);
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 5, y + 6, 2, 4);
      ctx.fillStyle = "#5C6B7A";
      ctx.fillRect(x + 7, y + 6, 2, 4);
      ctx.fillStyle = "#d88a84";
      ctx.fillRect(x + 9, y + 7, 2, 3);
      ctx.fillStyle = "#5a7a58";
      ctx.fillRect(x + 11, y + 6, 2, 4);
      // books bottom row
      ctx.fillStyle = "#8B4513";
      ctx.fillRect(x + 2, y + 11, 2, 3);
      ctx.fillStyle = "#C4706A";
      ctx.fillRect(x + 4, y + 11, 3, 3);
      ctx.fillStyle = "#5C6B7A";
      ctx.fillRect(x + 7, y + 12, 2, 2);
      ctx.fillStyle = "#a08030";
      ctx.fillRect(x + 10, y + 11, 3, 3);
      break;
    }

    case TILES.BENCH: {
      // ground
      ctx.fillStyle = "#7A9178";
      ctx.fillRect(x, y, s, s);
      // bench seat
      ctx.fillStyle = c;
      ctx.fillRect(x + 1, y + 6, 14, 4);
      // seat highlight
      ctx.fillStyle = "#b8c8c0";
      ctx.fillRect(x + 1, y + 6, 14, 1);
      // legs
      ctx.fillStyle = d;
      ctx.fillRect(x + 2, y + 10, 2, 4);
      ctx.fillRect(x + 12, y + 10, 2, 4);
      break;
    }

    // ── Nature tiles ──────────────────────────────────
    case TILES.TREE_TOP: {
      // transparent bg — draw on grass
      ctx.fillStyle = "#7A9178";
      ctx.fillRect(x, y, s, s);
      // canopy — rounded shape
      ctx.fillStyle = d; // darker outline
      ctx.fillRect(x + 3, y + 1, 10, 1);
      ctx.fillRect(x + 2, y + 2, 12, 1);
      ctx.fillRect(x + 1, y + 3, 14, 8);
      ctx.fillRect(x + 2, y + 11, 12, 1);
      ctx.fillRect(x + 3, y + 12, 10, 1);
      ctx.fillRect(x + 5, y + 13, 6, 1);
      // inner lighter canopy
      ctx.fillStyle = c;
      ctx.fillRect(x + 3, y + 3, 10, 7);
      ctx.fillRect(x + 4, y + 2, 8, 9);
      ctx.fillRect(x + 5, y + 11, 6, 1);
      // leaf detail
      ctx.fillStyle = "#8aac86";
      ctx.fillRect(x + 5, y + 4, 2, 1);
      ctx.fillRect(x + 9, y + 6, 2, 1);
      ctx.fillRect(x + 4, y + 8, 2, 1);
      break;
    }

    case TILES.TREE_TRUNK: {
      // grass bg
      ctx.fillStyle = "#7A9178";
      ctx.fillRect(x, y, s, s);
      // trunk
      ctx.fillStyle = c;
      ctx.fillRect(x + 6, y, 4, 12);
      // bark detail
      ctx.fillStyle = "#5a4a3e";
      ctx.fillRect(x + 7, y + 2, 1, 2);
      ctx.fillRect(x + 8, y + 6, 1, 2);
      // roots
      ctx.fillStyle = c;
      ctx.fillRect(x + 5, y + 12, 6, 2);
      ctx.fillRect(x + 4, y + 13, 2, 2);
      ctx.fillRect(x + 10, y + 13, 2, 2);
      break;
    }

    case TILES.FLOWER_RED:
    case TILES.FLOWER_PINK:
    case TILES.FLOWER_YELLOW:
    case TILES.FLOWER_PURPLE: {
      // grass bg
      ctx.fillStyle = "#7A9178";
      ctx.fillRect(x, y, s, s);
      // stems
      ctx.fillStyle = d; // dark grass
      ctx.fillRect(x + 3, y + 7, 1, 6);
      ctx.fillRect(x + 7, y + 5, 1, 8);
      ctx.fillRect(x + 12, y + 6, 1, 7);
      // leaves
      ctx.fillStyle = "#6a9a68";
      ctx.fillRect(x + 4, y + 9, 2, 1);
      ctx.fillRect(x + 8, y + 8, 2, 1);
      ctx.fillRect(x + 10, y + 9, 2, 1);
      // flower heads
      ctx.fillStyle = c;
      ctx.fillRect(x + 2, y + 5, 3, 3);
      ctx.fillRect(x + 6, y + 3, 3, 3);
      ctx.fillRect(x + 11, y + 4, 3, 3);
      // flower centers
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 3, y + 6, 1, 1);
      ctx.fillRect(x + 7, y + 4, 1, 1);
      ctx.fillRect(x + 12, y + 5, 1, 1);
      break;
    }

    case TILES.BAMBOO: {
      // grass bg
      ctx.fillStyle = "#7A9178";
      ctx.fillRect(x, y, s, s);
      // bamboo stems
      ctx.fillStyle = c;
      ctx.fillRect(x + 3, y, 2, s);
      ctx.fillRect(x + 8, y, 2, s);
      ctx.fillRect(x + 13, y, 2, s);
      // nodes
      ctx.fillStyle = d;
      ctx.fillRect(x + 3, y + 4, 2, 1);
      ctx.fillRect(x + 3, y + 11, 2, 1);
      ctx.fillRect(x + 8, y + 2, 2, 1);
      ctx.fillRect(x + 8, y + 9, 2, 1);
      ctx.fillRect(x + 13, y + 6, 2, 1);
      ctx.fillRect(x + 13, y + 13, 2, 1);
      // small leaves
      ctx.fillStyle = "#4a6a48";
      ctx.fillRect(x + 5, y + 3, 2, 1);
      ctx.fillRect(x + 1, y + 10, 2, 1);
      ctx.fillRect(x + 10, y + 1, 2, 1);
      ctx.fillRect(x + 6, y + 8, 2, 1);
      ctx.fillRect(x + 11, y + 12, 2, 1);
      break;
    }

    // ── Structure tiles ───────────────────────────────
    case TILES.FLAG_POLE: {
      // grass bg
      ctx.fillStyle = "#7A9178";
      ctx.fillRect(x, y, s, s);
      // pole
      ctx.fillStyle = c;
      ctx.fillRect(x + 7, y + 3, 2, 13);
      // pole cap
      ctx.fillStyle = "#e8c84a";
      ctx.fillRect(x + 6, y + 2, 4, 2);
      ctx.fillRect(x + 7, y + 1, 2, 1);
      // flag
      ctx.fillStyle = d; // red
      ctx.fillRect(x + 9, y + 3, 5, 4);
      // flag detail
      ctx.fillStyle = "#e84040";
      ctx.fillRect(x + 10, y + 4, 3, 2);
      break;
    }

    case TILES.BASKETBALL_HOOP: {
      // ground bg
      ctx.fillStyle = "#D4C08E";
      ctx.fillRect(x, y, s, s);
      // pole
      ctx.fillStyle = c;
      ctx.fillRect(x + 7, y + 6, 2, 10);
      // backboard
      ctx.fillStyle = "#e0e0e0";
      ctx.fillRect(x + 4, y + 2, 8, 5);
      ctx.fillStyle = c;
      ctx.fillRect(x + 4, y + 2, 8, 1); // top edge
      ctx.fillRect(x + 4, y + 2, 1, 5); // left edge
      ctx.fillRect(x + 11, y + 2, 1, 5); // right edge
      // hoop
      ctx.fillStyle = "#C4706A";
      ctx.fillRect(x + 5, y + 7, 6, 1);
      ctx.fillRect(x + 5, y + 7, 1, 3);
      ctx.fillRect(x + 10, y + 7, 1, 3);
      ctx.fillRect(x + 5, y + 9, 6, 1);
      break;
    }

    case TILES.WATER_TOWER_TOP: {
      // sky/bg
      ctx.fillStyle = "#D4C08E";
      ctx.fillRect(x, y, s, s);
      // tank body — rounded
      ctx.fillStyle = c;
      ctx.fillRect(x + 2, y + 3, 12, 10);
      ctx.fillRect(x + 3, y + 2, 10, 12);
      ctx.fillRect(x + 4, y + 1, 8, 14);
      // highlight
      ctx.fillStyle = "#b8c8c0";
      ctx.fillRect(x + 5, y + 3, 2, 6);
      // rim
      ctx.fillStyle = d;
      ctx.fillRect(x + 3, y + 14, 10, 1);
      break;
    }

    case TILES.WATER_TOWER_BASE: {
      // bg
      ctx.fillStyle = "#D4C08E";
      ctx.fillRect(x, y, s, s);
      // support column
      ctx.fillStyle = c;
      ctx.fillRect(x + 6, y, 4, s);
      // cross beams
      ctx.fillStyle = "#5a4a3e";
      ctx.fillRect(x + 4, y + 4, 8, 1);
      ctx.fillRect(x + 3, y + 10, 10, 1);
      // angled supports
      ctx.fillRect(x + 4, y + 5, 1, 5);
      ctx.fillRect(x + 11, y + 5, 1, 5);
      break;
    }

    case TILES.WATER_TAP: {
      // grass bg
      ctx.fillStyle = "#7A9178";
      ctx.fillRect(x, y, s, s);
      // pipe
      ctx.fillStyle = c;
      ctx.fillRect(x + 6, y + 2, 3, 8);
      // tap head
      ctx.fillStyle = d;
      ctx.fillRect(x + 5, y + 2, 5, 2);
      // spout
      ctx.fillStyle = c;
      ctx.fillRect(x + 9, y + 5, 3, 2);
      // water drop
      ctx.fillStyle = "#88b8d0";
      ctx.fillRect(x + 10, y + 8, 1, 2);
      // base
      ctx.fillStyle = "#A8B8B0";
      ctx.fillRect(x + 4, y + 10, 8, 4);
      break;
    }

    case TILES.GATE_PILLAR: {
      // ground bg
      ctx.fillStyle = "#D4C08E";
      ctx.fillRect(x, y, s, s);
      // pillar
      ctx.fillStyle = c;
      ctx.fillRect(x + 3, y + 2, 10, 14);
      // cap
      ctx.fillStyle = "#7a6a5e";
      ctx.fillRect(x + 2, y + 0, 12, 3);
      // brick lines
      ctx.fillStyle = "#5a4a3e";
      ctx.fillRect(x + 3, y + 6, 10, 1);
      ctx.fillRect(x + 3, y + 11, 10, 1);
      break;
    }

    case TILES.GATE_BAR: {
      // ground bg
      ctx.fillStyle = "#D4C08E";
      ctx.fillRect(x, y, s, s);
      // horizontal bar
      ctx.fillStyle = c;
      ctx.fillRect(x, y + 4, s, 2);
      ctx.fillRect(x, y + 10, s, 2);
      // vertical connectors
      ctx.fillRect(x + 3, y + 4, 1, 8);
      ctx.fillRect(x + 8, y + 4, 1, 8);
      ctx.fillRect(x + 13, y + 4, 1, 8);
      break;
    }

    default: {
      // Fallback: solid fill with detail speckles
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
    const px = npc.tileX * TILE_SIZE - 4; // center 24px sprite on 16px tile
    const py = npc.tileY * TILE_SIZE - 16; // sprite is taller than tile
    drawCharacter(ctx, px, py, spriteConfig, "down", npc.name, npc.mood);
  }

  // Draw player character
  const playerConfig = getPlayerSpriteConfig(props.activeCharacter);
  if (playerConfig) {
    // Player at center-ish spawn or wherever they are
    // For now, just draw at a default position
  }

  // Apply nostalgic filter
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
  const scaleX = canvasRef.value.width / rect.width;
  const scaleY = canvasRef.value.height / rect.height;
  const px = (e.clientX - rect.left) * scaleX;
  const py = (e.clientY - rect.top) * scaleY;
  const { tileX, tileY } = engine.pixelToTile(px, py);

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
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  cursor: pointer;
}
</style>
