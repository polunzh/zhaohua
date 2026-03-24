import type Database from "better-sqlite3";
import { getNpcState, addEventLog } from "../db/queries";
import { npcs } from "../../src/data/npcs";

export interface ExamResult {
  npcId: string;
  name: string;
  score: number; // 0-100
  grade: string; // 优良中差
  change: string; // 进步/退步/持平
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function runExams(db: Database.Database, gameDate: string): ExamResult[] {
  // Only run on exam dates (month 1 or 7)
  const month = parseInt(gameDate.slice(5, 7));
  if (month !== 1 && month !== 7) return [];

  // Check if already ran this semester
  const existing = db
    .prepare("SELECT * FROM event_log WHERE event_id LIKE 'exam-%' AND game_date = ?")
    .all(gameDate);
  if (existing.length > 0) return [];

  const students = [
    "student-zhang-wei",
    "student-wang-fang",
    "student-li-lei",
    "student-zhao-na",
    "student-zhu-peng",
  ];
  const results: ExamResult[] = [];

  for (const studentId of students) {
    const state = getNpcState(db, studentId);
    const affinity = state?.affinity ?? 50;

    // Score = base(50) + affinity bonus + random factor
    const hash = simpleHash(studentId + gameDate);
    const randomFactor = (hash % 20) - 10; // -10 to +10
    const score = Math.max(0, Math.min(100, 50 + Math.floor(affinity * 0.4) + randomFactor));

    const grade = score >= 80 ? "优" : score >= 60 ? "良" : score >= 40 ? "中" : "差";

    // Compare with last exam
    const lastExam = db
      .prepare("SELECT description FROM event_log WHERE event_id = ? ORDER BY id DESC LIMIT 1")
      .get(`exam-${studentId}`) as any;
    let change = "持平";
    if (lastExam) {
      const lastScore = parseInt(lastExam.description.match(/(\d+)分/)?.[1] || "50");
      if (score > lastScore + 5) change = "进步";
      else if (score < lastScore - 5) change = "退步";
    }

    const npc = npcs.find((n) => n.id === studentId);
    results.push({ npcId: studentId, name: npc?.name || studentId, score, grade, change });

    // Log exam event
    addEventLog(db, {
      eventId: `exam-${studentId}`,
      gameDate,
      gameTime: "09:00",
      type: "exam",
      involvedNpcs: studentId,
      description: `${npc?.name || "学生"}考了${score}分（${grade}），${change}。`,
    });
  }

  return results;
}
