import { TILES } from "../tileset";
import type { TileMapData } from "../types";

const T = TILES;

// Shorthand aliases for readability
const G = T.GRASS;
const D = T.DIRT;
const R = T.ROAD;
const FC = T.FLOOR_CLASSROOM;
const WB = T.WALL_BRICK;
const RO = T.ROOF;
const WN = T.WINDOW;
const DR = T.DOOR;
const _ = T.EMPTY;
const TT = T.TREE_TOP;
const TK = T.TREE_TRUNK;
const FR = T.FLOWER_RED;
const FP = T.FLOWER_PINK;
const FY = T.FLOWER_YELLOW;
const FU = T.FLOWER_PURPLE;
const BB = T.BAMBOO;
const FG = T.FLAG_POLE;
const BH = T.BASKETBALL_HOOP;
const WT = T.WATER_TOWER_TOP;
const WBa = T.WATER_TOWER_BASE;
const WTp = T.WATER_TAP;
const GP = T.GATE_PILLAR;
const GB = T.GATE_BAR;

// 30 wide x 20 tall campus map
// Row helper: fill(val, count)
function row(width: number, ...segments: [number, number][]): number[] {
  const r = new Array(width).fill(0);
  let col = 0;
  for (const [val, count] of segments) {
    for (let i = 0; i < count && col < width; i++, col++) {
      r[col] = val;
    }
  }
  return r;
}

// Ground layer (30x20)
// Rows 0-4: playground (dirt)
// Rows 5-13: left flowers(grass under), center building(classroom floor), right water tower area(grass)
// Row 14: gate row
// Rows 15-19: road and grass
const ground: number[][] = [
  // Row 0-4: Playground area — all dirt
  ...Array.from({ length: 5 }, () => new Array(30).fill(D)),
  // Row 5: flower area grass | gap | building floor | gap | water tower grass
  row(30, [G, 6], [G, 1], [FC, 16], [G, 2], [G, 5]),
  // Row 6
  row(30, [G, 6], [G, 1], [FC, 16], [G, 2], [G, 5]),
  // Row 7
  row(30, [G, 6], [G, 1], [FC, 16], [G, 2], [G, 5]),
  // Row 8
  row(30, [G, 6], [G, 1], [FC, 16], [G, 2], [G, 5]),
  // Row 9-13: open grass area with dirt paths
  row(30, [G, 12], [D, 4], [G, 14]),
  row(30, [G, 12], [D, 4], [G, 14]),
  row(30, [G, 12], [D, 4], [G, 14]),
  row(30, [G, 12], [D, 4], [G, 14]),
  row(30, [G, 12], [D, 4], [G, 14]),
  // Row 14: gate row
  row(30, [G, 12], [D, 6], [G, 12]),
  // Row 15-19: road going south
  row(30, [G, 12], [R, 6], [G, 12]),
  row(30, [G, 12], [R, 6], [G, 12]),
  row(30, [G, 12], [R, 6], [G, 12]),
  row(30, [G, 12], [R, 6], [G, 12]),
  row(30, [G, 12], [R, 6], [G, 12]),
];

// Objects layer (30x20) — 0 means empty
function emptyRow(): number[] {
  return new Array(30).fill(_);
}

const objects: number[][] = (() => {
  const o = Array.from({ length: 20 }, () => new Array(30).fill(_));

  // --- Playground (rows 0-4) ---
  // Flag pole at center top (col 14-15, row 1)
  o[1][14] = FG;
  // Basketball hoop on right (col 26, row 2)
  o[2][26] = BH;

  // --- Flower pool (rows 5-12, cols 0-5) — densely packed ---
  const flowers = [FR, FP, FY, FU, BB];
  for (let y = 5; y <= 12; y++) {
    for (let x = 0; x <= 5; x++) {
      o[y][x] = flowers[(y * 7 + x * 3) % flowers.length];
    }
  }

  // --- Teaching building (rows 5-8, cols 7-22) ---
  // Row 5: roof
  for (let x = 7; x <= 22; x++) o[5][x] = RO;
  // Row 6: wall with windows
  for (let x = 7; x <= 22; x++) o[6][x] = WB;
  o[6][9] = WN;
  o[6][12] = WN;
  o[6][17] = WN;
  o[6][20] = WN;
  // Row 7: wall with door in middle (cols 14-15)
  for (let x = 7; x <= 22; x++) o[7][x] = WB;
  o[7][14] = DR;
  o[7][15] = DR;
  // Row 8: wall bottom
  for (let x = 7; x <= 22; x++) o[8][x] = WB;

  // --- Water tower (rows 5-8, cols 25-29) ---
  o[5][27] = WT;
  o[6][27] = WBa;
  o[7][27] = WBa;
  o[8][27] = WTp;

  // --- Gate (row 14, cols 12-17) ---
  o[14][12] = GP;
  o[14][13] = GB;
  o[14][14] = GB;
  o[14][15] = GB;
  o[14][16] = GB;
  o[14][17] = GP;

  // --- Trees scattered around edges ---
  // Left edge trees
  o[0][0] = TT;
  o[1][0] = TK;
  o[0][2] = TT;
  o[1][2] = TK;
  // Right edge trees
  o[0][29] = TT;
  o[1][29] = TK;
  o[0][27] = TT;
  o[1][27] = TK;
  // Bottom corners
  o[17][0] = TT;
  o[18][0] = TK;
  o[17][1] = TT;
  o[18][1] = TK;
  o[17][28] = TT;
  o[18][28] = TK;
  o[17][29] = TT;
  o[18][29] = TK;
  // Some along left edge lower
  o[13][0] = TT;
  o[14][0] = TK;
  // Right side mid
  o[10][29] = TT;
  o[11][29] = TK;

  return o;
})();

// Collision layer (30x20)
const collision: boolean[][] = (() => {
  const c = Array.from({ length: 20 }, () => new Array(30).fill(false));

  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 30; x++) {
      const obj = objects[y][x];
      if (obj === _) continue;
      // Door and gate bar are walkable
      if (obj === DR || obj === GB) continue;
      // Everything else on object layer is blocked
      c[y][x] = true;
    }
  }

  return c;
})();

export const campusMap: TileMapData = {
  width: 30,
  height: 20,
  ground,
  objects,
  collision,
  exits: [
    // Gate at bottom center — leads to village road
    {
      tileX: 14,
      tileY: 19,
      targetMapId: "village-road",
      targetTileX: 14,
      targetTileY: 0,
    },
    {
      tileX: 15,
      tileY: 19,
      targetMapId: "village-road",
      targetTileX: 15,
      targetTileY: 0,
    },
    // Door of building — leads to classroom
    {
      tileX: 14,
      tileY: 7,
      targetMapId: "classroom",
      targetTileX: 7,
      targetTileY: 11,
    },
    {
      tileX: 15,
      tileY: 7,
      targetMapId: "classroom",
      targetTileX: 8,
      targetTileY: 11,
    },
  ],
  npcSpawns: [
    { npcId: "student-1", tileX: 10, tileY: 10 },
    { npcId: "student-2", tileX: 16, tileY: 11 },
    { npcId: "student-3", tileX: 20, tileY: 10 },
    { npcId: "principal", tileX: 13, tileY: 9 },
  ],
};
