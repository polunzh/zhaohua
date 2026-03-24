import { TILES } from "../tileset";
import type { TileMapData } from "../types";

const T = TILES;
const _ = T.EMPTY;
const D = T.DIRT;
const DK = T.DESK;

// 16 wide x 12 tall outdoor market
const W = 16;
const H = 12;

const ground: number[][] = Array.from({ length: H }, () => new Array(W).fill(D));

const objects: number[][] = (() => {
  const o = Array.from({ length: H }, () => new Array(W).fill(_));

  // Market stalls (desks) arranged in rows
  // Stall row 1 (row 2, cols 3-5)
  for (let x = 3; x <= 5; x++) o[2][x] = DK;
  // Stall row 2 (row 2, cols 9-11)
  for (let x = 9; x <= 11; x++) o[2][x] = DK;

  // Stall row 3 (row 5, cols 3-5)
  for (let x = 3; x <= 5; x++) o[5][x] = DK;
  // Stall row 4 (row 5, cols 9-11)
  for (let x = 9; x <= 11; x++) o[5][x] = DK;

  // Stall row 5 (row 8, cols 3-5)
  for (let x = 3; x <= 5; x++) o[8][x] = DK;
  // Stall row 6 (row 8, cols 9-11)
  for (let x = 9; x <= 11; x++) o[8][x] = DK;

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

export const marketMap: TileMapData = {
  width: W,
  height: H,
  ground,
  objects,
  collision,
  exits: [
    // Left -> town-road
    { tileX: 0, tileY: 5, targetMapId: "town-road", targetTileX: 19, targetTileY: 5 },
    { tileX: 0, tileY: 6, targetMapId: "town-road", targetTileX: 19, targetTileY: 6 },
  ],
  npcSpawns: [],
};
