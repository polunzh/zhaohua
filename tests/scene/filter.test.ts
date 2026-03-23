import { describe, it, expect } from "vitest";
import { getNostalgiaFilterCSS, applyColorGrading } from "../../src/scene/filter";

describe("Nostalgic Filter", () => {
  it("returns CSS filter string", () => {
    const css = getNostalgiaFilterCSS();
    expect(css).toContain("sepia");
    expect(css).toContain("saturate");
  });

  it("applies color grading to pixel data", () => {
    const data = new Uint8ClampedArray([255, 255, 255, 255, 0, 0, 0, 255]);
    applyColorGrading(data);
    expect(data[0]).toBeGreaterThan(data[2]);
    expect(data[4]).toBeGreaterThan(0);
    expect(data[5]).toBeGreaterThan(0);
  });
});
