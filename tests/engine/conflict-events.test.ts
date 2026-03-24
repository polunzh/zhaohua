import { describe, it, expect } from "vitest";
import { checkConflictEvent, conflictEvents } from "../../src/data/conflict-events";

describe("Conflict Events", () => {
  it("returns null when hash does not produce a trigger", () => {
    // Try several dates; most should not trigger (80% chance of null)
    let nullCount = 0;
    for (let d = 1; d <= 20; d++) {
      const date = `1994-10-${String(d).padStart(2, "0")}`;
      const result = checkConflictEvent(date, "autumn", {});
      if (result === null) nullCount++;
    }
    // Roughly 80% should be null — allow some variance
    expect(nullCount).toBeGreaterThanOrEqual(10);
    expect(nullCount).toBeLessThanOrEqual(20);
  });

  it("returns a conflict event on some date", () => {
    // Try many dates until we find one that triggers
    let found = false;
    for (let d = 1; d <= 60; d++) {
      const date = `1994-10-${String(d).padStart(2, "0")}`;
      const result = checkConflictEvent(date, "autumn", {});
      if (result !== null) {
        found = true;
        expect(result.id).toBeTruthy();
        expect(result.title).toBeTruthy();
        expect(result.choices.length).toBeGreaterThan(0);
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("respects minDaysBetween cooldown", () => {
    // Find a date that triggers student-fight
    const fightEvent = conflictEvents.find((e) => e.id === "student-fight")!;
    // If student-fight was triggered 5 days ago (minDaysBetween=14), it should be ineligible
    const lastDates = { "student-fight": "1994-10-10" };
    for (let d = 11; d <= 23; d++) {
      const date = `1994-10-${String(d).padStart(2, "0")}`;
      const result = checkConflictEvent(date, "autumn", lastDates);
      if (result !== null) {
        expect(result.id).not.toBe("student-fight");
      }
    }
  });

  it("filters by season for winter-only events", () => {
    const winterEvent = conflictEvents.find((e) => e.id === "broken-window")!;
    expect(winterEvent.seasons).toContain("winter");

    // In summer, broken-window should never appear
    for (let d = 1; d <= 60; d++) {
      const date = `1994-06-${String(d).padStart(2, "0")}`;
      const result = checkConflictEvent(date, "summer", {});
      if (result !== null) {
        expect(result.id).not.toBe("broken-window");
      }
    }
  });

  it("all conflict events have valid structure", () => {
    for (const e of conflictEvents) {
      expect(e.id).toBeTruthy();
      expect(e.title).toBeTruthy();
      expect(e.description).toBeTruthy();
      expect(e.choices.length).toBeGreaterThan(0);
      expect(e.minDaysBetween).toBeGreaterThan(0);
      for (const c of e.choices) {
        expect(c.id).toBeTruthy();
        expect(c.label).toBeTruthy();
        expect(c.consequence).toBeTruthy();
        expect(c.affinityChanges).toBeDefined();
      }
    }
  });
});
