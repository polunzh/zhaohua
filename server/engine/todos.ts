import type Database from "better-sqlite3";
import { addTodo, getPendingTodos } from "../db/queries";

interface TodoTemplate {
  type: string;
  title: string;
  description: string;
  priority: string;
  daysUntilDeadline: number;
  location: string;
  actionType: string;
}

const teacherTodos: TodoTemplate[] = [
  {
    type: "grade-homework",
    title: "批改作业",
    description: "学生们交上来的作业需要批改",
    priority: "normal",
    daysUntilDeadline: 1,
    location: "office",
    actionType: "click-object",
  },
  {
    type: "prep-class",
    title: "备课",
    description: "准备明天的课程内容",
    priority: "normal",
    daysUntilDeadline: 1,
    location: "office",
    actionType: "click-object",
  },
  {
    type: "student-issue",
    title: "处理学生问题",
    description: "有学生需要你关注",
    priority: "high",
    daysUntilDeadline: 2,
    location: "classroom",
    actionType: "click-npc",
  },
  {
    type: "parent-meeting",
    title: "接待家长",
    description: "有家长想了解孩子的情况",
    priority: "normal",
    daysUntilDeadline: 1,
    location: "classroom",
    actionType: "click-npc",
  },
  {
    type: "write-comments",
    title: "写学生评语",
    description: "给学生们写这学期的评语",
    priority: "low",
    daysUntilDeadline: 7,
    location: "office",
    actionType: "click-object",
  },
];

const postmanTodos: TodoTemplate[] = [
  {
    type: "deliver-mail",
    title: "送信",
    description: "今天有几封信需要送到",
    priority: "high",
    daysUntilDeadline: 1,
    location: "villager-house",
    actionType: "click-door",
  },
  {
    type: "deliver-newspaper",
    title: "送报纸",
    description: "今天的报纸到了",
    priority: "normal",
    daysUntilDeadline: 1,
    location: "villager-house",
    actionType: "click-door",
  },
  {
    type: "problem-mail",
    title: "处理问题邮件",
    description: "有一封信地址不清楚，需要想办法",
    priority: "normal",
    daysUntilDeadline: 2,
    location: "post-office",
    actionType: "click-object",
  },
];

function getTargetCount(offlineHours: number): number {
  if (offlineHours <= 0) return 0;
  if (offlineHours <= 3) return Math.min(2, Math.max(1, Math.floor(offlineHours)));
  if (offlineHours <= 12) return Math.min(4, Math.max(2, Math.floor(offlineHours / 3)));
  if (offlineHours <= 48) return Math.min(6, Math.max(4, Math.floor(offlineHours / 8)));
  return 8;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function generateTodos(
  db: Database.Database,
  gameDate: string,
  character: string,
  offlineHours: number,
): void {
  const targetCount = getTargetCount(offlineHours);
  if (targetCount === 0) return;

  const templates = character === "postman" ? postmanTodos : teacherTodos;
  const existing = getPendingTodos(db);
  const existingTypes = new Set(existing.map((t) => t.type));

  // Filter out types that already have pending todos
  const available = templates.filter((t) => !existingTypes.has(t.type));

  // Pick up to targetCount
  const toCreate = available.slice(0, targetCount);

  for (const tmpl of toCreate) {
    addTodo(db, {
      type: tmpl.type,
      title: tmpl.title,
      description: tmpl.description,
      npcId: null,
      priority: tmpl.priority,
      createdDate: gameDate,
      deadlineDate: addDays(gameDate, tmpl.daysUntilDeadline),
      location: tmpl.location,
      actionType: tmpl.actionType,
    });
  }
}
