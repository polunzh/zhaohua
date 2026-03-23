import { describe, it, expect } from "vitest";
import { EventEngine } from "../../src/engine/events";

interface GameTime {
  date: string;
  hour: number;
  minute: number;
  season: string;
  period: string;
}

describe("EventEngine", () => {
  const makeGameTime = (overrides: Partial<GameTime> = {}): GameTime => ({
    date: "1994-09-15",
    hour: 9,
    minute: 0,
    season: "autumn",
    period: "morning",
    ...overrides,
  });

  it("selects a daily event for a school morning", () => {
    const engine = new EventEngine(42);
    const event = engine.selectEvent(makeGameTime(), []);
    expect(event).toBeDefined();
    expect(event!.type).toBe("daily");
  });

  it("returns null for night time", () => {
    const engine = new EventEngine(42);
    const event = engine.selectEvent(makeGameTime({ hour: 2, period: "night" }), []);
    expect(event).toBeNull();
  });

  it("triggers season event on matching date", () => {
    const engine = new EventEngine(42);
    const event = engine.selectEvent(makeGameTime({ date: "1994-09-01" }), []);
    expect(event).toBeDefined();
    expect(event!.type).toBe("seasonal");
    expect(event!.id).toBe("school-start");
  });

  it("does not repeat already-triggered events", () => {
    const engine = new EventEngine(42);
    const event = engine.selectEvent(makeGameTime({ date: "1994-09-01" }), ["school-start"]);
    if (event) expect(event.id).not.toBe("school-start");
  });

  it("produces deterministic results with same seed", () => {
    const engine1 = new EventEngine(123);
    const engine2 = new EventEngine(123);
    const gt = makeGameTime();
    const e1 = engine1.selectEvent(gt, []);
    const e2 = engine2.selectEvent(gt, []);
    expect(e1?.id).toBe(e2?.id);
  });

  // --- Location filtering tests ---

  it("event with location only triggers when player is at that location", () => {
    const engine = new EventEngine(42);
    // Try many seeds to ensure location-specific events never appear at wrong location
    for (let seed = 0; seed < 50; seed++) {
      const eng = new EventEngine(seed);
      const event = eng.selectEvent(makeGameTime(), [], undefined, "home");
      // If event has a location, it must match 'home'
      if (event && event.location) {
        expect(event.location).toBe("home");
      }
    }
  });

  it("event without location triggers anywhere", () => {
    const engine = new EventEngine(42);
    const event = engine.selectEvent(makeGameTime(), [], undefined, "some-random-place");
    // Events without location field should still be selectable
    if (event) {
      expect(event.location).toBeUndefined();
    }
  });

  it("location-specific event triggers at matching location", () => {
    // playground-flag is a morning event at playground
    // Try multiple seeds to find it
    let found = false;
    for (let seed = 0; seed < 200; seed++) {
      const eng = new EventEngine(seed);
      const event = eng.selectEvent(makeGameTime(), [], undefined, "playground");
      if (event && event.id === "playground-flag") {
        found = true;
        expect(event.location).toBe("playground");
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("playground-flag event does not trigger at office", () => {
    for (let seed = 0; seed < 200; seed++) {
      const eng = new EventEngine(seed);
      const event = eng.selectEvent(makeGameTime(), [], undefined, "office");
      if (event) {
        expect(event.id).not.toBe("playground-flag");
      }
    }
  });

  // --- Character filtering tests ---

  it("postman event only triggers for postman character", () => {
    let found = false;
    for (let seed = 0; seed < 200; seed++) {
      const eng = new EventEngine(seed);
      const event = eng.selectEvent(makeGameTime(), [], undefined, undefined, "postman");
      if (event && event.character === "postman") {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("postman event does not trigger for teacher character", () => {
    for (let seed = 0; seed < 200; seed++) {
      const eng = new EventEngine(seed);
      const event = eng.selectEvent(makeGameTime(), [], undefined, undefined, "teacher");
      if (event) {
        expect(event.character).not.toBe("postman");
      }
    }
  });

  // --- Affinity filtering tests ---

  it("event with minAffinity triggers when affinity is high enough", () => {
    // student-confide has minAffinity: 70
    let found = false;
    for (let seed = 0; seed < 500; seed++) {
      const eng = new EventEngine(seed);
      const event = eng.selectEvent(
        makeGameTime({ period: "afternoon" }),
        [],
        undefined,
        undefined,
        undefined,
        80,
      );
      if (event && event.id === "student-confide") {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("event with minAffinity does NOT trigger when affinity is too low", () => {
    for (let seed = 0; seed < 500; seed++) {
      const eng = new EventEngine(seed);
      const event = eng.selectEvent(
        makeGameTime({ period: "afternoon" }),
        [],
        undefined,
        undefined,
        undefined,
        50,
      );
      if (event) {
        expect(event.id).not.toBe("student-confide");
      }
    }
  });

  it("event with maxAffinity triggers when affinity is low enough", () => {
    // student-skip has maxAffinity: 30
    let found = false;
    for (let seed = 0; seed < 500; seed++) {
      const eng = new EventEngine(seed);
      const event = eng.selectEvent(
        makeGameTime({ period: "morning" }),
        [],
        undefined,
        undefined,
        undefined,
        20,
      );
      if (event && event.id === "student-skip") {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("affinity-gated events do not trigger when affinity is not provided", () => {
    for (let seed = 0; seed < 500; seed++) {
      const eng = new EventEngine(seed);
      const event = eng.selectEvent(makeGameTime({ period: "afternoon" }), []);
      if (event) {
        expect(event.minAffinity).toBeUndefined();
        expect(event.maxAffinity).toBeUndefined();
      }
    }
  });

  it("cross-character event (no character filter) triggers for both postman and teacher", () => {
    // postman-at-school has no character field, location=playground, period=morning
    let foundForPostman = false;
    let foundForTeacher = false;
    for (let seed = 0; seed < 500; seed++) {
      const engP = new EventEngine(seed);
      const eventP = engP.selectEvent(makeGameTime(), [], undefined, "playground", "postman");
      if (eventP && eventP.id === "postman-at-school") {
        foundForPostman = true;
      }
      const engT = new EventEngine(seed);
      const eventT = engT.selectEvent(makeGameTime(), [], undefined, "playground", "teacher");
      if (eventT && eventT.id === "postman-at-school") {
        foundForTeacher = true;
      }
      if (foundForPostman && foundForTeacher) break;
    }
    expect(foundForPostman).toBe(true);
    expect(foundForTeacher).toBe(true);
  });
});
