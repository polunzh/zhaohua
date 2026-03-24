export interface BranchNode {
  condition: {
    type: "affinity" | "choice" | "date" | "weather";
    npcId?: string;
    minValue?: number;
    maxValue?: number;
    choiceValue?: string;
    afterDate?: string;
  };
  nextStageId: string;
}

export interface StoryStage {
  id: string;
  description: string;
  triggerConditions: {
    minDaysSinceLastStage?: number;
    requiredAffinity?: { npcId: string; min: number };
    requiredChoice?: { choiceValue: string };
    afterGameDate?: string;
  };
  branches?: BranchNode[];
  nextStage?: string; // default next stage if no branch matches
  isFinal?: boolean;
}

export interface StoryArc {
  id: string;
  name: string;
  description: string;
  startCondition: {
    afterGameDate?: string;
    minAffinity?: { npcId: string; min: number };
  };
  stages: StoryStage[];
}

export const storyArcs: StoryArc[] = [
  {
    id: "love-learning",
    name: "厌学到爱学",
    description: "朱鹏从不爱上学到慢慢喜欢学习",
    startCondition: { afterGameDate: "1994-09-15" },
    stages: [
      {
        id: "stage-1",
        description: "朱鹏上课总是走神，趴在桌上不听讲",
        triggerConditions: {},
        nextStage: "stage-2",
      },
      {
        id: "stage-2",
        description: "你发现朱鹏其实对课本上的故事很感兴趣",
        triggerConditions: { minDaysSinceLastStage: 7 },
        branches: [
          {
            condition: { type: "affinity", npcId: "student-zhu-peng", minValue: 60 },
            nextStageId: "stage-3a",
          },
        ],
        nextStage: "stage-3b",
      },
      {
        id: "stage-3a",
        description: "朱鹏开始主动问问题了，虽然还是有些害羞",
        triggerConditions: { minDaysSinceLastStage: 14 },
        nextStage: "stage-4",
      },
      {
        id: "stage-3b",
        description: "朱鹏还是不太愿意说话，但至少不再趴着了",
        triggerConditions: { minDaysSinceLastStage: 14 },
        nextStage: "stage-4",
      },
      {
        id: "stage-4",
        description: "期末考试，朱鹏的成绩进步了不少",
        triggerConditions: { minDaysSinceLastStage: 30 },
        isFinal: true,
      },
    ],
  },
  {
    id: "waiting-letter",
    name: "等信",
    description: "高大爷一直在等远方儿子的来信",
    startCondition: { afterGameDate: "1994-10-01" },
    stages: [
      {
        id: "stage-1",
        description: "高大爷又来学校门口问有没有他的信",
        triggerConditions: {},
        nextStage: "stage-2",
      },
      {
        id: "stage-2",
        description: "已经两个月没有儿子的消息了，高大爷有些焦虑",
        triggerConditions: { minDaysSinceLastStage: 14 },
        nextStage: "stage-3",
      },
      {
        id: "stage-3",
        description: "邮递员终于带来了一封从城里寄来的信",
        triggerConditions: { minDaysSinceLastStage: 21 },
        nextStage: "stage-4",
      },
      {
        id: "stage-4",
        description: "高大爷拿着信在村口的大树下看了又看，眼眶红红的",
        triggerConditions: { minDaysSinceLastStage: 1 },
        isFinal: true,
      },
    ],
  },
  {
    id: "repair-classroom",
    name: "修教室",
    description: "孙校长争取经费修教室",
    startCondition: { afterGameDate: "1994-11-01" },
    stages: [
      {
        id: "stage-1",
        description: "下雨天教室漏水了，孙校长拿盆接水",
        triggerConditions: {},
        nextStage: "stage-2",
      },
      {
        id: "stage-2",
        description: "孙校长写了好几封信给教育局申请维修经费",
        triggerConditions: { minDaysSinceLastStage: 14 },
        nextStage: "stage-3",
      },
      {
        id: "stage-3",
        description: "教育局的人来学校看了看，说经费紧张要再等等",
        triggerConditions: { minDaysSinceLastStage: 30 },
        nextStage: "stage-4",
      },
      {
        id: "stage-4",
        description: "村里人凑了些钱，加上教育局拨的一点，终于开始修教室了",
        triggerConditions: { minDaysSinceLastStage: 30 },
        nextStage: "stage-5",
      },
      {
        id: "stage-5",
        description: "教室修好了，孙校长站在新刷的墙前笑了",
        triggerConditions: { minDaysSinceLastStage: 14 },
        isFinal: true,
      },
    ],
  },
];
