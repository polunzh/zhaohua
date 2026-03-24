import { TILES } from "../tileset";
import type { TileMapData } from "../types";

const T = TILES;
const _ = T.EMPTY;
const D = T.DIRT;
const G = T.GRASS;
const FG = T.FLAG_POLE;
const BH = T.BASKETBALL_HOOP;

// 20 wide x 15 tall playground
const W = 20;
const H = 15;

const ground: number[][] = Array.from({ length: H }, () => new Array(W).fill(D));

const objects: number[][] = (() => {
  const o = Array.from({ length: H }, () => new Array(W).fill(_));

  // Flag pole in center
  o[6][10] = FG;
  o[7][10] = FG;

  // Basketball hoop on right side
  o[5][17] = BH;
  o[7][17] = BH;

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

export const playgroundMap: TileMapData = {
  width: W,
  height: H,
  ground,
  objects,
  collision,
  exits: [
    // Top edge -> classroom
    { tileX: 9, tileY: 0, targetMapId: "classroom", targetTileX: 7, targetTileY: 11 },
    { tileX: 10, tileY: 0, targetMapId: "classroom", targetTileX: 8, targetTileY: 11 },
    // Left edge -> flower-pool
    { tileX: 0, tileY: 7, targetMapId: "flower-pool", targetTileX: 11, targetTileY: 5 },
    // Right edge -> water-tower
    { tileX: 19, tileY: 7, targetMapId: "water-tower", targetTileX: 0, targetTileY: 5 },
    // Bottom edge -> village-road
    { tileX: 9, tileY: 14, targetMapId: "village-road", targetTileX: 10, targetTileY: 0 },
    { tileX: 10, tileY: 14, targetMapId: "village-road", targetTileX: 11, targetTileY: 0 },
  ],
  npcSpawns: [
    { npcId: "student-1", tileX: 5, tileY: 5 },
    { npcId: "student-2", tileX: 12, tileY: 8 },
    { npcId: "student-3", tileX: 15, tileY: 5 },
  ],
};
