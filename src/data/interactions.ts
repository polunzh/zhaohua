export interface InteractionEffect {
  affinityDelta: number;
  mood: string;
}

export interface InteractionChoice {
  id: string;
  label: string;
  effect: InteractionEffect;
}

interface InteractionTemplate {
  roles: string[];
  locations: string[]; // empty = any location
  choices: InteractionChoice[];
}

const templates: InteractionTemplate[] = [
  // Student in classroom
  {
    roles: ["student"],
    locations: ["classroom"],
    choices: [
      { id: "check-homework", label: "检查作业", effect: { affinityDelta: 0, mood: "neutral" } },
      { id: "ask-question", label: "提问", effect: { affinityDelta: 5, mood: "neutral" } },
      { id: "encourage", label: "鼓励一下", effect: { affinityDelta: 10, mood: "happy" } },
      { id: "leave-alone", label: "不打扰", effect: { affinityDelta: 0, mood: "neutral" } },
    ],
  },
  // Student at playground
  {
    roles: ["student"],
    locations: ["playground", "flower-pool", "water-tower"],
    choices: [
      { id: "play-together", label: "一起玩", effect: { affinityDelta: 8, mood: "happy" } },
      { id: "chat", label: "聊聊天", effect: { affinityDelta: 5, mood: "happy" } },
      { id: "call-back", label: "叫回教室", effect: { affinityDelta: -3, mood: "upset" } },
    ],
  },
  // Student at home (家访)
  {
    roles: ["student"],
    locations: ["home-zhang", "home-wang", "home-li", "home-zhao", "home-zhu"],
    choices: [
      { id: "home-visit-chat", label: "家访聊天", effect: { affinityDelta: 5, mood: "happy" } },
      {
        id: "understand-situation",
        label: "了解情况",
        effect: { affinityDelta: 3, mood: "neutral" },
      },
      { id: "say-goodbye", label: "告辞", effect: { affinityDelta: 0, mood: "neutral" } },
    ],
  },
  // Principal in office
  {
    roles: ["principal"],
    locations: ["office"],
    choices: [
      { id: "report-work", label: "汇报工作", effect: { affinityDelta: 3, mood: "neutral" } },
      { id: "request-supplies", label: "申请物资", effect: { affinityDelta: 0, mood: "neutral" } },
      { id: "casual-chat", label: "闲聊几句", effect: { affinityDelta: 5, mood: "happy" } },
    ],
  },
  // Principal at playground
  {
    roles: ["principal"],
    locations: ["playground", "classroom"],
    choices: [
      { id: "patrol-together", label: "一起巡视", effect: { affinityDelta: 5, mood: "neutral" } },
      { id: "chat", label: "聊聊", effect: { affinityDelta: 3, mood: "happy" } },
      { id: "leave-alone", label: "不打扰", effect: { affinityDelta: 0, mood: "neutral" } },
    ],
  },
  // Teacher colleague
  {
    roles: ["teacher-colleague"],
    locations: ["classroom"],
    choices: [
      { id: "discuss-teaching", label: "商量教学", effect: { affinityDelta: 5, mood: "neutral" } },
      { id: "chat", label: "聊聊天", effect: { affinityDelta: 3, mood: "happy" } },
      { id: "leave-alone", label: "不打扰", effect: { affinityDelta: 0, mood: "neutral" } },
    ],
  },
  {
    roles: ["teacher-colleague"],
    locations: ["office"],
    choices: [
      { id: "discuss-students", label: "讨论学生", effect: { affinityDelta: 3, mood: "neutral" } },
      { id: "chat", label: "聊聊天", effect: { affinityDelta: 3, mood: "happy" } },
      { id: "borrow-tools", label: "借教具", effect: { affinityDelta: 0, mood: "neutral" } },
    ],
  },
  // Parent visiting
  {
    roles: ["parent"],
    locations: ["classroom", "office", "playground"],
    choices: [
      {
        id: "introduce-situation",
        label: "介绍孩子情况",
        effect: { affinityDelta: 5, mood: "neutral" },
      },
      { id: "comfort", label: "安慰", effect: { affinityDelta: 8, mood: "happy" } },
      {
        id: "invite-to-office",
        label: "请到办公室",
        effect: { affinityDelta: 3, mood: "neutral" },
      },
    ],
  },
  // Parent at farmland
  {
    roles: ["parent"],
    locations: ["farmland"],
    choices: [
      { id: "help-farm", label: "帮忙干活", effect: { affinityDelta: 10, mood: "happy" } },
      { id: "chat", label: "聊聊天", effect: { affinityDelta: 5, mood: "happy" } },
      { id: "leave-alone", label: "不打扰", effect: { affinityDelta: 0, mood: "neutral" } },
    ],
  },
  // Shopkeeper
  {
    roles: ["shopkeeper"],
    locations: [], // any location
    choices: [
      { id: "buy-stuff", label: "买点东西", effect: { affinityDelta: 3, mood: "happy" } },
      { id: "chat", label: "聊聊天", effect: { affinityDelta: 5, mood: "happy" } },
      { id: "ask-directions", label: "问个路", effect: { affinityDelta: 0, mood: "neutral" } },
    ],
  },
  // Postman
  {
    roles: ["postman"],
    locations: [], // any location
    choices: [
      { id: "ask-for-mail", label: "有我的信吗", effect: { affinityDelta: 0, mood: "neutral" } },
      { id: "ask-to-carry", label: "托你带个东西", effect: { affinityDelta: 3, mood: "neutral" } },
      { id: "chat", label: "聊聊天", effect: { affinityDelta: 5, mood: "happy" } },
    ],
  },
];

// Fallback choices
const fallbackChoices: InteractionChoice[] = [
  { id: "encourage", label: "鼓励一下", effect: { affinityDelta: 10, mood: "happy" } },
  { id: "criticize", label: "批评几句", effect: { affinityDelta: -5, mood: "upset" } },
  { id: "ignore", label: "不说了", effect: { affinityDelta: 0, mood: "neutral" } },
];

export function getInteractionChoices(role: string, location: string): InteractionChoice[] {
  // Find specific match: role + location
  const specific = templates.find(
    (t) => t.roles.includes(role) && t.locations.length > 0 && t.locations.includes(location),
  );
  if (specific) return specific.choices;

  // Find role match with any location
  const roleAny = templates.find((t) => t.roles.includes(role) && t.locations.length === 0);
  if (roleAny) return roleAny.choices;

  return fallbackChoices;
}

export function getChoiceEffect(
  choiceId: string,
  role: string,
  location: string,
): InteractionEffect {
  const choices = getInteractionChoices(role, location);
  const choice = choices.find((c) => c.id === choiceId);
  if (choice) return choice.effect;
  // Fallback effect
  const fb = fallbackChoices.find((c) => c.id === choiceId);
  return fb?.effect || { affinityDelta: 0, mood: "neutral" };
}
