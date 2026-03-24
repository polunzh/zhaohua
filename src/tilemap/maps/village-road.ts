import { TILES } from "../tileset";
import type { TileMapData } from "../types";

const T = TILES;
const _ = T.EMPTY;
const G = T.GRASS;
const D = T.DIRT;
const R = T.ROAD;
const TT = T.TREE_TOP;
const TK = T.TREE_TRUNK;

// 20 wide x 12 tall village road
const W = 20;
const H = 12;

// Ground: grass with a dirt road going left-right across middle
const ground: number[][] = Array.from({ length: H }, (_, y) => {
  if (y >= 5 && y <= 6) return new Array(W).fill(R);
  return new Array(W).fill(G);
});

const objects: number[][] = (() => {
  const o = Array.from({ length: H }, () => new Array(W).fill(_));

  // Trees along top edge
  o[0][2] = TT;
  o[1][2] = TK;
  o[0][6] = TT;
  o[1][6] = TK;
  o[0][14] = TT;
  o[1][14] = TK;
  o[0][18] = TT;
  o[1][18] = TK;

  // Trees along bottom edge
  o[9][1] = TT;
  o[10][1] = TK;
  o[9][8] = TT;
  o[10][8] = TK;
  o[9][15] = TT;
  o[10][15] = TK;
  o[9][19] = TT;
  o[10][19] = TK;

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

export const villageRoadMap: TileMapData = {
  width: W,
  height: H,
  ground,
  objects,
  collision,
  exits: [
    // Top -> playground/school
    { tileX: 10, tileY: 0, targetMapId: "playground", targetTileX: 9, targetTileY: 14 },
    { tileX: 11, tileY: 0, targetMapId: "playground", targetTileX: 10, targetTileY: 14 },
    // Right -> farmland
    { tileX: 19, tileY: 5, targetMapId: "farmland", targetTileX: 0, targetTileY: 5 },
    { tileX: 19, tileY: 6, targetMapId: "farmland", targetTileX: 0, targetTileY: 6 },
    // Left -> villager-house
    { tileX: 0, tileY: 5, targetMapId: "villager-house", targetTileX: 11, targetTileY: 5 },
    { tileX: 0, tileY: 6, targetMapId: "villager-house", targetTileX: 11, targetTileY: 6 },
    // Bottom -> town-road
    { tileX: 10, tileY: 11, targetMapId: "town-road", targetTileX: 10, targetTileY: 0 },
    { tileX: 11, tileY: 11, targetMapId: "town-road", targetTileX: 11, targetTileY: 0 },
  ],
  npcSpawns: [],
};
