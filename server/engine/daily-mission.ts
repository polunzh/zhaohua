import type Database from "better-sqlite3";
import {
  getDailyMission as getDailyMissionFromDb,
  saveDailyMission,
  completeDailyMission,
  type DailyMission,
} from "../db/queries";
import { createLogger } from "../utils/logger";

const log = createLogger("engine:mission");

interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  targetLocation: string;
  targetAction?: string;
  targetNpc?: string;
  completionText: string;
  seasons?: string[];
  weather?: string[];
  character?: string;
}

const teacherMissions: MissionTemplate[] = [
  // Exploration
  {
    id: "visit-flower-pool",
    title: "去花池走走",
    description: "课间了，去花池看看月季开得怎么样",
    targetLocation: "flower-pool",
    completionText: "花池里的月季开得正好，心情不错。",
  },
  {
    id: "check-water-tower",
    title: "去水塔看看",
    description: "听说水塔那边学生们玩得很开心",
    targetLocation: "water-tower",
    completionText: "水塔旁学生们正排队喝水，叽叽喳喳的。",
    seasons: ["summer"],
  },
  {
    id: "visit-market",
    title: "去集市买粉笔",
    description: "粉笔快用完了，得去镇上集市买一些",
    targetLocation: "market",
    completionText: "买好了粉笔，还顺便看了看集市上的新鲜玩意儿。",
  },
  {
    id: "visit-office",
    title: "去办公室备课",
    description: "明天有一节重要的课，得好好准备",
    targetLocation: "office",
    completionText: "备好了课，明天应该能讲得不错。",
  },

  // NPC interaction
  {
    id: "talk-zhang",
    title: "找张志强聊聊",
    description: "张志强最近上课老走神，找他了解一下",
    targetLocation: "classroom",
    targetNpc: "student-zhang-wei",
    targetAction: "click-npc",
    completionText: "和张志强聊了聊，原来是家里有点事。",
  },
  {
    id: "talk-wangfang",
    title: "看看王芳的作文",
    description: "王芳的作文写得不错，找她鼓励一下",
    targetLocation: "classroom",
    targetNpc: "student-wang-fang",
    targetAction: "click-npc",
    completionText: "王芳听到夸奖很开心，说要继续努力。",
  },
  {
    id: "talk-zhulong",
    title: "关心一下朱小龙",
    description: "朱小龙家里条件不好，去关心一下他",
    targetLocation: "classroom",
    targetNpc: "student-zhu-peng",
    targetAction: "click-npc",
    completionText: "朱小龙有点不好意思，但能看出他很感激。",
  },
  {
    id: "talk-principal",
    title: "找校长汇报",
    description: "有些教学上的事需要和校长说一下",
    targetLocation: "office",
    targetNpc: "principal-sun",
    targetAction: "click-npc",
    completionText: "和校长聊了聊教学计划，他很支持。",
  },
  {
    id: "talk-colleague",
    title: "和周老师商量",
    description: "想和周老师商量一下下周的课程安排",
    targetLocation: "office",
    targetNpc: "colleague-zhou",
    targetAction: "click-npc",
    completionText: "和周老师商量好了分工，配合得不错。",
  },

  // Home visit
  {
    id: "visit-zhulong-home",
    title: "去朱小龙家家访",
    description: "放学后去朱小龙家看看情况",
    targetLocation: "home-zhu",
    completionText: "了解了朱小龙家里的情况，心里有了数。",
  },
  {
    id: "visit-zhang-home",
    title: "去张志强家坐坐",
    description: "顺路去张志强家看看，和高大爷聊聊",
    targetLocation: "home-zhang",
    completionText: "高大爷泡了茶，聊了半天孩子的事。",
  },

  // Weather-specific
  {
    id: "rainy-check-windows",
    title: "检查教室窗户",
    description: "下雨了，去看看教室窗户关好没有",
    targetLocation: "classroom",
    weather: ["rainy"],
    completionText: "窗户都关好了，没有淋到桌椅。",
  },
  {
    id: "snowy-check-stove",
    title: "检查煤炉",
    description: "下雪天，去教室看看煤炉烧得怎么样",
    targetLocation: "classroom",
    weather: ["snowy"],
    seasons: ["winter"],
    completionText: "往煤炉里加了几块煤，教室暖和多了。",
  },

  // Season-specific
  {
    id: "spring-flowers",
    title: "看看花池的花",
    description: "春天了，花池里的花应该发芽了",
    targetLocation: "flower-pool",
    seasons: ["spring"],
    completionText: "嫩芽冒出来了，再过些日子就该开花了。",
  },
  {
    id: "autumn-harvest",
    title: "看看农田",
    description: "秋收了，去看看田里庄稼的情况",
    targetLocation: "farmland",
    seasons: ["autumn"],
    completionText: "玉米长得不错，村民们都在忙着收。",
  },
];

