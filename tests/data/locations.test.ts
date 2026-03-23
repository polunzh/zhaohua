import { describe, it, expect } from "vitest";
import { locations, getLocation, getConnectedLocations } from "../../src/data/locations";

describe("Locations", () => {
  it("all locations have unique IDs", () => {
    const ids = locations.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all connections are bidirectional", () => {
    for (const loc of locations) {
      for (const connId of loc.connections) {
        const connected = getLocation(connId);
        expect(connected, `${connId} not found`).toBeDefined();
        expect(connected!.connections, `${connId} does not connect back to ${loc.id}`).toContain(
          loc.id,
        );
      }
    }
  });

  it("classroom connects to playground, office, flower-pool", () => {
    const conns = getConnectedLocations("classroom");
    const ids = conns.map((c) => c.id);
    expect(ids).toContain("playground");
    expect(ids).toContain("office");
    expect(ids).toContain("flower-pool");
  });

  it("graph is connected (can reach all locations from classroom)", () => {
    const visited = new Set<string>();
    const queue = ["classroom"];
    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      const loc = getLocation(id)!;
      queue.push(...loc.connections.filter((c) => !visited.has(c)));
    }
    expect(visited.size).toBe(locations.length);
  });
});
