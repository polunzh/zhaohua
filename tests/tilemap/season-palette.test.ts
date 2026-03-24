import { describe, it, expect } from "vitest";
import { getSeasonalPalette } from "../../src/tilemap/season-palette";

describe("Season Palette", () => {
  it("returns default palette for summer", () => {
    const pal = getSeasonalPalette("summer");
    expect(pal.grass.base).toBe("#7A9178");
  });

  it("spring has lighter grass", () => {
    const pal = getSeasonalPalette("spring");
    expect(pal.grass.base).not.toBe("#7A9178");
  });

  it("autumn has yellow-brown grass", () => {
    const pal = getSeasonalPalette("autumn");
    expect(pal.grass.base).toMatch(/#[a-fA-F0-9]{6}/);
  });

  it("winter has dry brown grass", () => {
    const pal = getSeasonalPalette("winter");
    expect(pal.grass.base).toMatch(/#[a-fA-F0-9]{6}/);
  });

  it("each season has all material keys", () => {
    for (const season of ["spring", "summer", "autumn", "winter"]) {
      const pal = getSeasonalPalette(season);
      expect(pal.grass).toBeDefined();
      expect(pal.dirt).toBeDefined();
      expect(pal.brick).toBeDefined();
      expect(pal.wood).toBeDefined();
    }
  });
});
