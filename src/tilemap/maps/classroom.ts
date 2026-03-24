import { TILES } from "../tileset";
import type { TileMapData } from "../types";

const T = TILES;
const _ = T.EMPTY;
const FC = T.FLOOR_CLASSROOM;
const WB = T.WALL_BRICK;
const WN = T.WINDOW;
const DR = T.DOOR;
const DK = T.DESK;
const BB = T.BLACKBOARD;
const ST = T.STOVE;

// 16 wide x 12 tall classroom interior

const ground: number[][] = Array.from({ length: 12 }, () => new Array(16).fill(FC));

const objects: number[][] = (() => {
  const o = Array.from({ length: 12 }, () => new Array(16).fill(_));

  // Row 0: top wall — brick with windows and blackboard
  for (let x = 0; x < 16; x++) o[0][x] = WB;
  o[0][2] = WN;
  o[0][4] = WN;
  o[0][6] = BB;
  o[0][7] = BB;
  o[0][8] = BB;
  o[0][9] = BB;
  o[0][11] = WN;
  o[0][13] = WN;

  // Left and right walls (rows 1-10)
  for (let y = 1; y <= 10; y++) {
    o[y][0] = WB;
    o[y][15] = WB;
  }

  // Bottom wall (row 11) with door in center
  for (let x = 0; x < 16; x++) o[11][x] = WB;
  o[11][7] = DR;
  o[11][8] = DR;

  // Desks: 3 columns x 4 rows
  // Column 1: cols 3-4, Column 2: cols 7-8, Column 3: cols 11-12
  // Rows: 3, 5, 7, 9
  const deskCols = [3, 4, 7, 8, 11, 12];
  const deskRows = [3, 5, 7, 9];
  for (const y of deskRows) {
    for (const x of deskCols) {
      o[y][x] = DK;
    }
  }

  // Stove in back-left corner (row 10, col 1)
  o[10][1] = ST;

  return o;
})();

const collision: boolean[][] = (() => {
  const c = Array.from({ length: 12 }, () => new Array(16).fill(false));

  for (let y = 0; y < 12; y++) {
    for (let x = 0; x < 16; x++) {
      const obj = objects[y][x];
      if (obj === _) continue;
      if (obj === DR) continue; // door is walkable
      c[y][x] = true;
    }
  }

  return c;
})();

export const classroomMap: TileMapData = {
  width: 16,
  height: 12,
  ground,
  objects,
  collision,
  exits: [
    // Door leads back to playground
    {
      tileX: 7,
      tileY: 11,
      targetMapId: "playground",
      targetTileX: 9,
      targetTileY: 0,
    },
    {
      tileX: 8,
      tileY: 11,
      targetMapId: "playground",
      targetTileX: 10,
      targetTileY: 0,
    },
  ],
  npcSpawns: [{ npcId: "teacher", tileX: 8, tileY: 1 }],
};
