import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import { saveRelationship, getRelationship, getRelationships } from "../../server/db/queries";

describe("Relationships", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
  });
  afterEach(() => db.close());

  it("saves and reads relationship", () => {
    saveRelationship(db, {
      npcA: "student-zhiqiang",
      npcB: "student-xiuqin",
      type: "friend",
      strength: 70,
    });
    const rel = getRelationship(db, "student-zhiqiang", "student-xiuqin");
    expect(rel).toBeDefined();
    expect(rel!.type).toBe("friend");
    expect(rel!.strength).toBe(70);
  });

  it("gets all relationships for NPC", () => {
    saveRelationship(db, {
      npcA: "student-zhiqiang",
      npcB: "student-xiuqin",
      type: "friend",
      strength: 70,
    });
    saveRelationship(db, {
      npcA: "student-zhiqiang",
      npcB: "student-jianjun",
      type: "rival",
      strength: 30,
    });
    const rels = getRelationships(db, "student-zhiqiang");
    expect(rels).toHaveLength(2);
  });
});
