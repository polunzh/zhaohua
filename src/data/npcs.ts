export interface NPC {
  id: string;
  name: string;
  role: "student" | "principal";
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
];
