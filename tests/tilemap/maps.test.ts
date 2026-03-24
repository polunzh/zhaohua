import { describe, it, expect } from "vitest";
import { classroomMap } from "../../src/tilemap/maps/classroom";
import { officeMap } from "../../src/tilemap/maps/office";
import { playgroundMap } from "../../src/tilemap/maps/playground";
import { flowerPoolMap } from "../../src/tilemap/maps/flower-pool";
import { waterTowerMap } from "../../src/tilemap/maps/water-tower";
import { villageRoadMap } from "../../src/tilemap/maps/village-road";
import { farmlandMap } from "../../src/tilemap/maps/farmland";
import { villagerHouseMap } from "../../src/tilemap/maps/villager-house";
import { townRoadMap } from "../../src/tilemap/maps/town-road";
import { postOfficeMap } from "../../src/tilemap/maps/post-office";
import { marketMap } from "../../src/tilemap/maps/market";
import { clinicMap } from "../../src/tilemap/maps/clinic";
import { homeMap } from "../../src/tilemap/maps/home";
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

validateMap(classroomMap, "Classroom Map");
validateMap(officeMap, "Office Map");
validateMap(playgroundMap, "Playground Map");
validateMap(flowerPoolMap, "Flower Pool Map");
validateMap(waterTowerMap, "Water Tower Map");
validateMap(villageRoadMap, "Village Road Map");
validateMap(farmlandMap, "Farmland Map");
validateMap(villagerHouseMap, "Villager House Map");
validateMap(townRoadMap, "Town Road Map");
validateMap(postOfficeMap, "Post Office Map");
validateMap(marketMap, "Market Map");
validateMap(clinicMap, "Clinic Map");
validateMap(homeMap, "Home Map");
