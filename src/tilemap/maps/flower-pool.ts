import { TILES } from "../tileset";
import type { TileMapData } from "../types";

const T = TILES;
const _ = T.EMPTY;
const G = T.GRASS;
const D = T.DIRT;
const FR = T.FLOWER_RED;
const FP = T.FLOWER_PINK;
const FY = T.FLOWER_YELLOW;
const FU = T.FLOWER_PURPLE;
const BB = T.BAMBOO;
const BN = T.BENCH;

// 12 wide x 10 tall flower pool
const W = 12;
const H = 10;

// Ground: grass everywhere, with a dirt path through the middle (row 4-5)
const ground: number[][] = Array.from({ length: H }, (_, y) => {
  if (y === 4 || y === 5) return new Array(W).fill(D);
  return new Array(W).fill(G);
});

const objects: number[][] = (() => {
  const o = Array.from({ length: H }, () => new Array(W).fill(_));
  const flowers = [FR, FP, FY, FU, BB];

  // Fill top section (rows 0-3) with flowers
  for (let y = 0; y <= 3; y++) {
    for (let x = 0; x < W; x++) {
      o[y][x] = flowers[(y * 7 + x * 3) % flowers.length];
    }
  }

  // Fill bottom section (rows 6-9) with flowers
  for (let y = 6; y <= 9; y++) {
    for (let x = 0; x < W; x++) {
      o[y][x] = flowers[(y * 5 + x * 2) % flowers.length];
    }
  }

  // Bench on the path
  o[4][5] = BN;

  // Clear exit tiles on the right edge path
  o[4][11] = _;
  o[5][11] = _;

  return o;
})();

const collision: boolean[][] = (() => {
  const c = Array.from({ length: H }, () => new Array(W).fill(false));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const obj = objects[y][x];
      if (obj !== _) c[y][x] = true;
    }
  }
  return c;
})();

export const flowerPoolMap: TileMapData = {
  width: W,
  height: H,
  ground,
  objects,
  collision,
  exits: [
    // Right edge -> playground
    { tileX: 11, tileY: 4, targetMapId: "playground", targetTileX: 0, targetTileY: 7 },
    { tileX: 11, tileY: 5, targetMapId: "playground", targetTileX: 0, targetTileY: 8 },
  ],
  npcSpawns: [],
};
