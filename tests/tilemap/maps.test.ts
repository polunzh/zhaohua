import { describe, it, expect } from "vitest";
import { campusMap } from "../../src/tilemap/maps/campus";
import { classroomMap } from "../../src/tilemap/maps/classroom";
import { officeMap } from "../../src/tilemap/maps/office";
import type { TileMapData } from "../../src/tilemap/types";

function validateMap(map: TileMapData, name: string) {
  describe(name, () => {
    it("has correct dimensions", () => {
      expect(map.ground.length).toBe(map.height);
      expect(map.objects.length).toBe(map.height);
      expect(map.collision.length).toBe(map.height);
      for (let y = 0; y < map.height; y++) {
        expect(map.ground[y].length, `ground row ${y}`).toBe(map.width);
        expect(map.objects[y].length, `objects row ${y}`).toBe(map.width);
        expect(map.collision[y].length, `collision row ${y}`).toBe(map.width);
      }
    });

    it("has at least one exit", () => {
      expect(map.exits.length).toBeGreaterThan(0);
    });

    it("exits point to valid tiles", () => {
      for (const exit of map.exits) {
        expect(exit.tileX).toBeGreaterThanOrEqual(0);
        expect(exit.tileX).toBeLessThan(map.width);
        expect(exit.tileY).toBeGreaterThanOrEqual(0);
        expect(exit.tileY).toBeLessThan(map.height);
      }
    });

    it("has walkable areas", () => {
      let walkable = 0;
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          if (!map.collision[y][x]) walkable++;
        }
      }
      expect(walkable).toBeGreaterThan(0);
    });
  });
}

validateMap(campusMap, "Campus Map");
validateMap(classroomMap, "Classroom Map");
validateMap(officeMap, "Office Map");
