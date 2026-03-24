export interface NPC {
  id: string;
  name: string;
  role:
    | "student"
    | "principal"
    | "teacher-colleague"
    | "parent"
    | "villager"
    | "shopkeeper"
    | "postman";
  personality: string;
  age: number;
}

export const npcs: NPC[] = [
  {
    id: "student-zhang-wei",
    name: "张伟",
    role: "student",
    personality: "调皮好动，成绩一般，但很讲义气",
    age: 10,
  },
  {
    id: "student-wang-fang",
    name: "王芳",
    role: "student",
    personality: "安静内向，成绩很好，字写得漂亮",
    age: 9,
  },
  {
    id: "principal-sun",
    name: "孙校长",
    role: "principal",
    personality: "严肃但关心学生，一个人撑起整个学校",
    age: 55,
  },
  {
    id: "student-li-lei",
    name: "李磊",
    role: "student",
    personality: "爱打篮球，个子最高，经常帮老师搬东西",
    age: 11,
  },
  {
    id: "student-zhao-na",
    name: "赵娜",
    role: "student",
    personality: "爱画画，课本上全是涂鸦，成绩中等",
    age: 10,
  },
  {
    id: "student-zhu-peng",
    name: "朱鹏",
    role: "student",
    personality: "家里穷但很努力，冬天手上都是冻疮",
    age: 9,
  },
  {
    id: "colleague-zhou",
    name: "周老师",
    role: "teacher-colleague",
    personality: "年轻女老师，教数学，和主角搭班",
    age: 28,
  },
  {
    id: "parent-gao",
    name: "高大爷",
    role: "parent",
    personality: "张伟的爷爷，农忙时不来，农闲时常来学校",
    age: 65,
  },
  {
    id: "parent-tian",
    name: "田婶",
    role: "parent",
    personality: "朱鹏的妈妈，在外打工偶尔回来",
    age: 35,
  },
  {
    id: "shopkeeper-ma",
    name: "马叔",
    role: "shopkeeper",
    personality: "镇上小卖部老板，什么都卖，爱聊天",
    age: 45,
  },
  {
    id: "postman-he",
    name: "贺邮递员",
    role: "postman",
    personality: "风雨无阻，骑车送信二十年，认识每个村的人",
    age: 40,
  },
];
