export interface Discovery {
  id: string;
  location: string;
  period: string; // morning, afternoon, evening, night
  season?: string;
  description: string;
  reward: { type: "item" | "affinity"; itemType?: string; npcId?: string; amount: number };
}

export const discoveries: Discovery[] = [
  {
    id: "morning-flower",
    location: "flower-pool",
    period: "morning",
    season: "spring",
    description: "早晨的花池里，露珠还挂在花瓣上，特别好看。你摘了一朵。",
    reward: { type: "item", itemType: "flower", amount: 1 },
  },
  {
    id: "sunset-playground",
    location: "playground",
    period: "evening",
    description: "操场上没人了，夕阳把一切染成金色。你捡到了一个弹珠。",
    reward: { type: "item", itemType: "marble", amount: 1 },
  },
  {
    id: "night-office",
    location: "office",
    period: "night",
    description: "夜晚的办公室安安静静，你在抽屉里翻到了一本旧杂志。",
    reward: { type: "item", itemType: "notebook", amount: 1 },
  },
  {
    id: "winter-stove",
    location: "classroom",
    period: "morning",
    season: "winter",
    description: "冬天的早晨，你第一个到教室，把煤炉生好了。学生们来了都说暖和。",
    reward: { type: "affinity", npcId: "student-zhang-wei", amount: 3 },
  },
  {
    id: "market-afternoon",
    location: "market",
    period: "afternoon",
    description: "下午的集市快收摊了，马叔便宜卖了你一些粉笔。",
    reward: { type: "item", itemType: "chalk", amount: 3 },
  },
  {
    id: "rain-village-road",
    location: "village-road",
    period: "afternoon",
    season: "summer",
    description: "雨后的村路上，你看到了一道彩虹。",
    reward: { type: "affinity", npcId: "student-wang-fang", amount: 2 },
  },
];

export function checkDiscovery(
  location: string,
  period: string,
  season: string,
  foundIds: string[],
): Discovery | null {
  const match = discoveries.find(
    (d) =>
      d.location === location &&
      d.period === period &&
      (!d.season || d.season === season) &&
      !foundIds.includes(d.id),
  );
  return match || null;
}
