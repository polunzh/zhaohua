export interface EventTemplate {
  id: string;
  type: "daily" | "seasonal";
  triggerDate?: string;
  seasons?: string[];
  periods?: string[];
  weather?: string[];
  description: string;
}

export const eventPool: EventTemplate[] = [
  {
    id: "school-start",
    type: "seasonal",
    triggerDate: "09-01",
    description: "开学第一天，学生们背着新书包来到学校",
  },
  {
    id: "midterm-exam",
    type: "seasonal",
    triggerDate: "10-20",
    description: "期中考试，教室里安安静静",
  },
  {
    id: "winter-stove",
    type: "seasonal",
    triggerDate: "11-15",
    description: "教室里生起了煤炉，第一次点火总是冒烟",
  },
  {
    id: "new-year-prep",
    type: "seasonal",
    triggerDate: "12-25",
    description: "快过年了，学生们开始写寒假作业清单",
  },
  {
    id: "spring-term",
    type: "seasonal",
    triggerDate: "02-20",
    description: "春季开学，有些学生晒黑了，有些长高了",
  },
  {
    id: "final-exam",
    type: "seasonal",
    triggerDate: "06-25",
    description: "期末考试，天热得坐不住",
  },
  {
    id: "student-late",
    type: "daily",
    periods: ["morning"],
    description: "有学生迟到了，气喘吁吁跑进教室",
  },
  {
    id: "homework-missing",
    type: "daily",
    periods: ["morning"],
    description: "收作业时发现有人没写完",
  },
  {
    id: "morning-reading",
    type: "daily",
    periods: ["morning"],
    description: "早读时间，教室里书声琅琅",
  },
  {
    id: "student-fight",
    type: "daily",
    periods: ["afternoon"],
    description: "课间两个学生吵起来了",
  },
  {
    id: "parent-visit",
    type: "daily",
    periods: ["afternoon"],
    description: "有家长来学校找老师问孩子的情况",
  },
  {
    id: "nap-in-class",
    type: "daily",
    periods: ["afternoon"],
    description: "下午第一节课，有学生趴在桌上打瞌睡",
  },
  {
    id: "grading-papers",
    type: "daily",
    periods: ["evening"],
    description: "在办公室批改作业，窗外天渐渐黑了",
  },
  {
    id: "colleague-chat",
    type: "daily",
    periods: ["evening"],
    description: "和同事聊了几句明天的课",
  },
];
