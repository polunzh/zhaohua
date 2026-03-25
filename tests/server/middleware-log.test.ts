import { describe, it, expect } from "vitest";
import { formatRequest } from "../../server/utils/format-request";

describe("Request Log Formatting", () => {
  it("returns readable string with method, path, status, and timing", () => {
    const result = formatRequest("POST", "/api/dialogue", 200, 42);
    expect(result).toContain("POST");
    expect(result).toContain("/api/dialogue");
    expect(result).toContain("200");
    expect(result).toContain("42ms");
  });

  it("handles missing status gracefully", () => {
    const result = formatRequest("GET", "/api/world", undefined, 10);
    expect(result).toContain("GET");
    expect(result).toContain("/api/world");
    expect(result).toContain("---");
    expect(result).toContain("10ms");
  });

  it("formats 4xx/5xx status codes correctly", () => {
    const result = formatRequest("POST", "/api/choice", 500, 88);
    expect(result).toContain("500");
    expect(result).toContain("88ms");
  });
});
