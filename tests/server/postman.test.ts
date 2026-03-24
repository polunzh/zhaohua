import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import {
  saveWorldState,
  getWorldState,
  addMail,
  getPendingMail,
  updateMailStatus,
} from "../../server/db/queries";
import { handleSwitch } from "../../server/handlers/switch.post";

describe("Postman", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
    saveWorldState(db, {
      gameDate: "1994-09-15",
      weather: "sunny",
      season: "autumn",
      lastVisit: new Date().toISOString(),
      calendarOffset: 0,
      randomSeed: 42,
      anchorRealDate: new Date().toISOString(),
      location: "classroom",
      activeCharacter: "teacher",
    });
  });
  afterEach(() => db.close());

  it("switches to postman", () => {
    const result = handleSwitch(db, "postman");
    expect(result.character).toBe("postman");
    expect(getWorldState(db)!.activeCharacter).toBe("postman");
    expect(getWorldState(db)!.location).toBe("post-office");
  });

  it("switches back to teacher", () => {
    handleSwitch(db, "postman");
    const result = handleSwitch(db, "teacher");
    expect(result.location).toBe("classroom");
  });

  it("creates and retrieves mail", () => {
    addMail(db, {
      type: "letter",
      sender: "远方的儿子",
      recipientNpc: "parent-gao",
      origin: "city",
      destination: "villager-house",
      content: "一封家信",
    });
    const pending = getPendingMail(db);
    expect(pending).toHaveLength(1);
    expect(pending[0].sender).toBe("远方的儿子");
  });

  it("updates mail status", () => {
    addMail(db, {
      type: "letter",
      sender: "报社",
      recipientNpc: "parent-gao",
      origin: "town",
      destination: "villager-house",
      content: "报纸",
    });
    const pending = getPendingMail(db);
    updateMailStatus(db, pending[0].id, "delivered", "1994-09-15");
    expect(getPendingMail(db)).toHaveLength(0);
  });
});
