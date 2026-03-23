import { describe, it, expect } from "vitest";
import { TimeEngine } from "../../src/engine/time";

describe("TimeEngine", () => {
  const anchor = "2026-03-23T00:00:00Z";

  it("returns game time matching real time when offset is 0", () => {
    const engine = new TimeEngine({
      calendarOffset: 0,
      gameStartDate: "1994-09-01",
      anchorRealDate: anchor,
    });
    const now = new Date("2026-03-23T08:00:00Z");
    const gameTime = engine.getGameTime(now);
    expect(gameTime.hour).toBe(8);
    expect(gameTime.minute).toBe(0);
  });

  it("applies calendar offset for skip-day", () => {
    const engine = new TimeEngine({
      calendarOffset: 0,
      gameStartDate: "1994-09-01",
      anchorRealDate: anchor,
    });
    engine.skipDays(1);
    expect(engine.calendarOffset).toBe(1);
  });

  it("applies calendar offset for skip-week", () => {
    const engine = new TimeEngine({
      calendarOffset: 0,
      gameStartDate: "1994-09-01",
      anchorRealDate: anchor,
    });
    engine.skipDays(7);
    expect(engine.calendarOffset).toBe(7);
  });

  it("calculates ticks needed for catch-up", () => {
    const engine = new TimeEngine({
      calendarOffset: 0,
      gameStartDate: "1994-09-01",
      anchorRealDate: anchor,
    });
    const lastVisit = new Date("2026-03-23T08:00:00Z");
    const now = new Date("2026-03-23T10:30:00Z");
    const ticks = engine.getTickCount(lastVisit, now);
    expect(ticks).toBe(10);
  });

  it("caps ticks at coarse granularity for long absence (>7 days)", () => {
    const engine = new TimeEngine({
      calendarOffset: 0,
      gameStartDate: "1994-09-01",
      anchorRealDate: anchor,
    });
    const lastVisit = new Date("2026-03-01T08:00:00Z");
    const now = new Date("2026-03-23T08:00:00Z");
    const ticks = engine.getTickCount(lastVisit, now);
    expect(ticks).toBe(22);
    expect(engine.isCoarseMode(lastVisit, now)).toBe(true);
  });

  it("determines season from game date", () => {
    const engine = new TimeEngine({
      calendarOffset: 0,
      gameStartDate: "1994-09-01",
      anchorRealDate: anchor,
    });
    expect(engine.getSeason("1994-09-01")).toBe("autumn");
    expect(engine.getSeason("1994-12-15")).toBe("winter");
    expect(engine.getSeason("1995-03-20")).toBe("spring");
    expect(engine.getSeason("1995-07-10")).toBe("summer");
  });

  it("determines time-of-day period", () => {
    expect(TimeEngine.getPeriod(7)).toBe("morning");
    expect(TimeEngine.getPeriod(10)).toBe("morning");
    expect(TimeEngine.getPeriod(12)).toBe("afternoon");
    expect(TimeEngine.getPeriod(18)).toBe("evening");
    expect(TimeEngine.getPeriod(22)).toBe("night");
    expect(TimeEngine.getPeriod(2)).toBe("night");
  });
});
