import { TILE_SIZE, type TileMapData, type PixelPos, type TilePos, type Exit } from "./types";

export class TileMapEngine {
  readonly width: number;
  readonly height: number;
  private data: TileMapData;

  constructor(data: TileMapData) {
    this.data = data;
    this.width = data.width;
    this.height = data.height;
  }

  tileToPixel(tileX: number, tileY: number): PixelPos {
    return { x: tileX * TILE_SIZE, y: tileY * TILE_SIZE };
  }

  pixelToTile(x: number, y: number): TilePos {
    return { tileX: Math.floor(x / TILE_SIZE), tileY: Math.floor(y / TILE_SIZE) };
  }

  isWalkable(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) return false;
    return !this.data.collision[tileY][tileX];
  }

  getExitAt(tileX: number, tileY: number): Exit | null {
    return this.data.exits.find((e) => e.tileX === tileX && e.tileY === tileY) ?? null;
  }

  getNpcAt(tileX: number, tileY: number): string | null {
    const spawn = this.data.npcSpawns.find((s) => s.tileX === tileX && s.tileY === tileY);
    return spawn?.npcId ?? null;
  }

  getGroundTile(tileX: number, tileY: number): number {
    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) return 0;
    return this.data.ground[tileY][tileX];
  }

  getObjectTile(tileX: number, tileY: number): number {
    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) return 0;
    return this.data.objects[tileY][tileX];
  }

  getMapData(): TileMapData {
    return this.data;
  }
}
