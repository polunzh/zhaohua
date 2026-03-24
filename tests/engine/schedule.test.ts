import { describe, it, expect } from "vitest";
import { getScheduleEntry } from "../../src/engine/schedule";
import { npcs } from "../../src/data/npcs";

describe("NPC Schedule", () => {
  it("student is at their own home before school", () => {
    const entry = getScheduleEntry(npcs[0], 6, 30, "weekday");
    expect(entry.location).toMatch(/^home-/);
  });

  it("student is on road to school at 7:15", () => {
    const entry = getScheduleEntry(npcs[0], 7, 15, "weekday");
    expect(entry.location).toBe("road");
    expect(entry.activity).toBe("walking-to-school");
  });

  it("student is in classroom during class", () => {
    const entry = getScheduleEntry(npcs[0], 9, 0, "weekday");
    expect(entry.location).toBe("classroom");
    expect(entry.activity).toBe("in-class");
  });

  it("student is at water tower during break in summer", () => {
    const entry = getScheduleEntry(npcs[0], 10, 0, "weekday", "summer");
    expect(entry.location).toBe("water-tower");
    expect(entry.activity).toBe("drinking-water");
  });

  it("principal is in office during school hours", () => {
    const principal = npcs.find((n) => n.role === "principal")!;
    const entry = getScheduleEntry(principal, 9, 0, "weekday");
    expect(entry.location).toBe("office");
  });

  it("everyone is at home at night", () => {
    for (const npc of npcs) {
      const entry = getScheduleEntry(npc, 22, 0, "weekday");
      // Students have specific homes (home-zhang etc), others go to villager-house
      if (npc.role === "student") {
        expect(entry.location).toMatch(/^home-/);
      } else {
        expect(entry.location).toBe("villager-house");
      }
    }
  });

  // --- New role schedule tests ---

  it("teacher-colleague is in classroom during class hours", () => {
    const colleague = npcs.find((n) => n.role === "teacher-colleague")!;
    expect(colleague).toBeDefined();
    const entry = getScheduleEntry(colleague, 9, 0, "weekday");
    expect(entry.location).toBe("classroom");
    expect(entry.activity).toBe("co-teaching");
  });

  it("teacher-colleague is in office during break", () => {
    const colleague = npcs.find((n) => n.role === "teacher-colleague")!;
    const entry = getScheduleEntry(colleague, 10, 0, "weekday");
    expect(entry.location).toBe("office");
    expect(entry.activity).toBe("break");
  });

  it("parent is at farmland during farming months", () => {
    const parent = npcs.find((n) => n.role === "parent")!;
    expect(parent).toBeDefined();
    // May is a farming month (Apr-Jun)
    const entry = getScheduleEntry(parent, 10, 0, "weekday", "spring", 5);
    expect(entry.location).toBe("farmland");
  });

  it("parent may visit school in off-months afternoon", () => {
    const parent = npcs.find((n) => n.role === "parent")!;
    // December is an off-month, afternoon time
    const entry = getScheduleEntry(parent, 15, 0, "weekday", "winter", 12);
    // In off-months afternoon, parent could be at classroom/office or home
    expect(["classroom", "office", "home"]).toContain(entry.location);
  });

  it("shopkeeper is at market during business hours", () => {
    const shopkeeper = npcs.find((n) => n.role === "shopkeeper")!;
    expect(shopkeeper).toBeDefined();
    const entry = getScheduleEntry(shopkeeper, 12, 0, "weekday");
    expect(entry.location).toBe("market");
    expect(entry.activity).toBe("selling");
  });

  it("shopkeeper is at home before business hours", () => {
    const shopkeeper = npcs.find((n) => n.role === "shopkeeper")!;
    const entry = getScheduleEntry(shopkeeper, 6, 0, "weekday");
    expect(entry.location).toBe("villager-house");
  });

  it("shopkeeper is at home after business hours", () => {
    const shopkeeper = npcs.find((n) => n.role === "shopkeeper")!;
    const entry = getScheduleEntry(shopkeeper, 19, 0, "weekday");
    expect(entry.location).toBe("villager-house");
  });
});
