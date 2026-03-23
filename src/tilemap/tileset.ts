// Tile IDs
export const TILES = {
  EMPTY: 0,
  // Ground
  DIRT: 1,
  GRASS: 2,
  FLOOR_CLASSROOM: 3,
  FLOOR_OFFICE: 4,
  ROAD: 5,
  // Walls
  WALL_BRICK: 10,
  WALL_TOP: 11,
  ROOF: 12,
  // Objects
  DESK: 20,
  BLACKBOARD: 21,
  WINDOW: 22,
  DOOR: 23,
  STOVE: 24,
  BOOKSHELF: 25,
  BENCH: 26,
  // Nature
  TREE_TOP: 30,
  TREE_TRUNK: 31,
  FLOWER_RED: 32,
  FLOWER_PINK: 33,
  FLOWER_YELLOW: 34,
  FLOWER_PURPLE: 35,
  BAMBOO: 36,
  // Structures
  FLAG_POLE: 40,
  BASKETBALL_HOOP: 41,
  WATER_TOWER_TOP: 42,
  WATER_TOWER_BASE: 43,
  WATER_TAP: 44,
  GATE_PILLAR: 45,
  GATE_BAR: 46,
} as const;

export type TileId = (typeof TILES)[keyof typeof TILES];

interface TileConfig {
  id: number;
  name: string;
  color: string; // primary fill color
  detail?: string; // secondary color for detail
  walkable: boolean;
}

// Color palette from design doc
const C = {
  dirt: "#D4C08E",
  grass: "#7A9178",
  darkGrass: "#5a7a58",
  brick: "#C4706A",
  roof: "#8B4513",
  wood: "#8B6914",
  window: "#A8B8B0",
  door: "#6B5B4E",
  dark: "#3a3530",
  paper: "#F5E6C8",
  shadow: "#6B5B4E",
  flowerRed: "#C4706A",
  flowerPink: "#d88a84",
  flowerYellow: "#e8c84a",
  flowerPurple: "#e0a0d0",
  bamboo: "#5a7a58",
  metal: "#5C6B7A",
  stone: "#A8B8B0",
};

export const tileConfigs: Record<number, TileConfig> = {
  [TILES.EMPTY]: { id: 0, name: "empty", color: "transparent", walkable: true },
  [TILES.DIRT]: { id: 1, name: "dirt", color: C.dirt, walkable: true },
  [TILES.GRASS]: { id: 2, name: "grass", color: C.grass, walkable: true },
  [TILES.FLOOR_CLASSROOM]: {
    id: 3,
    name: "floor-classroom",
    color: C.paper,
    detail: C.dirt,
    walkable: true,
  },
  [TILES.FLOOR_OFFICE]: {
    id: 4,
    name: "floor-office",
    color: C.paper,
    detail: C.dirt,
    walkable: true,
  },
  [TILES.ROAD]: { id: 5, name: "road", color: "#C9A882", walkable: true },
  [TILES.WALL_BRICK]: {
    id: 10,
    name: "wall-brick",
    color: C.brick,
    detail: C.dark,
    walkable: false,
  },
  [TILES.WALL_TOP]: { id: 11, name: "wall-top", color: C.brick, detail: C.roof, walkable: false },
  [TILES.ROOF]: { id: 12, name: "roof", color: C.roof, walkable: false },
  [TILES.DESK]: { id: 20, name: "desk", color: C.wood, detail: C.shadow, walkable: false },
  [TILES.BLACKBOARD]: {
    id: 21,
    name: "blackboard",
    color: C.dark,
    detail: C.shadow,
    walkable: false,
  },
  [TILES.WINDOW]: { id: 22, name: "window", color: C.window, detail: C.shadow, walkable: false },
  [TILES.DOOR]: { id: 23, name: "door", color: C.door, detail: C.dirt, walkable: true },
  [TILES.STOVE]: { id: 24, name: "stove", color: C.dark, detail: C.brick, walkable: false },
  [TILES.BOOKSHELF]: { id: 25, name: "bookshelf", color: C.wood, detail: C.dark, walkable: false },
  [TILES.BENCH]: { id: 26, name: "bench", color: C.stone, detail: C.shadow, walkable: false },
  [TILES.TREE_TOP]: {
    id: 30,
    name: "tree-top",
    color: C.grass,
    detail: C.darkGrass,
    walkable: false,
  },
  [TILES.TREE_TRUNK]: { id: 31, name: "tree-trunk", color: C.shadow, walkable: false },
  [TILES.FLOWER_RED]: {
    id: 32,
    name: "flower-red",
    color: C.flowerRed,
    detail: C.darkGrass,
    walkable: false,
  },
  [TILES.FLOWER_PINK]: {
    id: 33,
    name: "flower-pink",
    color: C.flowerPink,
    detail: C.darkGrass,
    walkable: false,
  },
  [TILES.FLOWER_YELLOW]: {
    id: 34,
    name: "flower-yellow",
    color: C.flowerYellow,
    detail: C.darkGrass,
    walkable: false,
  },
  [TILES.FLOWER_PURPLE]: {
    id: 35,
    name: "flower-purple",
    color: C.flowerPurple,
    detail: C.darkGrass,
    walkable: false,
  },
  [TILES.BAMBOO]: { id: 36, name: "bamboo", color: C.bamboo, detail: C.darkGrass, walkable: false },
  [TILES.FLAG_POLE]: {
    id: 40,
    name: "flag-pole",
    color: C.shadow,
    detail: C.brick,
    walkable: false,
  },
  [TILES.BASKETBALL_HOOP]: { id: 41, name: "basketball-hoop", color: C.shadow, walkable: false },
  [TILES.WATER_TOWER_TOP]: {
    id: 42,
    name: "water-tower-top",
    color: C.stone,
    detail: C.shadow,
    walkable: false,
  },
  [TILES.WATER_TOWER_BASE]: { id: 43, name: "water-tower-base", color: C.shadow, walkable: false },
  [TILES.WATER_TAP]: {
    id: 44,
    name: "water-tap",
    color: C.metal,
    detail: C.shadow,
    walkable: false,
  },
  [TILES.GATE_PILLAR]: { id: 45, name: "gate-pillar", color: C.shadow, walkable: false },
  [TILES.GATE_BAR]: { id: 46, name: "gate-bar", color: C.shadow, walkable: true },
};

export function getTileConfig(id: number): TileConfig | undefined {
  return tileConfigs[id];
}

export function isTileWalkable(id: number): boolean {
  const config = tileConfigs[id];
  return config ? config.walkable : false;
}

// Browser-only: generate tile images onto a canvas
export function generateTileset(ctx: CanvasRenderingContext2D): Map<number, ImageData> {
  const tiles = new Map<number, ImageData>();
  const size = 16;

  for (const [idStr, config] of Object.entries(tileConfigs)) {
    const id = Number(idStr);
    if (config.color === "transparent") continue;

    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = config.color;
    ctx.fillRect(0, 0, size, size);

    // Add pixel-style detail based on tile type
    if (config.detail) {
      ctx.fillStyle = config.detail;
      // Simple pixel detail pattern
      for (let i = 0; i < 4; i++) {
        const dx = (i * 5 + 3) % size;
        const dy = (i * 7 + 2) % size;
        ctx.fillRect(dx, dy, 2, 2);
      }
    }

    tiles.set(id, ctx.getImageData(0, 0, size, size));
  }

  return tiles;
}
