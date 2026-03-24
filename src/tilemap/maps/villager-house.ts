import { TILES } from "../tileset";
import type { TileMapData } from "../types";

const T = TILES;
const _ = T.EMPTY;
const D = T.DIRT;
const WB = T.WALL_BRICK;
const RO = T.ROOF;
const WN = T.WINDOW;
const DR = T.DOOR;

// 12 wide x 10 tall villager house with yard
const W = 12;
const H = 10;

// Ground: all dirt (yard + interior)
const ground: number[][] = Array.from({ length: H }, () => new Array(W).fill(D));

const objects: number[][] = (() => {
  const o = Array.from({ length: H }, () => new Array(W).fill(_));

  // House: rows 1-5, cols 2-8
  // Roof row
  for (let x = 2; x <= 8; x++) o[1][x] = RO;
  // Top wall with windows
  for (let x = 2; x <= 8; x++) o[2][x] = WB;
  o[2][4] = WN;
  o[2][6] = WN;
  // Side walls (rows 3-4)
  for (let y = 3; y <= 4; y++) {
    o[y][2] = WB;
    o[y][8] = WB;
  }
  // Bottom wall with door
  for (let x = 2; x <= 8; x++) o[5][x] = WB;
  o[5][5] = DR;

  return o;
})();

const collision: boolean[][] = (() => {
  const c = Array.from({ length: H }, () => new Array(W).fill(false));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const obj = objects[y][x];
      if (obj === _ || obj === DR) continue;
      c[y][x] = true;
    }
  }
  return c;
})();

export const villagerHouseMap: TileMapData = {
  width: W,
  height: H,
  ground,
  objects,
  collision,
  exits: [
    // Right edge -> village-road
    { tileX: 11, tileY: 5, targetMapId: "village-road", targetTileX: 0, targetTileY: 5 },
    { tileX: 11, tileY: 6, targetMapId: "village-road", targetTileX: 0, targetTileY: 6 },
  ],
  npcSpawns: [],
};
