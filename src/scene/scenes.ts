export interface ClickableArea {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  type: "npc" | "object" | "exit";
}

export interface SceneDefinition {
  id: string;
  name: string;
  backgroundKey: string;
  clickableAreas: ClickableArea[];
}

export const scenes: Record<string, SceneDefinition> = {
  classroom: {
    id: "classroom",
    name: "教室",
    backgroundKey: "classroom",
    clickableAreas: [
      {
        id: "desk-xiaoming",
        x: 100,
        y: 200,
        width: 80,
        height: 60,
        label: "小明的座位",
        type: "npc",
      },
      {
        id: "desk-xiaohua",
        x: 200,
        y: 200,
        width: 80,
        height: 60,
        label: "小花的座位",
        type: "npc",
      },
      { id: "blackboard", x: 150, y: 50, width: 200, height: 100, label: "黑板", type: "object" },
      { id: "door", x: 0, y: 100, width: 40, height: 150, label: "门", type: "exit" },
      { id: "stove", x: 350, y: 180, width: 50, height: 50, label: "煤炉", type: "object" },
    ],
  },

  playground: {
    id: "playground",
    name: "操场",
    backgroundKey: "playground",
    clickableAreas: [
      { id: "flagpole", x: 370, y: 30, width: 60, height: 200, label: "旗杆", type: "object" },
      {
        id: "basketball-hoop",
        x: 580,
        y: 80,
        width: 120,
        height: 150,
        label: "篮球架",
        type: "object",
      },
      { id: "exit-classroom", x: 0, y: 150, width: 40, height: 120, label: "教室", type: "exit" },
      {
        id: "exit-water-tower",
        x: 700,
        y: 300,
        width: 80,
        height: 80,
        label: "水塔",
        type: "exit",
      },
      {
        id: "exit-flower-pool",
        x: 100,
        y: 380,
        width: 100,
        height: 60,
        label: "花池",
        type: "exit",
      },
      {
        id: "exit-village-road",
        x: 350,
        y: 440,
        width: 120,
        height: 50,
        label: "村路",
        type: "exit",
      },
    ],
  },

  office: {
    id: "office",
    name: "办公室",
    backgroundKey: "office",
    clickableAreas: [
      { id: "desk", x: 200, y: 180, width: 150, height: 100, label: "办公桌", type: "object" },
      { id: "bookshelf", x: 550, y: 60, width: 100, height: 250, label: "书架", type: "object" },
      { id: "exit-classroom", x: 0, y: 150, width: 40, height: 120, label: "教室", type: "exit" },
    ],
  },

  "flower-pool": {
    id: "flower-pool",
    name: "花池",
    backgroundKey: "flower-pool",
    clickableAreas: [
      {
        id: "rose-bed",
        x: 150,
        y: 150,
        width: 180,
        height: 120,
        label: "月季花坛",
        type: "object",
      },
      { id: "bamboo", x: 550, y: 60, width: 120, height: 250, label: "竹林", type: "object" },
      { id: "bench", x: 350, y: 350, width: 120, height: 60, label: "长椅", type: "object" },
      { id: "exit-classroom", x: 0, y: 150, width: 40, height: 120, label: "教室", type: "exit" },
      { id: "exit-playground", x: 700, y: 200, width: 80, height: 80, label: "操场", type: "exit" },
    ],
  },

  "water-tower": {
    id: "water-tower",
    name: "水塔",
    backgroundKey: "water-tower",
    clickableAreas: [
      { id: "faucet", x: 300, y: 200, width: 80, height: 80, label: "水龙头", type: "object" },
      { id: "queue-area", x: 150, y: 300, width: 200, height: 80, label: "排队区", type: "object" },
      { id: "exit-playground", x: 0, y: 150, width: 40, height: 120, label: "操场", type: "exit" },
    ],
  },

  "village-road": {
    id: "village-road",
    name: "村路",
    backgroundKey: "village-road",
    clickableAreas: [
      { id: "road", x: 200, y: 200, width: 400, height: 80, label: "路", type: "object" },
      { id: "exit-playground", x: 0, y: 150, width: 40, height: 120, label: "操场", type: "exit" },
      { id: "exit-farmland", x: 700, y: 100, width: 80, height: 80, label: "农田", type: "exit" },
      {
        id: "exit-villager-house",
        x: 700,
        y: 300,
        width: 80,
        height: 80,
        label: "村民家",
        type: "exit",
      },
      { id: "exit-town-road", x: 350, y: 440, width: 120, height: 50, label: "镇上", type: "exit" },
    ],
  },

  farmland: {
    id: "farmland",
    name: "农田",
    backgroundKey: "farmland",
    clickableAreas: [
      { id: "crops", x: 100, y: 100, width: 600, height: 280, label: "庄稼", type: "object" },
      {
        id: "exit-village-road",
        x: 0,
        y: 150,
        width: 40,
        height: 120,
        label: "村路",
        type: "exit",
      },
    ],
  },

  "villager-house": {
    id: "villager-house",
    name: "村民家",
    backgroundKey: "villager-house",
    clickableAreas: [
      { id: "gate", x: 320, y: 150, width: 160, height: 200, label: "大门", type: "object" },
      { id: "courtyard", x: 100, y: 300, width: 600, height: 120, label: "院子", type: "object" },
      {
        id: "exit-village-road",
        x: 0,
        y: 150,
        width: 40,
        height: 120,
        label: "村路",
        type: "exit",
      },
    ],
  },

  "town-road": {
    id: "town-road",
    name: "镇上",
    backgroundKey: "town-road",
    clickableAreas: [
      { id: "street", x: 150, y: 200, width: 500, height: 80, label: "街道", type: "object" },
      {
        id: "exit-village-road",
        x: 0,
        y: 150,
        width: 40,
        height: 120,
        label: "村路",
        type: "exit",
      },
      { id: "exit-post-office", x: 700, y: 80, width: 80, height: 80, label: "邮局", type: "exit" },
      { id: "exit-market", x: 700, y: 220, width: 80, height: 80, label: "集市", type: "exit" },
      { id: "exit-clinic", x: 700, y: 360, width: 80, height: 80, label: "卫生所", type: "exit" },
    ],
  },

  "post-office": {
    id: "post-office",
    name: "邮局",
    backgroundKey: "post-office",
    clickableAreas: [
      { id: "counter", x: 200, y: 150, width: 200, height: 100, label: "柜台", type: "object" },
      {
        id: "mail-package",
        x: 500,
        y: 200,
        width: 120,
        height: 100,
        label: "邮包",
        type: "object",
      },
      { id: "exit-town-road", x: 0, y: 150, width: 40, height: 120, label: "镇上", type: "exit" },
    ],
  },

  market: {
    id: "market",
    name: "集市",
    backgroundKey: "market",
    clickableAreas: [
      { id: "stall", x: 150, y: 120, width: 500, height: 200, label: "摊位", type: "object" },
      { id: "exit-town-road", x: 0, y: 150, width: 40, height: 120, label: "镇上", type: "exit" },
    ],
  },

  clinic: {
    id: "clinic",
    name: "卫生所",
    backgroundKey: "clinic",
    clickableAreas: [
      { id: "door", x: 320, y: 100, width: 160, height: 220, label: "门", type: "object" },
      { id: "exit-town-road", x: 0, y: 150, width: 40, height: 120, label: "镇上", type: "exit" },
    ],
  },
};

export function getBackgroundKey(sceneId: string, season: string, period: string): string {
  return `${sceneId}-${season}-${period}`;
}