const postmanMissions: MissionTemplate[] = [
  {
    id: "deliver-to-school",
    title: "给学校送信",
    description: "今天有学校的信件，骑车去送一趟",
    targetLocation: "playground",
    completionText: "信送到了，老师们道了谢。",
  },
  {
    id: "deliver-to-village",
    title: "给村民送报纸",
    description: "今天的报纸到了，送到各家去",
    targetLocation: "villager-house",
    completionText: "报纸都送完了，村民们都等着看呢。",
  },
  {
    id: "sort-mail",
    title: "整理邮件",
    description: "邮局里积了些邮件，得分拣一下",
    targetLocation: "post-office",
    completionText: "邮件都分好了，明天可以按路线送出去。",
  },
  {
    id: "rest-at-shop",
    title: "去集市歇歇脚",
    description: "跑了一上午了，去马叔那儿喝碗水",
    targetLocation: "market",
    targetNpc: "shopkeeper-ma",
    targetAction: "click-npc",
    completionText: "马叔倒了碗水，聊了会儿天，歇够了。",
  },
  {
    id: "fix-bike",
    title: "修自行车",
    description: "车链子松了，去镇上修一下",
    targetLocation: "town-road",
    completionText: "链子紧好了，骑起来顺畅多了。",
  },
];

// Simple hash function for deterministic mission selection
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function generateDailyMission(
  db: Database.Database,
  gameDate: string,
  character: string,
  season: string,
  weather: string,
): DailyMission {
  // Check if already generated for this date
  const existing = getDailyMissionFromDb(db, gameDate);
  if (existing) return existing;

  const templates = character === "postman" ? postmanMissions : teacherMissions;

  // Filter by season and weather
  const eligible = templates.filter((t) => {
    if (t.seasons && !t.seasons.includes(season)) return false;
    if (t.weather && !t.weather.includes(weather)) return false;
    if (t.character && t.character !== character) return false;
    return true;
  });

  // Pick one deterministically based on date
  const pool = eligible.length > 0 ? eligible : templates.slice(0, 5);
  const index = simpleHash(gameDate) % pool.length;
  const template = pool[index];

  const mission: DailyMission = {
    id: `${gameDate}-${template.id}`,
    gameDate,
    title: template.title,
    description: template.description,
    targetLocation: template.targetLocation,
    targetAction: template.targetAction || null,
    targetNpc: template.targetNpc || null,
    completionText: template.completionText,
    status: "active",
  };

  saveDailyMission(db, mission);
  log.debug(`mission generated: ${mission.id} for ${gameDate}`);
  return mission;
}

export function completeMission(db: Database.Database, missionId: string): void {
  // Get the mission to find its completion text
  const row = db
    .prepare("SELECT completion_text FROM daily_missions WHERE id = ?")
    .get(missionId) as any;
  const text = row?.completion_text || "完成了今天的任务。";
  completeDailyMission(db, missionId, text);
}

export function getDailyMission(db: Database.Database, gameDate: string): DailyMission | null {
  return getDailyMissionFromDb(db, gameDate);
}
