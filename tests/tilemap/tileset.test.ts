import { describe, it, expect } from "vitest";
import { TILES, getTileConfig, isTileWalkable, tileConfigs } from "../../src/tilemap/tileset";

describe("Tileset", () => {
  it("all TILES constants have configs", () => {
    for (const [name, id] of Object.entries(TILES)) {
      expect(tileConfigs[id], `Missing config for ${name} (${id})`).toBeDefined();
    }
  });

  it("getTileConfig returns config for valid ID", () => {
    const config = getTileConfig(TILES.DIRT);
    expect(config).toBeDefined();
    expect(config!.name).toBe("dirt");
    expect(config!.color).toBe("#D4C08E");
  });

  it("ground tiles are walkable", () => {
    expect(isTileWalkable(TILES.DIRT)).toBe(true);
    expect(isTileWalkable(TILES.GRASS)).toBe(true);
    expect(isTileWalkable(TILES.ROAD)).toBe(true);
    expect(isTileWalkable(TILES.FLOOR_CLASSROOM)).toBe(true);
  });

  it("wall and object tiles are not walkable", () => {
    expect(isTileWalkable(TILES.WALL_BRICK)).toBe(false);
    expect(isTileWalkable(TILES.DESK)).toBe(false);
    expect(isTileWalkable(TILES.TREE_TOP)).toBe(false);
  });

  it("door is walkable", () => {
    expect(isTileWalkable(TILES.DOOR)).toBe(true);
  });

  it("all configs have valid colors", () => {
    for (const config of Object.values(tileConfigs)) {
      if (config.color === "transparent") continue;
      expect(config.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("tile IDs are unique", () => {
    const ids = Object.values(TILES);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
