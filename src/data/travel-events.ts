export interface TravelEvent {
  id: string;
  text: string;
  seasons?: string[];
  weather?: string[];
}

export const travelEvents: TravelEvent[] = [
  // Generic
  { id: "te-bird", text: "路上看到一只喜鹊站在电线上，叫了两声飞走了。" },
  { id: "te-dog", text: "村口的大黄狗冲你摇了摇尾巴。" },
  { id: "te-smoke", text: "远处的烟囱冒着炊烟，飘着饭菜香。" },
  { id: "te-old-man", text: '路上碰到一个大爷，打了个招呼："吃了没？"' },
  { id: "te-kid-run", text: "几个小孩从身边跑过，笑声飘出老远。" },
  { id: "te-bicycle", text: "一辆自行车从身边骑过，铃铛响了两下。" },
  { id: "te-wall", text: '路边墙上刷着"科学种田，勤劳致富"的标语。' },
  { id: "te-well", text: "路过井台，有人在打水，辘轳吱呀吱呀响。" },
  { id: "te-chicken", text: "一群鸡在路边啄食，咕咕叫着。" },

  // Spring
  { id: "te-spring-flower", text: "路边的野花开了，黄的白的一片一片。", seasons: ["spring"] },
  {
    id: "te-spring-rain",
    text: "春雨细细地下着，像牛毛一样。",
    seasons: ["spring"],
    weather: ["rainy"],
  },
  { id: "te-spring-willow", text: "柳树抽了新芽，软软的枝条在风里摆。", seasons: ["spring"] },

  // Summer
  { id: "te-summer-cicada", text: "知了叫得震天响，热得人直冒汗。", seasons: ["summer"] },
  { id: "te-summer-melon", text: "路边有人在卖西瓜，绿油油的堆了一地。", seasons: ["summer"] },
  { id: "te-summer-shade", text: "在大树底下歇了歇，树荫凉快多了。", seasons: ["summer"] },

  // Autumn
  {
    id: "te-autumn-harvest",
    text: "田里的人在忙着收庄稼，弯着腰一排一排地割。",
    seasons: ["autumn"],
  },
  { id: "te-autumn-leaf", text: "踩着落叶走，脚下嘎吱嘎吱响。", seasons: ["autumn"] },
  { id: "te-autumn-sky", text: "秋天的天高高的，蓝得透亮。", seasons: ["autumn"] },

  // Winter
  { id: "te-winter-cold", text: "手揣在兜里走，鼻尖冻得发红。", seasons: ["winter"] },
  {
    id: "te-winter-snow",
    text: "地上的雪嘎吱嘎吱响，留下一串脚印。",
    seasons: ["winter"],
    weather: ["snowy"],
  },
  { id: "te-winter-stove", text: "闻到煤烟的味道，哪家在生炉子。", seasons: ["winter"] },
];

// Simple hash for deterministic selection
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getTravelEvent(
  from: string,
  to: string,
  season: string,
  weather: string,
  gameDate: string,
): TravelEvent | null {
  // 40% chance of an event
  const hash = simpleHash(`${from}-${to}-${gameDate}`);
  if (hash % 10 >= 4) return null;

  const eligible = travelEvents.filter((e) => {
    if (e.seasons && !e.seasons.includes(season)) return false;
    if (e.weather && !e.weather.includes(weather)) return false;
    return true;
  });

  if (eligible.length === 0) return null;
  return eligible[hash % eligible.length];
}
