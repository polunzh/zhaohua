import { TILES } from "../tileset";
import type { TileMapData } from "../types";

const T = TILES;
const _ = T.EMPTY;
const D = T.DIRT;
const R = T.ROAD;
const WB = T.WALL_BRICK;

// 20 wide x 12 tall town road
const W = 20;
const H = 12;

// Ground: road through center, dirt on sides
const ground: number[][] = Array.from({ length: H }, (_, y) => {
  const row = new Array(W).fill(D);
  if (y >= 5 && y <= 6) {
    for (let x = 0; x < W; x++) row[x] = R;
  }
  return row;
});

const objects: number[][] = (() => {
  const o = Array.from({ length: H }, () => new Array(W).fill(_));

  // Buildings on left side (rows 1-3, cols 1-4)
  for (let y = 1; y <= 3; y++) {
    for (let x = 1; x <= 4; x++) o[y][x] = WB;
  }

  // Buildings on right side (rows 1-3, cols 15-18)
  for (let y = 1; y <= 3; y++) {
    for (let x = 15; x <= 18; x++) o[y][x] = WB;
  }

  // Buildings on bottom-left (rows 8-10, cols 1-4)
  for (let y = 8; y <= 10; y++) {
    for (let x = 1; x <= 4; x++) o[y][x] = WB;
  }

  // Buildings on bottom-right (rows 8-10, cols 15-18)
  for (let y = 8; y <= 10; y++) {
    for (let x = 15; x <= 18; x++) o[y][x] = WB;
  }

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

export const townRoadMap: TileMapData = {
  width: W,
  height: H,
  ground,
  objects,
  collision,
  exits: [
    // Top -> village-road
    { tileX: 10, tileY: 0, targetMapId: "village-road", targetTileX: 10, targetTileY: 11 },
    { tileX: 11, tileY: 0, targetMapId: "village-road", targetTileX: 11, targetTileY: 11 },
    // Left -> post-office
    { tileX: 0, tileY: 5, targetMapId: "post-office", targetTileX: 11, targetTileY: 5 },
    { tileX: 0, tileY: 6, targetMapId: "post-office", targetTileX: 11, targetTileY: 6 },
    // Right -> market
    { tileX: 19, tileY: 5, targetMapId: "market", targetTileX: 0, targetTileY: 5 },
    { tileX: 19, tileY: 6, targetMapId: "market", targetTileX: 0, targetTileY: 6 },
    // Bottom -> clinic
    { tileX: 10, tileY: 11, targetMapId: "clinic", targetTileX: 5, targetTileY: 0 },
  ],
  npcSpawns: [],
};
