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

// 12 wide x 10 tall office

const ground: number[][] = Array.from({ length: 10 }, () => new Array(12).fill(FO));

const objects: number[][] = (() => {
  const o = Array.from({ length: 10 }, () => new Array(12).fill(_));

  // Row 0: top wall with windows
  for (let x = 0; x < 12; x++) o[0][x] = WB;
  o[0][3] = WN;
  o[0][5] = WN;
  o[0][7] = WN;

  // Left and right walls (rows 1-8)
  for (let y = 1; y <= 8; y++) {
    o[y][0] = WB;
    o[y][11] = WB;
  }

  // Bottom wall (row 9) with door
  for (let x = 0; x < 12; x++) o[9][x] = WB;
  o[9][5] = DR;
  o[9][6] = DR;

  // Bookshelves along left wall (rows 1-4)
  for (let y = 1; y <= 4; y++) {
    o[y][1] = BS;
  }

  // Bookshelves along right wall (rows 1-3)
  for (let y = 1; y <= 3; y++) {
    o[y][10] = BS;
  }

  // Desk in center area
  o[4][5] = DK;
  o[4][6] = DK;
  o[5][5] = DK;
  o[5][6] = DK;

  // Another desk by the right wall
  o[6][9] = DK;
  o[6][10] = DK;

  return o;
})();

const collision: boolean[][] = (() => {
  const c = Array.from({ length: 10 }, () => new Array(12).fill(false));

  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 12; x++) {
      const obj = objects[y][x];
      if (obj === _) continue;
      if (obj === DR) continue;
      c[y][x] = true;
    }
  }

  return c;
})();

export const officeMap: TileMapData = {
  width: 12,
  height: 10,
  ground,
  objects,
  collision,
  exits: [
    {
      tileX: 5,
      tileY: 9,
      targetMapId: "campus",
      targetTileX: 14,
      targetTileY: 8,
    },
    {
      tileX: 6,
      tileY: 9,
      targetMapId: "campus",
      targetTileX: 15,
      targetTileY: 8,
    },
  ],
  npcSpawns: [{ npcId: "principal", tileX: 6, tileY: 4 }],
};
