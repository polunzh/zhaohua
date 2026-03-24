import { describe, it, expect } from "vitest";
import { checkDiscovery, discoveries, type Discovery } from "../../src/data/discoveries";

describe("Discoveries — R9", () => {
  it("exports a non-empty discoveries list", () => {
    expect(discoveries.length).toBeGreaterThan(0);
  });

  it("each discovery has required fields", () => {
    for (const d of discoveries) {
      expect(d.id).toBeTruthy();
      expect(d.location).toBeTruthy();
      expect(d.period).toBeTruthy();
      expect(d.description).toBeTruthy();
      expect(d.reward).toBeDefined();
      expect(["item", "affinity"]).toContain(d.reward.type);
      expect(d.reward.amount).toBeGreaterThan(0);
    }
  });

  it("item rewards have itemType", () => {
    const itemRewards = discoveries.filter((d) => d.reward.type === "item");
    expect(itemRewards.length).toBeGreaterThan(0);
    for (const d of itemRewards) {
      expect(d.reward.itemType).toBeTruthy();
    }
  });

  it("affinity rewards have npcId", () => {
    const affinityRewards = discoveries.filter((d) => d.reward.type === "affinity");
    expect(affinityRewards.length).toBeGreaterThan(0);
    for (const d of affinityRewards) {
      expect(d.reward.npcId).toBeTruthy();
    }
  });

  it("finds a discovery matching location + period", () => {
    const result = checkDiscovery("playground", "evening", "autumn", []);
    expect(result).not.toBeNull();
    expect(result!.id).toBe("sunset-playground");
  });

  it("respects season filter — spring flower only in spring", () => {
    const spring = checkDiscovery("flower-pool", "morning", "spring", []);
    expect(spring).not.toBeNull();
    expect(spring!.id).toBe("morning-flower");

    const autumn = checkDiscovery("flower-pool", "morning", "autumn", []);
    // morning-flower requires spring, so shouldn't match in autumn
    expect(autumn?.id).not.toBe("morning-flower");
  });

  it("returns null when no match", () => {
    const result = checkDiscovery("office", "morning", "spring", []);
    expect(result).toBeNull();
  });

  it("skips already-found discoveries", () => {
    const first = checkDiscovery("playground", "evening", "autumn", []);
    expect(first).not.toBeNull();

    const second = checkDiscovery("playground", "evening", "autumn", [first!.id]);
    expect(second).toBeNull();
  });

  it("season-less discoveries match any season", () => {
    const r1 = checkDiscovery("playground", "evening", "spring", []);
    const r2 = checkDiscovery("playground", "evening", "winter", []);
    expect(r1?.id).toBe("sunset-playground");
    expect(r2?.id).toBe("sunset-playground");
  });

  it("winter-stove only matches winter morning classroom", () => {
    const winter = checkDiscovery("classroom", "morning", "winter", []);
    expect(winter).not.toBeNull();
    expect(winter!.id).toBe("winter-stove");

    const summer = checkDiscovery("classroom", "morning", "summer", []);
    expect(summer?.id).not.toBe("winter-stove");
  });
});
