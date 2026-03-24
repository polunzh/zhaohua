import { TILES } from "../tileset";
import type { TileMapData } from "../types";

const T = TILES;
const _ = T.EMPTY;
const FO = T.FLOOR_OFFICE;
const WB = T.WALL_BRICK;
const WN = T.WINDOW;
const DR = T.DOOR;
const DK = T.DESK;
const BS = T.BOOKSHELF;

// 10 wide x 8 tall clinic interior
const W = 10;
const H = 8;

const ground: number[][] = Array.from({ length: H }, () => new Array(W).fill(FO));

const objects: number[][] = (() => {
  const o = Array.from({ length: H }, () => new Array(W).fill(_));

  // Top wall with window
  for (let x = 0; x < W; x++) o[0][x] = WB;
  o[0][4] = WN;
  o[0][6] = WN;

  // Left and right walls
  for (let y = 1; y <= 6; y++) {
    o[y][0] = WB;
    o[y][9] = WB;
  }

  // Bottom wall with door
  for (let x = 0; x < W; x++) o[7][x] = WB;
  o[7][5] = DR;

  // Desk (doctor's table)
  o[3][4] = DK;
  o[3][5] = DK;

  // Bookshelf (medicine cabinet) along left wall
  o[1][1] = BS;
  o[2][1] = BS;
  o[3][1] = BS;

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

export const clinicMap: TileMapData = {
  width: W,
  height: H,
  ground,
  objects,
  collision,
  exits: [
    // Door -> town-road
    { tileX: 5, tileY: 7, targetMapId: "town-road", targetTileX: 10, targetTileY: 11 },
  ],
  npcSpawns: [],
};
