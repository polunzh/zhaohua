import { describe, it, expect } from "vitest";
import { determineWeather } from "../../src/engine/weather";

describe("Weather", () => {
  it("generates weather deterministically with seed", () => {
    const w1 = determineWeather("autumn", 42);
    const w2 = determineWeather("autumn", 42);
    expect(w1).toBe(w2);
  });

  it("generates valid weather for each season", () => {
    const springWeathers = ["sunny", "cloudy", "rainy"];
    const winterWeathers = ["sunny", "cloudy", "snowy", "windy"];
    expect(springWeathers).toContain(determineWeather("spring", 1));
    expect(winterWeathers).toContain(determineWeather("winter", 1));
  });
});
