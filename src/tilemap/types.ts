export const TILE_SIZE = 32;

export interface TileMapData {
  width: number; // in tiles
  height: number; // in tiles
  ground: number[][]; // tile IDs for ground layer
  objects: number[][]; // tile IDs for objects layer (0 = empty)
  collision: boolean[][]; // true = blocked
  exits: Exit[];
  npcSpawns: NpcSpawn[];
}

export interface Exit {
  tileX: number;
  tileY: number;
  targetMapId: string;
  targetTileX: number;
  targetTileY: number;
}

export interface NpcSpawn {
  npcId: string;
  tileX: number;
  tileY: number;
}

export interface PixelPos {
  x: number;
  y: number;
}

export interface TilePos {
  tileX: number;
  tileY: number;
}
