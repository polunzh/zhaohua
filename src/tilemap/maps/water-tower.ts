import { TILES } from "../tileset";
import type { TileMapData } from "../types";

const T = TILES;
const _ = T.EMPTY;
const G = T.GRASS;
const D = T.DIRT;
const WT = T.WATER_TOWER_TOP;
const WBa = T.WATER_TOWER_BASE;
const WTp = T.WATER_TAP;

// 10 wide x 10 tall water tower area
const W = 10;
const H = 10;

// Ground: grass with a dirt path from left edge to center
const ground: number[][] = Array.from({ length: H }, (_, y) => {
  const row = new Array(W).fill(G);
  // Dirt path through middle rows
  if (y >= 4 && y <= 6) {
    for (let x = 0; x <= 5; x++) row[x] = D;
  }
  return row;
});

const objects: number[][] = (() => {
  const o = Array.from({ length: H }, () => new Array(W).fill(_));

  // Water tower in center (cols 4-5, rows 2-5)
  o[2][5] = WT;
  o[3][5] = WBa;
  o[4][5] = WBa;
  // Water tap below the tower
  o[5][5] = WTp;

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

export const waterTowerMap: TileMapData = {
  width: W,
  height: H,
  ground,
  objects,
  collision,
  exits: [
    // Left edge -> playground
    { tileX: 0, tileY: 5, targetMapId: "playground", targetTileX: 19, targetTileY: 7 },
  ],
  npcSpawns: [],
};
