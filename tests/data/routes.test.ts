import { describe, it, expect } from "vitest";
import { getPostmanStop, postmanRoute } from "../../src/data/routes";

describe("Postman Route", () => {
  it("starts at post office before 8am", () => {
    expect(getPostmanStop(7, 30).locationId).toBe("post-office");
  });
  it("is at post office at 8am", () => {
    expect(getPostmanStop(8, 0).locationId).toBe("post-office");
  });
  it("returns to post office after route", () => {
    expect(getPostmanStop(17, 0).locationId).toBe("post-office");
  });
});
