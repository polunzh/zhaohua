import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import {
  savePlayerChoice,
  updateNpcAffinity,
  updateNpcMood,
  saveNpcState,
  getNpcState,
} from "../../server/db/queries";
import { handleChoice } from "../../server/handlers/choice.post";

describe("Choice system", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
  });

  afterEach(() => db.close());

  it("saves a player choice to DB", () => {
    savePlayerChoice(db, {
      gameDate: "1994-09-15",
      gameTime: "08:30",
      choiceType: "npc-interaction",
      choiceValue: "encourage",
      context: "student-xiaoming",
    });

    const rows = db.prepare("SELECT * FROM player_choices").all() as {
      choice_value: string;
      context: string;
    }[];
    expect(rows).toHaveLength(1);
    expect(rows[0].choice_value).toBe("encourage");
    expect(rows[0].context).toBe("student-xiaoming");
  });

  it("updates NPC affinity with encourage (+10)", () => {
    saveNpcState(db, {
      npcId: "student-xiaoming",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });

    updateNpcAffinity(db, "student-xiaoming", 10);

    const state = getNpcState(db, "student-xiaoming");
    expect(state!.affinity).toBe(60);
  });

  it("updates NPC affinity with criticize (-5)", () => {
    saveNpcState(db, {
      npcId: "student-xiaoming",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });

    updateNpcAffinity(db, "student-xiaoming", -5);

    const state = getNpcState(db, "student-xiaoming");
    expect(state!.affinity).toBe(45);
  });

  it("updates NPC mood", () => {
    saveNpcState(db, {
      npcId: "student-xiaoming",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });

    updateNpcMood(db, "student-xiaoming", "happy");

    const state = getNpcState(db, "student-xiaoming");
    expect(state!.mood).toBe("happy");
  });

  it("handleChoice with encourage updates affinity and mood", () => {
    const result = handleChoice(db, {
      npcId: "student-xiaoming",
      choiceId: "encourage",
      gameDate: "1994-09-15",
      gameTime: "08:30",
    });

    expect(result.ok).toBe(true);
    expect(result.effect.affinityDelta).toBe(10);
    expect(result.effect.mood).toBe("happy");

    const state = getNpcState(db, "student-xiaoming");
    expect(state!.affinity).toBe(60);
    expect(state!.mood).toBe("happy");
  });

  it("handleChoice with criticize updates affinity and mood", () => {
    saveNpcState(db, {
      npcId: "student-xiaoming",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });

    const result = handleChoice(db, {
      npcId: "student-xiaoming",
      choiceId: "criticize",
      gameDate: "1994-09-15",
      gameTime: "08:30",
    });

    expect(result.ok).toBe(true);
    expect(result.effect.affinityDelta).toBe(-5);
    expect(result.effect.mood).toBe("upset");

    const state = getNpcState(db, "student-xiaoming");
    expect(state!.affinity).toBe(45);
    expect(state!.mood).toBe("upset");
  });
});
