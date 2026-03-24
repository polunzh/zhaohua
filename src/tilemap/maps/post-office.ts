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

// 12 wide x 10 tall post office interior
const W = 12;
const H = 10;

const ground: number[][] = Array.from({ length: H }, () => new Array(W).fill(FO));

const objects: number[][] = (() => {
  const o = Array.from({ length: H }, () => new Array(W).fill(_));

  // Top wall with windows
  for (let x = 0; x < W; x++) o[0][x] = WB;
  o[0][3] = WN;
  o[0][8] = WN;

  // Left and right walls
  for (let y = 1; y <= 8; y++) {
    o[y][0] = WB;
  }
  // Right wall has door for exit to town-road
  for (let y = 1; y <= 8; y++) {
    o[y][11] = WB;
  }
  o[8][11] = DR; // Door on right wall at row 5-6 — actually let's put exit at bottom

  // Bottom wall with door
  for (let x = 0; x < W; x++) o[9][x] = WB;
  o[9][5] = DR;
  o[9][6] = DR;

  // Counter desk (row 4, cols 2-5)
  for (let x = 2; x <= 5; x++) o[4][x] = DK;

  // Bookshelves for mail storage along left wall
  for (let y = 1; y <= 3; y++) o[y][1] = BS;
  // Bookshelves along back wall
  for (let y = 1; y <= 3; y++) o[y][10] = BS;

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

export const postOfficeMap: TileMapData = {
  width: W,
  height: H,
  ground,
  objects,
  collision,
  exits: [
    // Door -> town-road
    { tileX: 5, tileY: 9, targetMapId: "town-road", targetTileX: 0, targetTileY: 5 },
    { tileX: 6, tileY: 9, targetMapId: "town-road", targetTileX: 0, targetTileY: 6 },
  ],
  npcSpawns: [],
};
