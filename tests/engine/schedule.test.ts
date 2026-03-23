import { describe, it, expect } from "vitest";
import { getScheduleEntry } from "../../src/engine/schedule";
import { npcs } from "../../src/data/npcs";

describe("NPC Schedule", () => {
  it("student is at home before school", () => {
    const entry = getScheduleEntry(npcs[0], 6, 30, "weekday");
    expect(entry.location).toBe("home");
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
      expect(entry.location).toBe("home");
    }
  });
});
