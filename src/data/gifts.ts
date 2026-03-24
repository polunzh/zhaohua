export interface GiftTemplate {
  id: string;
  name: string;
  description: string;
  fromRoles: string[];
  minAffinity: number;
}

export const giftTemplates: GiftTemplate[] = [
  {
    id: "drawing",
    name: "一幅画",
    description: "学生画了一幅画送给你，虽然画得歪歪扭扭，但很用心。",
    fromRoles: ["student"],
    minAffinity: 65,
  },
  {
    id: "apple",
    name: "一个苹果",
    description: "学生从家里带了个苹果，红红的，放在你桌上。",
    fromRoles: ["student"],
    minAffinity: 60,
  },
  {
    id: "letter",
    name: "一封感谢信",
    description: "叠得整整齐齐的一封信，字迹还有点歪。",
    fromRoles: ["student"],
    minAffinity: 75,
  },
  {
    id: "flower",
    name: "一朵野花",
    description: "路边摘的一朵小花，插在你的笔筒里。",
    fromRoles: ["student"],
    minAffinity: 55,
  },
  {
    id: "eggs",
    name: "几个鸡蛋",
    description: "家长送来的鸡蛋，用布包着，还热乎的。",
    fromRoles: ["parent"],
    minAffinity: 60,
  },
  {
    id: "tea",
    name: "一包茶叶",
    description: "校长拿出珍藏的茶叶泡了一壶。",
    fromRoles: ["principal"],
    minAffinity: 70,
  },
  {
    id: "candy",
    name: "两颗糖",
    description: "马叔塞给你两颗水果糖，说是进的新货。",
    fromRoles: ["shopkeeper"],
    minAffinity: 50,
  },
  {
    id: "newspaper",
    name: "一份旧报纸",
    description: "邮递员留了份没人要的旧报纸给你看。",
    fromRoles: ["postman"],
    minAffinity: 50,
  },
];

export function checkGift(role: string, affinity: number, seed: number): GiftTemplate | null {
  const eligible = giftTemplates.filter(
    (g) => g.fromRoles.includes(role) && affinity >= g.minAffinity,
  );
  if (eligible.length === 0) return null;
  // 15% chance per interaction
  if (seed % 100 >= 15) return null;
  return eligible[seed % eligible.length];
}
