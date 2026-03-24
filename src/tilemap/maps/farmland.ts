import { TILES } from "../tileset";
import type { TileMapData } from "../types";

const T = TILES;
const _ = T.EMPTY;
const G = T.GRASS;
const D = T.DIRT;

// 16 wide x 12 tall farmland
const W = 16;
const H = 12;

// Ground: alternating rows of grass (crops) and dirt (paths)
const ground: number[][] = Array.from({ length: H }, (_, y) => {
  // Dirt paths every 3 rows
  if (y % 3 === 0) return new Array(W).fill(D);
  return new Array(W).fill(G);
});

const objects: number[][] = Array.from({ length: H }, () => new Array(W).fill(_));

const collision: boolean[][] = Array.from({ length: H }, () => new Array(W).fill(false));

export const farmlandMap: TileMapData = {
  width: W,
  height: H,
  ground,
  objects,
  collision,
  exits: [
    // Left -> village-road
    { tileX: 0, tileY: 5, targetMapId: "village-road", targetTileX: 19, targetTileY: 5 },
    { tileX: 0, tileY: 6, targetMapId: "village-road", targetTileX: 19, targetTileY: 6 },
  ],
  npcSpawns: [],
};
