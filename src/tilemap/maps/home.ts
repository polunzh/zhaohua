import type { TileMapData } from "../types";
import { TILES } from "../tileset";

const T = TILES;

// Home interior: 10x8 tiles (160x128 pixels)
// A simple rural home with a table, stove, bookshelf, window

export const homeMap: TileMapData = {
  width: 10,
  height: 8,
  ground: [
    [
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
    ],
    [
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
    ],
    [
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
    ],
    [
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
    ],
    [
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
    ],
    [
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
    ],
    [
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
      T.FLOOR_CLASSROOM,
    ],
    [T.DIRT, T.DIRT, T.DIRT, T.DIRT, T.DIRT, T.DIRT, T.DIRT, T.DIRT, T.DIRT, T.DIRT],
  ],
  objects: [
    // Top wall with windows
    [
      T.WALL_BRICK,
      T.WALL_BRICK,
      T.WINDOW,
      T.WALL_BRICK,
      T.WALL_BRICK,
      T.WALL_BRICK,
      T.WALL_BRICK,
      T.WINDOW,
      T.WALL_BRICK,
      T.WALL_BRICK,
    ],
    // Left wall, stove, shelves, right wall
    [T.WALL_BRICK, T.STOVE, 0, 0, 0, 0, 0, T.BOOKSHELF, 0, T.WALL_BRICK],
    // Table and benches
    [T.WALL_BRICK, 0, 0, T.DESK, T.DESK, 0, 0, 0, 0, T.WALL_BRICK],
    // Seating area
    [T.WALL_BRICK, 0, 0, T.BENCH, T.BENCH, 0, 0, 0, 0, T.WALL_BRICK],
    // Open space
    [T.WALL_BRICK, 0, 0, 0, 0, 0, 0, 0, 0, T.WALL_BRICK],
    // Bed area
    [T.WALL_BRICK, T.DESK, T.DESK, T.DESK, 0, 0, 0, T.BOOKSHELF, 0, T.WALL_BRICK],
    // Bottom wall with door
    [
      T.WALL_BRICK,
      T.WALL_BRICK,
      T.WALL_BRICK,
      T.WALL_BRICK,
      T.DOOR,
      T.DOOR,
      T.WALL_BRICK,
      T.WALL_BRICK,
      T.WALL_BRICK,
      T.WALL_BRICK,
    ],
    // Outside dirt
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  collision: [
    [true, true, true, true, true, true, true, true, true, true],
    [true, true, false, false, false, false, false, true, false, true],
    [true, false, false, true, true, false, false, false, false, true],
    [true, false, false, true, true, false, false, false, false, true],
    [true, false, false, false, false, false, false, false, false, true],
    [true, true, true, true, false, false, false, true, false, true],
    [true, true, true, true, false, false, true, true, true, true],
    [false, false, false, false, false, false, false, false, false, false],
  ],
  exits: [
    { tileX: 4, tileY: 7, targetMapId: "village-road", targetTileX: 5, targetTileY: 0 },
    { tileX: 5, tileY: 7, targetMapId: "village-road", targetTileX: 6, targetTileY: 0 },
  ],
  npcSpawns: [],
};
