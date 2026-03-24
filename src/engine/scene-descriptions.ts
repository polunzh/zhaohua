export interface NpcInfo {
  name: string;
  role: string;
  mood: string;
}

export function generateSceneDescription(
  scene: string,
  period: string,
  npcs: NpcInfo[],
  season: string,
  weather: string,
): string {
  const names = npcs.map((n) => n.name);

  if (scene === "classroom") {
    if (period === "morning" || period === "afternoon") {
      if (names.length >= 2) return `${names[0]}在翻课本，${names[1]}在认真听讲。`;
      if (names.length === 1) return `${names[0]}一个人坐在座位上。`;
      return period === "morning" ? "🌅 还没开始上课" : "🔔 放学了，教室空了";
    }
    if (period === "evening") return "放学后的教室，安安静静的。去办公室备课？还是回家？";
    if (period === "night") return "夜里的教室，黑漆漆一片。回家休息吧。";
    if (period === "noon") return "午休时间。去看看学生们在家怎么样？";
  }

  if (scene === "playground") {
    if (names.length >= 2) return `${names[0]}在跑步，${names[1]}在旗杆旁站着。`;
    if (names.length === 1) return `${names[0]}一个人在操场上。`;
    if (weather === "rainy") return "🌧 下雨了，操场上没有人。去教室躲雨？";
    return "课间还没到。要去教室看看？";
  }

  if (scene === "flower-pool") {
    if (season === "spring") return "🌱 花池里的花苞正在冒头。";
    if (season === "summer") return "🌹 月季开得正好，蜜蜂嗡嗡飞。";
    if (season === "autumn") return "🍂 花池里的花落了不少。";
    if (season === "winter") return "❄ 只剩竹子还绿着。";
    return "🌹 花池里月季开得正好";
  }

  if (scene === "water-tower") {
    if (names.length > 0 && season === "summer") return `💧 ${names.join("、")}在排队喝水。`;
    return "水塔安安静静的。去操场转转？";
  }

  if (scene === "office") {
    if (names.length > 0) return `${names[0]}在办公室里。`;
    return "办公室里堆着作业本。去教室上课？";
  }

  if (scene === "market") {
    if (names.length > 0) return `${names[0]}在摊位后面招呼客人。`;
    return "🏪 集市上人来人往。";
  }

  if (scene === "post-office") return "📮 柜台上摆着今天的信件和报纸。";

  if (scene === "farmland") {
    if (season === "autumn") return "🌾 田里的庄稼熟了，等着收。";
    return "田野一望无际。去村路上走走？";
  }

  if (scene.startsWith("home-")) {
    if (names.length > 0) return `🏠 ${names[0]}在家里。`;
    return "🏠 家里没人，出去了。去村路上找找？";
  }

  if (scene === "village-road") {
    if (period === "morning") return "👣 早上的村路，有人在走动。";
    if (period === "evening") return "夕阳下的村路，远处有炊烟。";
    return "土路弯弯曲曲通向远处。去集市逛逛？";
  }

  if (period === "night") return "🌙 夜深了，安安静静的。回家休息吧。";

  return names.length > 0 ? `这里有${names.join("、")}。` : "四下无人。试试去别的地方看看。";
}
