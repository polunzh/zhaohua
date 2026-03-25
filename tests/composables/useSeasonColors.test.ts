import { describe, it, expect } from "vitest";
import { getSceneColors } from "../../src/composables/useSeasonColors";

describe("useSeasonColors", () => {
  it("returns green grass for summer", () => {
    const colors = getSceneColors("summer");
    expect(colors.grass).toBe("#7A9178"); // from summerPalette.grass.base
  });

  it("returns brown grass for autumn", () => {
    const colors = getSceneColors("autumn");
    expect(colors.grass).not.toBe("#7A9178");
  });

  it("returns white-ish grass for winter (snow covered)", () => {
    const colors = getSceneColors("winter");
    expect(colors.showSnow).toBe(true);
  });

  it("returns bloom flower state for summer", () => {
    const colors = getSceneColors("summer");
    expect(colors.flowerState).toBe("bloom");
  });

  it("returns bud flower state for spring", () => {
    const colors = getSceneColors("spring");
    expect(colors.flowerState).toBe("bud");
  });

  it("returns wilt flower state for autumn", () => {
    const colors = getSceneColors("autumn");
    expect(colors.flowerState).toBe("wilt");
  });

  it("returns bare flower state for winter", () => {
    const colors = getSceneColors("winter");
    expect(colors.flowerState).toBe("bare");
  });

  it("returns green tree leaf color for summer", () => {
    const colors = getSceneColors("summer");
    expect(colors.treeLeaf).toMatch(/#[a-fA-F0-9]{6}/);
  });

  it("returns orange-brown tree leaf color for autumn", () => {
    const colors = getSceneColors("autumn");
    expect(colors.treeLeaf).not.toBe(getSceneColors("summer").treeLeaf);
  });

  it("returns showBareTree true for winter", () => {
    const colors = getSceneColors("winter");
    expect(colors.showBareTree).toBe(true);
  });

  it("returns showBareTree false for summer", () => {
    const colors = getSceneColors("summer");
    expect(colors.showBareTree).toBe(false);
  });

  it("sky color changes by season", () => {
    const summer = getSceneColors("summer");
    const winter = getSceneColors("winter");
    expect(summer.sky).not.toBe(winter.sky);
  });
});

describe("flower pool seasonal data", () => {
  it("summer has 5 flower colors", () => {
    const colors = getSceneColors("summer");
    expect(colors.flowerColors.length).toBeGreaterThanOrEqual(5);
  });

  it("winter has no flower colors", () => {
    const colors = getSceneColors("winter");
    expect(colors.flowerColors).toHaveLength(0);
  });

  it("spring has muted flower colors (buds)", () => {
    const colors = getSceneColors("spring");
    expect(colors.flowerColors.length).toBeGreaterThan(0);
    expect(colors.flowerState).toBe("bud");
  });

  it("autumn has faded flower colors", () => {
    const colors = getSceneColors("autumn");
    expect(colors.flowerColors.length).toBeGreaterThan(0);
    expect(colors.flowerState).toBe("wilt");
  });
});

describe("scene seasonal consistency", () => {
  it("winter: showBareTree true and showSnow true", () => {
    const c = getSceneColors("winter");
    expect(c.showBareTree).toBe(true);
    expect(c.showSnow).toBe(true);
  });

  it("summer: showBareTree false and showSnow false", () => {
    const c = getSceneColors("summer");
    expect(c.showBareTree).toBe(false);
    expect(c.showSnow).toBe(false);
  });

  it("all seasons return valid hex grass color", () => {
    for (const s of ["spring", "summer", "autumn", "winter"]) {
      expect(getSceneColors(s).grass).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("all seasons return valid hex treeLeaf color", () => {
    for (const s of ["spring", "summer", "autumn", "winter"]) {
      expect(getSceneColors(s).treeLeaf).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it("all seasons return valid hex sky color", () => {
    for (const s of ["spring", "summer", "autumn", "winter"]) {
      expect(getSceneColors(s).sky).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
