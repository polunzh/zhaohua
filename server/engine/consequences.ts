import type Database from "better-sqlite3";
import {
  getRecentChoices,
  getNpcState,
  updateNpcAffinity,
  updateNpcMood,
  addEventLog,
  saveNpcState,
  setNpcLocationOverride,
} from "../db/queries";
import { npcs } from "../../src/data/npcs";

interface ConsequenceResult {
  type: "positive" | "negative";
  npcId: string;
  description: string;
}

/** Return IDs of choices that already have a consequence event logged. */
function getProcessedChoiceIds(db: Database.Database): Set<number> {
  const rows = db.prepare("SELECT event_id FROM event_log WHERE type = 'consequence'").all() as {
    event_id: string;
  }[];
  return new Set(
    rows.map((r) => {
      const match = r.event_id.match(/consequence-(\d+)/);
      return match ? parseInt(match[1]) : -1;
    }),
  );
}

const positiveDescriptions = [
  "上次你的鼓励起了作用，{name}最近表现积极多了",
  "{name}这周的作业写得认真多了，看来你的话他听进去了",
  "{name}今天主动举手回答问题了，虽然答错了但态度很好",
];

const negativeDescriptions = [
  "自从上次被批评后，{name}变得有些沉默",
  "{name}最近不太愿意说话，可能还在想上次的事",
  "{name}今天又迟到了，进教室时低着头",
];

export function processConsequences(db: Database.Database, gameDate: string): ConsequenceResult[] {
  const results: ConsequenceResult[] = [];
  const processedIds = getProcessedChoiceIds(db);

  // Look for choices 3-7 days ago
  const from = addDays(gameDate, -7);
  const to = addDays(gameDate, -3);
  const choices = getRecentChoices(db, from, to);

  for (const choice of choices) {
    if (processedIds.has(choice.id)) continue;
    if (choice.choiceValue === "ignore") continue;

    const npcId = choice.context;
    if (!npcId) continue;

    // Ensure NPC state exists
    let npcState = getNpcState(db, npcId);
    if (!npcState) {
      saveNpcState(db, {
        npcId,
        location: "classroom",
        mood: "neutral",
        affinity: 50,
      });
      npcState = getNpcState(db, npcId)!;
    }

    const isPositive = choice.choiceValue === "encourage";
    const type = isPositive ? ("positive" as const) : ("negative" as const);
    const templates = isPositive ? positiveDescriptions : negativeDescriptions;
    const npcName = npcId.split("-").pop() || npcId;
    const description = templates[choice.id % templates.length].replace("{name}", npcName);

    // Apply effect
    const affinityDelta = isPositive ? 5 : -3;
    updateNpcAffinity(db, npcId, affinityDelta);
    updateNpcMood(db, npcId, isPositive ? "happy" : "upset");

    // Log as event
    addEventLog(db, {
      eventId: `consequence-${choice.id}`,
      gameDate,
      gameTime: "08:00",
      type: "consequence",
      involvedNpcs: npcId,
      description,
    });

    // Enhanced visible consequences for students
    if (npcId.startsWith("student-")) {
      const npcDef = npcs.find((n) => n.id === npcId);
      const displayName = npcDef?.name || npcName;

      if (!isPositive) {
        // Student skips school after criticism — set location override to home
        const homeLocation = getNpcHome(npcId);
        setNpcLocationOverride(db, npcId, homeLocation, gameDate);
        addEventLog(db, {
          eventId: `skip-school-${choice.id}`,
          gameDate,
          gameTime: "08:30",
          type: "consequence",
          involvedNpcs: npcId,
          description: `${displayName}今天没来上课，可能是因为上次被批评了。`,
        });
      } else {
        // Positive: student progress event
        addEventLog(db, {
          eventId: `progress-${choice.id}`,
          gameDate,
          gameTime: "09:00",
          type: "consequence",
          involvedNpcs: npcId,
          description: `${displayName}的成绩进步了，看来鼓励起了作用。`,
        });
      }
    }

    results.push({ type, npcId, description });
  }

  return results;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Map student NPC ID to their home location */
function getNpcHome(npcId: string): string {
  const homeMap: Record<string, string> = {
    "student-zhang-wei": "home-zhang",
    "student-wang-fang": "home-wang",
    "student-li-lei": "home-li",
    "student-zhao-na": "home-zhao",
    "student-zhu-peng": "home-zhu",
  };
  return homeMap[npcId] || "home-zhang";
}
