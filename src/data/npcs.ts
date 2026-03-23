export interface NPC {
  id: string;
  name: string;
  role: "student" | "principal" | "teacher-colleague" | "parent" | "villager" | "shopkeeper";
  personality: string;
  age: number;
}

export const npcs: NPC[] = [
  {
    id: "student-xiaoming",
    name: "小明",
    role: "student",
    personality: "调皮好动，成绩一般，但很讲义气",
    age: 10,
  },
  {
    id: "student-xiaohua",
    name: "小花",
    role: "student",
    personality: "安静内向，成绩很好，字写得漂亮",
    age: 9,
  },
  {
    id: "principal-zhang",
    name: "张校长",
    role: "principal",
    personality: "严肃但关心学生，一个人撑起整个学校",
    age: 55,
  },
  {
    id: "student-dapeng",
    name: "大鹏",
    role: "student",
    personality: "爱打篮球，个子最高，经常帮老师搬东西",
    age: 11,
  },
  {
    id: "student-meimei",
    name: "美美",
    role: "student",
    personality: "爱画画，课本上全是涂鸦，成绩中等",
    age: 10,
  },
  {
    id: "student-tiezhu",
    name: "铁柱",
    role: "student",
    personality: "家里穷但很努力，冬天手上都是冻疮",
    age: 9,
  },
  {
    id: "colleague-li",
    name: "李老师",
    role: "teacher-colleague",
    personality: "年轻女老师，教数学，和主角搭班",
    age: 28,
  },
  {
    id: "parent-wang",
    name: "王大爷",
    role: "parent",
    personality: "小明的爷爷，农忙时不来，农闲时常来学校",
    age: 65,
  },
  {
    id: "parent-zhao",
    name: "赵婶",
    role: "parent",
    personality: "铁柱的妈妈，在外打工偶尔回来",
    age: 35,
  },
  {
    id: "shopkeeper-liu",
    name: "刘叔",
    role: "shopkeeper",
    personality: "镇上小卖部老板，什么都卖，爱聊天",
    age: 45,
  },
];
