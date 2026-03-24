import { describe, it, expect } from "vitest";
import { checkGift, giftTemplates } from "../../src/data/gifts";

describe("Gift System", () => {
  it("returns null for low affinity", () => {
    expect(checkGift("student", 30, 1)).toBeNull();
  });

  it("returns gift for high affinity when lucky", () => {
    // Try many seeds to find one that triggers
    let found = false;
    for (let seed = 0; seed < 100; seed++) {
      if (checkGift("student", 80, seed) !== null) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("returns null for unknown role", () => {
    expect(checkGift("unknown-role", 100, 0)).toBeNull();
  });

  it("all templates have valid roles", () => {
    const validRoles = ["student", "principal", "parent", "shopkeeper", "postman"];
    for (const t of giftTemplates) {
      for (const r of t.fromRoles) {
        expect(validRoles).toContain(r);
      }
    }
  });
});
