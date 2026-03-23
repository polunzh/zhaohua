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
});
