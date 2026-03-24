import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import { getEnergy, useEnergy } from "../../server/db/queries";

describe("Energy system", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
  });

  afterEach(() => db.close());

  it("starts with 5 energy", () => {
    const energy = getEnergy(db);
    expect(energy.remaining).toBe(5);
    expect(energy.max).toBe(5);
  });

  it("useEnergy decrements", () => {
    const used = useEnergy(db, "1994-09-15");
    expect(used).toBe(true);

    const energy = getEnergy(db);
    expect(energy.remaining).toBe(4);
  });

  it("useEnergy resets on new day", () => {
    // Use all energy on day 1
    for (let i = 0; i < 5; i++) {
      useEnergy(db, "1994-09-15");
    }
    expect(getEnergy(db).remaining).toBe(0);

    // New day — should reset
    const used = useEnergy(db, "1994-09-16");
    expect(used).toBe(true);
    expect(getEnergy(db).remaining).toBe(4);
  });

  it("useEnergy returns false when empty", () => {
    for (let i = 0; i < 5; i++) {
      expect(useEnergy(db, "1994-09-15")).toBe(true);
    }
    // 6th attempt should fail
    expect(useEnergy(db, "1994-09-15")).toBe(false);
    expect(getEnergy(db).remaining).toBe(0);
  });
});
