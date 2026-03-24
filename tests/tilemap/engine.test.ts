import { describe, it, expect } from "vitest";
import { TileMapEngine } from "../../src/tilemap/engine";
import type { TileMapData } from "../../src/tilemap/types";
import { TILE_SIZE } from "../../src/tilemap/types";

const testMap: TileMapData = {
  width: 4,
  height: 4,
  ground: [
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
    [1, 1, 1, 1],
  ],
  objects: [
    [0, 0, 0, 0],
    [0, 2, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  collision: [
    [false, false, false, false],
    [false, true, false, false],
    [false, false, false, false],
    [false, false, false, false],
  ],
  exits: [{ tileX: 3, tileY: 3, targetMapId: "village", targetTileX: 0, targetTileY: 0 }],
  npcSpawns: [{ npcId: "student-zhang-wei", tileX: 2, tileY: 2 }],
};

describe("TileMapEngine", () => {
  it("creates from map data", () => {
    const engine = new TileMapEngine(testMap);
    expect(engine.width).toBe(4);
    expect(engine.height).toBe(4);
  });

  it("converts tile to pixel coordinates", () => {
    const engine = new TileMapEngine(testMap);
    const pos = engine.tileToPixel(2, 3);
    expect(pos.x).toBe(2 * TILE_SIZE);
    expect(pos.y).toBe(3 * TILE_SIZE);
  });

  it("converts pixel to tile coordinates", () => {
    const engine = new TileMapEngine(testMap);
    const pos = engine.pixelToTile(35, 50);
    expect(pos.tileX).toBe(2); // 35 / 16 = 2.18 → 2
    expect(pos.tileY).toBe(3); // 50 / 16 = 3.12 → 3
  });

  it("checks walkability", () => {
    const engine = new TileMapEngine(testMap);
    expect(engine.isWalkable(0, 0)).toBe(true);
    expect(engine.isWalkable(1, 1)).toBe(false); // collision = true
    expect(engine.isWalkable(5, 5)).toBe(false); // out of bounds
  });

  it("gets exit at tile", () => {
    const engine = new TileMapEngine(testMap);
    expect(engine.getExitAt(3, 3)).toBeDefined();
    expect(engine.getExitAt(3, 3)!.targetMapId).toBe("village");
    expect(engine.getExitAt(0, 0)).toBeNull();
  });

  it("gets NPC spawn at tile", () => {
    const engine = new TileMapEngine(testMap);
    expect(engine.getNpcAt(2, 2)).toBe("student-zhang-wei");
    expect(engine.getNpcAt(0, 0)).toBeNull();
  });

  it("gets tile ID from layer", () => {
    const engine = new TileMapEngine(testMap);
    expect(engine.getGroundTile(0, 0)).toBe(1);
    expect(engine.getObjectTile(1, 1)).toBe(2);
    expect(engine.getObjectTile(0, 0)).toBe(0);
  });
});
