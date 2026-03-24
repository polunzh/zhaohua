import { TILE_SIZE } from "./types";
import { TILES } from "./tileset";
import type { SeasonalPalette } from "./season-palette";

type DrawTileFn = (
  ctx: CanvasRenderingContext2D,
  tileId: number,
  x: number,
  y: number,
  s: number,
  pal: SeasonalPalette,
) => void;

// Pre-renders all tiles to off-screen canvases for fast blitting
export class TileCache {
  private cache: Map<string, HTMLCanvasElement> = new Map();

  constructor(
    private drawTileFn: DrawTileFn,
    private palette: SeasonalPalette,
  ) {
    this.buildCache();
  }

  private buildCache(): void {
    const allTileIds = Object.values(TILES);
    for (const tileId of allTileIds) {
      if (tileId === 0) continue; // skip EMPTY
      const key = String(tileId);
      const canvas = document.createElement("canvas");
      canvas.width = TILE_SIZE;
      canvas.height = TILE_SIZE;
      const ctx = canvas.getContext("2d")!;
      this.drawTileFn(ctx, tileId, 0, 0, TILE_SIZE, this.palette);
      this.cache.set(key, canvas);
    }
  }

  getTile(tileId: number): HTMLCanvasElement | undefined {
    return this.cache.get(String(tileId));
  }

  // Rebuild cache when season changes
  rebuild(palette: SeasonalPalette): void {
    this.palette = palette;
    this.cache.clear();
    this.buildCache();
  }
}
