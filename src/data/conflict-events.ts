export interface ConflictEvent {
  id: string;
  title: string;
  description: string;
  choices: {
    id: string;
    label: string;
    consequence: string;
    affinityChanges: Record<string, number>;
  }[];
  seasons?: string[];
  minDaysBetween: number;
}

export const conflictEvents: ConflictEvent[] = [
  {
    id: "student-fight",
    title: "学生打架了",
    description: "张志强和李磊在操场上打了起来，其他学生围在旁边看。",
    choices: [
      {
        id: "scold-both",
        label: "两个都批评",
        consequence: "两人都低下了头。",
        affinityChanges: { "student-zhang-wei": -5, "student-li-lei": -5 },
      },
      {
        id: "understand-first",
        label: "先了解原因",
        consequence: "原来是为了一块橡皮。你让他们握手言和。",
        affinityChanges: { "student-zhang-wei": 3, "student-li-lei": 3 },
      },
      {
        id: "ignore",
        label: "让他们自己解决",
        consequence: "打着打着两人都哭了，最后自己和好了。",
        affinityChanges: {},
      },
    ],
    minDaysBetween: 14,
  },
  {
    id: "student-cry",
    title: "有学生哭了",
    description: "王芳趴在桌上哭，问了也不说为什么。",
    choices: [
      {
        id: "comfort",
        label: "安慰她",
        consequence: "你递了张纸巾，她擦了擦眼泪，说想妈妈了。",
        affinityChanges: { "student-wang-fang": 8 },
      },
      {
        id: "give-space",
        label: "给她空间",
        consequence: "过了一会儿她自己好了，冲你笑了笑。",
        affinityChanges: { "student-wang-fang": 2 },
      },
      {
        id: "ask-classmate",
        label: "问问其他同学",
        consequence: "赵春燕说王芳收到了家里的信，她爸在外地打工。",
        affinityChanges: { "student-wang-fang": 3, "student-zhao-na": 3 },
      },
    ],
    minDaysBetween: 10,
  },
  {
    id: "parent-angry",
    title: "家长来找你了",
    description: "高大爷气冲冲地来学校，说张志强回家说被老师批评了。",
    choices: [
      {
        id: "explain-calmly",
        label: "耐心解释",
        consequence: "你把情况说明了，高大爷听完点了点头。",
        affinityChanges: { "parent-gao": 5, "student-zhang-wei": 2 },
      },
      {
        id: "apologize",
        label: "先道歉",
        consequence: "你说对不起可能方式不太对。高大爷脸色缓和了。",
        affinityChanges: { "parent-gao": 8 },
      },
      {
        id: "stand-firm",
        label: "坚持原则",
        consequence: "你说批评是为了孩子好。高大爷不太高兴地走了。",
        affinityChanges: { "parent-gao": -5, "student-zhang-wei": -3 },
      },
    ],
    minDaysBetween: 21,
  },
  {
    id: "broken-window",
    title: "教室窗户碎了",
    description: "不知道谁打碎了教室的窗户玻璃，外面风呼呼地往里灌。",
    choices: [
      {
        id: "ask-who",
        label: "调查是谁",
        consequence: "问了一圈，朱小龙小声说是他不小心的。",
        affinityChanges: { "student-zhu-peng": -2 },
      },
      {
        id: "fix-first",
        label: "先想办法堵上",
        consequence: "你找了块纸板先挡着，明天再想办法修。",
        affinityChanges: {},
      },
      {
        id: "report-principal",
        label: "报告校长",
        consequence: "校长说经费紧张，让你先凑合着。",
        affinityChanges: { "principal-sun": -2 },
      },
    ],
    seasons: ["winter"],
    minDaysBetween: 30,
  },
  {
    id: "chalk-shortage",
    title: "粉笔不够了",
    description: "粉笔盒空了，这节课还没上完。",
    choices: [
      {
        id: "borrow",
        label: "去隔壁借",
        consequence: "周老师借了你半盒，够用了。",
        affinityChanges: { "colleague-zhou": 3 },
      },
      {
        id: "use-finger",
        label: "用手指在黑板上比划",
        consequence: "学生们觉得很有趣，笑成一团。",
        affinityChanges: { "student-zhang-wei": 3, "student-wang-fang": 3 },
      },
      {
        id: "end-early",
        label: "提前下课",
        consequence: "学生们欢呼着跑出去了。",
        affinityChanges: {},
      },
    ],
    minDaysBetween: 7,
  },
];

export function checkConflictEvent(
  gameDate: string,
  season: string,
  lastConflictDates: Record<string, string>,
): ConflictEvent | null {
  // Hash-based 20% daily chance
  let hash = 0;
  for (let i = 0; i < gameDate.length; i++)
    hash = ((hash << 5) - hash + gameDate.charCodeAt(i)) | 0;
  if (Math.abs(hash) % 5 !== 0) return null;

  const eligible = conflictEvents.filter((e) => {
    if (e.seasons && !e.seasons.includes(season)) return false;
    const lastDate = lastConflictDates[e.id];
    if (lastDate) {
      const daysDiff = (new Date(gameDate).getTime() - new Date(lastDate).getTime()) / 86400000;
      if (daysDiff < e.minDaysBetween) return false;
    }
    return true;
  });

  if (eligible.length === 0) return null;
  return eligible[Math.abs(hash) % eligible.length];
}
