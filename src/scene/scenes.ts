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
};

export function getBackgroundKey(sceneId: string, season: string, period: string): string {
  return `${sceneId}-${season}-${period}`;
}
