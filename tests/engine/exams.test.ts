import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { initSchema } from "../../server/db/schema";
import { saveWorldState, saveNpcState } from "../../server/db/queries";
import { runExams } from "../../server/engine/exams";

describe("Exam System", () => {
  let db: Database.Database;
  beforeEach(() => {
    db = new Database(":memory:");
    initSchema(db);
    saveWorldState(db, {
      gameDate: "1995-01-15",
      weather: "sunny",
      season: "winter",
      lastVisit: new Date().toISOString(),
      calendarOffset: 0,
      randomSeed: 42,
      anchorRealDate: new Date().toISOString(),
      location: "classroom",
      activeCharacter: "teacher",
    });
  });
  afterEach(() => db.close());

  it("returns empty on non-exam months", () => {
    const results = runExams(db, "1994-10-15");
    expect(results).toEqual([]);
  });

  it("returns exam results on month 1", () => {
    // Set up student NPC states
    saveNpcState(db, {
      npcId: "student-zhang-wei",
      location: "classroom",
      mood: "neutral",
      affinity: 60,
    });
    saveNpcState(db, {
      npcId: "student-wang-fang",
      location: "classroom",
      mood: "neutral",
      affinity: 80,
    });
    saveNpcState(db, {
      npcId: "student-li-lei",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });
    saveNpcState(db, {
      npcId: "student-zhao-na",
      location: "classroom",
      mood: "neutral",
      affinity: 45,
    });
    saveNpcState(db, {
      npcId: "student-zhu-peng",
      location: "classroom",
      mood: "neutral",
      affinity: 70,
    });

    const results = runExams(db, "1995-01-15");
    expect(results.length).toBe(5);
    for (const r of results) {
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(100);
      expect(["优", "良", "中", "差"]).toContain(r.grade);
      expect(["进步", "退步", "持平"]).toContain(r.change);
    }
  });

  it("returns exam results on month 7", () => {
    saveNpcState(db, {
      npcId: "student-zhang-wei",
      location: "classroom",
      mood: "neutral",
      affinity: 55,
    });
    saveNpcState(db, {
      npcId: "student-wang-fang",
      location: "classroom",
      mood: "neutral",
      affinity: 55,
    });
    saveNpcState(db, {
      npcId: "student-li-lei",
      location: "classroom",
      mood: "neutral",
      affinity: 55,
    });
    saveNpcState(db, {
      npcId: "student-zhao-na",
      location: "classroom",
      mood: "neutral",
      affinity: 55,
    });
    saveNpcState(db, {
      npcId: "student-zhu-peng",
      location: "classroom",
      mood: "neutral",
      affinity: 55,
    });

    const results = runExams(db, "1995-07-01");
    expect(results.length).toBe(5);
  });

  it("higher affinity produces generally higher scores", () => {
    // High affinity student
    saveNpcState(db, {
      npcId: "student-zhang-wei",
      location: "classroom",
      mood: "neutral",
      affinity: 90,
    });
    // Low affinity student
    saveNpcState(db, {
      npcId: "student-wang-fang",
      location: "classroom",
      mood: "neutral",
      affinity: 10,
    });
    saveNpcState(db, {
      npcId: "student-li-lei",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });
    saveNpcState(db, {
      npcId: "student-zhao-na",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });
    saveNpcState(db, {
      npcId: "student-zhu-peng",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });

    const results = runExams(db, "1995-01-15");
    const zhangWei = results.find((r) => r.npcId === "student-zhang-wei")!;
    const wangFang = results.find((r) => r.npcId === "student-wang-fang")!;
    // High affinity student should score higher (affinity * 0.4 = 36 vs 4, difference of 32)
    // Random factor is only -10 to +10, so this should hold
    expect(zhangWei.score).toBeGreaterThan(wangFang.score);
  });

  it("does not duplicate exam results on same date", () => {
    saveNpcState(db, {
      npcId: "student-zhang-wei",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });
    saveNpcState(db, {
      npcId: "student-wang-fang",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });
    saveNpcState(db, {
      npcId: "student-li-lei",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });
    saveNpcState(db, {
      npcId: "student-zhao-na",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });
    saveNpcState(db, {
      npcId: "student-zhu-peng",
      location: "classroom",
      mood: "neutral",
      affinity: 50,
    });

    const results1 = runExams(db, "1995-01-15");
    expect(results1.length).toBe(5);

    const results2 = runExams(db, "1995-01-15");
    expect(results2.length).toBe(0);
  });

  it("detects score improvement between exams", () => {
    // First exam with low affinity
    saveNpcState(db, {
      npcId: "student-zhang-wei",
      location: "classroom",
      mood: "neutral",
      affinity: 20,
    });
    saveNpcState(db, {
      npcId: "student-wang-fang",
      location: "classroom",
      mood: "neutral",
      affinity: 20,
    });
    saveNpcState(db, {
      npcId: "student-li-lei",
      location: "classroom",
      mood: "neutral",
      affinity: 20,
    });
    saveNpcState(db, {
      npcId: "student-zhao-na",
      location: "classroom",
      mood: "neutral",
      affinity: 20,
    });
    saveNpcState(db, {
      npcId: "student-zhu-peng",
      location: "classroom",
      mood: "neutral",
      affinity: 20,
    });

    runExams(db, "1995-01-15");

    // Now greatly increase affinity for second exam
    saveNpcState(db, {
      npcId: "student-zhang-wei",
      location: "classroom",
      mood: "neutral",
      affinity: 95,
    });
    saveNpcState(db, {
      npcId: "student-wang-fang",
      location: "classroom",
      mood: "neutral",
      affinity: 95,
    });
    saveNpcState(db, {
      npcId: "student-li-lei",
      location: "classroom",
      mood: "neutral",
      affinity: 95,
    });
    saveNpcState(db, {
      npcId: "student-zhao-na",
      location: "classroom",
      mood: "neutral",
      affinity: 95,
    });
    saveNpcState(db, {
      npcId: "student-zhu-peng",
      location: "classroom",
      mood: "neutral",
      affinity: 95,
    });

    const results2 = runExams(db, "1995-07-01");
    // With such a big affinity jump, most students should show improvement
    const improved = results2.filter((r) => r.change === "进步");
    expect(improved.length).toBeGreaterThanOrEqual(3);
  });
});
